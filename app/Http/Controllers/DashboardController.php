<?php

namespace App\Http\Controllers;

use App\Services\ChecklistAssignmentService;
use Illuminate\Http\Request;
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

        return Inertia::render('dashboard', [
            'assignedChecklists' => $this->assignmentService->assignmentsForUser($user, 5)->values(),
        ]);
    }
}
