<?php

namespace App\Http\Requests;

use App\Models\ComplianceChecklist;
use App\Models\ComplianceChecklistTrigger;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreComplianceChecklistRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('compliance.manage_checklists');
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $user = $this->user();

        if (!$user->hasRole(['admin', 'auditor'])) {
            $this->merge(['branch_id' => $user->branch_id]);
        }

        $dueTime = $this->input('due_time');
        if ($dueTime) {
            $this->merge(['due_time' => substr($dueTime, 0, 5)]);
        }

        $advanceOffsets = collect($this->input('advance_reminder_offsets', []))
            ->filter(fn($value) => $value !== null && $value !== '')
            ->map(fn($value) => (int) $value)
            ->filter(fn($value) => $value >= 0)
            ->unique()
            ->values()
            ->all();

        $items = collect($this->input('items', []))
            ->map(function ($item, $index) {
                return [
                    'id' => $item['id'] ?? null,
                    'title' => $item['title'] ?? null,
                    'description' => $item['description'] ?? null,
                    'is_required' => filter_var($item['is_required'] ?? true, FILTER_VALIDATE_BOOLEAN),
                    'is_active' => filter_var($item['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                    'sort_order' => isset($item['sort_order']) ? (int) $item['sort_order'] : $index,
                    'metadata' => $item['metadata'] ?? null,
                ];
            })
            ->values()
            ->all();

        $triggers = collect($this->input('triggers', []))
            ->map(function ($trigger) {
                return [
                    'id' => $trigger['id'] ?? null,
                    'trigger_type' => $trigger['trigger_type'] ?? null,
                    'offset_hours' => isset($trigger['offset_hours']) ? (int) $trigger['offset_hours'] : 0,
                    'channels' => collect($trigger['channels'] ?? [])
                        ->filter(fn($channel) => is_string($channel) && $channel !== '')
                        ->unique()
                        ->values()
                        ->all(),
                    'escalate_to_user_id' => $trigger['escalate_to_user_id'] ?? null,
                    'escalate_to_role' => $trigger['escalate_to_role'] ?? null,
                    'is_active' => filter_var($trigger['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                    'metadata' => $trigger['metadata'] ?? null,
                ];
            })
            ->values()
            ->all();

        $this->merge([
            'is_recurring' => $this->boolean('is_recurring', true),
            'requires_acknowledgement' => $this->boolean('requires_acknowledgement', false),
            'allow_partial_completion' => $this->boolean('allow_partial_completion', true),
            'advance_reminder_offsets' => $advanceOffsets,
            'items' => $items,
            'triggers' => $triggers,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'exists:branches,id'],
            'title' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'unique:compliance_checklists,code'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:75'],
            'status' => ['nullable', 'in:' . implode(',', [
                ComplianceChecklist::STATUS_ACTIVE,
                ComplianceChecklist::STATUS_INACTIVE,
                ComplianceChecklist::STATUS_ARCHIVED,
            ])],
            'frequency_type' => ['required', Rule::in(ComplianceChecklist::FREQUENCIES)],
            'frequency_interval' => ['required', 'integer', 'min:1', 'max:365'],
            'custom_frequency_unit' => [
                'nullable',
                Rule::requiredIf($this->input('frequency_type') === ComplianceChecklist::FREQUENCY_CUSTOM),
                Rule::in(['hours', 'days', 'weeks', 'months', 'years']),
            ],
            'custom_frequency_value' => [
                'nullable',
                Rule::requiredIf($this->input('frequency_type') === ComplianceChecklist::FREQUENCY_CUSTOM),
                'integer',
                'min:1',
                'max:1000',
            ],
            'start_date' => ['required', 'date'],
            'due_time' => ['nullable', 'date_format:H:i'],
            'is_recurring' => ['boolean'],
            'assigned_user_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'assigned_role' => ['nullable', 'string', 'max:75'],
            'escalate_to_user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id'),
            ],
            'escalation_offset_hours' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'advance_reminder_offsets' => ['nullable', 'array'],
            'advance_reminder_offsets.*' => ['integer', 'min:0', 'max:10000'],
            'metadata' => ['nullable', 'array'],
            'requires_acknowledgement' => ['boolean'],
            'allow_partial_completion' => ['boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['nullable', 'integer'],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.is_required' => ['boolean'],
            'items.*.is_active' => ['boolean'],
            'items.*.sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'items.*.metadata' => ['nullable', 'array'],
            'triggers' => ['nullable', 'array'],
            'triggers.*.id' => ['nullable', 'integer'],
            'triggers.*.trigger_type' => [
                'required',
                Rule::in([
                    ComplianceChecklistTrigger::TYPE_ADVANCE,
                    ComplianceChecklistTrigger::TYPE_DUE,
                    ComplianceChecklistTrigger::TYPE_ESCALATION,
                ]),
            ],
            'triggers.*.offset_hours' => ['required', 'integer', 'min:-10000', 'max:10000'],
            'triggers.*.channels' => ['nullable', 'array'],
            'triggers.*.channels.*' => ['string', 'max:25'],
            'triggers.*.escalate_to_user_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'triggers.*.escalate_to_role' => ['nullable', 'string', 'max:75'],
            'triggers.*.is_active' => ['boolean'],
            'triggers.*.metadata' => ['nullable', 'array'],
        ];
    }

    /**
     * Custom attribute names.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'frequency_type' => 'frequency',
            'frequency_interval' => 'frequency interval',
            'custom_frequency_unit' => 'custom frequency unit',
            'custom_frequency_value' => 'custom frequency value',
            'start_date' => 'start date',
            'due_time' => 'due time',
            'advance_reminder_offsets.*' => 'advance reminder offset',
            'items' => 'checklist items',
            'items.*.title' => 'checklist item title',
            'triggers' => 'reminder triggers',
            'triggers.*.trigger_type' => 'trigger type',
            'triggers.*.offset_hours' => 'trigger offset (hours)',
        ];
    }
}
