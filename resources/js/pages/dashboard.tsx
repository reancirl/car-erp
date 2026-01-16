import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Calendar as CalendarIcon,
    Wrench,
    Package,
    Users,
    TrendingUp,
    AlertTriangle,
    Clock,
    DollarSign,
    CheckCircle,
    XCircle,
    Activity,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Bell,
    ClipboardCheck,
    ExternalLink,
    Car,
    FileText,
    ShoppingCart,
    Target,
    Star,
    Shield,
    AlertCircle,
    Building2,
    Layers,
    PieChart as PieChartIcon,
    ClipboardList,
    Gauge,
    Factory,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';

// Lazy load charts to reduce initial bundle size
const DashboardCharts = lazy(() =>
    import('@/components/dashboard/charts').then((module) => ({ default: module.DashboardCharts }))
);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface AssignedChecklistItem {
    id: number;
    label: string;
    assignment_item_id: number | null;
    is_completed: boolean;
}

interface AssignedChecklist {
    id: number;
    assignment_id: number | null;
    title: string;
    frequency: string;
    due_at: string | null;
    branch: string | null;
    status: string;
    progress_percentage: number;
    items: AssignedChecklistItem[];
}

interface Branch {
    id: number;
    name: string;
    code?: string | null;
}

interface KPIs {
    sales: {
        revenue: { current: number; previous: number; change: number };
        units_sold: { current: number; previous: number; change: number };
        avg_deal_value: { current: number; previous: number };
    };
    service: {
        work_orders: { current: number; active: number; completed: number; change: number };
        revenue: { current: number; previous: number; change: number };
        avg_turnaround: number;
    };
    pipeline: {
        total_leads: number;
        conversion_rate: { current: number; previous: number; change: number };
        test_drives: { scheduled: number; completed: number };
    };
    customers: {
        total: number;
        satisfaction: { current: number; previous: number; change: number };
        nps: { current: number; previous: number; change: number };
    };
    inventory: {
        units_in_stock: number;
        total_value: number;
        low_stock_parts: number;
        total_parts: number;
        parts_value: number;
    };
    warranty: {
        pending_claims: number;
        approved_claims: number;
        total_claims_amount: number;
    };
    compliance: {
        overdue_checklists: number;
        completion_rate: number;
    };
}

interface ChartData {
    pipeline_stages: Array<{ stage: string; count: number; value: number }>;
    revenue_trend: Array<{ month: string; revenue: number; units: number }>;
    service_trend: Array<{ month: string; revenue: number; count: number }>;
    top_sales_reps: Array<{ name: string; units_sold: number; revenue: number }>;
    lead_sources: Array<{ source: string; count: number }>;
}

interface Alert {
    type: string;
    message: string;
    time: string;
    priority: string;
}

interface Activity {
    action: string;
    user: string;
    time: string;
}

interface CalendarEvent {
    type: 'test_drive' | 'pms' | string;
    title: string;
    date: string;
    time?: string | null;
    status?: string | null;
    branch?: { id: number; name: string; code?: string | null } | null;
    meta?: Record<string, string | number | null>;
}

interface DashboardProps {
    assignedChecklists?: AssignedChecklist[];
    filters: {
        date_range: string;
        branch_id: number | null;
        start_date: string | null;
        end_date: string | null;
        current_start: string;
        current_end: string;
        use_test_data: boolean;
    };
    branches: Branch[];
    kpis: KPIs;
    charts: ChartData;
    alerts: Alert[];
    recentActivities: Activity[];
    viewer?: ViewerContext | null;
    calendarEvents?: CalendarEvent[];
}

interface AssignmentMeta {
    progress_percentage: number;
    status: string;
}

interface ChecklistCompletionSummary {
    completed: number;
    total: number;
    percentage: number;
}

function BranchCalendarCard({ events }: { events: CalendarEvent[] }) {
    const [showCalendar, setShowCalendar] = useState(false);

    const groupedEvents = useMemo(() => {
        if (!showCalendar) return [];
        const sorted = [...events].filter((e) => e.date).sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : (a.time || '').localeCompare(b.time || '')));
        const groups: Record<string, CalendarEvent[]> = {};
        sorted.forEach((event) => {
            const key = event.date;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(event);
        });
        return Object.entries(groups)
            .map(([date, items]) => ({ date, items }))
            .sort((a, b) => (a.date > b.date ? 1 : -1));
    }, [events, showCalendar]);

    const typeBadge = (type: string) => {
        switch (type) {
            case 'test_drive':
                return (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Car className="h-3 w-3" /> Test Drive
                    </Badge>
                );
            case 'pms':
                return (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Wrench className="h-3 w-3" /> PMS
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-xs capitalize">{type}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex items-start justify-between gap-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Branch Calendar (Next 14 days)
                    </CardTitle>
                    <CardDescription>Test drives, PMS schedules, and branch events.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowCalendar((prev) => !prev)}>
                        {showCalendar ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                    <Link href="/dashboard/calendar">
                        <Button size="sm">Open Calendar</Button>
                    </Link>
                </div>
            </CardHeader>
            {showCalendar && (
                <CardContent className="space-y-4">
                    {groupedEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No scheduled items in the next 14 days.</p>
                    ) : (
                        groupedEvents.map(({ date, items }) => (
                            <div key={date} className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    {new Date(date).toLocaleDateString()}
                                </div>
                                <div className="space-y-2">
                                    {items.map((event, idx) => (
                                        <div key={`${event.type}-${idx}`} className="flex items-start justify-between rounded-md border p-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    {typeBadge(event.type)}
                                                    {event.branch?.code && (
                                                        <Badge variant="outline" className="text-[11px]">
                                                            {event.branch.code}
                                                        </Badge>
                                                    )}
                                                    {event.status && (
                                                        <Badge variant="outline" className="text-[11px] capitalize">
                                                            {event.status.replace('_', ' ')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="font-medium">{event.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {event.time ? `${event.time}` : 'All day'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            )}
        </Card>
    );
}

type ChecklistToggleHandler = (checklist: AssignedChecklist, item: AssignedChecklistItem) => Promise<void> | void;

interface ChecklistPanelBindings {
    assignedChecklists: AssignedChecklist[];
    assignmentMeta: Record<number, AssignmentMeta>;
    activeChecklistId: number | null;
    setActiveChecklistId: (id: number | null) => void;
    checklistProgress: Record<number, Record<number, boolean>>;
    savingItems: Record<string, boolean>;
    handleChecklistItemToggle: ChecklistToggleHandler;
    getChecklistCompletion: (checklist: AssignedChecklist) => ChecklistCompletionSummary;
    activeChecklist: AssignedChecklist | null;
    activeChecklistMeta?: AssignmentMeta;
    formatDueDate: (value?: string | null) => string;
}

type DashboardRole =
    | 'admin'
    | 'sales_manager'
    | 'sales_rep'
    | 'service_manager'
    | 'technician'
    | 'parts_head'
    | 'parts_clerk'
    | 'auditor'
    | 'default';

type CurrencyFormatter = (value?: number | null) => string;

const ROLE_PRIORITY: DashboardRole[] = [
    'admin',
    'sales_manager',
    'sales_rep',
    'service_manager',
    'technician',
    'parts_head',
    'parts_clerk',
    'auditor',
    'default',
];

const ROLE_ALIASES: Record<DashboardRole, string[]> = {
    admin: ['admin', 'super_admin'],
    sales_manager: ['sales_manager'],
    sales_rep: ['sales_rep'],
    service_manager: ['service_manager', 'operations_manager', 'manager'],
    technician: ['technician'],
    parts_head: ['parts_head'],
    parts_clerk: ['parts_clerk'],
    auditor: ['auditor', 'compliance_manager'],
    default: [],
};

interface ViewerContext {
    branch_id: number | null;
    branch_name: string | null;
    branch_code: string | null;
    is_headquarters: boolean;
}

interface InertiaPageProps {
    auth?: {
        roles?: string[];
        permissions?: string[];
    };
    viewer?: ViewerContext | null;
}

interface RoleViewProps {
    role: DashboardRole;
    kpis: KPIs;
    charts: ChartData;
    alerts: Alert[];
    recentActivities: Activity[];
    branches: Branch[];
    formatCurrency: CurrencyFormatter;
    renderChangeIndicator: (change: number) => JSX.Element;
    checklistBindings: ChecklistPanelBindings;
    calendarEvents: CalendarEvent[];
}

export default function Dashboard({
    assignedChecklists = [],
    filters,
    branches,
    kpis,
    charts,
    alerts,
    recentActivities,
    viewer,
    calendarEvents = [],
}: DashboardProps) {
    const page = usePage<InertiaPageProps>();
    const { auth, viewer: viewerFromPage } = page.props;
    const roleNames = auth?.roles ?? [];
    const viewerContext = viewer ?? viewerFromPage ?? null;
    const canSelectBranch = viewerContext?.is_headquarters ?? true;
    const lockedBranchId = canSelectBranch ? null : viewerContext?.branch_id ?? null;
    const lockedBranchName = viewerContext?.branch_name ?? null;

    const [activeChecklistId, setActiveChecklistId] = useState<number | null>(assignedChecklists[0]?.id ?? null);
    const [checklistProgress, setChecklistProgress] = useState<Record<number, Record<number, boolean>>>(() => {
        const initial: Record<number, Record<number, boolean>> = {};
        assignedChecklists.forEach((checklist) => {
            initial[checklist.id] = checklist.items.reduce<Record<number, boolean>>((acc, item) => {
                acc[item.id] = Boolean(item.is_completed);
                return acc;
            }, {});
        });
        return initial;
    });
    const [assignmentMeta, setAssignmentMeta] = useState<Record<number, AssignmentMeta>>(() => {
        const meta: Record<number, AssignmentMeta> = {};
        assignedChecklists.forEach((checklist) => {
            if (checklist.assignment_id) {
                meta[checklist.assignment_id] = {
                    progress_percentage: checklist.progress_percentage ?? 0,
                    status: checklist.status,
                };
            }
        });
        return meta;
    });
    const [savingItems, setSavingItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setChecklistProgress(() => {
            const updated: Record<number, Record<number, boolean>> = {};
            assignedChecklists.forEach((checklist) => {
                updated[checklist.id] = checklist.items.reduce<Record<number, boolean>>((acc, item) => {
                    acc[item.id] = Boolean(item.is_completed);
                    return acc;
                }, {});
            });
            return updated;
        });

        setAssignmentMeta(() => {
            const meta: Record<number, AssignmentMeta> = {};
            assignedChecklists.forEach((checklist) => {
                if (checklist.assignment_id) {
                    meta[checklist.assignment_id] = {
                        progress_percentage: checklist.progress_percentage ?? 0,
                        status: checklist.status,
                    };
                }
            });
            return meta;
        });

        setActiveChecklistId((current) => {
            if (current && assignedChecklists.some((checklist) => checklist.id === current)) {
                return current;
            }
            return assignedChecklists[0]?.id ?? null;
        });
    }, [assignedChecklists]);

    const activeChecklist = useMemo(
        () =>
            assignedChecklists.find((checklist) => checklist.id === activeChecklistId) ??
            assignedChecklists[0] ??
            null,
        [activeChecklistId, assignedChecklists]
    );

    const activeChecklistMeta = activeChecklist && activeChecklist.assignment_id ? assignmentMeta[activeChecklist.assignment_id] : undefined;

    const formatDueDate = (value?: string | null) => {
        if (!value) return 'No schedule';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return 'No schedule';
        }
        return date.toLocaleString();
    };

    const getChecklistCompletion = (checklist: AssignedChecklist): ChecklistCompletionSummary => {
        const checklistState = checklistProgress[checklist.id];
        const totalItems = checklist.items.length || 1;

        if (!checklistState) {
            const percentage = checklist.progress_percentage ?? 0;
            const completedFromPercentage = Math.round((percentage / 100) * totalItems);
            return {
                completed: Math.min(completedFromPercentage, checklist.items.length),
                total: checklist.items.length,
                percentage,
            };
        }

        const completed = checklist.items.filter((item) => checklistState[item.id]).length;
        return {
            completed,
            total: checklist.items.length,
            percentage: Math.round((completed / totalItems) * 100) || 0,
        };
    };

    const handleChecklistItemToggle: ChecklistToggleHandler = async (checklist, item) => {
        if (!checklist.assignment_id || !item.assignment_item_id) {
            return;
        }

        const checklistId = checklist.id;
        const itemId = item.id;
        const key = `${checklist.assignment_id}:${item.assignment_item_id}`;
        const previousValue = Boolean(checklistProgress[checklistId]?.[itemId]);
        const nextValue = !previousValue;

        setChecklistProgress((prev) => ({
            ...prev,
            [checklistId]: {
                ...(prev[checklistId] ?? {}),
                [itemId]: nextValue,
            },
        }));
        setSavingItems((prev) => ({ ...prev, [key]: true }));

        try {
            const response = await axios.post(
                route('dashboard.checklists.items.toggle', {
                    assignment: checklist.assignment_id,
                    assignmentItem: item.assignment_item_id,
                }),
                {
                    is_completed: nextValue,
                }
            );

            const data = response.data as {
                assignment_id: number;
                assignment_item_id: number;
                is_completed: boolean;
                progress_percentage: number;
                status: string;
            };

            setChecklistProgress((prev) => ({
                ...prev,
                [checklistId]: {
                    ...(prev[checklistId] ?? {}),
                    [itemId]: data.is_completed,
                },
            }));

            setAssignmentMeta((prev) => ({
                ...prev,
                [data.assignment_id]: {
                    progress_percentage: data.progress_percentage,
                    status: data.status,
                },
            }));
        } catch (error) {
            console.error(error);
            setChecklistProgress((prev) => ({
                ...prev,
                [checklistId]: {
                    ...(prev[checklistId] ?? {}),
                    [itemId]: previousValue,
                },
            }));
        } finally {
            setSavingItems((prev) => {
                const { [key]: _unused, ...rest } = prev;
                return rest;
            });
        }
    };

    const formatCurrency = (value?: number | null) => {
        const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;

        if (amount >= 1_000_000) {
            return `₱${(amount / 1_000_000).toFixed(1)}M`;
        }
        if (amount >= 1_000) {
            return `₱${(amount / 1_000).toFixed(0)}K`;
        }
        return `₱${amount.toFixed(0)}`;
    };

    const renderChangeIndicator = (change: number) => {
        if (change === 0) {
            return (
                <span className="text-xs text-muted-foreground flex items-center">
                    <span className="ml-1">No change</span>
                </span>
            );
        }

        return (
            <div className="flex items-center text-xs text-muted-foreground">
                {change > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(change).toFixed(1)}%
                </span>
                <span className="ml-1">vs previous period</span>
            </div>
        );
    };

    const primaryRole = useMemo(() => detectPrimaryRole(roleNames), [roleNames]);

    const checklistBindings: ChecklistPanelBindings = {
        assignedChecklists,
        assignmentMeta,
        activeChecklistId,
        setActiveChecklistId,
        checklistProgress,
        savingItems,
        handleChecklistItemToggle,
        getChecklistCompletion,
        activeChecklist,
        activeChecklistMeta,
        formatDueDate,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 overflow-x-auto">
                <DashboardFilters
                    filters={filters}
                    branches={branches}
                    canSelectBranch={canSelectBranch}
                    lockedBranchId={lockedBranchId}
                    lockedBranchName={lockedBranchName}
                />
                {renderDashboardByRole({
                    role: primaryRole,
                    kpis,
                    charts,
                    alerts,
                    recentActivities,
                    branches,
                    formatCurrency,
                    renderChangeIndicator,
                    checklistBindings,
                    calendarEvents: calendarEvents ?? [],
                })}
            </div>
        </AppLayout>
    );
}

function detectPrimaryRole(roles: string[]): DashboardRole {
    const normalized = roles.map((role) => role?.toLowerCase?.() ?? role);

    for (const role of ROLE_PRIORITY) {
        if (role === 'default') {
            continue;
        }
        const aliases = ROLE_ALIASES[role];
        if (aliases.some((alias) => normalized.includes(alias))) {
            return role;
        }
    }

    return 'default';
}

function renderDashboardByRole(props: RoleViewProps) {
    switch (props.role) {
        case 'admin':
            return <AdminDashboard {...props} />;
        case 'sales_manager':
            return <SalesManagerDashboard {...props} />;
        case 'sales_rep':
            return <SalesRepDashboard {...props} />;
        case 'service_manager':
            return <ServiceManagerDashboard {...props} />;
        case 'technician':
            return <TechnicianDashboard {...props} />;
        case 'parts_head':
            return <PartsHeadDashboard {...props} />;
        case 'parts_clerk':
            return <PartsClerkDashboard {...props} />;
        case 'auditor':
            return <AuditorDashboard {...props} />;
        default:
            return <GeneralDashboard {...props} />;
    }
}

function AdminDashboard(props: RoleViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <BranchCalendarCard events={props.calendarEvents} />
            <PrimaryKpiGrid kpis={props.kpis} formatCurrency={props.formatCurrency} renderChangeIndicator={props.renderChangeIndicator} />
            <SecondaryKpiGrid kpis={props.kpis} formatCurrency={props.formatCurrency} />
            <AdminExecutiveInsights branches={props.branches} kpis={props.kpis} alerts={props.alerts} formatCurrency={props.formatCurrency} />
            <Suspense
                fallback={
                    <Card className="lg:col-span-2">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center h-64">
                                <div className="text-muted-foreground">Loading charts...</div>
                            </div>
                        </CardContent>
                    </Card>
                }
            >
                <DashboardCharts charts={props.charts} />
            </Suspense>
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <SalesPipelineCard charts={props.charts} formatCurrency={props.formatCurrency} />
                        <KeyMetricsCard kpis={props.kpis} formatCurrency={props.formatCurrency} />
                    </div>
                    <TopSalesRepsCard charts={props.charts} formatCurrency={props.formatCurrency} />
                    <div className="grid gap-6 md:grid-cols-2">
                        <AlertsPanel alerts={props.alerts} />
                        <RecentActivitiesPanel activities={props.recentActivities} />
                    </div>
                </div>
                <AssignedChecklistsPanel {...props.checklistBindings} />
            </div>
        </div>
    );
}

function SalesManagerDashboard(props: RoleViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <BranchCalendarCard events={props.calendarEvents} />
            <SalesLeadershipGrid kpis={props.kpis} formatCurrency={props.formatCurrency} renderChangeIndicator={props.renderChangeIndicator} />
            <div className="grid gap-6 lg:grid-cols-3">
                <SalesPipelineCard charts={props.charts} formatCurrency={props.formatCurrency} CTAHref="/sales/pipeline" />
                <KeyMetricsCard kpis={props.kpis} formatCurrency={props.formatCurrency} highlight="sales" />
                <LeadSourcesCard charts={props.charts} />
            </div>
            <TopSalesRepsCard charts={props.charts} formatCurrency={props.formatCurrency} />
            <div className="grid gap-6 lg:grid-cols-2">
                <AlertsPanel alerts={props.alerts} title="Pipeline Alerts" emptyMessage="No pipeline alerts today" />
                <AssignedChecklistsPanel
                    {...props.checklistBindings}
                    title="Customer Follow-ups"
                    description="Compliance and CX checklists assigned to your team"
                />
            </div>
        </div>
    );
}

function SalesRepDashboard(props: RoleViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <BranchCalendarCard events={props.calendarEvents} />
            <SalesRepScorecard kpis={props.kpis} formatCurrency={props.formatCurrency} renderChangeIndicator={props.renderChangeIndicator} />
            <div className="grid gap-6 lg:grid-cols-2">
                <SalesActionCenter alerts={props.alerts} activities={props.recentActivities} />
                <AssignedChecklistsPanel
                    {...props.checklistBindings}
                    title="Assigned Follow-ups"
                    description="Track survey send-outs and post-sales commitments"
                />
            </div>
            <SalesPipelineCard charts={props.charts} formatCurrency={props.formatCurrency} compact />
        </div>
    );
}

function ServiceManagerDashboard(props: RoleViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <BranchCalendarCard events={props.calendarEvents} />
            <ServiceKpiGrid kpis={props.kpis} formatCurrency={props.formatCurrency} renderChangeIndicator={props.renderChangeIndicator} />
            <div className="grid gap-6 lg:grid-cols-3">
                <OperationsSnapshotCard kpis={props.kpis} />
                <InventoryHealthCard kpis={props.kpis} formatCurrency={props.formatCurrency} />
                <LeadSourcesCard charts={props.charts} title="Lead Sources" description="Useful for cross-training sales & service" compact />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <AlertsPanel alerts={props.alerts} title="Shop Alerts" />
                <AssignedChecklistsPanel
                    {...props.checklistBindings}
                    title="Operational Checklists"
                    description="Branch safety, PMS, and QA routines"
                />
            </div>
        </div>
    );
}

function TechnicianDashboard(props: RoleViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <BranchCalendarCard events={props.calendarEvents} />
            <TechnicianWorkloadCard kpis={props.kpis} formatCurrency={props.formatCurrency} />
            <div className="grid gap-6 lg:grid-cols-2">
                <AssignedChecklistsPanel
                    {...props.checklistBindings}
                    title="My Checklists"
                    description="Tasks assigned across branches"
                />
                <AlertsPanel alerts={props.alerts} title="Shift Alerts" emptyMessage="No alerts for this shift" />
            </div>
            <RecentActivitiesPanel activities={props.recentActivities} title="Shop Activity" />
        </div>
    );
}

function PartsHeadDashboard(props: RoleViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <BranchCalendarCard events={props.calendarEvents} />
            <PartsKpiGrid kpis={props.kpis} formatCurrency={props.formatCurrency} />
            <InventoryHealthCard kpis={props.kpis} formatCurrency={props.formatCurrency} detailed />
            <div className="grid gap-6 lg:grid-cols-2">
                <AlertsPanel alerts={props.alerts} title="Inventory Alerts" />
                <AssignedChecklistsPanel
                    {...props.checklistBindings}
                    title="Parts Compliance"
                    description="Cycle counts and warranty reconciliation"
                />
            </div>
        </div>
    );
}

function PartsClerkDashboard(props: RoleViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <BranchCalendarCard events={props.calendarEvents} />
            <PartsKpiGrid kpis={props.kpis} formatCurrency={props.formatCurrency} compact />
            <AssignedChecklistsPanel
                {...props.checklistBindings}
                title="Daily Issue Lists"
                description="Pick, issue, and return tasks queued for you"
            />
            <AlertsPanel alerts={props.alerts} title="Stock Alerts" />
        </div>
    );
}

function AuditorDashboard(props: RoleViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <BranchCalendarCard events={props.calendarEvents} />
            <AuditorInsightsGrid kpis={props.kpis} alerts={props.alerts} />
            <div className="grid gap-6 md:grid-cols-2">
                <AlertsPanel
                    alerts={props.alerts.filter((alert) => alert.priority === 'high')}
                    title="High Priority Alerts"
                    emptyMessage="No critical alerts"
                />
                <RecentActivitiesPanel activities={props.recentActivities} title="Latest Logged Activity" />
            </div>
            <AssignedChecklistsPanel
                {...props.checklistBindings}
                title="Audit Assignments"
                description="Pending checklists, approvals, and follow-ups"
            />
        </div>
    );
}

function GeneralDashboard(props: RoleViewProps) {
    return (
        <div className="flex flex-col gap-6">
            <BranchCalendarCard events={props.calendarEvents} />
            <PrimaryKpiGrid kpis={props.kpis} formatCurrency={props.formatCurrency} renderChangeIndicator={props.renderChangeIndicator} />
            <SecondaryKpiGrid kpis={props.kpis} formatCurrency={props.formatCurrency} />
            <div className="grid gap-6 lg:grid-cols-2">
                <SalesPipelineCard charts={props.charts} formatCurrency={props.formatCurrency} />
                <KeyMetricsCard kpis={props.kpis} formatCurrency={props.formatCurrency} />
            </div>
            <Suspense
                fallback={
                    <Card className="lg:col-span-2">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center h-64">
                                <div className="text-muted-foreground">Loading charts...</div>
                            </div>
                        </CardContent>
                    </Card>
                }
            >
                <DashboardCharts charts={props.charts} />
            </Suspense>
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <div className="grid gap-6 md:grid-cols-2">
                    <AlertsPanel alerts={props.alerts} />
                    <RecentActivitiesPanel activities={props.recentActivities} />
                </div>
                <AssignedChecklistsPanel {...props.checklistBindings} />
            </div>
        </div>
    );
}

interface KPIGridProps {
    kpis: KPIs;
    formatCurrency: CurrencyFormatter;
    renderChangeIndicator: (change: number) => JSX.Element;
}

function PrimaryKpiGrid({ kpis, formatCurrency, renderChangeIndicator }: KPIGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpis.sales.revenue.current)}</div>
                    {renderChangeIndicator(kpis.sales.revenue.change)}
                    <div className="mt-2 text-xs text-muted-foreground">{kpis.sales.units_sold.current} units sold</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Service Revenue</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpis.service.revenue.current)}</div>
                    {renderChangeIndicator(kpis.service.revenue.change)}
                    <div className="mt-2 text-xs text-muted-foreground">{kpis.service.work_orders.active} active work orders</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.pipeline.conversion_rate.current}%</div>
                    {renderChangeIndicator(kpis.pipeline.conversion_rate.change)}
                    <div className="mt-2 text-xs text-muted-foreground">{kpis.pipeline.total_leads} total leads</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.customers.satisfaction.current}/5.0</div>
                    {renderChangeIndicator(kpis.customers.satisfaction.change)}
                    <div className="mt-2 text-xs text-muted-foreground">NPS: {kpis.customers.nps.current}</div>
                </CardContent>
            </Card>
        </div>
    );
}

interface SecondaryKpiGridProps {
    kpis: KPIs;
    formatCurrency: CurrencyFormatter;
}

function SecondaryKpiGrid({ kpis, formatCurrency }: SecondaryKpiGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vehicle Inventory</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.inventory.units_in_stock}</div>
                    <p className="text-xs text-muted-foreground">units in stock</p>
                    <div className="mt-2 text-xs text-muted-foreground">Value: {formatCurrency(kpis.inventory.total_value)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Parts Inventory</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Number(kpis.inventory.total_parts ?? 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">parts in stock</p>
                    <div className="mt-2 text-xs text-red-500 font-medium">{kpis.inventory.low_stock_parts} low stock alerts</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Warranty Claims</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.warranty.pending_claims}</div>
                    <p className="text-xs text-muted-foreground">pending claims</p>
                    <div className="mt-2 text-xs text-muted-foreground">Approved: {formatCurrency(kpis.warranty.total_claims_amount)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.compliance.completion_rate}%</div>
                    <p className="text-xs text-muted-foreground">completion rate</p>
                    {kpis.compliance.overdue_checklists > 0 && (
                        <div className="mt-2 text-xs text-red-500 font-medium">
                            {kpis.compliance.overdue_checklists} overdue checklists
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

interface AdminExecutiveInsightsProps {
    branches: Branch[];
    kpis: KPIs;
    alerts: Alert[];
    formatCurrency: CurrencyFormatter;
}

function AdminExecutiveInsights({ branches, kpis, alerts, formatCurrency }: AdminExecutiveInsightsProps) {
    const criticalAlerts = alerts.filter((alert) => alert.priority === 'high');

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Branch Coverage</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{branches.length}</div>
                    <p className="text-xs text-muted-foreground">active branches reporting data</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Customer Base</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Number(kpis.customers.total ?? 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">total customers across branches</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compliance Health</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.compliance.completion_rate}%</div>
                    <p className="text-xs text-muted-foreground">{kpis.compliance.overdue_checklists} overdue checklists</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{criticalAlerts.length}</div>
                    <p className="text-xs text-muted-foreground">high-priority issues requiring action</p>
                    {criticalAlerts.length > 0 && (
                        <div className="mt-2 text-xs text-red-500">
                            Latest: {criticalAlerts[0].message}
                        </div>
                    )}
                    {criticalAlerts.length === 0 && (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Stable
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

interface SalesLeadershipGridProps extends KPIGridProps {}

function SalesLeadershipGrid({ kpis, formatCurrency, renderChangeIndicator }: SalesLeadershipGridProps) {
    const pipelineValue = kpis.sales.avg_deal_value.current * kpis.pipeline.total_leads;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpis.sales.revenue.current)}</div>
                    {renderChangeIndicator(kpis.sales.revenue.change)}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.pipeline.conversion_rate.current}%</div>
                    {renderChangeIndicator(kpis.pipeline.conversion_rate.change)}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(pipelineValue)}</div>
                    <p className="text-xs text-muted-foreground">estimated value of open deals</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Customer NPS</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.customers.nps.current}</div>
                    {renderChangeIndicator(kpis.customers.nps.change)}
                </CardContent>
            </Card>
        </div>
    );
}

interface SalesRepScorecardProps extends KPIGridProps {}

function SalesRepScorecard({ kpis, formatCurrency, renderChangeIndicator }: SalesRepScorecardProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Personal Quota Pace</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpis.sales.avg_deal_value.current * 4)}</div>
                    <p className="text-xs text-muted-foreground">est. value needed to stay on pace</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.pipeline.conversion_rate.current}%</div>
                    {renderChangeIndicator(kpis.pipeline.conversion_rate.change)}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Test Drives</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.pipeline.test_drives.scheduled}</div>
                    <p className="text-xs text-muted-foreground">{kpis.pipeline.test_drives.completed} completed</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Deal Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpis.sales.avg_deal_value.current)}</div>
                    <p className="text-xs text-muted-foreground">vs {formatCurrency(kpis.sales.avg_deal_value.previous)}</p>
                </CardContent>
            </Card>
        </div>
    );
}

interface ServiceKpiGridProps extends KPIGridProps {}

function ServiceKpiGrid({ kpis, formatCurrency, renderChangeIndicator }: ServiceKpiGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.service.work_orders.active}</div>
                    {renderChangeIndicator(kpis.service.work_orders.change)}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Service Revenue</CardTitle>
                    <Factory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kpis.service.revenue.current)}</div>
                    {renderChangeIndicator(kpis.service.revenue.change)}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Warranty Queue</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.warranty.pending_claims}</div>
                    <p className="text-xs text-muted-foreground">pending approvals</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Turnaround</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.service.avg_turnaround}h</div>
                    <p className="text-xs text-muted-foreground">target: &lt; 18h</p>
                </CardContent>
            </Card>
        </div>
    );
}

interface PartsKpiGridProps {
    kpis: KPIs;
    formatCurrency: CurrencyFormatter;
    compact?: boolean;
}

function PartsKpiGrid({ kpis, formatCurrency, compact }: PartsKpiGridProps) {
    const gridClass = compact ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4 md:grid-cols-2 lg:grid-cols-4';

    return (
        <div className={gridClass}>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Parts on Hand</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Number(kpis.inventory.total_parts ?? 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">worth {formatCurrency(kpis.inventory.parts_value)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{kpis.inventory.low_stock_parts}</div>
                    <p className="text-xs text-muted-foreground">items below reorder point</p>
                </CardContent>
            </Card>
            {!compact && (
                <Card>
                    <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vehicle Inventory</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.inventory.units_in_stock}</div>
                        <p className="text-xs text-muted-foreground">units available</p>
                    </CardContent>
                </Card>
            )}
            {!compact && (
                <Card>
                    <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Warranty Claims</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.warranty.pending_claims}</div>
                        <p className="text-xs text-muted-foreground">requires parts reconciliation</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

interface AuditorInsightsGridProps {
    kpis: KPIs;
    alerts: Alert[];
}

function AuditorInsightsGrid({ kpis, alerts }: AuditorInsightsGridProps) {
    const overdue = kpis.compliance.overdue_checklists;
    const highPriority = alerts.filter((alert) => alert.priority === 'high').length;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.compliance.completion_rate}%</div>
                    <p className="text-xs text-muted-foreground">{overdue} overdue</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Audit Findings</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{highPriority}</div>
                    <p className="text-xs text-muted-foreground">open items flagged high priority</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time Tracking</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Live</div>
                    <p className="text-xs text-muted-foreground">monitoring idle sessions</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Survey Health</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.customers.satisfaction.current}/5</div>
                    <p className="text-xs text-muted-foreground">NPS {kpis.customers.nps.current}</p>
                </CardContent>
            </Card>
        </div>
    );
}

interface SalesPipelineCardProps {
    charts: ChartData;
    formatCurrency: CurrencyFormatter;
    CTAHref?: string;
    compact?: boolean;
}

function SalesPipelineCard({ charts, formatCurrency, CTAHref, compact }: SalesPipelineCardProps) {
    const stages = compact ? charts.pipeline_stages.slice(0, 3) : charts.pipeline_stages;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sales Pipeline
                </CardTitle>
                <CardDescription>Current sales funnel performance</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {stages.map((stage, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-medium">{stage.stage}</div>
                                <Badge variant="secondary" className="text-xs">
                                    {stage.count}
                                </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">{formatCurrency(stage.value)}</div>
                        </div>
                    ))}
                </div>
                {(CTAHref || !compact) && (
                    <div className="mt-4 pt-4 border-t">
                        <Link
                            href={CTAHref ?? '/sales/pipeline'}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            View detailed pipeline
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface KeyMetricsCardProps {
    kpis: KPIs;
    formatCurrency: CurrencyFormatter;
    highlight?: 'sales' | 'operations';
}

function KeyMetricsCard({ kpis, formatCurrency, highlight }: KeyMetricsCardProps) {
    const showOperations = highlight === 'operations';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {showOperations ? 'Operational Metrics' : 'Key Metrics'}
                </CardTitle>
                <CardDescription>
                    {showOperations ? 'Turnaround, completion, and utilization' : 'Important operational metrics'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Test Drives</span>
                        <span className="text-2xl font-bold">{kpis.pipeline.test_drives.scheduled}</span>
                    </div>
                    <Progress
                        value={
                            kpis.pipeline.test_drives.scheduled > 0
                                ? (kpis.pipeline.test_drives.completed / kpis.pipeline.test_drives.scheduled) * 100
                                : 0
                        }
                        className="h-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">{kpis.pipeline.test_drives.completed} completed</div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Work Orders</span>
                        <span className="text-2xl font-bold">{kpis.service.work_orders.completed}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Avg turnaround: {kpis.service.avg_turnaround}h</div>
                </div>

                {!showOperations && (
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Avg Deal Value</span>
                            <span className="text-lg font-bold">{formatCurrency(kpis.sales.avg_deal_value.current)}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface TopSalesRepsCardProps {
    charts: ChartData;
    formatCurrency: CurrencyFormatter;
}

function TopSalesRepsCard({ charts, formatCurrency }: TopSalesRepsCardProps) {
    if (charts.top_sales_reps.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Performing Sales Reps
                </CardTitle>
                <CardDescription>Based on units sold in selected period</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {charts.top_sales_reps.slice(0, 5).map((rep, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                                    #{index + 1}
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{rep.name}</div>
                                    <div className="text-xs text-muted-foreground">{rep.units_sold} units sold</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{formatCurrency(rep.revenue)}</div>
                                <div className="text-xs text-muted-foreground">revenue</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface LeadSourcesCardProps {
    charts: ChartData;
    title?: string;
    description?: string;
    compact?: boolean;
}

function LeadSourcesCard({ charts, title = 'Lead Sources', description = 'Where leads come from', compact }: LeadSourcesCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {charts.lead_sources.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">No lead source data</div>
                ) : (
                    <div className="space-y-3">
                        {charts.lead_sources.slice(0, compact ? 3 : charts.lead_sources.length).map((source) => (
                            <div key={source.source} className="flex items-center justify-between">
                                <div className="text-sm font-medium">{source.source}</div>
                                <Badge variant="outline">{source.count}</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface OperationsSnapshotCardProps {
    kpis: KPIs;
}

function OperationsSnapshotCard({ kpis }: OperationsSnapshotCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Operations Snapshot
                </CardTitle>
                <CardDescription>Live status of shop throughput</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-muted-foreground">Work Orders Today</div>
                        <div className="text-2xl font-bold">{kpis.service.work_orders.current}</div>
                    </div>
                    <Badge variant="secondary">{kpis.service.work_orders.completed} completed</Badge>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-muted-foreground">Warranty Approvals</div>
                        <div className="text-2xl font-bold">{kpis.warranty.approved_claims}</div>
                    </div>
                    <Badge variant="outline">₱{Number(kpis.warranty.total_claims_amount ?? 0).toLocaleString()}</Badge>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Compliance completion</div>
                    <Progress value={kpis.compliance.completion_rate} className="h-2" />
                </div>
            </CardContent>
        </Card>
    );
}

interface InventoryHealthCardProps {
    kpis: KPIs;
    formatCurrency: CurrencyFormatter;
    detailed?: boolean;
}

function InventoryHealthCard({ kpis, formatCurrency, detailed }: InventoryHealthCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Inventory Health
                </CardTitle>
                <CardDescription>Parts coverage & reorder readiness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Inventory value</span>
                    <span className="text-sm font-semibold">{formatCurrency(kpis.inventory.parts_value)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Low stock items</span>
                    <Badge variant="destructive">{kpis.inventory.low_stock_parts}</Badge>
                </div>
                {detailed && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Units in stock</span>
                        <span className="text-sm font-semibold">{kpis.inventory.units_in_stock}</span>
                    </div>
                )}
                {detailed && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Parts catalogue value</span>
                        <span className="text-sm font-semibold">{formatCurrency(kpis.inventory.total_value)}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface TechnicianWorkloadCardProps {
    kpis: KPIs;
    formatCurrency: CurrencyFormatter;
}

function TechnicianWorkloadCard({ kpis, formatCurrency }: TechnicianWorkloadCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Daily Workload
                </CardTitle>
                <CardDescription>Active assignments and materials readiness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active work orders</span>
                    <span className="text-2xl font-bold">{kpis.service.work_orders.active}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Parts available</span>
                    <span className="text-2xl font-bold">{Number(kpis.inventory.total_parts ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Warranty jobs</span>
                    <span className="text-2xl font-bold">{kpis.warranty.pending_claims}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                    Avg ticket value: {formatCurrency(kpis.service.revenue.current / Math.max(kpis.service.work_orders.completed, 1))}
                </div>
            </CardContent>
        </Card>
    );
}

interface SalesActionCenterProps {
    alerts: Alert[];
    activities: Activity[];
}

function SalesActionCenter({ alerts, activities }: SalesActionCenterProps) {
    const actionItems = alerts.slice(0, 3);
    const timeline = activities.slice(0, 3);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Action Center
                </CardTitle>
                <CardDescription>Immediate follow-ups & timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Alerts</p>
                    {actionItems.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No alerts at the moment</div>
                    ) : (
                        <div className="space-y-2">
                            {actionItems.map((alert, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    <AlertCircle className="h-4 w-4 mt-0.5 text-orange-500" />
                                    <div>
                                        <p className="font-medium">{alert.message}</p>
                                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Recent pipeline moves</p>
                    {timeline.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No recorded activities</div>
                    ) : (
                        <div className="space-y-2">
                            {timeline.map((activity, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    <Activity className="h-4 w-4 mt-0.5 text-blue-500" />
                                    <div>
                                        <p className="font-medium">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface AlertsPanelProps {
    alerts: Alert[];
    title?: string;
    emptyMessage?: string;
}

function AlertsPanel({ alerts, title = 'System Alerts', emptyMessage = 'No alerts at this time' }: AlertsPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>Important notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
                {alerts.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</div>
                ) : (
                    <div className="space-y-3">
                        {alerts.map((alert, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                                {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                                {alert.type === 'error' && <XCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                                {alert.type === 'info' && <Activity className="h-4 w-4 text-blue-500 mt-0.5" />}
                                {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{alert.message}</div>
                                    <div className="text-xs text-muted-foreground">{alert.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface RecentActivitiesPanelProps {
    activities: Activity[];
    title?: string;
}

function RecentActivitiesPanel({ activities, title = 'Recent Activities' }: RecentActivitiesPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
                {activities.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">No recent activities</div>
                ) : (
                    <div className="space-y-3">
                        {activities.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                                <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{activity.action}</div>
                                    <div className="text-xs text-muted-foreground">by {activity.user} • {activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface AssignedChecklistsPanelProps extends ChecklistPanelBindings {
    title?: string;
    description?: string;
}

function AssignedChecklistsPanel({
    assignedChecklists,
    assignmentMeta,
    activeChecklistId,
    setActiveChecklistId,
    checklistProgress,
    savingItems,
    handleChecklistItemToggle,
    getChecklistCompletion,
    activeChecklist,
    activeChecklistMeta,
    formatDueDate,
    title = 'Assigned Checklists',
    description = 'Compliance tasks assigned to you across branches',
}: AssignedChecklistsPanelProps) {
    return (
        <Card className="border-emerald-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {assignedChecklists.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            No checklists assigned to you yet.
                        </div>
                    ) : (
                        assignedChecklists.map((checklist) => {
                            const { completed, total, percentage } = getChecklistCompletion(checklist);
                            const meta = checklist.assignment_id ? assignmentMeta[checklist.assignment_id] : null;
                            const statusLabel = meta?.status ?? checklist.status ?? 'pending';

                            return (
                                <button
                                    key={checklist.id}
                                    type="button"
                                    onClick={() => setActiveChecklistId(checklist.id)}
                                    className={`w-full rounded-lg border p-3 text-left ${
                                        activeChecklistId === checklist.id ? 'border-emerald-500 bg-emerald-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold">{checklist.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {checklist.branch ?? 'Unassigned Branch'} • Due {formatDueDate(checklist.due_at)}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {statusLabel.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-xs">
                                        <span>
                                            {completed}/{total} completed ({percentage}%)
                                        </span>
                                        <span className="text-muted-foreground">{checklist.frequency}</span>
                                    </div>
                                    <Progress value={percentage} className="h-2 mt-2" />
                                </button>
                            );
                        })
                    )}
                </div>

                {activeChecklist ? (
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="text-sm font-semibold">{activeChecklist.title}</div>
                                <div className="text-xs text-muted-foreground">
                                    {activeChecklist.branch ?? 'Unassigned Branch'} • Due {formatDueDate(activeChecklist.due_at)}
                                </div>
                            </div>
                            {activeChecklistMeta && (
                                <Badge variant="outline" className="capitalize">
                                    {activeChecklistMeta.status.replace('_', ' ')}
                                </Badge>
                            )}
                        </div>
                        <div className="space-y-2">
                            {activeChecklist.items.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                                    No checklist items configured.
                                </div>
                            ) : (
                                activeChecklist.items.map((item) => (
                                    <label key={item.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                                        <Checkbox
                                            checked={Boolean(checklistProgress[activeChecklist.id]?.[item.id])}
                                            onCheckedChange={() => handleChecklistItemToggle(activeChecklist, item)}
                                            disabled={
                                                !activeChecklist.assignment_id ||
                                                !item.assignment_item_id ||
                                                savingItems[`${activeChecklist.assignment_id}:${item.assignment_item_id}`]
                                            }
                                        />
                                        <span className="flex-1 leading-snug">{item.label}</span>
                                    </label>
                                ))
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Link href="/compliance/checklists" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Module
                                </Button>
                            </Link>
                            <Link href={`/compliance/checklists/${activeChecklist.id}`} className="flex-1">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Continue Checklist</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Select a checklist to view its tasks once available.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
