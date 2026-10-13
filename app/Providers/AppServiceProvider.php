<?php

namespace App\Providers;

use App\Listeners\CreateUserSession;
use App\Listeners\EndUserSession;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Database\Events\ConnectionEstablished;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

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

        // Register on connect instead of connecting during boot, so commands like
        // package:discover don't need a database.
        Event::listen(ConnectionEstablished::class, function (ConnectionEstablished $event) {
            if ($event->connection->getDriverName() !== 'sqlite') {
                return;
            }

            $event->connection->getPdo()->sqliteCreateFunction('DATE_FORMAT', function (?string $value, string $format) {
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
                    static fn (array $match) => $replacements[$match[0]] ?? $match[0],
                    $format
                );

                return $date->format($phpFormat);
            });
        });
    }
}
