<?php

namespace App\Http\Controllers;

use App\Models\CustomerSurvey;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicSurveyController extends Controller
{
    /**
     * Display the public survey form
     */
    public function show(string $token): Response
    {
        $survey = CustomerSurvey::with(['customer', 'branch'])
            ->where('token', $token)
            ->firstOrFail();

        // Check if survey is already completed
        if ($survey->isCompleted()) {
            return Inertia::render('public/survey-completed', [
                'survey' => $survey,
                'customer' => $survey->customer,
            ]);
        }

        // Check if survey is expired
        if ($survey->isExpired()) {
            $survey->markAsExpired();
            return Inertia::render('public/survey-expired', [
                'survey' => $survey,
            ]);
        }

        return Inertia::render('public/survey-form', [
            'survey' => [
                'id' => $survey->id,
                'token' => $survey->token,
                'survey_type' => $survey->survey_type,
                'expires_at' => $survey->expires_at,
            ],
            'customer' => [
                'first_name' => $survey->customer->first_name,
                'last_name' => $survey->customer->last_name,
            ],
            'branch' => [
                'name' => $survey->branch->name,
            ],
        ]);
    }

    /**
     * Submit the survey response
     */
    public function submit(Request $request, string $token): RedirectResponse
    {
        $survey = CustomerSurvey::where('token', $token)->firstOrFail();

        // Validate survey can be completed
        if (!$survey->canBeCompleted()) {
            return redirect()->route('survey.show', $token)
                ->with('error', 'This survey cannot be completed.');
        }

        // Validate the request
        $validated = $request->validate([
            'overall_rating' => 'required|integer|min:1|max:5',
            'product_quality' => 'nullable|integer|min:1|max:5',
            'service_quality' => 'nullable|integer|min:1|max:5',
            'staff_friendliness' => 'nullable|integer|min:1|max:5',
            'facility_cleanliness' => 'nullable|integer|min:1|max:5',
            'value_for_money' => 'nullable|integer|min:1|max:5',
            'what_went_well' => 'nullable|string|max:1000',
            'what_needs_improvement' => 'nullable|string|max:1000',
            'additional_comments' => 'nullable|string|max:2000',
            'nps_score' => 'required|integer|min:0|max:10',
            'nps_reason' => 'nullable|string|max:500',
            'wants_followup' => 'boolean',
            'preferred_contact_method' => 'nullable|string|in:email,phone,sms',
        ]);

        // Add metadata
        $validated['ip_address'] = $request->ip();
        $validated['user_agent'] = $request->userAgent();

        // Update survey
        $survey->update($validated);
        $survey->markAsCompleted();

        // Update customer satisfaction rating based on overall rating
        $this->updateCustomerSatisfaction($survey);

        return redirect()->route('survey.show', $token)
            ->with('success', 'Thank you for your feedback!');
    }

    /**
     * Update customer's satisfaction rating
     */
    private function updateCustomerSatisfaction(CustomerSurvey $survey): void
    {
        $customer = $survey->customer;
        
        // Map 1-5 rating to satisfaction levels
        $satisfactionMap = [
            5 => 'very_satisfied',
            4 => 'satisfied',
            3 => 'neutral',
            2 => 'dissatisfied',
            1 => 'very_dissatisfied',
        ];

        if (isset($satisfactionMap[$survey->overall_rating])) {
            $customer->update([
                'satisfaction_rating' => $satisfactionMap[$survey->overall_rating],
            ]);
        }
    }
}
