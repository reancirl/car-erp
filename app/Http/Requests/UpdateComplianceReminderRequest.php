<?php

namespace App\Http\Requests;

use App\Models\ComplianceReminder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateComplianceReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('compliance.manage_reminders');
    }

    protected function prepareForValidation(): void
    {
        $user = $this->user();
        $reminder = $this->route('reminder');

        if (!$user->hasRole(['admin', 'auditor'])) {
            $this->merge(['branch_id' => $reminder?->branch_id ?? $user->branch_id]);
        }

        $deliveryChannels = collect($this->input('delivery_channels', $reminder?->delivery_channels ?? []))
            ->filter(fn($channel) => is_string($channel) && $channel !== '')
            ->unique()
            ->values()
            ->all();

        $this->merge([
            'auto_escalate' => $this->boolean('auto_escalate', (bool) $reminder?->auto_escalate),
            'delivery_channels' => $deliveryChannels,
            'updated_by' => $user->id,
        ]);
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'exists:branches,id'],
            'compliance_checklist_id' => ['nullable', 'exists:compliance_checklists,id'],
            'compliance_checklist_assignment_id' => ['nullable', 'exists:compliance_checklist_assignments,id'],
            'assigned_user_id' => ['nullable', 'exists:users,id'],
            'assigned_role' => ['nullable', 'string', 'max:75'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'reminder_type' => ['required', Rule::in(ComplianceReminder::TYPES)],
            'priority' => ['required', Rule::in(ComplianceReminder::PRIORITIES)],
            'delivery_channel' => ['required', Rule::in(ComplianceReminder::CHANNELS)],
            'delivery_channels' => ['nullable', 'array'],
            'delivery_channels.*' => [Rule::in(ComplianceReminder::CHANNELS)],
            'remind_at' => ['required', 'date'],
            'due_at' => ['nullable', 'date', 'after_or_equal:remind_at'],
            'escalate_at' => ['nullable', 'date', 'after:remind_at'],
            'status' => ['required', Rule::in(ComplianceReminder::STATUSES)],
            'auto_escalate' => ['boolean'],
            'escalate_to_user_id' => ['nullable', 'exists:users,id'],
            'escalate_to_role' => ['nullable', 'string', 'max:75'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function attributes(): array
    {
        return [
            'remind_at' => 'reminder schedule',
            'delivery_channel' => 'primary delivery channel',
        ];
    }
}
