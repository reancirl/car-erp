<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\VehicleModel;
use App\Models\VehicleUnit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class VehicleInventorySeeder extends Seeder
{
    /**
     * Seed vehicle master and unit data to power PMS dropdowns.
     */
    public function run(): void
    {
        $branches = Branch::pluck('id', 'code');
        if ($branches->isEmpty()) {
            $this->command?->warn('No branches available. Skipping vehicle inventory seeding.');
            return;
        }

        $modelDefinitions = [
            [
                'key' => 'toyota-vios-2023-g',
                'make' => 'Toyota',
                'model' => 'Vios',
                'year' => 2023,
                'trim' => 'G CVT',
                'body_type' => 'sedan',
                'transmission' => 'Automatic',
                'fuel_type' => 'Gasoline',
                'drivetrain' => 'FWD',
                'seating' => 5,
                'doors' => 4,
                'base_price' => 985000,
                'currency' => 'PHP',
                'description' => 'Best-selling subcompact sedan ideal for PMS pilots.',
            ],
            [
                'key' => 'honda-civic-2024-vtec',
                'make' => 'Honda',
                'model' => 'Civic',
                'year' => 2024,
                'trim' => 'RS Turbo',
                'body_type' => 'sedan',
                'transmission' => 'Automatic',
                'fuel_type' => 'Gasoline',
                'drivetrain' => 'FWD',
                'seating' => 5,
                'doors' => 4,
                'base_price' => 1588000,
                'currency' => 'PHP',
                'description' => 'Turbocharged sedan used for corporate demo fleet.',
            ],
            [
                'key' => 'toyota-innova-2022-e',
                'make' => 'Toyota',
                'model' => 'Innova',
                'year' => 2022,
                'trim' => 'E Diesel AT',
                'body_type' => 'mpv',
                'transmission' => 'Automatic',
                'fuel_type' => 'Diesel',
                'drivetrain' => 'RWD',
                'seating' => 8,
                'doors' => 5,
                'base_price' => 1419000,
                'currency' => 'PHP',
                'description' => 'Fleet MPV unit popular with corporate accounts.',
            ],
        ];

        $modelIds = [];
        foreach ($modelDefinitions as $definition) {
            $model = VehicleModel::updateOrCreate(
                ['model_code' => strtoupper(Str::slug($definition['key'], '_'))],
                [
                    'make' => $definition['make'],
                    'model' => $definition['model'],
                    'year' => $definition['year'],
                    'body_type' => $definition['body_type'] ?? null,
                    'transmission' => $definition['transmission'] ?? null,
                    'fuel_type' => $definition['fuel_type'] ?? null,
                    'drivetrain' => $definition['drivetrain'] ?? null,
                    'doors' => $definition['doors'] ?? null,
                    'seating_capacity' => $definition['seating'] ?? null,
                    'base_price' => $definition['base_price'] ?? null,
                    'currency' => $definition['currency'] ?? 'PHP',
                    'is_active' => true,
                ]
            );

            $modelIds[$definition['key']] = $model->id;
        }

        $unitDefinitions = [
            [
                'vin' => 'JTDBX123456789001',
                'stock_number' => 'HQ-VIOS-0001',
                'branch_code' => 'HQ',
                'model_key' => 'toyota-vios-2023-g',
                'color_exterior' => 'Silver Metallic',
                'color_interior' => 'Black',
                'odometer' => 12500,
                'status' => 'in_stock',
                'acquisition_date' => Carbon::now()->subMonths(5)->toDateString(),
            ],
            [
                'vin' => 'JTDBX123456789002',
                'stock_number' => 'HQ-VIOS-0002',
                'branch_code' => 'HQ',
                'model_key' => 'toyota-vios-2023-g',
                'color_exterior' => 'Red Mica',
                'color_interior' => 'Beige',
                'odometer' => 9800,
                'status' => 'reserved',
                'acquisition_date' => Carbon::now()->subMonths(4)->toDateString(),
            ],
            [
                'vin' => 'R18FC123456789003',
                'stock_number' => 'CDO-CIVIC-0001',
                'branch_code' => 'CDO',
                'model_key' => 'honda-civic-2024-vtec',
                'color_exterior' => 'Crystal Black',
                'color_interior' => 'Black',
                'odometer' => 5800,
                'status' => 'in_stock',
                'acquisition_date' => Carbon::now()->subMonths(2)->toDateString(),
            ],
            [
                'vin' => 'ANZB123456789004',
                'stock_number' => 'CEB-INNOVA-0001',
                'branch_code' => 'CEB',
                'model_key' => 'toyota-innova-2022-e',
                'color_exterior' => 'Super White',
                'color_interior' => 'Black',
                'odometer' => 20500,
                'status' => 'in_stock',
                'acquisition_date' => Carbon::now()->subMonths(8)->toDateString(),
            ],
            [
                'vin' => 'ANZB123456789005',
                'stock_number' => 'DVO-INNOVA-0001',
                'branch_code' => 'DVO',
                'model_key' => 'toyota-innova-2022-e',
                'color_exterior' => 'Attitude Black',
                'color_interior' => 'Gray',
                'odometer' => 31200,
                'status' => 'sold',
                'acquisition_date' => Carbon::now()->subYear()->toDateString(),
            ],
        ];

        foreach ($unitDefinitions as $unit) {
            $branchId = $branches[$unit['branch_code']] ?? null;
            $modelId = $modelIds[$unit['model_key']] ?? null;

            if (!$branchId || !$modelId) {
                $this->command?->warn("Skipping vehicle {$unit['stock_number']} due to missing branch or model.");
                continue;
            }

            VehicleUnit::updateOrCreate(
                ['vin' => $unit['vin']],
                [
                    'vehicle_model_id' => $modelId,
                    'branch_id' => $branchId,
                    'stock_number' => $unit['stock_number'],
                    'status' => $unit['status'],
                    'purchase_price' => 800000,
                    'sale_price' => null,
                    'currency' => 'PHP',
                    'acquisition_date' => $unit['acquisition_date'],
                    'sold_date' => null,
                    'notes' => null,
                    'images' => null,
                    'color_exterior' => $unit['color_exterior'],
                    'color_interior' => $unit['color_interior'],
                    'odometer' => $unit['odometer'],
                ]
            );
        }
    }
}
