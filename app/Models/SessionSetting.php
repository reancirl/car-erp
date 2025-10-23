<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SessionSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'label',
        'description',
        'type',
        'default_value',
    ];

    /**
     * Get a setting value by key
     */
    public static function get(string $key, $default = null)
    {
        // Cache settings for 1 hour
        return Cache::remember("session_setting_{$key}", 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            
            if (!$setting) {
                return $default;
            }

            // Cast to appropriate type
            return match ($setting->type) {
                'integer' => (int) $setting->value,
                'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                'float' => (float) $setting->value,
                default => $setting->value,
            };
        });
    }

    /**
     * Set a setting value by key
     */
    public static function set(string $key, $value): bool
    {
        $setting = self::where('key', $key)->first();
        
        if (!$setting) {
            return false;
        }

        $setting->update(['value' => (string) $value]);
        
        // Clear cache
        Cache::forget("session_setting_{$key}");
        
        return true;
    }

    /**
     * Get all settings as key-value pairs
     */
    public static function getAll(): array
    {
        return Cache::remember('all_session_settings', 3600, function () {
            $settings = self::all();
            $result = [];
            
            foreach ($settings as $setting) {
                $result[$setting->key] = match ($setting->type) {
                    'integer' => (int) $setting->value,
                    'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                    'float' => (float) $setting->value,
                    default => $setting->value,
                };
            }
            
            return $result;
        });
    }

    /**
     * Clear all settings cache
     */
    public static function clearCache(): void
    {
        Cache::forget('all_session_settings');
        
        $keys = ['idle_warning_minutes', 'auto_logout_minutes', 'grace_period_minutes'];
        foreach ($keys as $key) {
            Cache::forget("session_setting_{$key}");
        }
    }
}
