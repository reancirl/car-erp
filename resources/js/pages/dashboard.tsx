import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    Car, 
    Wrench, 
    Package, 
    Users, 
    TrendingUp, 
    AlertTriangle, 
    Clock, 
    DollarSign,
    CheckCircle,
    XCircle,
    Calendar,
    Activity,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Bell
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Mock data for dashboard analytics
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
    ]
};

export default function Dashboard() {
    const { kpis, serviceBays, sales, inventory, alerts, recentActivities } = dashboardData;

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

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently used actions and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="justify-start gap-2">
                                <Car className="h-4 w-4" />
                                New Work Order
                            </Button>
                            <Button variant="outline" className="justify-start gap-2">
                                <Users className="h-4 w-4" />
                                Add Lead
                            </Button>
                            <Button variant="outline" className="justify-start gap-2">
                                <Package className="h-4 w-4" />
                                Parts Request
                            </Button>
                            <Button variant="outline" className="justify-start gap-2">
                                <Calendar className="h-4 w-4" />
                                Schedule Service
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
