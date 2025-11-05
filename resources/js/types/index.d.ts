import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    permissions: string[];
    roles: string[];
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

export interface PageProps<T = Record<string, unknown>> extends SharedData {
    errors: Record<string, string | string[]>;
    props?: T;
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

export interface ServiceType {
    id: number;
    branch_id: number;
    branch?: Branch;
    name: string;
    code: string;
    description?: string;
    category: 'maintenance' | 'repair' | 'warranty' | 'inspection' | 'diagnostic';
    interval_type: 'mileage' | 'time' | 'on_demand';
    interval_value?: number;
    estimated_duration?: number;
    base_price: number | string;
    currency: string;
    status: 'active' | 'inactive' | 'discontinued';
    is_available: boolean;
    created_by?: number;
    updated_by?: number;
    creator?: User;
    updater?: User;
    common_services?: CommonService[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    formatted_base_price?: string;
    formatted_estimated_duration?: string;
    interval_description?: string;
    category_badge?: {
        text: string;
        color: string;
    };
    status_badge?: {
        text: string;
        color: string;
    };
}

export interface CommonService {
    id: number;
    branch_id: number;
    branch?: Branch;
    name: string;
    code: string;
    description?: string;
    category: string;
    estimated_duration: number;
    standard_price: number;
    currency: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    formatted_standard_price?: string;
    formatted_estimated_duration?: string;
    status_badge?: {
        text: string;
        color: string;
    };
    category_badge?: {
        text: string;
        color: string;
    };
    service_types?: ServiceType[];
}

export interface ComplianceChecklistTrigger {
    id: number;
    compliance_checklist_id: number;
    trigger_type: 'advance' | 'due' | 'escalation';
    offset_hours: number;
    channels: string[] | null;
    escalate_to_user_id?: number | null;
    escalate_to_role?: string | null;
    is_active: boolean;
    metadata?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface ComplianceChecklistItem {
    id: number;
    compliance_checklist_id: number;
    title: string;
    description?: string | null;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
    metadata?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface ComplianceChecklist {
    id: number;
    branch_id: number;
    branch?: Branch;
    title: string;
    code?: string | null;
    description?: string | null;
    category?: string | null;
    status: 'active' | 'inactive' | 'archived';
    frequency_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    frequency_interval: number;
    custom_frequency_unit?: 'hours' | 'days' | 'weeks' | 'months' | 'years' | null;
    custom_frequency_value?: number | null;
    start_date?: string | null;
    due_time?: string | null;
    next_due_at?: string | null;
    last_triggered_at?: string | null;
    last_completed_at?: string | null;
    is_recurring: boolean;
    assigned_user_id?: number | null;
    assigned_user?: User | null;
    assigned_role?: string | null;
    escalate_to_user_id?: number | null;
    escalation_user?: User | null;
    escalation_offset_hours?: number | null;
    advance_reminder_offsets?: number[] | null;
    metadata?: Record<string, unknown> | null;
    requires_acknowledgement: boolean;
    allow_partial_completion: boolean;
    created_by?: number | null;
    updated_by?: number | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    items?: ComplianceChecklistItem[];
    triggers?: ComplianceChecklistTrigger[];
    items_count?: number;
}

export interface ComplianceReminderEvent {
    id: number;
    compliance_reminder_id: number;
    event_type: string;
    channel?: string | null;
    status: string;
    message?: string | null;
    metadata?: Record<string, unknown> | null;
    processed_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ComplianceReminderAssignmentSummary {
    id: number;
    compliance_checklist_id: number;
    user_id: number;
    status: string;
}

export interface ComplianceReminder {
    id: number;
    branch_id?: number | null;
    branch?: Branch | null;
    compliance_checklist_id?: number | null;
    checklist?: Pick<ComplianceChecklist, 'id' | 'title'> | null;
    compliance_checklist_assignment_id?: number | null;
    assignment?: ComplianceReminderAssignmentSummary | null;
    assigned_user_id?: number | null;
    assigned_user?: User | null;
    assigned_role?: string | null;
    title: string;
    description?: string | null;
    reminder_type: string;
    priority: string;
    delivery_channel: string;
    delivery_channels?: string[] | null;
    remind_at?: string | null;
    due_at?: string | null;
    escalate_at?: string | null;
    status: string;
    auto_escalate: boolean;
    escalate_to_user_id?: number | null;
    escalate_to_user?: User | null;
    escalate_to_role?: string | null;
    last_triggered_at?: string | null;
    last_sent_at?: string | null;
    last_escalated_at?: string | null;
    sent_count?: number;
    metadata?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    events?: ComplianceReminderEvent[];
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
