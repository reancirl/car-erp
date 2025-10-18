<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetBranchContext
{
    /**
     * Handle an incoming request.
     *
     * Sets the current branch context for the authenticated user.
     * This middleware ensures that branch information is available
     * throughout the request lifecycle.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();
            
            // Share branch information with all Inertia views
            if ($user->branch_id) {
                $branch = $user->branch;
                
                // Share with Inertia
                \Inertia\Inertia::share('currentBranch', [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'code' => $branch->code,
                ]);
            }
            
            // Store branch ID in session for easier access
            session(['current_branch_id' => $user->branch_id]);
        }
        
        return $next($request);
    }
}
