<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Pipeline;
use App\Models\TestDrive;
use App\Models\Customer;
use App\Models\CustomerSurvey;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class PerformanceMetricsController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $branchId = $request->get('branch_id');
        
        // Branch filtering: admin sees all, others see their branch
        if (!$user->hasRole('admin') && !$user->hasRole('auditor')) {
            $branchId = $user->branch_id;
        }

        // Date range filtering (default: this month)
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        // Calculate KPIs
        $kpis = $this->calculateKPIs($branchId, $startDate, $endDate);
        
        // Calculate sales rep performance
        $salesRepPerformance = $this->calculateSalesRepPerformance($branchId, $startDate, $endDate);

        return Inertia::render('sales/performance-metrics', [
            'kpis' => $kpis,
            'salesRepPerformance' => $salesRepPerformance,
            'filters' => [
                'branch_id' => $branchId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    private function calculateKPIs($branchId, $startDate, $endDate)
    {
        // Base query with branch filtering
        $leadsQuery = Lead::query();
        $pipelinesQuery = Pipeline::query();
        $testDrivesQuery = TestDrive::query();
        $surveysQuery = CustomerSurvey::query();

        if ($branchId) {
            $leadsQuery->where('branch_id', $branchId);
            $pipelinesQuery->where('branch_id', $branchId);
            $testDrivesQuery->where('branch_id', $branchId);
        }

        // Current period
        $leadsQuery->whereBetween('created_at', [$startDate, $endDate]);
        $pipelinesQuery->whereBetween('created_at', [$startDate, $endDate]);
        $testDrivesQuery->whereBetween('created_at', [$startDate, $endDate]);
        $surveysQuery->whereBetween('created_at', [$startDate, $endDate]);

        // Previous period (for comparison)
        $periodLength = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate));
        $prevStartDate = Carbon::parse($startDate)->subDays($periodLength);
        $prevEndDate = Carbon::parse($startDate)->subDay();

        // 1. Lead Conversion Rate
        $totalLeads = (clone $leadsQuery)->count();
        $qualifiedLeads = (clone $leadsQuery)->where('status', 'qualified')->count();
        $currentConversionRate = $totalLeads > 0 ? ($qualifiedLeads / $totalLeads) * 100 : 0;

        $prevTotalLeads = Lead::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->count();
        $prevQualifiedLeads = Lead::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->where('status', 'qualified')
            ->count();
        $prevConversionRate = $prevTotalLeads > 0 ? ($prevQualifiedLeads / $prevTotalLeads) * 100 : 0;

        // 2. Active Pipelines Count
        $activePipelines = Pipeline::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereNotIn('current_stage', ['won', 'lost'])
            ->count();

        $prevActivePipelines = Pipeline::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->whereNotIn('current_stage', ['won', 'lost'])
            ->count();

        // 3. Test Drive Completion Rate
        $totalTestDrives = (clone $testDrivesQuery)->count();
        $completedTestDrives = (clone $testDrivesQuery)->where('status', 'completed')->count();
        $currentTestDriveRate = $totalTestDrives > 0 ? ($completedTestDrives / $totalTestDrives) * 100 : 0;

        $prevTotalTestDrives = TestDrive::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->count();
        $prevCompletedTestDrives = TestDrive::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->where('status', 'completed')
            ->count();
        $prevTestDriveRate = $prevTotalTestDrives > 0 ? ($prevCompletedTestDrives / $prevTotalTestDrives) * 100 : 0;

        // 4. Customer Satisfaction (from surveys)
        $avgSatisfaction = (clone $surveysQuery)
            ->where('status', 'completed')
            ->avg('overall_rating') ?? 0;

        $prevAvgSatisfaction = CustomerSurvey::query()
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->where('status', 'completed')
            ->avg('overall_rating') ?? 0;

        // 5. Average Pipeline Duration (days)
        $avgPipelineDuration = Pipeline::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('current_stage', ['won', 'lost'])
            ->selectRaw('AVG(TIMESTAMPDIFF(DAY, created_at, updated_at)) as avg_days')
            ->value('avg_days') ?? 0;

        $prevAvgPipelineDuration = Pipeline::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->whereIn('current_stage', ['won', 'lost'])
            ->selectRaw('AVG(TIMESTAMPDIFF(DAY, created_at, updated_at)) as avg_days')
            ->value('avg_days') ?? 0;

        // 6. Pipeline Win Rate
        $closedPipelines = Pipeline::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('current_stage', ['won', 'lost'])
            ->count();
        $wonPipelines = Pipeline::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('current_stage', 'won')
            ->count();
        $currentWinRate = $closedPipelines > 0 ? ($wonPipelines / $closedPipelines) * 100 : 0;

        $prevClosedPipelines = Pipeline::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->whereIn('current_stage', ['won', 'lost'])
            ->count();
        $prevWonPipelines = Pipeline::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate])
            ->where('current_stage', 'won')
            ->count();
        $prevWinRate = $prevClosedPipelines > 0 ? ($prevWonPipelines / $prevClosedPipelines) * 100 : 0;

        return [
            // Summary cards
            'summary' => [
                'total_leads' => $totalLeads,
                'active_pipelines' => $activePipelines,
                'completed_test_drives' => $completedTestDrives,
            ],
            // Detailed KPIs
            'metrics' => [
                [
                    'id' => 1,
                    'metric_name' => 'Lead Conversion Rate',
                    'current_value' => round($currentConversionRate, 1),
                    'previous_value' => round($prevConversionRate, 1),
                    'unit' => '%',
                    'target_value' => 25.0,
                    'period' => 'This Period',
                    'trend' => $currentConversionRate >= $prevConversionRate ? 'up' : 'down',
                    'data_source' => 'Lead Management System',
                    'last_updated' => now()->toDateTimeString(),
                    'auto_calculated' => true,
                ],
                [
                    'id' => 2,
                    'metric_name' => 'Active Pipelines',
                    'current_value' => $activePipelines,
                    'previous_value' => $prevActivePipelines,
                    'unit' => '',
                    'target_value' => 50,
                    'period' => 'Current',
                    'trend' => $activePipelines >= $prevActivePipelines ? 'up' : 'down',
                    'data_source' => 'Pipeline System',
                    'last_updated' => now()->toDateTimeString(),
                    'auto_calculated' => true,
                ],
                [
                    'id' => 3,
                    'metric_name' => 'Test Drive Completion Rate',
                    'current_value' => round($currentTestDriveRate, 1),
                    'previous_value' => round($prevTestDriveRate, 1),
                    'unit' => '%',
                    'target_value' => 80.0,
                    'period' => 'This Period',
                    'trend' => $currentTestDriveRate >= $prevTestDriveRate ? 'up' : 'down',
                    'data_source' => 'Test Drive System',
                    'last_updated' => now()->toDateTimeString(),
                    'auto_calculated' => true,
                ],
                [
                    'id' => 4,
                    'metric_name' => 'Customer Satisfaction',
                    'current_value' => round($avgSatisfaction, 1),
                    'previous_value' => round($prevAvgSatisfaction, 1),
                    'unit' => '/5',
                    'target_value' => 4.5,
                    'period' => 'This Period',
                    'trend' => $avgSatisfaction >= $prevAvgSatisfaction ? 'up' : 'down',
                    'data_source' => 'Survey System',
                    'last_updated' => now()->toDateTimeString(),
                    'auto_calculated' => true,
                ],
                [
                    'id' => 5,
                    'metric_name' => 'Average Pipeline Duration',
                    'current_value' => round($avgPipelineDuration, 1),
                    'previous_value' => round($prevAvgPipelineDuration, 1),
                    'unit' => ' days',
                    'target_value' => 14.0,
                    'period' => 'This Period',
                    'trend' => $avgPipelineDuration <= $prevAvgPipelineDuration ? 'up' : 'down', // Lower is better
                    'data_source' => 'Pipeline System',
                    'last_updated' => now()->toDateTimeString(),
                    'auto_calculated' => true,
                ],
                [
                    'id' => 6,
                    'metric_name' => 'Pipeline Win Rate',
                    'current_value' => round($currentWinRate, 1),
                    'previous_value' => round($prevWinRate, 1),
                    'unit' => '%',
                    'target_value' => 30.0,
                    'period' => 'This Period',
                    'trend' => $currentWinRate >= $prevWinRate ? 'up' : 'down',
                    'data_source' => 'Pipeline System',
                    'last_updated' => now()->toDateTimeString(),
                    'auto_calculated' => true,
                ],
            ],
        ];
    }

    private function calculateSalesRepPerformance($branchId, $startDate, $endDate)
    {
        // Get sales reps (users with sales_rep or sales_manager role)
        $salesReps = User::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereHas('roles', function ($q) {
                $q->whereIn('name', ['sales_rep', 'sales_manager']);
            })
            ->get();

        $performance = [];

        foreach ($salesReps as $rep) {
            // Leads assigned
            $leadsAssigned = Lead::query()
                ->where('assigned_to', $rep->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            // Leads converted (qualified)
            $leadsConverted = Lead::query()
                ->where('assigned_to', $rep->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'qualified')
                ->count();

            // Conversion rate
            $conversionRate = $leadsAssigned > 0 ? ($leadsConverted / $leadsAssigned) * 100 : 0;

            // Pipelines managed
            $pipelinesManaged = Pipeline::query()
                ->where('sales_rep_id', $rep->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            // Won pipelines
            $pipelinesWon = Pipeline::query()
                ->where('sales_rep_id', $rep->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('current_stage', 'won')
                ->count();

            // Pipeline value (active)
            $pipelineValue = Pipeline::query()
                ->where('sales_rep_id', $rep->id)
                ->whereNotIn('current_stage', ['won', 'lost'])
                ->sum('quote_amount') ?? 0;

            // Test drives conducted
            $testDrivesConducted = TestDrive::query()
                ->where('sales_rep_id', $rep->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            // Customer satisfaction (from customers assigned to this rep)
            $customerSatisfaction = Customer::query()
                ->whereHas('surveys', function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate])
                      ->where('status', 'completed');
                })
                ->avg('satisfaction_rating') ?? 0;

            $performance[] = [
                'id' => $rep->id,
                'rep_name' => $rep->name,
                'leads_assigned' => $leadsAssigned,
                'leads_converted' => $leadsConverted,
                'conversion_rate' => round($conversionRate, 1),
                'pipelines_managed' => $pipelinesManaged,
                'pipelines_won' => $pipelinesWon,
                'pipeline_value' => $pipelineValue,
                'test_drives_conducted' => $testDrivesConducted,
                'customer_satisfaction' => round($customerSatisfaction, 1),
            ];
        }

        // Sort by conversion rate (descending) and add rank
        usort($performance, fn($a, $b) => $b['conversion_rate'] <=> $a['conversion_rate']);
        
        foreach ($performance as $index => &$perf) {
            $perf['rank'] = $index + 1;
        }

        return $performance;
    }
}
