import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Settings,
    Edit,
    Clock,
    DollarSign,
    Calendar,
    Gauge,
    CheckCircle,
    AlertCircle,
    Activity,
    TrendingUp,
    Users,
    FileText,
    Wrench,
    ClipboardList
} from 'lucide-react';
import { type BreadcrumbItem, type ServiceType, type CommonService, type Branch, type User } from '@/types';

type RecentWorkOrder = {
    id: number;
    work_order_number: string;
    customer_name?: string | null;
    status: string;
    created_at: string;
};

interface PerformanceMetrics {
    work_orders_count: number;
    completed_count: number;
    total_price: number;
    total_duration: number;
    completion_rate?: number | null;
    on_time_rate?: number | null;
    average_revenue?: number | null;
}

interface ViewableServiceType extends ServiceType {
    branch?: Branch | null;
    creator?: User | null;
    updater?: User | null;
    common_services?: Array<
        CommonService & {
            pivot?: {
                sequence?: number | null;
            };
        }
    >;
    work_orders_count?: number;
    completed_work_orders_count?: number;
    recent_work_orders?: RecentWorkOrder[];
    avg_completion_time?: number | null;
    customer_satisfaction?: number | null;
}

interface Props {
    serviceType: ViewableServiceType;
    performance: PerformanceMetrics;
    can: {
        edit: boolean;
        delete: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'Service Types',
        href: '/service/service-types',
    },
];

const getCategoryBadge = (category: string) => {
    switch (category) {
        case 'maintenance':
            return <Badge variant="outline" className="bg-blue-100 text-blue-800">Maintenance</Badge>;
        case 'repair':
            return <Badge variant="outline" className="bg-orange-100 text-orange-800">Repair</Badge>;
        case 'warranty':
            return <Badge variant="outline" className="bg-green-100 text-green-800">Warranty</Badge>;
        case 'inspection':
            return <Badge variant="outline" className="bg-purple-100 text-purple-800">Inspection</Badge>;
        case 'diagnostic':
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Diagnostic</Badge>;
        default:
            return <Badge variant="secondary">{category}</Badge>;
    }
};

const getStatusBadge = (status: string, isAvailable: boolean) => {
    const active = status === 'active' && isAvailable;

    return active ? (
        <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
        </Badge>
    ) : (
        <Badge variant="outline" className="bg-gray-100 text-gray-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Inactive
        </Badge>
    );
};

const getIntervalDisplay = (type: string, value?: number | null) => {
    if (type === 'on_demand') return 'On Demand';
    if (type === 'mileage' && value) return `Every ${value.toLocaleString()} km`;
    if (type === 'time' && value) return `Every ${value} months`;
    return 'Not Set';
};

const formatCurrency = (value: number | string | undefined) => {
    const numericValue = Number(value ?? 0);
    return `₱${numericValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export default function ServiceTypeView({ serviceType, performance, can }: Props) {
    const pageBreadcrumbs = [
        ...breadcrumbs,
        {
            title: serviceType.name,
            href: `/service/service-types/${serviceType.id}`,
        },
    ];

    const commonServices = serviceType.common_services ?? [];
    const totalCommonServicesCost = commonServices.reduce((sum, item) => sum + Number(item.standard_price ?? 0), 0);
    const recentWorkOrders = serviceType.recent_work_orders ?? [];

    return (
        <AppLayout breadcrumbs={pageBreadcrumbs}>
            <Head title={`Service Type: ${serviceType.name}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/service-types">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Service Types
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Settings className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">{serviceType.name}</h1>
                            {getStatusBadge(serviceType.status, serviceType.is_available)}
                            {getCategoryBadge(serviceType.category)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {can.edit && (
                            <Link href={`/service/service-types/${serviceType.id}/edit`}>
                                <Button size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Service Type
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Work Orders</h3>
                                <div className="text-2xl font-bold">{performance.work_orders_count ?? 0}</div>
                                <p className="text-sm text-muted-foreground">Total work orders created</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Completed Jobs</h3>
                                <div className="text-2xl font-bold">{performance.completed_count ?? 0}</div>
                                <p className="text-sm text-muted-foreground">Successfully completed work</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Total Duration</h3>
                                <div className="text-2xl font-bold">
                                    {Number(performance.total_duration ?? 0).toFixed(2)} h
                                </div>
                                <p className="text-sm text-muted-foreground">Base + common services duration</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Estimated Revenue</h3>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(performance.total_price ?? 0)}
                                </div>
                                <p className="text-sm text-muted-foreground">Base + linked services pricing</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Type Details</CardTitle>
                                <CardDescription>Core information and branch context</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Service Code</p>
                                        <p className="font-medium font-mono">{serviceType.code}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Branch</p>
                                        <p className="font-medium">
                                            {serviceType.branch?.name ?? 'Assigned Branch'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Created By</p>
                                        <p className="font-medium">{serviceType.creator?.name ?? '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Last Updated By</p>
                                        <p className="font-medium">{serviceType.updater?.name ?? '—'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Description</p>
                                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                                        {serviceType.description || 'No description provided.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Intervals & Pricing</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs uppercase text-muted-foreground">Interval Type</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {serviceType.interval_type === 'mileage' && <Gauge className="h-4 w-4" />}
                                                {serviceType.interval_type === 'time' && <Calendar className="h-4 w-4" />}
                                                <p className="font-medium">
                                                    {getIntervalDisplay(serviceType.interval_type, serviceType.interval_value ?? null)}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase text-muted-foreground">Estimated Duration</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Clock className="h-4 w-4" />
                                                <p className="font-medium">
                                                    {serviceType.formatted_estimated_duration ??
                                                        `${Number(serviceType.estimated_duration ?? 0).toFixed(2)} hours`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs uppercase text-muted-foreground">Base Price</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <DollarSign className="h-4 w-4" />
                                                <p className="font-medium">
                                                    {serviceType.formatted_base_price ??
                                                        (Number(serviceType.base_price ?? 0) > 0
                                                            ? formatCurrency(serviceType.base_price ?? 0)
                                                            : 'Free')}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase text-muted-foreground">Common Services Total</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <TrendingUp className="h-4 w-4" />
                                                <p className="font-medium">
                                                    {formatCurrency(totalCommonServicesCost)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Associated Common Services</CardTitle>
                                <CardDescription>Reusable tasks included in this service type</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {commonServices.length > 0 ? (
                                    commonServices.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between border rounded-lg p-3">
                                            <div>
                                                <p className="font-medium">{service.name}</p>
                                                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                                                    <Wrench className="h-3 w-3" />
                                                    <span>Sequence #{service.pivot?.sequence ?? 0}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Standard Price</p>
                                                <p className="font-medium">
                                                    {formatCurrency(service.standard_price ?? 0)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No common services are linked to this service type yet.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Recent Work Orders</span>
                                </CardTitle>
                                <CardDescription>Snapshot of the latest work activity for this service type</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentWorkOrders.length > 0 ? (
                                    recentWorkOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between border rounded-lg p-3">
                                            <div>
                                                <p className="font-medium">{order.work_order_number}</p>
                                                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                                                    <Users className="h-3 w-3" />
                                                    <span>{order.customer_name ?? 'Customer'}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        order.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : order.status === 'in_progress'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                    }
                                                >
                                                    {order.status.replace('_', ' ')}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No work orders have been recorded for this service type yet.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Service Type Info</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Service ID</span>
                                    <span className="text-sm font-medium">#{serviceType.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="text-sm font-medium">
                                        {new Date(serviceType.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Last Updated</span>
                                    <span className="text-sm font-medium">
                                        {new Date(serviceType.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span className="text-sm font-medium capitalize">{serviceType.status}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Availability</span>
                                    <span className="text-sm font-medium">
                                        {serviceType.is_available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <ClipboardList className="h-5 w-5" />
                                    <span>Operational Metrics</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Completion Rate</span>
                                    <span className="font-medium">
                                        {performance.completion_rate !== undefined && performance.completion_rate !== null
                                            ? `${performance.completion_rate}%`
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">On-time Completion</span>
                                    <span className="font-medium">
                                        {performance.on_time_rate !== undefined && performance.on_time_rate !== null
                                            ? `${performance.on_time_rate}%`
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Average Revenue</span>
                                    <span className="font-medium">
                                        {performance.average_revenue !== undefined && performance.average_revenue !== null
                                            ? formatCurrency(performance.average_revenue)
                                            : 'N/A'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5" />
                                    <span>Assignments & Usage</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Linked Common Services</span>
                                    <span className="font-medium">{commonServices.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Work Orders Created</span>
                                    <span className="font-medium">{performance.work_orders_count ?? 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Completed Orders</span>
                                    <span className="font-medium">{performance.completed_count ?? 0}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

