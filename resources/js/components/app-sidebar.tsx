import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
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

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
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
        icon: Shield,
    },
];

const auditNavItems: NavItem[] = [
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
    {
        title: 'Supervisor Approvals',
        href: '/audit/supervisor-approvals',
        icon: UserCheck,
    },
];

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
];

const serviceNavItems: NavItem[] = [
    {
        title: 'PMS Work Orders',
        href: '/service/pms-work-orders',
        icon: Wrench,
    },
    {
        title: 'Warranty Claims',
        href: '/service/warranty-claims',
        icon: FileText,
    },
    {
        title: 'Parts & Inventory',
        href: '/service/parts-inventory',
        icon: Package,
    },
];

const salesNavItems: NavItem[] = [
    {
        title: 'Lead Management',
        href: '/sales/lead-management',
        icon: UserPlus,
    },
    {
        title: 'Test Drives & Reservations',
        href: '/sales/test-drives',
        icon: Car,
    },
    {
        title: 'Pipeline Auto-Logging',
        href: '/sales/pipeline',
        icon: TrendingUp,
    },
    {
        title: 'Customer Experience',
        href: '/sales/customer-experience',
        icon: MessageSquare,
    },
    {
        title: 'Performance Metrics',
        href: '/sales/performance-metrics',
        icon: BarChart3,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
                <NavMain items={serviceNavItems} title="Service & Parts" />
                <NavMain items={salesNavItems} title="Sales & Customer" />
                <NavMain items={auditNavItems} title="Activity & Audit" />
                <NavMain items={complianceNavItems} title="Compliance" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
