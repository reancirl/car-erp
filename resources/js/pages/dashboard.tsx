import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { 
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
    ExternalLink
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Mock data for dashboard analytics
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

interface DashboardProps {
    assignedChecklists?: AssignedChecklist[];
}

const dashboardData = {
    kpis: {
        totalRevenue: { value: 2450000, change: 12.5, period: 'vs last month' },
        activeWorkOrders: { value: 47, change: -8.2, period: 'vs last week' },
        leadConversion: { value: 23.8, change: 5.3, period: 'vs last month' },
        customerSatisfaction: { value: 4.6, change: 0.2, period: 'vs last quarter' }
    },
    serviceBays: {
        utilization: 78,
        totalBays: 12,
        activeBays: 9,
        avgTurnaround: 2.4 // hours
    },
    sales: {
        monthlyTarget: 85,
        achieved: 67,
        pipeline: [
            { stage: 'Leads', count: 124, value: 18600000 },
            { stage: 'Qualified', count: 45, value: 13500000 },
            { stage: 'Test Drive', count: 23, value: 6900000 },
            { stage: 'Negotiation', count: 12, value: 3600000 },
            { stage: 'Closed', count: 8, value: 2400000 }
        ]
    },
    inventory: {
        lowStock: 15,
        totalParts: 2847,
        pendingOrders: 23,
        stockValue: 1250000
    },
    alerts: [
        { id: 1, type: 'warning', message: '15 parts below minimum stock level', time: '2 hours ago' },
        { id: 2, type: 'info', message: '3 warranty claims pending approval', time: '4 hours ago' },
        { id: 3, type: 'error', message: 'Service bay #7 equipment maintenance due', time: '1 day ago' },
        { id: 4, type: 'success', message: 'Monthly sales target 78% achieved', time: '2 days ago' }
    ],
    recentActivities: [
        { id: 1, action: 'Work Order #WO-2024-0156 completed', user: 'John Technician', time: '15 min ago' },
        { id: 2, action: 'New lead assigned to Sarah Sales', user: 'System', time: '32 min ago' },
        { id: 3, action: 'Parts order #PO-2024-0089 approved', user: 'Mike Parts Head', time: '1 hour ago' },
        { id: 4, action: 'Customer survey response received (5★)', user: 'Customer Portal', time: '2 hours ago' }
    ],
    assignedChecklists: [
        {
            id: 101,
            assignment_id: null,
            title: 'Daily Service Bay Inspection',
            frequency: 'Daily',
            due_at: '2025-01-15T10:00:00Z',
            branch: 'Quezon Ave HQ',
            status: 'due_soon',
            progress_percentage: 60,
            items: [
                { id: 1, label: 'Check hydraulic lift pressure', assignment_item_id: null, is_completed: true },
                { id: 2, label: 'Verify PPE compliance for technicians', assignment_item_id: null, is_completed: true },
                { id: 3, label: 'Inspect fire extinguisher seals', assignment_item_id: null, is_completed: true },
                { id: 4, label: 'Capture photos of bays 1-3', assignment_item_id: null, is_completed: false },
                { id: 5, label: 'Log findings in compliance system', assignment_item_id: null, is_completed: false }
            ]
        },
        {
            id: 102,
            assignment_id: null,
            title: 'Weekly Parts Inventory Audit',
            frequency: 'Weekly',
            due_at: '2025-01-18T16:00:00Z',
            branch: 'Pasig Auto Hub',
            status: 'on_track',
            progress_percentage: 30,
            items: [
                { id: 1, label: 'Scan top 20 fast-moving SKUs', assignment_item_id: null, is_completed: true },
                { id: 2, label: 'Compare counts vs ERP', assignment_item_id: null, is_completed: false },
                { id: 3, label: 'Flag discrepancies > 2%', assignment_item_id: null, is_completed: false },
                { id: 4, label: 'Upload variance report', assignment_item_id: null, is_completed: false }
            ]
        },
        {
            id: 103,
            assignment_id: null,
            title: 'Monthly Fire Safety Checklist',
            frequency: 'Monthly',
            due_at: '2025-01-25T08:00:00Z',
            branch: 'Cebu Service Center',
            status: 'scheduled',
            progress_percentage: 0,
            items: [
                { id: 1, label: 'Test smoke detectors', assignment_item_id: null, is_completed: false },
                { id: 2, label: 'Ensure exits are unobstructed', assignment_item_id: null, is_completed: false },
                { id: 3, label: 'Validate fire alarm panel logs', assignment_item_id: null, is_completed: false }
            ]
        }
    ] as AssignedChecklist[]
};

export default function Dashboard({ assignedChecklists: assignedChecklistProps = [] }: DashboardProps) {
    const { kpis, serviceBays, sales, inventory, alerts, recentActivities } = dashboardData;
    const assignedChecklists = assignedChecklistProps.length > 0 ? assignedChecklistProps : dashboardData.assignedChecklists;

    const [activeChecklistId, setActiveChecklistId] = useState<number | null>(assignedChecklists[0]?.id ?? null);
    const [checklistProgress, setChecklistProgress] = useState<Record<number, Record<number, boolean>>>(() => {
        const initialState: Record<number, Record<number, boolean>> = {};
        assignedChecklists.forEach((checklist) => {
            initialState[checklist.id] = checklist.items.reduce<Record<number, boolean>>((acc, item) => {
                acc[item.id] = Boolean(item.is_completed);
                return acc;
            }, {});
        });
        return initialState;
    });
    const [assignmentMeta, setAssignmentMeta] = useState<Record<number, { progress_percentage: number; status: string }>>(() => {
        const meta: Record<number, { progress_percentage: number; status: string }> = {};
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
            const meta: Record<number, { progress_percentage: number; status: string }> = {};
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

    const activeChecklist = useMemo(() => assignedChecklists.find((checklist) => checklist.id === activeChecklistId) ?? assignedChecklists[0] ?? null, [activeChecklistId, assignedChecklists]);
    const activeChecklistMeta = activeChecklist && activeChecklist.assignment_id
        ? assignmentMeta[activeChecklist.assignment_id]
        : undefined;

    const formatDueDate = (value?: string | null) => {
        if (!value) return 'No schedule';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return 'No schedule';
        }
        return date.toLocaleString();
    };

    const getChecklistCompletion = (checklist: AssignedChecklist) => {
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

    const handleChecklistItemToggle = async (checklist: AssignedChecklist, item: AssignedChecklistItem) => {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 overflow-x-auto">
                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{(kpis.totalRevenue.value / 1000000).toFixed(1)}M</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {kpis.totalRevenue.change > 0 ? (
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                                )}
                                <span className={kpis.totalRevenue.change > 0 ? 'text-green-500' : 'text-red-500'}>
                                    {Math.abs(kpis.totalRevenue.change)}%
                                </span>
                                <span className="ml-1">{kpis.totalRevenue.period}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.activeWorkOrders.value}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {kpis.activeWorkOrders.change > 0 ? (
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                                )}
                                <span className={kpis.activeWorkOrders.change > 0 ? 'text-green-500' : 'text-red-500'}>
                                    {Math.abs(kpis.activeWorkOrders.change)}%
                                </span>
                                <span className="ml-1">{kpis.activeWorkOrders.period}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.leadConversion.value}%</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {kpis.leadConversion.change > 0 ? (
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                                )}
                                <span className={kpis.leadConversion.change > 0 ? 'text-green-500' : 'text-red-500'}>
                                    {Math.abs(kpis.leadConversion.change)}%
                                </span>
                                <span className="ml-1">{kpis.leadConversion.period}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.customerSatisfaction.value}/5.0</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {kpis.customerSatisfaction.change > 0 ? (
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                                )}
                                <span className={kpis.customerSatisfaction.change > 0 ? 'text-green-500' : 'text-red-500'}>
                                    +{Math.abs(kpis.customerSatisfaction.change)}
                                </span>
                                <span className="ml-1">{kpis.customerSatisfaction.period}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content + Compliance Sidebar */}
                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div className="space-y-6">
                        {/* Main Analytics Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Service Bay Utilization */}
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wrench className="h-5 w-5" />
                                Service Bay Utilization
                            </CardTitle>
                            <CardDescription>Current service bay status and efficiency</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Utilization Rate</span>
                                <span className="text-2xl font-bold">{serviceBays.utilization}%</span>
                            </div>
                            <Progress value={serviceBays.utilization} className="h-2" />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Active Bays</div>
                                    <div className="font-semibold">{serviceBays.activeBays}/{serviceBays.totalBays}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Avg Turnaround</div>
                                    <div className="font-semibold">{serviceBays.avgTurnaround}h</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sales Pipeline */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Sales Pipeline
                            </CardTitle>
                            <CardDescription>Current sales funnel performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sales.pipeline.map((stage, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium">{stage.stage}</div>
                                            <Badge variant="secondary" className="text-xs">
                                                {stage.count}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ₱{(stage.value / 1000000).toFixed(1)}M
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Monthly Target Progress</span>
                                    <span className="font-semibold">{sales.achieved}/{sales.monthlyTarget}</span>
                                </div>
                                <Progress value={(sales.achieved / sales.monthlyTarget) * 100} className="h-2 mt-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory Status */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Inventory Status
                            </CardTitle>
                            <CardDescription>Parts and stock management overview</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-500">{inventory.lowStock}</div>
                                    <div className="text-xs text-muted-foreground">Low Stock Items</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{inventory.totalParts}</div>
                                    <div className="text-xs text-muted-foreground">Total Parts</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Pending Orders</span>
                                    <span className="font-semibold">{inventory.pendingOrders}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Stock Value</span>
                                    <span className="font-semibold">₱{(inventory.stockValue / 1000000).toFixed(1)}M</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                        {/* Alerts and Recent Activities */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Alerts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        System Alerts
                                    </CardTitle>
                                    <CardDescription>Important notifications and warnings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {alerts.map((alert) => (
                                            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
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
                                </CardContent>
                            </Card>

                            {/* Recent Activities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Recent Activities
                                    </CardTitle>
                                    <CardDescription>Latest system activities and updates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentActivities.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                                <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">{activity.action}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        by {activity.user} • {activity.time}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" className="w-full mt-4">
                                        View All Activities
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Compliance Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-emerald-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                                    Assigned Checklists
                                </CardTitle>
                                <CardDescription>
                                    Compliance tasks assigned to you across branches
                                </CardDescription>
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
                                                    className={`w-full rounded-lg border p-3 text-left transition hover:border-emerald-400 ${activeChecklist?.id === checklist.id ? 'border-emerald-500 bg-emerald-50' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-semibold">{checklist.title}</span>
                                                        <div className="flex items-center gap-1">
                                                            <Badge variant="outline" className="capitalize">
                                                                {statusLabel.replace('_', ' ')}
                                                            </Badge>
                                                            <Badge variant="secondary">{checklist.frequency}</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        Due {formatDueDate(checklist.due_at)} • {completed}/{total || 0} items completed
                                                    </div>
                                                    <Progress value={percentage} className="mt-2 h-1.5" />
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
                                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                                    Continue Checklist
                                                </Button>
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
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
