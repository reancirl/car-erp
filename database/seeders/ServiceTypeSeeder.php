<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\ServiceType;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceTypeSeeder extends Seeder
{
    /**
     * Seed baseline service types for PMS work orders.
     */
    public function run(): void
    {
        $branches = Branch::pluck('id', 'code');
        if ($branches->isEmpty()) {
            $this->command?->warn('No branches available. Skipping ServiceType seeding.');
            return;
        }

        $adminId = User::role('admin')->value('id') ?? User::query()->value('id');

        $serviceTypes = [
            [
                'branch_code' => 'HQ',
                'name' => 'PMS 5,000 KM',
                'code' => 'PMS-5K',
                'description' => 'Initial preventive maintenance service for units reaching 5,000 KM.',
                'category' => 'maintenance',
                'interval_type' => 'mileage',
                'interval_value' => 5000,
                'estimated_duration' => 2.5,
                'base_price' => 3500,
            ],
            [
                'branch_code' => 'HQ',
                'name' => 'PMS 10,000 KM',
                'code' => 'PMS-10K',
                'description' => 'Comprehensive maintenance package for 10,000 KM interval.',
                'category' => 'maintenance',
                'interval_type' => 'mileage',
                'interval_value' => 10000,
                'estimated_duration' => 3.5,
                'base_price' => 5200,
            ],
            [
                'branch_code' => 'CDO',
                'name' => 'Engine Diagnostics',
                'code' => 'ENG-DIAG',
                'description' => 'Full engine diagnostic check for drivability concerns.',
                'category' => 'diagnostic',
                'interval_type' => 'on_demand',
                'interval_value' => null,
                'estimated_duration' => 1.5,
                'base_price' => 2500,
            ],
            [
                'branch_code' => 'CEB',
                'name' => 'Aircon Cleaning',
                'code' => 'AIRCON-CLN',
                'description' => 'Air conditioning system cleaning and cabin filter replacement.',
                'category' => 'maintenance',
                'interval_type' => 'time',
                'interval_value' => 12,
                'estimated_duration' => 2.0,
                'base_price' => 4200,
            ],
            [
                'branch_code' => 'DVO',
                'name' => 'Brake System Overhaul',
                'code' => 'BRK-OVH',
                'description' => 'Brake pad replacement, rotor resurfacing, and fluid bleeding.',
                'category' => 'repair',
                'interval_type' => 'on_demand',
                'interval_value' => null,
                'estimated_duration' => 4.0,
                'base_price' => 6800,
            ],
        ];

        foreach ($serviceTypes as $definition) {
            $branchId = $branches[$definition['branch_code']] ?? null;
            if (!$branchId) {
                $this->command?->warn("Branch code {$definition['branch_code']} not found. Skipping {$definition['name']} seeding.");
                continue;
            }

            ServiceType::updateOrCreate(
                ['code' => $definition['code']],
                [
                    'branch_id' => $branchId,
                    'name' => $definition['name'],
                    'description' => $definition['description'],
                    'category' => $definition['category'],
                    'interval_type' => $definition['interval_type'],
                    'interval_value' => $definition['interval_value'],
                    'estimated_duration' => $definition['estimated_duration'],
                    'base_price' => $definition['base_price'],
                    'currency' => 'PHP',
                    'status' => 'active',
                    'is_available' => true,
                    'created_by' => $adminId,
                    'updated_by' => $adminId,
                ]
            );
        }
    }
}
