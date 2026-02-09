<?php

namespace Database\Seeders\Qa;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Document;
use App\Models\Lead;
use App\Models\PartInventory;
use App\Models\Pipeline;
use App\Models\User;
use App\Models\VehicleModel;
use App\Models\VehicleReservation;
use App\Models\VehicleUnit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Spatie\Permission\Models\Role;

class QaDemoSeeder extends Seeder
{
    public function run(): void
    {
        $summary = $this->seedData();

        $this->renderSummary($summary);
    }

    public function seedData(): array
    {
        $summary = [];

        DB::transaction(function () use (&$summary) {
            $branches = $this->seedBranches();
            $users = $this->seedUsers($branches);
            $customers = $this->seedCustomers($branches);
            $vehicles = $this->seedVehicles($branches, $customers, $users);
            $leads = $this->seedLeads($branches, $users);
            $pipeline = $this->seedPipeline($branches, $leads, $users);
            $workOrder = $this->seedWorkOrder($branches, $vehicles, $customers, $users);
            $part = $this->seedPartInventory($branches);

            $summary = compact('branches', 'users', 'customers', 'vehicles', 'leads', 'pipeline', 'workOrder', 'part');
        });

        return $summary;
    }

    public function renderSummary(array $summary, ?Command $console = null): void
    {
        $console ??= $this->command;

        if (!$console) {
            return;
        }

        $console->info('QA demo data ready ✅');

        if (!empty($summary['branches'])) {
            $console->table(
                ['Branch', 'Code', 'ID'],
                array_map(fn ($branch) => [
                    $branch['name'],
                    $branch['code'],
                    $branch['id'],
                ], array_values($summary['branches']))
            );
        }

        if (!empty($summary['users'])) {
            $console->table(
                ['User', 'Email', 'Role', 'Branch', 'Password'],
                array_map(fn ($user) => [
                    $user['name'],
                    $user['email'],
                    $user['role'],
                    $user['branch_code'],
                    $user['password'],
                ], $summary['users'])
            );
        }

        if (!empty($summary['leads'])) {
            $console->table(
                ['Lead', 'Branch', 'Lead ID', 'Status'],
                array_map(fn ($lead) => [
                    $lead['name'],
                    $lead['branch_code'],
                    $lead['lead_id'],
                    $lead['status'],
                ], $summary['leads'])
            );
        }

        if (!empty($summary['vehicles']['units'] ?? [])) {
            $console->table(
                ['Unit', 'Stock #', 'VIN', 'Status', 'Branch'],
                array_map(fn ($unit) => [
                    $unit['label'],
                    $unit['stock_number'],
                    $unit['vin'],
                    $unit['status'],
                    $unit['branch_code'],
                ], $summary['vehicles']['units'])
            );
        }

        if (!empty($summary['pipeline'])) {
            $console->table(
                ['Pipeline ID', 'Branch', 'Stage', 'ID'],
                [
                    [
                        $summary['pipeline']['pipeline_id'],
                        $summary['pipeline']['branch_code'],
                        $summary['pipeline']['stage'],
                        $summary['pipeline']['id'],
                    ],
                ]
            );
        }

        if (!empty($summary['workOrder'])) {
            $console->table(
                ['Work Order #', 'Branch', 'Status', 'ID'],
                [
                    [
                        $summary['workOrder']['work_order_number'],
                        $summary['workOrder']['branch_code'],
                        $summary['workOrder']['status'],
                        $summary['workOrder']['id'],
                    ],
                ]
            );
        }

        if (!empty($summary['part'])) {
            $console->table(
                ['Part #', 'Name', 'Branch', 'Qty on Hand', 'ID'],
                [
                    [
                        $summary['part']['part_number'],
                        $summary['part']['part_name'],
                        $summary['part']['branch_code'],
                        $summary['part']['quantity_on_hand'],
                        $summary['part']['id'],
                    ],
                ]
            );
        }

        if (!empty($summary['vehicles']['reservation'] ?? null)) {
            $reservation = $summary['vehicles']['reservation'];
            $console->line("Reservation {$reservation['reservation_ref']} (ID {$reservation['id']}) locks {$reservation['stock_number']} for {$reservation['customer']}.");
        }

        if (!empty($summary['vehicles']['release'] ?? null)) {
            $release = $summary['vehicles']['release'];
            $console->line("Release approval: {$release['stock_number']} approved by {$release['approved_by']} on {$release['approved_at']}." );
        }
    }

    protected function seedBranches(): array
    {
        $branches = [];

        $definitions = [
            [
                'code' => 'QA-A',
                'name' => 'Branch A',
                'address' => '123 QA Avenue',
                'city' => 'Makati',
                'state' => 'Metro Manila',
                'postal_code' => '1200',
                'country' => 'Philippines',
                'phone' => '+63-2-8000-0001',
                'email' => 'branch-a@qa.car-erp.test',
                'status' => 'active',
                'business_hours' => [
                    'monday' => ['open' => '08:00', 'close' => '17:00'],
                    'tuesday' => ['open' => '08:00', 'close' => '17:00'],
                    'wednesday' => ['open' => '08:00', 'close' => '17:00'],
                    'thursday' => ['open' => '08:00', 'close' => '17:00'],
                    'friday' => ['open' => '08:00', 'close' => '17:00'],
                    'saturday' => ['open' => '08:30', 'close' => '12:00'],
                    'sunday' => ['open' => null, 'close' => null],
                ],
                'latitude' => 14.5547,
                'longitude' => 121.0244,
                'notes' => 'QA branch for Metro Manila flows.',
            ],
            [
                'code' => 'QA-B',
                'name' => 'Branch B',
                'address' => '45 Demo Street',
                'city' => 'Cebu City',
                'state' => 'Cebu',
                'postal_code' => '6000',
                'country' => 'Philippines',
                'phone' => '+63-32-900-0002',
                'email' => 'branch-b@qa.car-erp.test',
                'status' => 'active',
                'business_hours' => [
                    'monday' => ['open' => '08:00', 'close' => '17:00'],
                    'tuesday' => ['open' => '08:00', 'close' => '17:00'],
                    'wednesday' => ['open' => '08:00', 'close' => '17:00'],
                    'thursday' => ['open' => '08:00', 'close' => '17:00'],
                    'friday' => ['open' => '08:00', 'close' => '17:00'],
                    'saturday' => ['open' => '08:30', 'close' => '12:00'],
                    'sunday' => ['open' => null, 'close' => null],
                ],
                'latitude' => 10.3157,
                'longitude' => 123.8854,
                'notes' => 'QA branch for Visayas flows.',
            ],
        ];

        foreach ($definitions as $data) {
            $branch = Branch::updateOrCreate(['code' => $data['code']], $data);

            $branches[$data['code']] = [
                'id' => $branch->id,
                'code' => $branch->code,
                'name' => $branch->name,
            ];
        }

        return $branches;
    }

    protected function seedUsers(array $branches): array
    {
        $requiredRoles = ['admin', 'sales_rep', 'parts_head', 'accounting'];
        $existingRoles = Role::query()->whereIn('name', $requiredRoles)->pluck('name')->all();
        $missingRoles = array_values(array_diff($requiredRoles, $existingRoles));

        if (!empty($missingRoles)) {
            throw new RuntimeException('Missing roles: ' . implode(', ', $missingRoles) . '. Run the base seeders first.');
        }

        $users = [];

        $definitions = [
            'admin' => [
                'name' => 'QA Admin',
                'email' => 'qa.admin@car-erp.test',
                'password' => 'Password!234',
                'role' => 'admin',
                'branch_code' => 'QA-A',
            ],
            'sales' => [
                'name' => 'QA Sales',
                'email' => 'qa.sales@car-erp.test',
                'password' => 'Password!234',
                'role' => 'sales_rep',
                'branch_code' => 'QA-A',
            ],
            'inventory' => [
                'name' => 'QA Inventory',
                'email' => 'qa.inventory@car-erp.test',
                'password' => 'Password!234',
                'role' => 'parts_head',
                'branch_code' => 'QA-B',
            ],
            'accounting' => [
                'name' => 'QA Accounting',
                'email' => 'qa.accounting@car-erp.test',
                'password' => 'Password!234',
                'role' => 'accounting',
                'branch_code' => 'QA-B',
            ],
        ];

        foreach ($definitions as $key => $data) {
            $branchId = $branches[$data['branch_code']]['id'] ?? null;

            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make($data['password']),
                    'branch_id' => $branchId,
                ]
            );

            if ($user->email_verified_at === null) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            $user->syncRoles([$data['role']]);

            $users[$key] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $data['role'],
                'branch_code' => $data['branch_code'],
                'password' => $data['password'],
            ];
        }

        return $users;
    }

    protected function seedCustomers(array $branches): array
    {
        $customers = [];

        $definitions = [
            [
                'key' => 'CUS-QA-001',
                'first_name' => 'Alex',
                'last_name' => 'Demo',
                'email' => 'alex.customer@car-erp.test',
                'phone' => '+639171110001',
                'branch_code' => 'QA-A',
            ],
            [
                'key' => 'CUS-QA-002',
                'first_name' => 'Bianca',
                'last_name' => 'Customer',
                'email' => 'bianca.customer@car-erp.test',
                'phone' => '+639171110002',
                'branch_code' => 'QA-B',
            ],
        ];

        foreach ($definitions as $data) {
            $customer = Customer::updateOrCreate(
                ['customer_id' => $data['key']],
                [
                    'branch_id' => $branches[$data['branch_code']]['id'] ?? null,
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'status' => 'active',
                    'customer_type' => 'individual',
                    'city' => 'QA City',
                    'country' => 'Philippines',
                ]
            );

            $customers[$data['key']] = [
                'id' => $customer->id,
                'name' => $customer->full_name,
                'email' => $customer->email,
                'branch_code' => $data['branch_code'],
            ];
        }

        return $customers;
    }

    protected function seedVehicles(array $branches, array $customers, array $users): array
    {
        $models = [
            'QA-SEDAN' => VehicleModel::updateOrCreate(
                ['model_code' => 'QA-SEDAN'],
                [
                    'make' => 'Toyota',
                    'model' => 'Vios QA',
                    'year' => 2024,
                    'body_type' => 'sedan',
                    'transmission' => 'automatic',
                    'drivetrain' => 'fwd',
                    'fuel_type' => 'gasoline',
                    'base_price' => 850000,
                    'currency' => 'PHP',
                    'is_active' => true,
                ]
            ),
            'QA-CROSS' => VehicleModel::updateOrCreate(
                ['model_code' => 'QA-CROSS'],
                [
                    'make' => 'Honda',
                    'model' => 'HR-V QA',
                    'year' => 2025,
                    'body_type' => 'suv',
                    'transmission' => 'cvt',
                    'drivetrain' => 'fwd',
                    'fuel_type' => 'gasoline',
                    'base_price' => 1450000,
                    'currency' => 'PHP',
                    'is_active' => true,
                ]
            ),
        ];

        $units = [];

        $unitInStock = VehicleUnit::updateOrCreate(
            ['vin' => 'VIN-QA-UNIT-001'],
            [
                'vehicle_model_id' => $models['QA-SEDAN']->id,
                'branch_id' => $branches['QA-A']['id'],
                'stock_number' => 'QA-A-STOCK-001',
                'status' => 'in_stock',
                'location' => 'branch',
                'purchase_price' => 820000,
                'currency' => 'PHP',
                'acquisition_date' => Carbon::now()->subMonths(2)->toDateString(),
                'color_exterior' => 'Pearl White',
                'color_interior' => 'Black',
                'odometer' => 1200,
            ]
        );

        $units[] = [
            'label' => 'In-stock unit',
            'id' => $unitInStock->id,
            'stock_number' => $unitInStock->stock_number,
            'vin' => $unitInStock->vin,
            'status' => $unitInStock->status,
            'branch_code' => 'QA-A',
        ];

        $unitReserved = VehicleUnit::updateOrCreate(
            ['vin' => 'VIN-QA-UNIT-002'],
            [
                'vehicle_model_id' => $models['QA-SEDAN']->id,
                'branch_id' => $branches['QA-B']['id'],
                'stock_number' => 'QA-B-RES-001',
                'status' => 'reserved',
                'location' => 'branch',
                'sub_status' => 'reserved_with_dp',
                'is_locked' => true,
                'purchase_price' => 830000,
                'currency' => 'PHP',
                'acquisition_date' => Carbon::now()->subMonths(1)->toDateString(),
                'color_exterior' => 'Midnight Blue',
                'color_interior' => 'Gray',
                'odometer' => 500,
            ]
        );

        $reservation = VehicleReservation::updateOrCreate(
            ['reservation_ref' => 'RS-QA-001'],
            [
                'branch_id' => $branches['QA-B']['id'],
                'vehicle_unit_id' => $unitReserved->id,
                'customer_id' => $customers['CUS-QA-002']['id'],
                'handled_by_branch_id' => $branches['QA-B']['id'],
                'reservation_date' => Carbon::now()->toDateString(),
                'payment_type' => 'bank_financing',
                'target_release_date' => Carbon::now()->addDays(10)->toDateString(),
                'status' => 'confirmed',
                'remarks' => 'Demo reservation with lock applied.',
            ]
        );

        $units[] = [
            'label' => 'Reserved & locked',
            'id' => $unitReserved->id,
            'stock_number' => $unitReserved->stock_number,
            'vin' => $unitReserved->vin,
            'status' => $unitReserved->status,
            'branch_code' => 'QA-B',
        ];

        $releaseChecklist = [];
        foreach (config('release.required_checklist', []) as $key) {
            $releaseChecklist[$key] = true;
        }

        $unitSold = VehicleUnit::updateOrCreate(
            ['vin' => 'VIN-QA-UNIT-003'],
            [
                'vehicle_model_id' => $models['QA-CROSS']->id,
                'branch_id' => $branches['QA-A']['id'],
                'stock_number' => 'QA-A-SOLD-001',
                'status' => 'sold',
                'location' => 'sold',
                'owner_id' => $customers['CUS-QA-001']['id'],
                'sale_price' => 1550000,
                'purchase_price' => 1350000,
                'currency' => 'PHP',
                'acquisition_date' => Carbon::now()->subMonths(3)->toDateString(),
                'sold_date' => Carbon::now()->subWeeks(1)->toDateString(),
                'release_date' => Carbon::now()->subDays(5)->toDateString(),
                'release_checklist_status' => $releaseChecklist,
                'release_approval_user_id' => $users['admin']['id'],
                'release_approved_at' => Carbon::now()->subDays(2),
                'payment_method' => 'bank_financing',
                'color_exterior' => 'Lunar Silver',
                'color_interior' => 'Black',
                'odometer' => 250,
                'warranty_start_date' => Carbon::now()->subDays(5)->toDateString(),
                'warranty_end_date' => Carbon::now()->addYear()->subDays(5)->toDateString(),
            ]
        );

        Document::updateOrCreate(
            [
                'documentable_type' => VehicleUnit::class,
                'documentable_id' => $unitSold->id,
                'type' => 'or_cr_scan',
            ],
            [
                'path' => 'documents/qa/unit-sold-orcr.pdf',
                'filename' => 'unit-sold-orcr.pdf',
                'mime' => 'application/pdf',
                'size' => 128 * 1024,
                'uploaded_by' => $users['admin']['id'],
            ]
        );

        $units[] = [
            'label' => 'Sold unit (with release approval)',
            'id' => $unitSold->id,
            'stock_number' => $unitSold->stock_number,
            'vin' => $unitSold->vin,
            'status' => $unitSold->status,
            'branch_code' => 'QA-A',
        ];

        return [
            'units' => $units,
            'reservation' => [
                'id' => $reservation->id,
                'reservation_ref' => $reservation->reservation_ref,
                'stock_number' => $unitReserved->stock_number,
                'customer' => $customers['CUS-QA-002']['name'],
            ],
            'release' => [
                'stock_number' => $unitSold->stock_number,
                'approved_at' => optional($unitSold->release_approved_at)->toDateString(),
                'approved_by' => $users['admin']['email'],
            ],
        ];
    }

    protected function seedLeads(array $branches, array $users): array
    {
        $leads = [];

        $definitions = [
            [
                'lead_id' => 'LD-QA-A',
                'branch_code' => 'QA-A',
                'name' => 'Andrea Lead',
                'email' => 'andrea.lead@car-erp.test',
                'phone' => '+639171110101',
                'source' => 'web_form',
                'status' => 'hot',
                'priority' => 'high',
                'vehicle_interest' => 'Vios QA',
                'assigned_to' => $users['sales']['id'],
            ],
            [
                'lead_id' => 'LD-QA-B',
                'branch_code' => 'QA-B',
                'name' => 'Brandon Lead',
                'email' => 'brandon.lead@car-erp.test',
                'phone' => '+639171110102',
                'source' => 'referral',
                'status' => 'qualified',
                'priority' => 'medium',
                'vehicle_interest' => 'HR-V QA',
                'assigned_to' => $users['sales']['id'],
            ],
        ];

        foreach ($definitions as $data) {
            $lead = Lead::updateOrCreate(
                ['lead_id' => $data['lead_id']],
                [
                    'branch_id' => $branches[$data['branch_code']]['id'],
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'source' => $data['source'],
                    'status' => $data['status'],
                    'priority' => $data['priority'],
                    'vehicle_interest' => $data['vehicle_interest'],
                    'assigned_to' => $data['assigned_to'],
                    'lead_score' => 80,
                    'conversion_probability' => 75,
                ]
            );

            $leads[] = [
                'id' => $lead->id,
                'lead_id' => $lead->lead_id,
                'name' => $lead->name,
                'branch_code' => $data['branch_code'],
                'status' => $lead->status,
            ];
        }

        return $leads;
    }

    protected function seedPipeline(array $branches, array $leads, array $users): array
    {
        $lead = collect($leads)->firstWhere('lead_id', 'LD-QA-B');

        $pipeline = Pipeline::updateOrCreate(
            ['pipeline_id' => 'PL-QA-001'],
            [
                'branch_id' => $branches['QA-B']['id'],
                'lead_id' => $lead['id'] ?? null,
                'customer_name' => 'Brandon Lead',
                'customer_phone' => '+639171110102',
                'customer_email' => 'brandon.lead@car-erp.test',
                'sales_rep_id' => $users['sales']['id'],
                'vehicle_interest' => 'HR-V QA',
                'quote_amount' => 1520000,
                'current_stage' => 'quote_sent',
                'previous_stage' => 'qualified',
                'stage_entry_timestamp' => Carbon::now()->subDay(),
                'probability' => 65,
                'priority' => 'medium',
                'lead_score' => 82,
                'next_action' => 'Follow up on financing docs',
                'next_action_due' => Carbon::now()->addDays(2),
                'auto_progression_enabled' => true,
                'auto_loss_rule_enabled' => true,
                'notes' => 'Pipeline for QA branch B to validate exports and branch scoping.',
            ]
        );

        return [
            'id' => $pipeline->id,
            'pipeline_id' => $pipeline->pipeline_id,
            'branch_code' => 'QA-B',
            'stage' => $pipeline->current_stage,
        ];
    }

    protected function seedWorkOrder(array $branches, array $vehicles, array $customers, array $users): array
    {
        $reservedUnit = collect($vehicles['units'])->firstWhere('stock_number', 'QA-B-RES-001');

        $workOrder = WorkOrder::updateOrCreate(
            ['work_order_number' => 'WO-QA-0001'],
            [
                'branch_id' => $branches['QA-B']['id'],
                'vehicle_unit_id' => $reservedUnit['id'] ?? null,
                'customer_id' => $customers['CUS-QA-002']['id'],
                'customer_name' => $customers['CUS-QA-002']['name'],
                'customer_phone' => '+639171110002',
                'customer_email' => 'bianca.customer@car-erp.test',
                'customer_type' => 'individual',
                'status' => 'scheduled',
                'priority' => 'normal',
                'scheduled_at' => Carbon::now()->addDays(1),
                'due_date' => Carbon::now()->addDays(3)->toDateString(),
                'job_type' => 'pms',
                'assigned_to' => $users['admin']['id'],
                'assigned_technician_name' => 'QA Technician',
                'estimated_hours' => 2.5,
                'estimated_cost' => 3500,
                'customer_concerns' => 'Initial PMS for reserved unit prior to release.',
                'service_details' => 'Oil change, safety check, and detailing.',
                'pms_interval_km' => 5000,
                'next_pms_due_date' => Carbon::now()->addMonths(6),
                'verification_status' => 'pending',
            ]
        );

        return [
            'id' => $workOrder->id,
            'work_order_number' => $workOrder->work_order_number,
            'branch_code' => 'QA-B',
            'status' => $workOrder->status,
        ];
    }

    protected function seedPartInventory(array $branches): array
    {
        $part = PartInventory::updateOrCreate(
            ['part_number' => 'PART-QA-001'],
            [
                'branch_id' => $branches['QA-B']['id'],
                'part_name' => 'QA Oil Filter',
                'description' => 'Oil filter used for PMS QA flow.',
                'category' => 'engine',
                'manufacturer' => 'QA Parts Co.',
                'quantity_on_hand' => 25,
                'minimum_stock_level' => 5,
                'reorder_quantity' => 10,
                'unit_cost' => 250,
                'selling_price' => 450,
                'currency' => 'PHP',
                'warehouse_location' => 'WH-A1',
                'is_genuine' => true,
                'status' => 'active',
                'compatible_makes' => ['Toyota', 'Honda'],
                'compatible_models' => ['Vios QA', 'HR-V QA'],
                'compatible_years' => [2024, 2025],
            ]
        );

        return [
            'id' => $part->id,
            'part_number' => $part->part_number,
            'part_name' => $part->part_name,
            'branch_code' => 'QA-B',
            'quantity_on_hand' => $part->quantity_on_hand,
        ];
    }
}
