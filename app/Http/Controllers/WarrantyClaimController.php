<?php

namespace App\Http\Controllers;

use App\Models\WarrantyClaim;
use App\Models\WarrantyClaimPart;
use App\Models\WarrantyClaimService;
use App\Models\WarrantyClaimPhoto;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\VehicleUnit;
use App\Models\PartInventory;
use App\Models\ServiceType;
use App\Models\User;
use App\Http\Requests\StoreWarrantyClaimRequest;
use App\Http\Requests\UpdateWarrantyClaimRequest;
use App\Traits\LogsActivity;
use App\Services\PhotoUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class WarrantyClaimController extends Controller
{
    use LogsActivity;

    protected $photoService;

    public function __construct(PhotoUploadService $photoService)
    {
        $this->photoService = $photoService;
    }

    /**
     * Display a listing of warranty claims.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Base query with relationships
        $query = WarrantyClaim::with(['branch', 'customer', 'vehicleUnit', 'assignedUser'])
            ->when($request->include_deleted, function ($q) {
                $q->withTrashed();
            })
            ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                $q->forUserBranch($user);
            })
            ->when($request->branch_id && $user->hasRole('admin'), function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('claim_id', 'like', "%{$search}%")
                        ->orWhere('failure_description', 'like', "%{$search}%")
                        ->orWhere('warranty_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->claim_type, fn($q, $type) => $q->where('claim_type', $type))
            ->when($request->warranty_type, fn($q, $type) => $q->where('warranty_type', $type));

        $claims = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate stats
        $statsQuery = clone $query;
        $stats = [
            'total' => $statsQuery->count(),
            'pending' => (clone $statsQuery)->whereIn('status', ['draft', 'submitted', 'under_review'])->count(),
            'approved' => (clone $statsQuery)->where('status', 'approved')->count(),
            'total_claimed' => (clone $statsQuery)->sum('total_claimed_amount'),
        ];

        return Inertia::render('service/warranty-claims', [
            'claims' => $claims,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'claim_type', 'warranty_type', 'branch_id', 'include_deleted']),
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
        ]);
    }

    /**
     * Show the form for creating a new claim.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('service/warranty-claim-create', [
            'branches' => $user->hasRole('admin') ? Branch::where('status', 'active')->get() : null,
            'customers' => Customer::when(!$user->hasRole('admin'), function ($q) use ($user) {
                    $q->forUserBranch($user);
                })
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'customer_id', 'first_name', 'last_name', 'email', 'phone']),
            'vehicleUnits' => VehicleUnit::with('vehicleModel')
                ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                    $q->forUserBranch($user);
                })
                ->whereIn('status', ['in_stock', 'sold', 'reserved'])
                ->orderBy('created_at', 'desc')
                ->get(['id', 'vehicle_model_id', 'vin', 'stock_number', 'odometer']),
            'partsInventory' => PartInventory::when(!$user->hasRole('admin'), function ($q) use ($user) {
                    $q->forUserBranch($user);
                })
                ->where('status', 'active')
                ->orderBy('part_name')
                ->get(['id', 'part_number', 'part_name', 'selling_price', 'unit_cost']),
            'serviceTypes' => ServiceType::with('branch')
                ->where('status', 'active')
                ->where('is_available', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'category', 'base_price']),
            'users' => User::when(!$user->hasRole('admin'), function ($q) use ($user) {
                    $q->where('branch_id', $user->branch_id);
                })
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Store a newly created claim.
     */
    public function store(StoreWarrantyClaimRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();

            // Create the main claim
            $claim = WarrantyClaim::create([
                'branch_id' => $data['branch_id'],
                'customer_id' => $data['customer_id'] ?? null,
                'vehicle_unit_id' => $data['vehicle_unit_id'] ?? null,
                'claim_type' => $data['claim_type'],
                'claim_date' => $data['claim_date'],
                'incident_date' => $data['incident_date'] ?? null,
                'failure_description' => $data['failure_description'],
                'diagnosis' => $data['diagnosis'] ?? null,
                'repair_actions' => $data['repair_actions'] ?? null,
                'odometer_reading' => $data['odometer_reading'] ?? null,
                'warranty_type' => $data['warranty_type'] ?? null,
                'warranty_provider' => $data['warranty_provider'] ?? null,
                'warranty_number' => $data['warranty_number'] ?? null,
                'warranty_start_date' => $data['warranty_start_date'] ?? null,
                'warranty_end_date' => $data['warranty_end_date'] ?? null,
                'status' => $data['status'],
                'parts_claimed_amount' => 0,
                'labor_claimed_amount' => 0,
                'total_claimed_amount' => 0,
                'currency' => $data['currency'],
                'assigned_to' => $data['assigned_to'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'],
            ]);

            // Create parts if provided
            if (isset($data['parts']) && is_array($data['parts']) && count($data['parts']) > 0) {
                foreach ($data['parts'] as $partData) {
                    WarrantyClaimPart::create([
                        'warranty_claim_id' => $claim->id,
                        'part_inventory_id' => $partData['part_inventory_id'] ?? null,
                        'part_number' => $partData['part_number'] ?? null,
                        'part_name' => $partData['part_name'],
                        'description' => $partData['description'] ?? null,
                        'quantity' => $partData['quantity'],
                        'unit_price' => $partData['unit_price'],
                        'claim_status' => 'pending',
                    ]);
                }
            }

            // Create services if provided
            if (isset($data['services']) && is_array($data['services']) && count($data['services']) > 0) {
                foreach ($data['services'] as $serviceData) {
                    WarrantyClaimService::create([
                        'warranty_claim_id' => $claim->id,
                        'service_type_id' => $serviceData['service_type_id'] ?? null,
                        'service_code' => $serviceData['service_code'] ?? null,
                        'service_name' => $serviceData['service_name'],
                        'description' => $serviceData['description'] ?? null,
                        'labor_hours' => $serviceData['labor_hours'],
                        'labor_rate' => $serviceData['labor_rate'],
                        'claim_status' => 'pending',
                    ]);
                }
            }

            // Recalculate total amounts
            $claim->recalculateAmounts();

            // Log activity
            $this->logCreated(
                module: 'Warranty Claims',
                subject: $claim,
                description: "Created warranty claim {$claim->claim_id}",
                properties: [
                    'claim_id' => $claim->claim_id,
                    'customer_id' => $claim->customer_id,
                    'vehicle_unit_id' => $claim->vehicle_unit_id,
                    'claim_type' => $claim->claim_type,
                    'total_claimed_amount' => $claim->total_claimed_amount,
                    'status' => $claim->status,
                ]
            );

            DB::commit();

            return redirect()
                ->route('service.warranty-claims.index')
                ->with('success', "Warranty claim {$claim->claim_id} created successfully!");

        } catch (\Exception $e) {
            DB::rollBack();

            $this->logActivity(
                module: 'Warranty Claims',
                action: 'create',
                description: 'Failed to create warranty claim',
                status: 'failed',
                properties: ['error' => $e->getMessage()]
            );

            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create warranty claim. Please try again.']);
        }
    }

    /**
     * Display the specified claim.
     */
    public function show(Request $request, WarrantyClaim $warranty_claim): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $warranty_claim->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only view claims from your branch.');
        }

        $warranty_claim->load([
            'branch',
            'customer',
            'vehicleUnit.vehicleModel',
            'assignedUser',
            'createdByUser',
            'updatedByUser',
            'parts.partInventory',
            'services.serviceType',
            'photos.uploadedByUser'
        ]);

        return Inertia::render('service/warranty-claim-view', [
            'claim' => $warranty_claim,
            'can' => [
                'edit' => $request->user()->can('service.edit') && $warranty_claim->canEdit(),
                'delete' => $request->user()->can('service.delete') && $warranty_claim->canDelete(),
            ],
        ]);
    }

    /**
     * Show the form for editing the claim.
     */
    public function edit(Request $request, WarrantyClaim $warranty_claim): Response
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $warranty_claim->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only edit claims from your branch.');
        }

        $warranty_claim->load([
            'branch',
            'customer',
            'vehicleUnit.vehicleModel',
            'assignedUser',
            'parts.partInventory',
            'services.serviceType',
            'photos'
        ]);

        $user = $request->user();

        return Inertia::render('service/warranty-claim-edit', [
            'claim' => $warranty_claim,
            'customers' => Customer::when(!$user->hasRole('admin'), function ($q) use ($user) {
                    $q->forUserBranch($user);
                })
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'customer_id', 'first_name', 'last_name', 'email', 'phone']),
            'vehicleUnits' => VehicleUnit::with('vehicleModel')
                ->when(!$user->hasRole('admin'), function ($q) use ($user) {
                    $q->forUserBranch($user);
                })
                ->whereIn('status', ['in_stock', 'sold', 'reserved'])
                ->orderBy('created_at', 'desc')
                ->get(['id', 'vehicle_model_id', 'vin', 'stock_number', 'odometer']),
            'partsInventory' => PartInventory::when(!$user->hasRole('admin'), function ($q) use ($user) {
                    $q->forUserBranch($user);
                })
                ->where('status', 'active')
                ->orderBy('part_name')
                ->get(['id', 'part_number', 'part_name', 'selling_price', 'unit_cost']),
            'serviceTypes' => ServiceType::with('branch')
                ->where('status', 'active')
                ->where('is_available', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'category', 'base_price']),
            'users' => User::when(!$user->hasRole('admin'), function ($q) use ($user) {
                    $q->where('branch_id', $user->branch_id);
                })
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Update the specified claim.
     */
    public function update(UpdateWarrantyClaimRequest $request, WarrantyClaim $warranty_claim): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();

            // Track changes for logging
            $changes = [];
            $mainFields = ['customer_id', 'vehicle_unit_id', 'claim_type', 'claim_date', 'incident_date',
                          'failure_description', 'diagnosis', 'repair_actions', 'odometer_reading',
                          'warranty_type', 'warranty_provider', 'warranty_number', 'warranty_start_date',
                          'warranty_end_date', 'status', 'assigned_to', 'notes', 'approved_amount',
                          'submission_date', 'decision_date', 'decision_by', 'rejection_reason'];

            foreach ($mainFields as $field) {
                if (isset($data[$field]) && $warranty_claim->{$field} != $data[$field]) {
                    $changes[$field] = [
                        'old' => $warranty_claim->{$field},
                        'new' => $data[$field],
                    ];
                }
            }

            // Update main claim data
            $warranty_claim->update([
                'customer_id' => $data['customer_id'] ?? null,
                'vehicle_unit_id' => $data['vehicle_unit_id'] ?? null,
                'claim_type' => $data['claim_type'],
                'claim_date' => $data['claim_date'],
                'incident_date' => $data['incident_date'] ?? null,
                'failure_description' => $data['failure_description'],
                'diagnosis' => $data['diagnosis'] ?? null,
                'repair_actions' => $data['repair_actions'] ?? null,
                'odometer_reading' => $data['odometer_reading'] ?? null,
                'warranty_type' => $data['warranty_type'] ?? null,
                'warranty_provider' => $data['warranty_provider'] ?? null,
                'warranty_number' => $data['warranty_number'] ?? null,
                'warranty_start_date' => $data['warranty_start_date'] ?? null,
                'warranty_end_date' => $data['warranty_end_date'] ?? null,
                'status' => $data['status'],
                'approved_amount' => $data['approved_amount'] ?? null,
                'submission_date' => $data['submission_date'] ?? null,
                'decision_date' => $data['decision_date'] ?? null,
                'decision_by' => $data['decision_by'] ?? null,
                'rejection_reason' => $data['rejection_reason'] ?? null,
                'assigned_to' => $data['assigned_to'] ?? null,
                'notes' => $data['notes'] ?? null,
                'updated_by' => $data['updated_by'],
            ]);

            // Update or create parts
            if (isset($data['parts'])) {
                // Delete existing parts
                $warranty_claim->parts()->delete();

                // Create new parts
                if (is_array($data['parts']) && count($data['parts']) > 0) {
                    foreach ($data['parts'] as $partData) {
                        WarrantyClaimPart::create([
                            'warranty_claim_id' => $warranty_claim->id,
                            'part_inventory_id' => $partData['part_inventory_id'] ?? null,
                            'part_number' => $partData['part_number'] ?? null,
                            'part_name' => $partData['part_name'],
                            'description' => $partData['description'] ?? null,
                            'quantity' => $partData['quantity'],
                            'unit_price' => $partData['unit_price'],
                            'claim_status' => $partData['claim_status'] ?? 'pending',
                            'approved_quantity' => $partData['approved_quantity'] ?? null,
                            'approved_amount' => $partData['approved_amount'] ?? null,
                            'rejection_reason' => $partData['rejection_reason'] ?? null,
                        ]);
                    }
                }
            }

            // Update or create services
            if (isset($data['services'])) {
                // Delete existing services
                $warranty_claim->services()->delete();

                // Create new services
                if (is_array($data['services']) && count($data['services']) > 0) {
                    foreach ($data['services'] as $serviceData) {
                        WarrantyClaimService::create([
                            'warranty_claim_id' => $warranty_claim->id,
                            'service_type_id' => $serviceData['service_type_id'] ?? null,
                            'service_code' => $serviceData['service_code'] ?? null,
                            'service_name' => $serviceData['service_name'],
                            'description' => $serviceData['description'] ?? null,
                            'labor_hours' => $serviceData['labor_hours'],
                            'labor_rate' => $serviceData['labor_rate'],
                            'claim_status' => $serviceData['claim_status'] ?? 'pending',
                            'approved_hours' => $serviceData['approved_hours'] ?? null,
                            'approved_amount' => $serviceData['approved_amount'] ?? null,
                            'rejection_reason' => $serviceData['rejection_reason'] ?? null,
                        ]);
                    }
                }
            }

            // Recalculate total amounts
            $warranty_claim->recalculateAmounts();

            // Log activity
            $this->logUpdated(
                module: 'Warranty Claims',
                subject: $warranty_claim,
                description: "Updated warranty claim {$warranty_claim->claim_id}",
                properties: [
                    'claim_id' => $warranty_claim->claim_id,
                    'changes' => $changes,
                ]
            );

            DB::commit();

            return redirect()
                ->route('service.warranty-claims.index')
                ->with('success', "Warranty claim {$warranty_claim->claim_id} updated successfully!");

        } catch (\Exception $e) {
            DB::rollBack();

            $this->logActivity(
                module: 'Warranty Claims',
                action: 'update',
                subject: $warranty_claim,
                description: 'Failed to update warranty claim',
                status: 'failed',
                properties: ['error' => $e->getMessage()]
            );

            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update warranty claim. Please try again.']);
        }
    }

    /**
     * Remove the specified claim (soft delete).
     */
    public function destroy(Request $request, WarrantyClaim $warranty_claim): RedirectResponse
    {
        // Authorization check
        if (!$request->user()->hasRole('admin') && $warranty_claim->branch_id !== $request->user()->branch_id) {
            abort(403, 'You can only delete claims from your branch.');
        }

        $claimId = $warranty_claim->claim_id;

        // Log activity before deletion
        $this->logDeleted(
            module: 'Warranty Claims',
            subject: $warranty_claim,
            description: "Deleted warranty claim {$claimId}",
            properties: [
                'claim_id' => $claimId,
                'customer_id' => $warranty_claim->customer_id,
                'total_claimed_amount' => $warranty_claim->total_claimed_amount,
                'status' => $warranty_claim->status,
            ]
        );

        $warranty_claim->delete();

        return redirect()
            ->route('service.warranty-claims.index')
            ->with('success', "Warranty claim {$claimId} deleted successfully!");
    }

    /**
     * Restore a soft-deleted claim.
     */
    public function restore(Request $request, $id): RedirectResponse
    {
        try {
            $claim = WarrantyClaim::withTrashed()->findOrFail($id);

            // Authorization check
            if (!$request->user()->hasRole('admin') && $claim->branch_id !== $request->user()->branch_id) {
                abort(403, 'You can only restore claims from your branch.');
            }

            if (!$claim->trashed()) {
                return redirect()->back()->with('error', 'Claim is not deleted.');
            }

            $claimId = $claim->claim_id;
            $claim->restore();

            // Log activity
            $this->logRestored(
                module: 'Warranty Claims',
                subject: $claim,
                description: "Restored warranty claim {$claimId}",
                properties: [
                    'claim_id' => $claimId,
                ]
            );

            return redirect()
                ->route('service.warranty-claims.index')
                ->with('success', "Warranty claim {$claimId} restored successfully!");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to restore claim. Please try again.');
        }
    }

    /**
     * Upload photos for a warranty claim.
     */
    public function uploadPhotos(Request $request, WarrantyClaim $warranty_claim): RedirectResponse
    {
        $request->validate([
            'photos' => 'required|array|max:10',
            'photos.*' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'photo_type' => 'required|in:failure,damage,before_repair,after_repair,documentation,other',
            'caption' => 'nullable|string|max:500',
        ]);

        try {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('warranty-claims/' . $warranty_claim->id, 'public');

                // Extract EXIF data
                $exifData = @exif_read_data($photo->getRealPath());

                WarrantyClaimPhoto::create([
                    'warranty_claim_id' => $warranty_claim->id,
                    'file_path' => $path,
                    'file_name' => $photo->getClientOriginalName(),
                    'file_size' => $photo->getSize(),
                    'mime_type' => $photo->getMimeType(),
                    'photo_type' => $request->photo_type,
                    'caption' => $request->caption,
                    'latitude' => isset($exifData['GPSLatitude']) ? $this->getGps($exifData['GPSLatitude'], $exifData['GPSLatitudeRef'] ?? 'N') : null,
                    'longitude' => isset($exifData['GPSLongitude']) ? $this->getGps($exifData['GPSLongitude'], $exifData['GPSLongitudeRef'] ?? 'E') : null,
                    'camera_make' => $exifData['Make'] ?? null,
                    'camera_model' => $exifData['Model'] ?? null,
                    'photo_taken_at' => isset($exifData['DateTimeOriginal']) ? date('Y-m-d H:i:s', strtotime($exifData['DateTimeOriginal'])) : null,
                    'uploaded_by' => auth()->id(),
                    'upload_ip' => $request->ip(),
                    'upload_user_agent' => $request->userAgent(),
                ]);
            }

            $this->logActivity(
                module: 'Warranty Claims',
                action: 'photo_upload',
                subject: $warranty_claim,
                description: "Uploaded " . count($request->file('photos')) . " photo(s) for claim {$warranty_claim->claim_id}",
                properties: [
                    'photo_count' => count($request->file('photos')),
                    'photo_type' => $request->photo_type,
                ]
            );

            return redirect()
                ->route('service.warranty-claims.show', $warranty_claim)
                ->with('success', count($request->file('photos')) . ' photo(s) uploaded successfully!');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['photos' => 'Photo upload failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete a photo from warranty claim.
     */
    public function deletePhoto(Request $request, WarrantyClaim $warranty_claim, WarrantyClaimPhoto $photo): JsonResponse
    {
        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($photo->file_path)) {
                Storage::disk('public')->delete($photo->file_path);
            }

            $photo->delete();

            $this->logActivity(
                module: 'Warranty Claims',
                action: 'photo_delete',
                subject: $warranty_claim,
                description: "Deleted photo from claim {$warranty_claim->claim_id}",
                properties: [
                    'photo_id' => $photo->id,
                    'photo_type' => $photo->photo_type,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Photo deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete photo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper function to convert GPS coordinates.
     */
    private function getGps($exifCoord, $hemi)
    {
        $degrees = count($exifCoord) > 0 ? $this->gps2Num($exifCoord[0]) : 0;
        $minutes = count($exifCoord) > 1 ? $this->gps2Num($exifCoord[1]) : 0;
        $seconds = count($exifCoord) > 2 ? $this->gps2Num($exifCoord[2]) : 0;

        $flip = ($hemi == 'W' or $hemi == 'S') ? -1 : 1;

        return $flip * ($degrees + $minutes / 60 + $seconds / 3600);
    }

    private function gps2Num($coordPart)
    {
        $parts = explode('/', $coordPart);

        if (count($parts) <= 0)
            return 0;

        if (count($parts) == 1)
            return $parts[0];

        return floatval($parts[0]) / floatval($parts[1]);
    }
}
