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
        $branches = [
            [
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
                    'sunday' => ['open' => null, 'close' => null],
                ],
                'latitude' => 14.5547,
                'longitude' => 121.0244,
                'notes' => 'Main headquarters and primary dealership location',
            ],
            [
                'name' => 'Cagayan de Oro Branch',
                'code' => 'CDO',
                'address' => '456 Corrales Avenue, Cagayan de Oro City',
                'city' => 'Cagayan de Oro City',
                'state' => 'Misamis Oriental',
                'postal_code' => '9000',
                'country' => 'Philippines',
                'phone' => '+63-88-234-5678',
                'email' => 'cdo@dealership.com.ph',
                'status' => 'active',
                'business_hours' => [
                    'monday' => ['open' => '08:00', 'close' => '17:00'],
                    'tuesday' => ['open' => '08:00', 'close' => '17:00'],
                    'wednesday' => ['open' => '08:00', 'close' => '17:00'],
                    'thursday' => ['open' => '08:00', 'close' => '17:00'],
                    'friday' => ['open' => '08:00', 'close' => '17:00'],
                    'saturday' => ['open' => '08:00', 'close' => '12:00'],
                    'sunday' => ['open' => null, 'close' => null],
                ],
                'latitude' => 8.4542,
                'longitude' => 124.6319,
                'notes' => 'Northern Mindanao regional branch',
            ],
            [
                'name' => 'Cebu Branch',
                'code' => 'CEB',
                'address' => '789 Osmena Boulevard, Cebu City',
                'city' => 'Cebu City',
                'state' => 'Cebu',
                'postal_code' => '6000',
                'country' => 'Philippines',
                'phone' => '+63-32-234-5678',
                'email' => 'cebu@dealership.com.ph',
                'status' => 'active',
                'business_hours' => [
                    'monday' => ['open' => '08:00', 'close' => '17:00'],
                    'tuesday' => ['open' => '08:00', 'close' => '17:00'],
                    'wednesday' => ['open' => '08:00', 'close' => '17:00'],
                    'thursday' => ['open' => '08:00', 'close' => '17:00'],
                    'friday' => ['open' => '08:00', 'close' => '17:00'],
                    'saturday' => ['open' => '08:00', 'close' => '12:00'],
                    'sunday' => ['open' => null, 'close' => null],
                ],
                'latitude' => 10.3157,
                'longitude' => 123.8854,
                'notes' => 'Regional headquarters for Visayas operations',
            ],
            [
                'name' => 'Davao Branch',
                'code' => 'DVO',
                'address' => '321 JP Laurel Avenue, Davao City',
                'city' => 'Davao City',
                'state' => 'Davao del Sur',
                'postal_code' => '8000',
                'country' => 'Philippines',
                'phone' => '+63-82-234-5678',
                'email' => 'davao@dealership.com.ph',
                'status' => 'active',
                'business_hours' => [
                    'monday' => ['open' => '08:00', 'close' => '17:00'],
                    'tuesday' => ['open' => '08:00', 'close' => '17:00'],
                    'wednesday' => ['open' => '08:00', 'close' => '17:00'],
                    'thursday' => ['open' => '08:00', 'close' => '17:00'],
                    'friday' => ['open' => '08:00', 'close' => '17:00'],
                    'saturday' => ['open' => '08:00', 'close' => '12:00'],
                    'sunday' => ['open' => null, 'close' => null],
                ],
                'latitude' => 7.0731,
                'longitude' => 125.6128,
                'notes' => 'Regional headquarters for Mindanao operations',
            ],
        ];

        foreach ($branches as $branchData) {
            Branch::updateOrCreate(
                ['code' => $branchData['code']], // Match on code
                $branchData // Update or create with this data
            );
        }
    }
}
