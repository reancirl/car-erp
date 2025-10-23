<?php

use App\Models\AttributeDefinition;
use App\Services\AttributeSpecValidator;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    // Seed attribute definitions
    AttributeDefinition::create([
        'key' => 'safety.airbags',
        'label' => 'Number of Airbags',
        'type' => 'int',
        'scope' => 'both',
        'is_required_master' => false,
        'is_required_unit' => false,
        'is_active' => true,
    ]);

    AttributeDefinition::create([
        'key' => 'comfort.sunroof',
        'label' => 'Sunroof',
        'type' => 'bool',
        'scope' => 'master',
        'is_required_master' => false,
        'is_required_unit' => false,
        'is_active' => true,
    ]);

    AttributeDefinition::create([
        'key' => 'emissions.euro_class',
        'label' => 'Euro Emissions Class',
        'type' => 'enum',
        'scope' => 'master',
        'enum_options' => ['Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6'],
        'is_required_master' => false,
        'is_required_unit' => false,
        'is_active' => true,
    ]);

    AttributeDefinition::create([
        'key' => 'dimension.ground_clearance',
        'label' => 'Ground Clearance',
        'type' => 'decimal',
        'scope' => 'master',
        'uom' => 'mm',
        'is_required_master' => false,
        'is_required_unit' => false,
        'is_active' => true,
    ]);

    AttributeDefinition::create([
        'key' => 'unit.condition',
        'label' => 'Vehicle Condition',
        'type' => 'enum',
        'scope' => 'unit',
        'enum_options' => ['Excellent', 'Good', 'Fair', 'Poor'],
        'is_required_master' => false,
        'is_required_unit' => false,
        'is_active' => true,
    ]);

    AttributeDefinition::create([
        'key' => 'required.attribute',
        'label' => 'Required Attribute',
        'type' => 'string',
        'scope' => 'master',
        'is_required_master' => true,
        'is_required_unit' => false,
        'is_active' => true,
    ]);
});

test('validates master specs with known keys and correct types', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'safety.airbags' => 6,
        'comfort.sunroof' => true,
        'dimension.ground_clearance' => 200.5,
    ];

    $validated = $validator->validate($specs, 'master');

    expect($validated)->toBe($specs);
});

test('rejects unknown keys in specs', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'unknown.key' => 'value',
    ];

    expect(fn() => $validator->validate($specs, 'master'))
        ->toThrow(ValidationException::class);
});

test('rejects wrong types in specs', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'safety.airbags' => 'not_an_integer', // Should be int
    ];

    expect(fn() => $validator->validate($specs, 'master'))
        ->toThrow(ValidationException::class);
});

test('validates enum values correctly', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'emissions.euro_class' => 'Euro 5',
    ];

    $validated = $validator->validate($specs, 'master');

    expect($validated)->toBe($specs);
});

test('rejects invalid enum values', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'emissions.euro_class' => 'Euro 7', // Not in enum options
    ];

    expect(fn() => $validator->validate($specs, 'master'))
        ->toThrow(ValidationException::class);
});

test('validates unit-scoped attributes for unit scope', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'unit.condition' => 'Excellent',
    ];

    $validated = $validator->validate($specs, 'unit');

    expect($validated)->toBe($specs);
});

test('rejects master-only attributes when validating unit scope', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'comfort.sunroof' => true, // Master-only attribute
    ];

    expect(fn() => $validator->validate($specs, 'unit'))
        ->toThrow(ValidationException::class);
});

test('validates both-scoped attributes for any scope', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'safety.airbags' => 6,
    ];

    $masterValidated = $validator->validate($specs, 'master');
    $unitValidated = $validator->validate($specs, 'unit');

    expect($masterValidated)->toBe($specs)
        ->and($unitValidated)->toBe($specs);
});

test('enforces required attributes', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'safety.airbags' => 6,
        // Missing 'required.attribute'
    ];

    expect(fn() => $validator->validate($specs, 'master'))
        ->toThrow(ValidationException::class);
});

test('accepts specs with required attributes present', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'required.attribute' => 'value',
        'safety.airbags' => 6,
    ];

    $validated = $validator->validate($specs, 'master');

    expect($validated)->toBe($specs);
});

test('validates decimal types correctly', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'dimension.ground_clearance' => 200.5,
    ];

    $validated = $validator->validate($specs, 'master');

    expect($validated)->toBe($specs);
});

test('validates boolean types correctly', function () {
    $validator = new AttributeSpecValidator();

    $specs = [
        'comfort.sunroof' => true,
    ];

    $validated = $validator->validate($specs, 'master');

    expect($validated)->toBe($specs);
});
