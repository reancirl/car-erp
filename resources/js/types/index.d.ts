import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Branch {
    id: number;
    name: string;
    code: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    status: 'active' | 'inactive';
    business_hours?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface PartInventory {
    id: number;
    part_number: string;
    branch_id: number;
    branch?: Branch;
    part_name: string;
    description?: string;
    category: 'engine' | 'transmission' | 'electrical' | 'body' | 'suspension' | 'brakes' | 'interior' | 'exterior' | 'accessories' | 'fluids' | 'filters' | 'other';
    subcategory?: string;
    manufacturer?: string;
    manufacturer_part_number?: string;
    oem_part_number?: string;
    compatible_makes?: string[];
    compatible_models?: string[];
    compatible_years?: number[];
    quantity_on_hand: number;
    quantity_reserved: number;
    quantity_available?: number;
    minimum_stock_level: number;
    maximum_stock_level?: number;
    reorder_quantity?: number;
    warehouse_location?: string;
    aisle?: string;
    rack?: string;
    bin?: string;
    unit_cost: number | string;
    selling_price: number | string;
    wholesale_price?: number | string;
    currency: string;
    markup_percentage?: number | string;
    weight?: number | string;
    length?: number | string;
    width?: number | string;
    height?: number | string;
    primary_supplier?: string;
    supplier_contact?: string;
    supplier_email?: string;
    supplier_phone?: string;
    lead_time_days?: number;
    condition: 'new' | 'refurbished' | 'used' | 'oem' | 'aftermarket';
    quality_grade?: string;
    is_genuine: boolean;
    warranty_months?: number;
    warranty_terms?: string;
    status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock' | 'on_order';
    is_serialized: boolean;
    is_hazardous: boolean;
    requires_special_handling: boolean;
    is_fast_moving: boolean;
    last_received_date?: string;
    last_sold_date?: string;
    last_counted_date?: string;
    discontinued_date?: string;
    total_sold: number;
    total_revenue: number;
    times_ordered: number;
    average_monthly_sales: number;
    days_in_stock: number;
    turnover_rate?: number;
    images?: string[];
    documents?: string[];
    notes?: string;
    tags?: string[];
    barcode?: string;
    sku?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
    stock_status_badge?: {
        text: string;
        color: string;
    };
    formatted_unit_cost?: string;
    formatted_selling_price?: string;
    formatted_inventory_value?: string;
    full_location?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}
