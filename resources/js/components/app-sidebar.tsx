import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
  Users,
  Settings,
  Activity,
  Shield,
  Wrench,
  FileText,
  Package,
  TrendingUp,
  UserPlus,
  Car,
  BarChart3,
  MessageSquare,
  LayoutGrid,
  Clock,
  UserCheck,
  ClipboardCheck,
} from "lucide-react";
import AppLogo from './app-logo';

// Core Navigation
const coreNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Checklist & Reminders',
        href: '/checklists-reminders',
        icon: ClipboardCheck,
    },
];

// Administration
const adminNavItems: NavItem[] = [
    {
        title: 'User Management',
        href: '/admin/user-management',
        icon: Users,
    },
    {
        title: 'Branch Management',
        href: '/admin/branch-management',
        icon: LayoutGrid,
    },
    {
        title: 'Roles & Permissions',
        href: '/roles',
        icon: Shield,
    },
    {
        title: 'MFA Settings',
        href: '/settings/mfa',
        icon: Settings,
    },
];

// Operations Management
const operationsNavItems: NavItem[] = [
    {
        title: 'PMS Work Orders',
        href: '/service/pms-work-orders',
        icon: Wrench,
    },
    {
        title: 'Service Types',
        href: '/service/service-types',
        icon: Settings,
    },
    {
        title: 'Common Services',
        href: '/service/common-services',
        icon: Wrench,
    },
    {
        title: 'Warranty Claims',
        href: '/service/warranty-claims',
        icon: FileText,
    },
];

// Inventory Management
const inventoryNavItems: NavItem[] = [
    {
        title: 'Parts & Accessories',
        href: '/inventory/parts-inventory',
        icon: Package,
    },
    {
        title: 'Vehicle Models',
        href: '/inventory/models',
        icon: LayoutGrid,
    },
    {
        title: 'Vehicle Inventory',
        href: '/inventory/vehicles',
        icon: Car,
    },
];

// Sales & Customer Management
const salesNavItems: NavItem[] = [
    {
        title: 'Lead Management',
        href: '/sales/lead-management',
        icon: UserPlus,
    },
    {
        title: 'Test Drives',
        href: '/sales/test-drives',
        icon: Car,
    },
    {
        title: 'Sales Pipeline',
        href: '/sales/pipeline',
        icon: TrendingUp,
    },
    {
        title: 'Customer Experience',
        href: '/sales/customer-experience',
        icon: MessageSquare,
    },
];

// Analytics & Reporting
const analyticsNavItems: NavItem[] = [
    {
        title: 'Performance Metrics',
        href: '/sales/performance-metrics',
        icon: BarChart3,
    },
    {
        title: 'Activity Logs',
        href: '/audit/activity-logs',
        icon: Activity,
    },
    {
        title: 'Time Tracking',
        href: '/audit/time-tracking',
        icon: Clock,
    },
];

// Compliance & Quality
const complianceNavItems: NavItem[] = [
    {
        title: 'Checklists',
        href: '/compliance/checklists',
        icon: ClipboardCheck,
    },
    {
        title: 'Reminders',
        href: '/compliance/reminders',
        icon: Clock,
    },
    {
        title: 'Supervisor Approvals',
        href: '/audit/supervisor-approvals',
        icon: UserCheck,
    },
];

const footerNavItems: NavItem[] = [];

// Permission mapping for navigation items
const navPermissions: Record<string, string> = {
    '/admin/user-management': 'users.view',
    '/admin/branch-management': 'users.view', // Branch management requires admin access
    '/roles': 'users.view',
    '/settings/mfa': 'users.view',
    '/service/pms-work-orders': 'pms-work-orders.view',
    '/service/service-types': 'service-types.view',
    '/service/common-services': 'common-services.view',
    '/service/warranty-claims': 'warranty.view',
    '/inventory/parts-inventory': 'inventory.view',
    '/inventory/vehicles': 'inventory.view',
    '/sales/lead-management': 'sales.view',
    '/sales/test-drives': 'sales.view',
    '/sales/pipeline': 'sales.view',
    '/sales/customer-experience': 'customer.view',
    '/sales/performance-metrics': 'reports.view',
    '/audit/activity-logs': 'audit.view',
    '/audit/time-tracking': 'audit.view',
    '/audit/supervisor-approvals': 'audit.supervisor_override',
    '/compliance/checklists': 'compliance.view',
    '/compliance/reminders': 'compliance.view',
};

function filterNavItemsByPermissions(items: NavItem[], permissions: string[]): NavItem[] {
    return items.filter(item => {
        const requiredPermission = navPermissions[item.href];
        if (!requiredPermission) return true; // Dashboard and other unprotected routes
        return permissions.includes(requiredPermission);
    });
}

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const userPermissions = auth?.permissions || [];

    // Filter navigation items based on user permissions
    const filteredAdminNavItems = filterNavItemsByPermissions(adminNavItems, userPermissions);
    const filteredOperationsNavItems = filterNavItemsByPermissions(operationsNavItems, userPermissions);
    const filteredInventoryNavItems = filterNavItemsByPermissions(inventoryNavItems, userPermissions);
    const filteredSalesNavItems = filterNavItemsByPermissions(salesNavItems, userPermissions);
    const filteredAnalyticsNavItems = filterNavItemsByPermissions(analyticsNavItems, userPermissions);
    const filteredComplianceNavItems = filterNavItemsByPermissions(complianceNavItems, userPermissions);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={coreNavItems} />
                {filteredSalesNavItems.length > 0 && <NavMain items={filteredSalesNavItems} title="Sales & Customer" collapsible />}
                {filteredInventoryNavItems.length > 0 && <NavMain items={filteredInventoryNavItems} title="Inventory Management" collapsible />}
                {filteredOperationsNavItems.length > 0 && <NavMain items={filteredOperationsNavItems} title="Operations" collapsible />}
                {filteredAnalyticsNavItems.length > 0 && <NavMain items={filteredAnalyticsNavItems} title="Analytics & Reports" collapsible />}
                {filteredComplianceNavItems.length > 0 && <NavMain items={filteredComplianceNavItems} title="Compliance & Quality" collapsible />}
                {filteredAdminNavItems.length > 0 && <NavMain items={filteredAdminNavItems} title="Administration" collapsible />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
