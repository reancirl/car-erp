<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\TestDrive;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardCalendarController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : Carbon::now()->startOfDay();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : Carbon::now()->addDays(30)->endOfDay();
        $branchId = $request->input('branch_id');

        $branchFilter = $branchId ? [(int) $branchId] : $this->getUserBranches($user);

        $events = $this->getCalendarEvents($branchFilter, $startDate, $endDate);

        $branches = Branch::select('id', 'name', 'code')->where('status', 'active')->orderBy('name')->get();

        return Inertia::render('dashboard/calendar', [
            'events' => $events,
            'branches' => $branches,
            'filters' => [
                'branch_id' => $branchId,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
        ]);
    }

    private function getUserBranches($user): array
    {
        if ($user->hasRole(['admin', 'manager'])) {
            return Branch::where('status', 'active')->pluck('id')->toArray();
        }

        return $user->branch_id ? [$user->branch_id] : [];
    }

    private function getCalendarEvents(array $branchFilter, Carbon $start, Carbon $end): array
    {
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
}
