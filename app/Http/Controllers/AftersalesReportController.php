<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AftersalesReportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->subDays(90);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now();
        $branchId = $request->branch_id;

        $baseQuery = WorkOrder::with(['serviceType', 'branch', 'vehicleUnit'])
            ->when($branchId && $user->hasRole(['admin', 'auditor']), fn($q) => $q->where('branch_id', $branchId));

        // PMS compliance (maintenance category)
        $maintenanceQuery = (clone $baseQuery)->whereHas('serviceType', fn($q) => $q->where('category', 'maintenance'));

        $pmsDueOrders = $maintenanceQuery
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('due_date', [$startDate->toDateString(), $endDate->toDateString()])
                    ->orWhereBetween('next_pms_due_date', [$startDate, $endDate]);
            })
            ->get();

        $pmsTotal = $pmsDueOrders->count();
        $pmsCompletedOnTime = $pmsDueOrders->filter(function ($wo) {
            $due = $wo->due_date ?? $wo->next_pms_due_date;
            return $wo->status === 'completed'
                && $wo->completed_at
                && $due
                && $wo->completed_at->lte(Carbon::parse($due)->endOfDay());
        })->count();

        $pmsCompletedLate = $pmsDueOrders->filter(function ($wo) {
            $due = $wo->due_date ?? $wo->next_pms_due_date;
            return $wo->status === 'completed'
                && $wo->completed_at
                && $due
                && $wo->completed_at->gt(Carbon::parse($due)->endOfDay());
        })->count();

        $pmsPending = $pmsTotal - ($pmsCompletedOnTime + $pmsCompletedLate);
        $pmsComplianceRate = $pmsTotal > 0 ? round(($pmsCompletedOnTime / $pmsTotal) * 100, 1) : 0;

        $pmsCompliance = [
            'total_due' => $pmsTotal,
            'completed_on_time' => $pmsCompletedOnTime,
            'completed_late' => $pmsCompletedLate,
            'pending' => $pmsPending,
            'compliance_rate' => $pmsComplianceRate,
        ];

        // Repeat repairs (repair/warranty categories)
        $repeatRepairs = (clone $baseQuery)
            ->whereHas('serviceType', fn($q) => $q->whereIn('category', ['repair', 'warranty']))
            ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereNotIn('status', ['cancelled', 'draft'])
            ->whereNotNull('vehicle_unit_id')
            ->get()
            ->groupBy('vehicle_unit_id')
            ->filter(fn($group) => $group->count() > 1)
            ->map(function ($group) {
                $latest = $group->sortByDesc('completed_at')->first();
                $unit = $latest?->vehicleUnit;
                $branch = $latest?->branch;

                return [
                    'vehicle_unit_id' => $latest?->vehicle_unit_id,
                    'stock_number' => $unit?->stock_number,
                    'vin' => $unit?->vin,
                    'branch' => $branch ? $branch->name : null,
                    'count' => $group->count(),
                    'last_service_date' => optional($latest?->completed_at)->toDateString(),
                    'last_issue' => $latest?->diagnostic_findings ?? $latest?->customer_concerns,
                    'service_types' => $group->pluck('serviceType.name')->filter()->unique()->values(),
                ];
            })
            ->values();

        $branches = $user->hasRole(['admin', 'auditor'])
            ? Branch::orderBy('name')->get(['id', 'name', 'code'])
            : null;

        return Inertia::render('service/aftersales-reports', [
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'branch_id' => $branchId,
            ],
            'pmsCompliance' => $pmsCompliance,
            'repeatRepairs' => $repeatRepairs,
            'branches' => $branches,
        ]);
    }
}
