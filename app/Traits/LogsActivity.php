<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    protected function logActivity(
        string $action,
        string $module,
        string $description,
        $subject = null,
        array $properties = [],
        string $status = 'success',
        ?string $event = null
    ): ActivityLog {
        $logData = [
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'status' => $status,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'properties' => $properties,
            'log_name' => strtolower($module),
        ];

        if ($subject) {
            $logData['subject_type'] = get_class($subject);
            $logData['subject_id'] = $subject->id ?? null;
            $logData['event'] = $event;
        }

        if (Auth::check()) {
            $logData['causer_type'] = get_class(Auth::user());
            $logData['causer_id'] = Auth::id();
        }

        return ActivityLog::create($logData);
    }

    protected function logCreated(string $module, $subject, string $description, array $properties = []): ActivityLog
    {
        return $this->logActivity(
            action: strtolower($module) . '.create',
            module: $module,
            description: $description,
            subject: $subject,
            properties: $properties,
            status: 'success',
            event: 'created'
        );
    }

    protected function logUpdated(string $module, $subject, string $description, array $properties = []): ActivityLog
    {
        return $this->logActivity(
            action: strtolower($module) . '.update',
            module: $module,
            description: $description,
            subject: $subject,
            properties: $properties,
            status: 'success',
            event: 'updated'
        );
    }

    protected function logDeleted(string $module, $subject, string $description, array $properties = []): ActivityLog
    {
        return $this->logActivity(
            action: strtolower($module) . '.delete',
            module: $module,
            description: $description,
            subject: $subject,
            properties: $properties,
            status: 'success',
            event: 'deleted'
        );
    }
}
