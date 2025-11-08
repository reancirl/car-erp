<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use App\Listeners\CreateUserSession;
use App\Listeners\EndUserSession;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register event listeners for session tracking
        Event::listen(Login::class, CreateUserSession::class);
        Event::listen(Logout::class, EndUserSession::class);

        if (DB::connection()->getDriverName() === 'sqlite') {
            $pdo = DB::connection()->getPdo();

            $pdo->sqliteCreateFunction('DATE_FORMAT', function (?string $value, string $format) {
                if ($value === null) {
                    return null;
                }

                try {
                    $date = new \DateTime($value);
                } catch (\Exception $exception) {
                    return null;
                }

                $replacements = [
                    '%Y' => 'Y',
                    '%m' => 'm',
                    '%d' => 'd',
                    '%H' => 'H',
                    '%i' => 'i',
                    '%s' => 's',
                ];

                $phpFormat = preg_replace_callback(
                    '/%[YmdHis]/',
                    static fn(array $match) => $replacements[$match[0]] ?? $match[0],
                    $format
                );

                return $date->format($phpFormat);
            });
        }
    }
}
