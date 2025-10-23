<?php

namespace Database\Seeders;

use App\Models\AttributeDefinition;
use Illuminate\Database\Seeder;

class AttributeDefinitionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $definitions = [
            // Safety attributes
            [
                'key' => 'safety.airbags',
                'label' => 'Number of Airbags',
                'type' => 'int',
                'scope' => 'both',
                'uom' => null,
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Total number of airbags in the vehicle',
            ],
            [
                'key' => 'safety.abs',
                'label' => 'Anti-lock Braking System (ABS)',
                'type' => 'bool',
                'scope' => 'master',
                'uom' => null,
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Whether the vehicle has ABS',
            ],
            [
                'key' => 'safety.traction_control',
                'label' => 'Traction Control',
                'type' => 'bool',
                'scope' => 'master',
                'uom' => null,
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Whether the vehicle has traction control system',
            ],
            
            // Comfort attributes
            [
                'key' => 'comfort.sunroof',
                'label' => 'Sunroof',
                'type' => 'bool',
                'scope' => 'master',
                'uom' => null,
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Whether the vehicle has a sunroof',
            ],
            [
                'key' => 'comfort.climate_zones',
                'label' => 'Climate Control Zones',
                'type' => 'int',
                'scope' => 'master',
                'uom' => null,
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Number of independent climate control zones',
            ],
            
            // Infotainment attributes
            [
                'key' => 'infotainment.apple_carplay',
                'label' => 'Apple CarPlay',
                'type' => 'bool',
                'scope' => 'both',
                'uom' => null,
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Whether the vehicle supports Apple CarPlay',
            ],
            [
                'key' => 'infotainment.android_auto',
                'label' => 'Android Auto',
                'type' => 'bool',
                'scope' => 'both',
                'uom' => null,
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Whether the vehicle supports Android Auto',
            ],
            [
                'key' => 'infotainment.screen_size',
                'label' => 'Touchscreen Size',
                'type' => 'decimal',
                'scope' => 'master',
                'uom' => 'inches',
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Size of the infotainment touchscreen in inches',
            ],
            
            // Dimensions attributes
            [
                'key' => 'dimension.ground_clearance',
                'label' => 'Ground Clearance',
                'type' => 'decimal',
                'scope' => 'master',
                'uom' => 'mm',
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Ground clearance in millimeters',
            ],
            [
                'key' => 'dimension.cargo_capacity',
                'label' => 'Cargo Capacity',
                'type' => 'decimal',
                'scope' => 'master',
                'uom' => 'liters',
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Cargo/trunk capacity in liters',
            ],
            
            // Emissions attributes
            [
                'key' => 'emissions.euro_class',
                'label' => 'Euro Emissions Class',
                'type' => 'enum',
                'scope' => 'master',
                'uom' => null,
                'enum_options' => ['Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6'],
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'European emissions standard classification',
            ],
            
            // Performance attributes
            [
                'key' => 'performance.horsepower',
                'label' => 'Horsepower',
                'type' => 'int',
                'scope' => 'master',
                'uom' => 'hp',
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Engine horsepower',
            ],
            [
                'key' => 'performance.torque',
                'label' => 'Torque',
                'type' => 'int',
                'scope' => 'master',
                'uom' => 'Nm',
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Engine torque in Newton-meters',
            ],
            
            // Unit-specific attributes
            [
                'key' => 'unit.condition',
                'label' => 'Vehicle Condition',
                'type' => 'enum',
                'scope' => 'unit',
                'uom' => null,
                'enum_options' => ['Excellent', 'Good', 'Fair', 'Poor'],
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Overall condition assessment of the specific unit',
            ],
            [
                'key' => 'unit.previous_owners',
                'label' => 'Previous Owners',
                'type' => 'int',
                'scope' => 'unit',
                'uom' => null,
                'enum_options' => null,
                'is_required_master' => false,
                'is_required_unit' => false,
                'is_active' => true,
                'description' => 'Number of previous owners (for used vehicles)',
            ],
        ];

        foreach ($definitions as $definitionData) {
            AttributeDefinition::updateOrCreate(
                ['key' => $definitionData['key']], // Match on key
                $definitionData // Update or create with this data
            );
        }
    }
}
