<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create HQ branch
        Branch::create([
            'name' => 'Headquarters',
            'code' => 'HQ',
            'address' => '123 EDSA, Makati City',
            'city' => 'Makati City',
            'state' => 'Metro Manila',
            'postal_code' => '1200',
            'country' => 'Philippines',
            'phone' => '+63-2-8123-4567',
            'email' => 'hq@dealership.com.ph',
            'status' => 'active',
            'business_hours' => [
                'monday' => ['open' => '08:00', 'close' => '17:00'],
                'tuesday' => ['open' => '08:00', 'close' => '17:00'],
                'wednesday' => ['open' => '08:00', 'close' => '17:00'],
                'thursday' => ['open' => '08:00', 'close' => '17:00'],
                'friday' => ['open' => '08:00', 'close' => '17:00'],
                'saturday' => ['open' => '08:00', 'close' => '12:00'],
                'sunday' => ['open' => null, 'close' => null], // Closed
            ],
            'latitude' => 14.5547,
            'longitude' => 121.0244,
            'notes' => 'Main headquarters and primary dealership location',
        ]);
    }
}
