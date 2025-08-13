import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Shield, Activity, ClipboardCheck, Clock, UserCheck } from 'lucide-react';
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

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

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
