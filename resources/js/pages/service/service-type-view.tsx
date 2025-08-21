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
    FileText,
    Activity,
    Users,
    TrendingUp
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface ServiceTypeViewProps {
    serviceTypeId: string;
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
    {
        title: 'View Service Type',
        href: '/service/service-types/view',
    },
];

export default function ServiceTypeView({ serviceTypeId }: ServiceTypeViewProps) {
    // Mock service type data
    const mockServiceType = {
        id: parseInt(serviceTypeId) || 1,
        name: 'Preventive Maintenance Service (PMS)',
        code: 'PMS',
        description: 'Regular maintenance service based on mileage intervals to prevent breakdowns and ensure optimal vehicle performance. Includes comprehensive inspection, fluid checks, and component replacements.',
        category: 'maintenance',
        interval_type: 'mileage',
        interval_value: 5000,
        estimated_duration: 2.5,
        base_price: 2500.00,
        is_active: true,
        created_at: '2025-01-10 09:00:00',
        updated_at: '2025-01-15 14:30:00',
        created_by: 'Admin User',
        work_orders_count: 15,
        total_revenue: 37500.00,
        avg_completion_time: 2.3,
        customer_satisfaction: 4.8,
        common_services: [
            { name: 'Oil Change', included: true, avg_cost: 800 },
            { name: 'Filter Replacement', included: true, avg_cost: 1200 },
            { name: 'Brake Inspection', included: true, avg_cost: 500 },
            { name: 'Battery Check', included: true, avg_cost: 300 },
            { name: 'Tire Rotation', included: false, avg_cost: 400 },
            { name: 'Fluid Top-up', included: true, avg_cost: 200 }
        ],
        recent_work_orders: [
            { id: 1, work_order_number: 'WO-2025-001', customer: 'Maria Santos', status: 'completed', date: '2025-01-15' },
            { id: 2, work_order_number: 'WO-2025-005', customer: 'John Smith', status: 'in_progress', date: '2025-01-16' },
            { id: 3, work_order_number: 'WO-2025-008', customer: 'Sarah Davis', status: 'scheduled', date: '2025-01-18' }
        ]
    };

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

    const getIntervalDisplay = (type: string, value: number | null) => {
        if (type === 'on_demand') return 'On Demand';
        if (type === 'mileage' && value) return `Every ${value.toLocaleString()} km`;
        if (type === 'time' && value) return `Every ${value} months`;
        return 'Not Set';
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Inactive
            </Badge>
        );
    };

    const includedServices = mockServiceType.common_services.filter(s => s.included);
    const totalServiceCost = includedServices.reduce((sum, s) => sum + s.avg_cost, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Service Type: ${mockServiceType.name}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
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
                            <h1 className="text-2xl font-bold">{mockServiceType.name}</h1>
                            {getStatusBadge(mockServiceType.is_active)}
                            {getCategoryBadge(mockServiceType.category)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Export Details
                        </Button>
                        <Link href={`/service/service-types/${mockServiceType.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Service Type
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Performance Summary */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Work Orders</h3>
                                <div className="text-2xl font-bold">{mockServiceType.work_orders_count}</div>
                                <p className="text-sm text-muted-foreground">Total completed</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Revenue</h3>
                                <div className="text-2xl font-bold">₱{mockServiceType.total_revenue.toLocaleString()}</div>
                                <p className="text-sm text-muted-foreground">Total generated</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Avg Duration</h3>
                                <div className="text-2xl font-bold">{mockServiceType.avg_completion_time}h</div>
                                <p className="text-sm text-muted-foreground">vs {mockServiceType.estimated_duration}h estimated</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Satisfaction</h3>
                                <div className="text-2xl font-bold">{mockServiceType.customer_satisfaction}/5</div>
                                <p className="text-sm text-muted-foreground">Customer rating</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Type Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Service Name</span>
                                            <p className="font-medium">{mockServiceType.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Service Code</span>
                                            <p className="font-medium font-mono">{mockServiceType.code}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Description</span>
                                        <p className="font-medium">{mockServiceType.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Category</span>
                                            <div className="mt-1">{getCategoryBadge(mockServiceType.category)}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Status</span>
                                            <div className="mt-1">{getStatusBadge(mockServiceType.is_active)}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Intervals & Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Intervals & Pricing</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Service Interval</span>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {mockServiceType.interval_type === 'mileage' && <Gauge className="h-4 w-4" />}
                                                {mockServiceType.interval_type === 'time' && <Calendar className="h-4 w-4" />}
                                                <p className="font-medium">
                                                    {getIntervalDisplay(mockServiceType.interval_type, mockServiceType.interval_value)}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Estimated Duration</span>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Clock className="h-4 w-4" />
                                                <p className="font-medium">{mockServiceType.estimated_duration} hours</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Base Price</span>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <DollarSign className="h-4 w-4" />
                                                <p className="font-medium">
                                                    {mockServiceType.base_price > 0 ? `₱${mockServiceType.base_price.toLocaleString()}` : 'Free'}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Avg Service Cost</span>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <TrendingUp className="h-4 w-4" />
                                                <p className="font-medium">₱{totalServiceCost.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Common Services */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Associated Common Services</CardTitle>
                                <CardDescription>Services typically included in this service type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockServiceType.common_services.map((service, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                {service.included ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                                                )}
                                                <span className={service.included ? 'font-medium' : 'text-gray-500'}>
                                                    {service.name}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-medium">₱{service.avg_cost.toLocaleString()}</span>
                                                {service.included && (
                                                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                                                        Included
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Separator className="my-4" />
                                <div className="flex justify-between items-center font-medium">
                                    <span>Total Included Services Cost:</span>
                                    <span>₱{totalServiceCost.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Work Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Recent Work Orders</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockServiceType.recent_work_orders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{order.work_order_number}</p>
                                                <p className="text-sm text-muted-foreground">{order.customer}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className={
                                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }>
                                                    {order.status.replace('_', ' ')}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-3">
                                    View All Work Orders
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Service Type Info */}
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
                                    <span className="text-sm font-medium">#{mockServiceType.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="text-sm font-medium">{mockServiceType.created_at.split(' ')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Last Updated</span>
                                    <span className="text-sm font-medium">{mockServiceType.updated_at.split(' ')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Created By</span>
                                    <span className="text-sm font-medium">{mockServiceType.created_by}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Work Orders</span>
                                    <span className="text-sm font-medium">{mockServiceType.work_orders_count}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5" />
                                    <span>Performance</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                                    <span className="text-sm font-medium">95%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">On-Time Rate</span>
                                    <span className="text-sm font-medium">88%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Avg Revenue</span>
                                    <span className="text-sm font-medium">₱{(mockServiceType.total_revenue / mockServiceType.work_orders_count).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Efficiency</span>
                                    <span className="text-sm font-medium">
                                        {((mockServiceType.estimated_duration / mockServiceType.avg_completion_time) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full">
                                    <Users className="h-4 w-4 mr-2" />
                                    View Work Orders
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Performance Report
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Duplicate Service Type
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
