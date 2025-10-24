/**
 * Parts Inventory Constants
 * Centralized constants for parts inventory management
 */

export const PART_CATEGORIES = [
    { value: 'engine', label: 'Engine' },
    { value: 'transmission', label: 'Transmission' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'body', label: 'Body' },
    { value: 'suspension', label: 'Suspension' },
    { value: 'brakes', label: 'Brakes' },
    { value: 'interior', label: 'Interior' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'fluids', label: 'Fluids' },
    { value: 'filters', label: 'Filters' },
    { value: 'other', label: 'Other' },
] as const;

export const PART_CONDITIONS = [
    { value: 'new', label: 'New' },
    { value: 'refurbished', label: 'Refurbished' },
    { value: 'used', label: 'Used' },
    { value: 'oem', label: 'OEM' },
    { value: 'aftermarket', label: 'Aftermarket' },
] as const;

export const PART_STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'discontinued', label: 'Discontinued' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'on_order', label: 'On Order' },
] as const;

// Type exports for TypeScript
export type PartCategory = typeof PART_CATEGORIES[number]['value'];
export type PartCondition = typeof PART_CONDITIONS[number]['value'];
export type PartStatus = typeof PART_STATUSES[number]['value'];
