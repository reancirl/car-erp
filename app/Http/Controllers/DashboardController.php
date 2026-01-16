<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\ComplianceChecklistAssignment;
use App\Models\Customer;
use App\Models\CustomerSurvey;
use App\Models\Lead;
use App\Models\PartInventory;
use App\Models\Pipeline;
use App\Models\TestDrive;
use App\Models\VehicleUnit;
use App\Models\WarrantyClaim;
use App\Models\WorkOrder;
use App\Services\ChecklistAssignmentService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly ChecklistAssignmentService $assignmentService)
    {
    }

    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        // Get filter parameters
        $dateRange = $request->input('date_range', '30_days'); // today, 7_days, 30_days, 90_days, year, custom
        $branchIdInput = $request->input('branch_id', null);
        $startDate = $request->input('start_date', null);
        $endDate = $request->input('end_date', null);
        $useTestData = filter_var($request->input('use_test_data', false), FILTER_VALIDATE_BOOLEAN);

        $viewerBranch = $user?->branch()->select('id', 'name', 'code')->first();
        $isHeadquarters = ! $viewerBranch || strcasecmp($viewerBranch->code ?? '', 'HQ') === 0;

        $branchId = is_numeric($branchIdInput) ? (int) $branchIdInput : null;
        if (! $isHeadquarters && $viewerBranch) {
            $branchId = $viewerBranch->id;
        }

        // Calculate date ranges
        [$currentStart, $currentEnd, $previousStart, $previousEnd] = $this->calculateDateRanges(
            $dateRange,
            $startDate,
            $endDate
        );

        // Apply branch filter
        $branchFilter = $branchId ? [$branchId] : $this->getUserBranches($user);

        // Use test data or real data
        if ($useTestData) {
            $kpis = $this->getTestKPIs();
            $charts = $this->getTestChartData();
            $alerts = $this->getTestAlerts();
            $recentActivities = $this->getTestActivities();
        } else {
            $kpis = $this->getKPIs($branchFilter, $currentStart, $currentEnd, $previousStart, $previousEnd);
            $charts = $this->getChartData($branchFilter, $currentStart, $currentEnd);
            $alerts = $this->getSystemAlerts($branchFilter);
            $recentActivities = $this->getRecentActivities($branchFilter, 10);
        }

        return Inertia::render('dashboard', [
            'assignedChecklists' => $this->assignmentService->assignmentsForUser($user, 5)->values(),
            'filters' => [
                'date_range' => $dateRange,
                'branch_id' => $branchId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'current_start' => $currentStart->toDateString(),
                'current_end' => $currentEnd->toDateString(),
                'use_test_data' => $useTestData,
            ],
            'branches' => Branch::select('id', 'name', 'code')->where('status', 'active')->get(),
            'kpis' => $kpis,
            'charts' => $charts,
            'alerts' => $alerts,
            'recentActivities' => $recentActivities,
            'viewer' => [
                'branch_id' => $viewerBranch->id ?? null,
                'branch_name' => $viewerBranch->name ?? null,
                'branch_code' => $viewerBranch->code ?? null,
                'is_headquarters' => $isHeadquarters,
            ],
            'calendarEvents' => $this->getCalendarEvents($branchFilter),
        ]);
    }

    private function calculateDateRanges(string $dateRange, ?string $startDate, ?string $endDate): array
    {
        $now = Carbon::now();

        if ($dateRange === 'custom' && $startDate && $endDate) {
            $currentStart = Carbon::parse($startDate)->startOfDay();
            $currentEnd = Carbon::parse($endDate)->endOfDay();
            $diffDays = $currentStart->diffInDays($currentEnd);
            $previousEnd = $currentStart->copy()->subDay()->endOfDay();
            $previousStart = $previousEnd->copy()->subDays($diffDays)->startOfDay();
        } else {
            match ($dateRange) {
                'today' => [
                    $currentStart = $now->copy()->startOfDay(),
                    $currentEnd = $now->copy()->endOfDay(),
                    $previousStart = $now->copy()->subDay()->startOfDay(),
                    $previousEnd = $now->copy()->subDay()->endOfDay(),
                ],
                '7_days' => [
                    $currentStart = $now->copy()->subDays(6)->startOfDay(),
                    $currentEnd = $now->copy()->endOfDay(),
                    $previousStart = $now->copy()->subDays(13)->startOfDay(),
                    $previousEnd = $now->copy()->subDays(7)->endOfDay(),
                ],
                '90_days' => [
                    $currentStart = $now->copy()->subDays(89)->startOfDay(),
                    $currentEnd = $now->copy()->endOfDay(),
                    $previousStart = $now->copy()->subDays(179)->startOfDay(),
                    $previousEnd = $now->copy()->subDays(90)->endOfDay(),
                ],
                'year' => [
                    $currentStart = $now->copy()->startOfYear(),
                    $currentEnd = $now->copy()->endOfDay(),
                    $previousStart = $now->copy()->subYear()->startOfYear(),
                    $previousEnd = $now->copy()->subYear()->endOfYear(),
                ],
                default => [ // 30_days
                    $currentStart = $now->copy()->subDays(29)->startOfDay(),
                    $currentEnd = $now->copy()->endOfDay(),
                    $previousStart = $now->copy()->subDays(59)->startOfDay(),
                    $previousEnd = $now->copy()->subDays(30)->endOfDay(),
                ],
            };
        }

        return [$currentStart, $currentEnd, $previousStart, $previousEnd];
    }

    private function getCalendarEvents(array $branchFilter): array
    {
        $start = Carbon::now()->startOfDay();
        $end = Carbon::now()->addDays(14)->endOfDay();

        $testDriveEvents = TestDrive::with('branch')
            ->whereIn('branch_id', $branchFilter)
            ->whereBetween('scheduled_date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('scheduled_date')
            ->orderBy('scheduled_time')
            ->get()
            ->map(function ($td) {
                return [
                    'type' => 'test_drive',
                    'title' => "{$td->customer_name} – {$td->vehicle_details}",
                    'date' => Carbon::parse($td->scheduled_date)->toDateString(),
                    'time' => $td->scheduled_time,
                    'status' => $td->status,
                    'branch' => $td->branch?->only(['id', 'name', 'code']),
                    'meta' => [
                        'reservation_id' => $td->reservation_id,
                        'vehicle_vin' => $td->vehicle_vin,
                    ],
                ];
            });

        $workOrderEvents = WorkOrder::with(['branch', 'serviceType', 'vehicleUnit'])
            ->whereIn('branch_id', $branchFilter)
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('scheduled_at', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->whereNull('scheduled_at')
                            ->whereBetween('due_date', [$start->toDateString(), $end->toDateString()]);
                    });
            })
            ->orderBy('scheduled_at')
            ->orderBy('due_date')
            ->get()
            ->map(function ($wo) {
                $date = $wo->scheduled_at ? $wo->scheduled_at->toDateString() : ($wo->due_date ? Carbon::parse($wo->due_date)->toDateString() : null);
                $time = $wo->scheduled_at ? $wo->scheduled_at->format('H:i') : null;

                return [
                    'type' => 'pms',
                    'title' => $wo->serviceType?->name ?? 'PMS Work Order',
                    'date' => $date,
                    'time' => $time,
                    'status' => $wo->status,
                    'branch' => $wo->branch?->only(['id', 'name', 'code']),
                    'meta' => [
                        'work_order_number' => $wo->work_order_number,
                        'vehicle' => $wo->vehicleUnit?->stock_number ?? $wo->vehicle_plate_number,
                    ],
                ];
            })
            ->filter(fn($event) => $event['date'] !== null);

        return $testDriveEvents
            ->merge($workOrderEvents)
            ->sortBy(fn($event) => $event['date'] . ' ' . ($event['time'] ?? ''))
            ->values()
            ->toArray();
    }

    private function getUserBranches($user): array
    {
        // If user is admin, return all branches, otherwise return user's branch
        if ($user->hasRole('admin') || $user->hasRole('manager')) {
            return Branch::where('status', 'active')->pluck('id')->toArray();
        }

        return $user->branch_id ? [$user->branch_id] : [];
    }

    private function getKPIs(array $branchFilter, Carbon $currentStart, Carbon $currentEnd, Carbon $previousStart, Carbon $previousEnd): array
    {
        // SALES KPIs
        $currentRevenue = VehicleUnit::whereIn('branch_id', $branchFilter)
            ->where('status', 'sold')
            ->whereBetween('updated_at', [$currentStart, $currentEnd])
            ->sum('sale_price');

        $previousRevenue = VehicleUnit::whereIn('branch_id', $branchFilter)
            ->where('status', 'sold')
            ->whereBetween('updated_at', [$previousStart, $previousEnd])
            ->sum('sale_price');

        $currentUnitsSold = VehicleUnit::whereIn('branch_id', $branchFilter)
            ->where('status', 'sold')
            ->whereBetween('updated_at', [$currentStart, $currentEnd])
            ->count();

        $previousUnitsSold = VehicleUnit::whereIn('branch_id', $branchFilter)
            ->where('status', 'sold')
            ->whereBetween('updated_at', [$previousStart, $previousEnd])
            ->count();

        // SERVICE KPIs
        $currentWorkOrders = WorkOrder::whereIn('branch_id', $branchFilter)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        $previousWorkOrders = WorkOrder::whereIn('branch_id', $branchFilter)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $activeWorkOrders = WorkOrder::whereIn('branch_id', $branchFilter)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->count();

        $completedWorkOrders = WorkOrder::whereIn('branch_id', $branchFilter)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$currentStart, $currentEnd])
            ->count();

        $previousCompletedWorkOrders = WorkOrder::whereIn('branch_id', $branchFilter)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$previousStart, $previousEnd])
            ->count();

        $serviceRevenue = WorkOrder::whereIn('branch_id', $branchFilter)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$currentStart, $currentEnd])
            ->sum('actual_cost');

        $previousServiceRevenue = WorkOrder::whereIn('branch_id', $branchFilter)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$previousStart, $previousEnd])
            ->sum('actual_cost');

        // Average turnaround time (in hours)
        $avgTurnaround = WorkOrder::whereIn('branch_id', $branchFilter)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$currentStart, $currentEnd])
            ->whereNotNull('completed_at')
            ->whereNotNull('scheduled_at')
            ->get()
            ->avg(function ($wo) {
                if ($wo->completed_at && $wo->scheduled_at) {
                    return Carbon::parse($wo->scheduled_at)->diffInHours($wo->completed_at);
                }
                return 0;
            }) ?? 0;

        // LEAD & PIPELINE KPIs
        $totalLeads = Lead::whereIn('branch_id', $branchFilter)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        $previousLeads = Lead::whereIn('branch_id', $branchFilter)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $convertedLeads = Pipeline::whereIn('branch_id', $branchFilter)
            ->where('current_stage', 'won')
            ->whereBetween('updated_at', [$currentStart, $currentEnd])
            ->count();

        $previousConvertedLeads = Pipeline::whereIn('branch_id', $branchFilter)
            ->where('current_stage', 'won')
            ->whereBetween('updated_at', [$previousStart, $previousEnd])
            ->count();

        $leadConversionRate = $totalLeads > 0 ? ($convertedLeads / $totalLeads) * 100 : 0;
        $previousLeadConversionRate = $previousLeads > 0 ? ($previousConvertedLeads / $previousLeads) * 100 : 0;

        $testDrivesScheduled = TestDrive::whereIn('branch_id', $branchFilter)
            ->whereBetween('scheduled_date', [$currentStart, $currentEnd])
            ->count();

        $testDrivesCompleted = TestDrive::whereIn('branch_id', $branchFilter)
            ->where('status', 'completed')
            ->whereBetween('scheduled_date', [$currentStart, $currentEnd])
            ->count();

        // CUSTOMER KPIs - Calculate average of all rating fields
        $currentSurveys = CustomerSurvey::whereHas('customer', function ($q) use ($branchFilter) {
            $q->whereIn('branch_id', $branchFilter);
        })
            ->whereBetween('completed_at', [$currentStart, $currentEnd])
            ->whereNotNull('completed_at')
            ->where('status', 'completed')
            ->get();

        $avgSatisfaction = $currentSurveys->avg(function ($survey) {
            return $survey->average_rating; // Uses the accessor
        }) ?? 0;

        $previousSurveys = CustomerSurvey::whereHas('customer', function ($q) use ($branchFilter) {
            $q->whereIn('branch_id', $branchFilter);
        })
            ->whereBetween('completed_at', [$previousStart, $previousEnd])
            ->whereNotNull('completed_at')
            ->where('status', 'completed')
            ->get();

        $previousAvgSatisfaction = $previousSurveys->avg(function ($survey) {
            return $survey->average_rating; // Uses the accessor
        }) ?? 0;

        $npsScore = $this->calculateNPS($branchFilter, $currentStart, $currentEnd);
        $previousNPS = $this->calculateNPS($branchFilter, $previousStart, $previousEnd);

        $totalCustomers = Customer::whereIn('branch_id', $branchFilter)->count();

        // INVENTORY KPIs
        $unitsInStock = VehicleUnit::whereIn('branch_id', $branchFilter)
            ->where('status', 'in_stock')
            ->count();

        $totalInventoryValue = VehicleUnit::whereIn('branch_id', $branchFilter)
            ->where('status', 'in_stock')
            ->sum('purchase_price');

        // PARTS KPIs
        $lowStockParts = PartInventory::whereIn('branch_id', $branchFilter)
            ->whereColumn('quantity_on_hand', '<=', 'minimum_stock_level')
            ->count();

        $totalParts = PartInventory::whereIn('branch_id', $branchFilter)->sum('quantity_on_hand');

        $partsValue = PartInventory::whereIn('branch_id', $branchFilter)
            ->selectRaw('SUM(quantity_on_hand * unit_cost) as total')
            ->value('total') ?? 0;

        // WARRANTY KPIs
        $pendingClaims = WarrantyClaim::whereIn('branch_id', $branchFilter)
            ->whereIn('status', ['draft', 'submitted', 'under_review'])
            ->count();

        $approvedClaims = WarrantyClaim::whereIn('branch_id', $branchFilter)
            ->where('status', 'approved')
            ->whereBetween('updated_at', [$currentStart, $currentEnd])
            ->count();

        $totalClaimsAmount = WarrantyClaim::whereIn('branch_id', $branchFilter)
            ->where('status', 'approved')
            ->whereBetween('updated_at', [$currentStart, $currentEnd])
            ->sum(DB::raw('parts_claimed_amount + labor_claimed_amount'));

        // COMPLIANCE KPIs
        $overdueChecklists = ComplianceChecklistAssignment::whereIn('compliance_checklist_assignments.branch_id', $branchFilter)
            ->where('compliance_checklist_assignments.status', '!=', 'completed')
            ->join('compliance_checklists', 'compliance_checklist_assignments.compliance_checklist_id', '=', 'compliance_checklists.id')
            ->where('compliance_checklists.next_due_at', '<', now())
            ->count();

        $completedChecklists = ComplianceChecklistAssignment::whereIn('branch_id', $branchFilter)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$currentStart, $currentEnd])
            ->count();

        $totalChecklists = ComplianceChecklistAssignment::whereIn('branch_id', $branchFilter)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        $complianceRate = $totalChecklists > 0 ? ($completedChecklists / $totalChecklists) * 100 : 100;

        return [
            'sales' => [
                'revenue' => [
                    'current' => $currentRevenue,
                    'previous' => $previousRevenue,
                    'change' => $this->calculatePercentageChange($currentRevenue, $previousRevenue),
                ],
                'units_sold' => [
                    'current' => $currentUnitsSold,
                    'previous' => $previousUnitsSold,
                    'change' => $this->calculatePercentageChange($currentUnitsSold, $previousUnitsSold),
                ],
                'avg_deal_value' => [
                    'current' => $currentUnitsSold > 0 ? $currentRevenue / $currentUnitsSold : 0,
                    'previous' => $previousUnitsSold > 0 ? $previousRevenue / $previousUnitsSold : 0,
                ],
            ],
            'service' => [
                'work_orders' => [
                    'current' => $currentWorkOrders,
                    'active' => $activeWorkOrders,
                    'completed' => $completedWorkOrders,
                    'change' => $this->calculatePercentageChange($completedWorkOrders, $previousCompletedWorkOrders),
                ],
                'revenue' => [
                    'current' => $serviceRevenue,
                    'previous' => $previousServiceRevenue,
                    'change' => $this->calculatePercentageChange($serviceRevenue, $previousServiceRevenue),
                ],
                'avg_turnaround' => round($avgTurnaround, 1),
            ],
            'pipeline' => [
                'total_leads' => $totalLeads,
                'conversion_rate' => [
                    'current' => round($leadConversionRate, 1),
                    'previous' => round($previousLeadConversionRate, 1),
                    'change' => $leadConversionRate - $previousLeadConversionRate,
                ],
                'test_drives' => [
                    'scheduled' => $testDrivesScheduled,
                    'completed' => $testDrivesCompleted,
                ],
            ],
            'customers' => [
                'total' => $totalCustomers,
                'satisfaction' => [
                    'current' => round($avgSatisfaction, 1),
                    'previous' => round($previousAvgSatisfaction, 1),
                    'change' => $avgSatisfaction - $previousAvgSatisfaction,
                ],
                'nps' => [
                    'current' => round($npsScore, 1),
                    'previous' => round($previousNPS, 1),
                    'change' => $npsScore - $previousNPS,
                ],
            ],
            'inventory' => [
                'units_in_stock' => $unitsInStock,
                'total_value' => $totalInventoryValue,
                'low_stock_parts' => $lowStockParts,
                'total_parts' => $totalParts,
                'parts_value' => $partsValue,
            ],
            'warranty' => [
                'pending_claims' => $pendingClaims,
                'approved_claims' => $approvedClaims,
                'total_claims_amount' => $totalClaimsAmount,
            ],
            'compliance' => [
                'overdue_checklists' => $overdueChecklists,
                'completion_rate' => round($complianceRate, 1),
            ],
        ];
    }

    private function calculateNPS(array $branchFilter, Carbon $start, Carbon $end): float
    {
        $surveys = CustomerSurvey::whereHas('customer', function ($q) use ($branchFilter) {
            $q->whereIn('branch_id', $branchFilter);
        })
            ->whereBetween('completed_at', [$start, $end])
            ->whereNotNull('completed_at')
            ->where('status', 'completed')
            ->whereNotNull('nps_score')
            ->get();

        if ($surveys->isEmpty()) {
            return 0;
        }

        $total = $surveys->count();
        $promoters = $surveys->filter(fn($s) => $s->nps_category === 'promoter')->count();
        $detractors = $surveys->filter(fn($s) => $s->nps_category === 'detractor')->count();

        return (($promoters - $detractors) / $total) * 100;
    }

    private function calculatePercentageChange(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return (($current - $previous) / $previous) * 100;
    }

    private function getChartData(array $branchFilter, Carbon $start, Carbon $end): array
    {
        // Sales Pipeline Stages
        $pipelineStages = Pipeline::whereIn('branch_id', $branchFilter)
            ->selectRaw('current_stage, COUNT(*) as count, SUM(quote_amount) as total_value')
            ->whereNull('deleted_at')
            ->groupBy('current_stage')
            ->get()
            ->map(function ($stage) {
                return [
                    'stage' => ucfirst(str_replace('_', ' ', $stage->current_stage)),
                    'count' => $stage->count,
                    'value' => $stage->total_value ?? 0,
                ];
            });

        // Revenue Trend (last 12 months)
        $revenueTrend = VehicleUnit::whereIn('branch_id', $branchFilter)
            ->where('status', 'sold')
            ->where('updated_at', '>=', now()->subMonths(12))
            ->selectRaw('DATE_FORMAT(updated_at, "%Y-%m") as month, SUM(sale_price) as revenue, COUNT(*) as units')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Service Revenue Trend
        $serviceTrend = WorkOrder::whereIn('branch_id', $branchFilter)
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subMonths(12))
            ->selectRaw('DATE_FORMAT(completed_at, "%Y-%m") as month, SUM(actual_cost) as revenue, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Top Performing Sales Reps (by units sold)
        $topSalesReps = VehicleUnit::withoutBranchScope()
            ->whereIn('vehicle_units.branch_id', $branchFilter)
            ->where('vehicle_units.status', 'sold')
            ->whereBetween('vehicle_units.updated_at', [$start, $end])
            ->whereNotNull('vehicle_units.assigned_user_id')
            ->join('users', 'vehicle_units.assigned_user_id', '=', 'users.id')
            ->selectRaw('users.name, COUNT(*) as units_sold, SUM(vehicle_units.sale_price) as revenue')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('units_sold')
            ->limit(10)
            ->get();

        // Lead Source Analysis
        $leadSources = Lead::whereIn('branch_id', $branchFilter)
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->get();

        return [
            'pipeline_stages' => $pipelineStages,
            'revenue_trend' => $revenueTrend,
            'service_trend' => $serviceTrend,
            'top_sales_reps' => $topSalesReps,
            'lead_sources' => $leadSources,
        ];
    }

    private function getSystemAlerts(array $branchFilter): array
    {
        $alerts = [];

        // Low stock parts alert
        $lowStockCount = PartInventory::whereIn('branch_id', $branchFilter)
            ->whereColumn('quantity_on_hand', '<=', 'minimum_stock_level')
            ->count();

        if ($lowStockCount > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "{$lowStockCount} parts below minimum stock level",
                'time' => 'Now',
                'priority' => 'high',
            ];
        }

        // Pending warranty claims
        $pendingClaims = WarrantyClaim::whereIn('branch_id', $branchFilter)
            ->whereIn('status', ['submitted', 'under_review'])
            ->count();

        if ($pendingClaims > 0) {
            $alerts[] = [
                'type' => 'info',
                'message' => "{$pendingClaims} warranty claims pending approval",
                'time' => 'Now',
                'priority' => 'medium',
            ];
        }

        // Overdue PMS work orders
        $overdueWorkOrders = WorkOrder::whereIn('branch_id', $branchFilter)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->where('next_pms_due_date', '<', now())
            ->count();

        if ($overdueWorkOrders > 0) {
            $alerts[] = [
                'type' => 'error',
                'message' => "{$overdueWorkOrders} PMS work orders overdue",
                'time' => 'Now',
                'priority' => 'high',
            ];
        }

        // Overdue compliance checklists
        $overdueChecklists = ComplianceChecklistAssignment::whereIn('compliance_checklist_assignments.branch_id', $branchFilter)
            ->where('compliance_checklist_assignments.status', '!=', 'completed')
            ->join('compliance_checklists', 'compliance_checklist_assignments.compliance_checklist_id', '=', 'compliance_checklists.id')
            ->where('compliance_checklists.next_due_at', '<', now())
            ->count();

        if ($overdueChecklists > 0) {
            $alerts[] = [
                'type' => 'error',
                'message' => "{$overdueChecklists} compliance checklists overdue",
                'time' => 'Now',
                'priority' => 'high',
            ];
        }

        // Test drives scheduled today
        $todayTestDrives = TestDrive::whereIn('branch_id', $branchFilter)
            ->whereDate('scheduled_date', today())
            ->where('status', 'confirmed')
            ->count();

        if ($todayTestDrives > 0) {
            $alerts[] = [
                'type' => 'success',
                'message' => "{$todayTestDrives} test drives scheduled for today",
                'time' => 'Today',
                'priority' => 'low',
            ];
        }

        // Sort by priority
        $priorityOrder = ['high' => 1, 'medium' => 2, 'low' => 3];
        usort($alerts, function ($a, $b) use ($priorityOrder) {
            return $priorityOrder[$a['priority']] <=> $priorityOrder[$b['priority']];
        });

        return array_slice($alerts, 0, 10); // Return top 10 alerts
    }

    private function getRecentActivities(array $branchFilter, int $limit = 10): array
    {
        // Get recent activities from various modules
        $activities = [];

        // Recent work orders
        $recentWorkOrders = WorkOrder::whereIn('branch_id', $branchFilter)
            ->where('status', 'completed')
            ->orderByDesc('completed_at')
            ->limit(5)
            ->get(['work_order_number', 'completed_at'])
            ->map(function ($wo) {
                return [
                    'action' => "Work Order {$wo->work_order_number} completed",
                    'user' => 'Service Team',
                    'time' => $wo->completed_at->diffForHumans(),
                    'timestamp' => $wo->completed_at,
                ];
            });

        // Recent leads
        $recentLeads = Lead::whereIn('branch_id', $branchFilter)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['lead_id', 'created_at'])
            ->map(function ($lead) {
                return [
                    'action' => "New lead {$lead->lead_id} created",
                    'user' => 'Sales Team',
                    'time' => $lead->created_at->diffForHumans(),
                    'timestamp' => $lead->created_at,
                ];
            });

        // Recent customer surveys
        $recentSurveys = CustomerSurvey::whereHas('customer', function ($q) use ($branchFilter) {
            $q->whereIn('branch_id', $branchFilter);
        })
            ->whereNotNull('completed_at')
            ->where('status', 'completed')
            ->orderByDesc('completed_at')
            ->limit(5)
            ->get()
            ->map(function ($survey) {
                $avgRating = $survey->average_rating ?? 0;
                $stars = str_repeat('★', round($avgRating));
                return [
                    'action' => "Customer survey response received ({$stars})",
                    'user' => 'Customer Portal',
                    'time' => $survey->completed_at->diffForHumans(),
                    'timestamp' => $survey->completed_at,
                ];
            });

        $activities = $recentWorkOrders->concat($recentLeads)->concat($recentSurveys);

        // Sort by timestamp and limit
        return $activities->sortByDesc('timestamp')
            ->take($limit)
            ->values()
            ->map(function ($activity) {
                unset($activity['timestamp']);
                return $activity;
            })
            ->toArray();
    }

    // TEST DATA METHODS
    private function getTestKPIs(): array
    {
        return [
            'sales' => [
                'revenue' => [
                    'current' => 12500000,
                    'previous' => 10200000,
                    'change' => 22.55,
                ],
                'units_sold' => [
                    'current' => 45,
                    'previous' => 38,
                    'change' => 18.42,
                ],
                'avg_deal_value' => [
                    'current' => 277777.78,
                    'previous' => 268421.05,
                ],
            ],
            'service' => [
                'work_orders' => [
                    'current' => 156,
                    'active' => 23,
                    'completed' => 133,
                    'change' => 15.65,
                ],
                'revenue' => [
                    'current' => 3250000,
                    'previous' => 2980000,
                    'change' => 9.06,
                ],
                'avg_turnaround' => 18.5,
            ],
            'pipeline' => [
                'total_leads' => 234,
                'conversion_rate' => [
                    'current' => 19.2,
                    'previous' => 16.8,
                    'change' => 2.4,
                ],
                'test_drives' => [
                    'scheduled' => 67,
                    'completed' => 52,
                ],
            ],
            'customers' => [
                'total' => 1847,
                'satisfaction' => [
                    'current' => 4.6,
                    'previous' => 4.4,
                    'change' => 0.2,
                ],
                'nps' => [
                    'current' => 68.5,
                    'previous' => 62.3,
                    'change' => 6.2,
                ],
            ],
            'inventory' => [
                'units_in_stock' => 127,
                'total_value' => 42500000,
                'low_stock_parts' => 18,
                'total_parts' => 2456,
                'parts_value' => 8750000,
            ],
            'warranty' => [
                'pending_claims' => 12,
                'approved_claims' => 34,
                'total_claims_amount' => 1250000,
            ],
            'compliance' => [
                'overdue_checklists' => 3,
                'completion_rate' => 94.5,
            ],
        ];
    }

    private function getTestChartData(): array
    {
        return [
            'pipeline_stages' => [
                ['stage' => 'Lead', 'count' => 89, 'value' => 22250000],
                ['stage' => 'Qualified', 'count' => 67, 'value' => 16750000],
                ['stage' => 'Quote Sent', 'count' => 45, 'value' => 11250000],
                ['stage' => 'Test Drive Scheduled', 'count' => 34, 'value' => 8500000],
                ['stage' => 'Test Drive Completed', 'count' => 28, 'value' => 7000000],
                ['stage' => 'Reservation Made', 'count' => 19, 'value' => 4750000],
            ],
            'revenue_trend' => [
                ['month' => '2025-01', 'revenue' => 9500000, 'units' => 32],
                ['month' => '2025-02', 'revenue' => 10200000, 'units' => 35],
                ['month' => '2025-03', 'revenue' => 11800000, 'units' => 41],
                ['month' => '2025-04', 'revenue' => 10900000, 'units' => 38],
                ['month' => '2025-05', 'revenue' => 12300000, 'units' => 43],
                ['month' => '2025-06', 'revenue' => 13500000, 'units' => 47],
                ['month' => '2025-07', 'revenue' => 11700000, 'units' => 40],
                ['month' => '2025-08', 'revenue' => 12800000, 'units' => 44],
                ['month' => '2025-09', 'revenue' => 13200000, 'units' => 46],
                ['month' => '2025-10', 'revenue' => 12500000, 'units' => 45],
            ],
            'service_trend' => [
                ['month' => '2025-01', 'revenue' => 2800000, 'count' => 142],
                ['month' => '2025-02', 'revenue' => 2950000, 'count' => 148],
                ['month' => '2025-03', 'revenue' => 3100000, 'count' => 156],
                ['month' => '2025-04', 'revenue' => 2900000, 'count' => 145],
                ['month' => '2025-05', 'revenue' => 3200000, 'count' => 162],
                ['month' => '2025-06', 'revenue' => 3350000, 'count' => 168],
                ['month' => '2025-07', 'revenue' => 3050000, 'count' => 153],
                ['month' => '2025-08', 'revenue' => 3180000, 'count' => 159],
                ['month' => '2025-09', 'revenue' => 3280000, 'count' => 164],
                ['month' => '2025-10', 'revenue' => 3250000, 'count' => 156],
            ],
            'top_sales_reps' => [
                ['name' => 'Juan Dela Cruz', 'units_sold' => 12, 'revenue' => 3340000],
                ['name' => 'Maria Santos', 'units_sold' => 10, 'revenue' => 2780000],
                ['name' => 'Pedro Gonzales', 'units_sold' => 9, 'revenue' => 2510000],
                ['name' => 'Ana Reyes', 'units_sold' => 8, 'revenue' => 2220000],
                ['name' => 'Carlos Mendoza', 'units_sold' => 6, 'revenue' => 1670000],
            ],
            'lead_sources' => [
                ['source' => 'walk_in', 'count' => 98],
                ['source' => 'web_form', 'count' => 67],
                ['source' => 'referral', 'count' => 45],
                ['source' => 'phone', 'count' => 24],
            ],
        ];
    }

    private function getTestAlerts(): array
    {
        return [
            [
                'type' => 'warning',
                'message' => '18 parts below minimum stock level',
                'time' => 'Now',
                'priority' => 'high',
            ],
            [
                'type' => 'info',
                'message' => '12 warranty claims pending approval',
                'time' => 'Now',
                'priority' => 'medium',
            ],
            [
                'type' => 'error',
                'message' => '5 PMS work orders overdue',
                'time' => 'Now',
                'priority' => 'high',
            ],
            [
                'type' => 'error',
                'message' => '3 compliance checklists overdue',
                'time' => 'Now',
                'priority' => 'high',
            ],
            [
                'type' => 'success',
                'message' => '8 test drives scheduled for today',
                'time' => 'Today',
                'priority' => 'low',
            ],
        ];
    }

    private function getTestActivities(): array
    {
        return [
            ['action' => 'Work Order WO-20251027-0156 completed', 'user' => 'Service Team', 'time' => '2 minutes ago'],
            ['action' => 'New lead LD-2025-234 created', 'user' => 'Sales Team', 'time' => '15 minutes ago'],
            ['action' => 'Customer survey response received (★★★★★)', 'user' => 'Customer Portal', 'time' => '1 hour ago'],
            ['action' => 'Work Order WO-20251027-0155 completed', 'user' => 'Service Team', 'time' => '2 hours ago'],
            ['action' => 'New lead LD-2025-233 created', 'user' => 'Sales Team', 'time' => '3 hours ago'],
            ['action' => 'Customer survey response received (★★★★)', 'user' => 'Customer Portal', 'time' => '4 hours ago'],
            ['action' => 'Work Order WO-20251026-0089 completed', 'user' => 'Service Team', 'time' => '5 hours ago'],
            ['action' => 'New lead LD-2025-232 created', 'user' => 'Sales Team', 'time' => '6 hours ago'],
            ['action' => 'Customer survey response received (★★★★★)', 'user' => 'Customer Portal', 'time' => '7 hours ago'],
            ['action' => 'Work Order WO-20251026-0088 completed', 'user' => 'Service Team', 'time' => '8 hours ago'],
        ];
    }
}
