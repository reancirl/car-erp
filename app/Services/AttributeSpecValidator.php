<?php

namespace App\Services;

use App\Models\AttributeDefinition;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class AttributeSpecValidator
{
    /**
     * Validate specs array against attribute definitions.
     *
     * @param array $specs The specs to validate
     * @param string $scope The scope to validate against ('master', 'unit', or 'both')
     * @return array Validated specs
     * @throws ValidationException
     */
    public function validate(array $specs, string $scope = 'both'): array
    {
        if (empty($specs)) {
            return [];
        }

        // Get applicable attribute definitions (cached for performance)
        $definitions = $this->getDefinitionsForScope($scope);
        
        $errors = [];
        $validatedSpecs = [];

        // Validate each spec
        foreach ($specs as $key => $value) {
            $definition = $definitions->get($key);

            // Check if key exists in definitions
            if (!$definition) {
                $errors[$key] = "Unknown attribute key: {$key}";
                continue;
            }

            // Check if definition is active
            if (!$definition->is_active) {
                $errors[$key] = "Attribute {$key} is not active";
                continue;
            }

            // Validate value type
            if (!$this->validateType($value, $definition)) {
                $expectedType = $this->getExpectedTypeMessage($definition);
                $errors[$key] = "Invalid type for {$key}. Expected {$expectedType}";
                continue;
            }

            // For enum types, validate against allowed options
            if ($definition->type === 'enum') {
                if (!in_array($value, $definition->enum_options ?? [])) {
                    $options = implode(', ', $definition->enum_options ?? []);
                    $errors[$key] = "Invalid value for {$key}. Allowed values: {$options}";
                    continue;
                }
            }

            $validatedSpecs[$key] = $value;
        }

        // Check for required attributes
        $requiredErrors = $this->validateRequiredAttributes($validatedSpecs, $definitions, $scope);
        $errors = array_merge($errors, $requiredErrors);

        // Throw validation exception if there are errors
        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }

        return $validatedSpecs;
    }

    /**
     * Get attribute definitions for a specific scope (cached).
     */
    protected function getDefinitionsForScope(string $scope)
    {
        $cacheKey = "attribute_definitions_{$scope}";
        
        return Cache::remember($cacheKey, 3600, function () use ($scope) {
            return AttributeDefinition::active()
                ->where(function ($query) use ($scope) {
                    $query->where('scope', $scope)
                        ->orWhere('scope', 'both');
                })
                ->get()
                ->keyBy('key');
        });
    }

    /**
     * Validate value type against definition.
     */
    protected function validateType($value, AttributeDefinition $definition): bool
    {
        return match ($definition->type) {
            'string' => is_string($value),
            'int' => is_int($value) || (is_numeric($value) && intval($value) == $value),
            'decimal' => is_numeric($value),
            'bool' => is_bool($value),
            'enum' => is_string($value),
            default => false,
        };
    }

    /**
     * Get expected type message for error.
     */
    protected function getExpectedTypeMessage(AttributeDefinition $definition): string
    {
        return match ($definition->type) {
            'string' => 'string',
            'int' => 'integer',
            'decimal' => 'number',
            'bool' => 'boolean',
            'enum' => 'one of: ' . implode(', ', $definition->enum_options ?? []),
            default => 'unknown',
        };
    }

    /**
     * Validate required attributes are present.
     */
    protected function validateRequiredAttributes(array $specs, $definitions, string $scope): array
    {
        $errors = [];

        foreach ($definitions as $key => $definition) {
            $isRequired = $scope === 'master' 
                ? $definition->is_required_master 
                : $definition->is_required_unit;

            if ($isRequired && !array_key_exists($key, $specs)) {
                $errors[$key] = "Required attribute {$key} is missing";
            }
        }

        return $errors;
    }

    /**
     * Clear cached definitions (useful after updating definitions).
     */
    public function clearCache(): void
    {
        Cache::forget('attribute_definitions_master');
        Cache::forget('attribute_definitions_unit');
        Cache::forget('attribute_definitions_both');
    }

    /**
     * Validate and merge specs with defaults from an attribute set.
     */
    public function validateWithDefaults(array $specs, string $scope, ?int $attributeSetId = null): array
    {
        // If attribute set provided, merge with defaults
        if ($attributeSetId) {
            $attributeSet = \App\Models\AttributeSet::with('items.attributeDefinition')->find($attributeSetId);
            
            if ($attributeSet) {
                $defaults = $attributeSet->getDefaultSpecs();
                $specs = array_merge($defaults, $specs);
            }
        }

        return $this->validate($specs, $scope);
    }
}
