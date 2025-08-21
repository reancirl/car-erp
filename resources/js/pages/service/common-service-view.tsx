import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    Wrench, 
    Edit, 
    Clock,
    DollarSign,
    Package,
    CheckCircle,
    AlertCircle,
    FileText,
    Activity,
    TrendingUp,
    Users,
    BarChart3
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface CommonServiceViewProps {
    serviceId: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'Common Services',
        href: '/service/common-services',
    },
    {
        title: 'View Common Service',
        href: '/service/common-services/view',
    },
];

export default function CommonServiceView({ serviceId }: CommonServiceViewProps) {
    // Mock common service data
    const mockService = {
        id: parseInt(serviceId) || 1,
        name: 'Oil Change',
        code: 'OIL_CHANGE',
        description: 'Engine oil and filter replacement service including oil drain, filter replacement, and new oil filling with quality check.',
        category: 'maintenance',
        estimated_duration: 0.5,
        standard_price: 800.00,
        is_active: true,
        created_at: '2025-01-10 09:00:00',
        updated_at: '2025-01-15 14:30:00',
        created_by: 'Admin User',
        usage_count: 45,
        total_revenue: 36000.00,
        avg_actual_duration: 0.4,
        avg_actual_price: 850.00,
        customer_satisfaction: 4.9,
        parts_required: [
            { name: 'Engine Oil', required: true, avg_cost: 400 },
            { name: 'Oil Filter', required: true, avg_cost: 150 },
            { name: 'Drain Plug Gasket', required: false, avg_cost: 50 }
        ],
        service_types: [
            { name: 'PMS - 5K Service', usage_count: 20 },
            { name: 'PMS - 10K Service', usage_count: 15 },
            { name: 'PMS - 15K Service', usage_count: 10 }
        ],
        recent_usage: [
            { id: 1, work_order: 'WO-2025-001', customer: 'Maria Santos', date: '2025-01-15', duration: 0.4, price: 800 },
            { id: 2, work_order: 'WO-2025-005', customer: 'John Smith', date: '2025-01-14', duration: 0.5, price: 850 },
            { id: 3, work_order: 'WO-2025-008', customer: 'Sarah Davis', date: '2025-01-13', duration: 0.3, price: 800 }
        ],
        monthly_stats: [
            { month: 'Jan 2025', usage: 15, revenue: 12750 },
            { month: 'Dec 2024', usage: 12, revenue: 10200 },
            { month: 'Nov 2024', usage: 18, revenue: 15300 }
        ]
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'maintenance':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Maintenance</Badge>;
            case 'repair':
                return <Badge variant="outline" className="bg-orange-100 text-orange-800">Repair</Badge>;
            case 'inspection':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800">Inspection</Badge>;
            case 'diagnostic':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Diagnostic</Badge>;
            default:
                return <Badge variant="secondary">{category}</Badge>;
        }
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

    const requiredParts = mockService.parts_required.filter(p => p.required);
    const optionalParts = mockService.parts_required.filter(p => !p.required);
    const totalPartsCost = requiredParts.reduce((sum, p) => sum + p.avg_cost, 0);
    const efficiency = (mockService.estimated_duration / mockService.avg_actual_duration) * 100;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Common Service: ${mockService.name}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/common-services">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Common Services
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Wrench className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">{mockService.name}</h1>
                            {getStatusBadge(mockService.is_active)}
                            {getCategoryBadge(mockService.category)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Export Details
                        </Button>
                        <Link href={`/service/common-services/${mockService.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Service
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Performance Summary */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Usage Count</h3>
                                <div className="text-2xl font-bold">{mockService.usage_count}</div>
                                <p className="text-sm text-muted-foreground">Times performed</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Total Revenue</h3>
                                <div className="text-2xl font-bold">₱{mockService.total_revenue.toLocaleString()}</div>
                                <p className="text-sm text-muted-foreground">Generated revenue</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Efficiency</h3>
                                <div className="text-2xl font-bold">{efficiency.toFixed(0)}%</div>
                                <p className="text-sm text-muted-foreground">{mockService.avg_actual_duration}h avg vs {mockService.estimated_duration}h est</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Satisfaction</h3>
                                <div className="text-2xl font-bold">{mockService.customer_satisfaction}/5</div>
                                <p className="text-sm text-muted-foreground">Customer rating</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Service Name</span>
                                            <p className="font-medium">{mockService.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Service Code</span>
                                            <p className="font-medium font-mono">{mockService.code}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Description</span>
                                        <p className="font-medium">{mockService.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Category</span>
                                            <div className="mt-1">{getCategoryBadge(mockService.category)}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Status</span>
                                            <div className="mt-1">{getStatusBadge(mockService.is_active)}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Duration & Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5" />
                                    <span>Duration & Pricing</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Estimated Duration</span>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Clock className="h-4 w-4" />
                                                <p className="font-medium">{mockService.estimated_duration} hours</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Average Actual Duration</span>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Clock className="h-4 w-4" />
                                                <p className="font-medium">{mockService.avg_actual_duration} hours</p>
                                                <Badge variant="outline" className={
                                                    efficiency >= 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }>
                                                    {efficiency.toFixed(0)}% efficient
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Standard Price</span>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <DollarSign className="h-4 w-4" />
                                                <p className="font-medium">₱{mockService.standard_price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Average Actual Price</span>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <TrendingUp className="h-4 w-4" />
                                                <p className="font-medium">₱{mockService.avg_actual_price.toLocaleString()}</p>
                                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                    +₱{(mockService.avg_actual_price - mockService.standard_price).toLocaleString()}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parts Required */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Package className="h-5 w-5" />
                                    <span>Parts Required</span>
                                </CardTitle>
                                <CardDescription>Parts typically needed for this service</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {requiredParts.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-sm mb-3">Required Parts</h4>
                                            <div className="space-y-2">
                                                {requiredParts.map((part, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                                                        <div className="flex items-center space-x-3">
                                                            <CheckCircle className="h-4 w-4 text-red-600" />
                                                            <span className="font-medium">{part.name}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-medium">₱{part.avg_cost.toLocaleString()}</span>
                                                            <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
                                                                Required
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {optionalParts.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-sm mb-3">Optional Parts</h4>
                                            <div className="space-y-2">
                                                {optionalParts.map((part, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                                                            <span className="text-gray-600">{part.name}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-medium">₱{part.avg_cost.toLocaleString()}</span>
                                                            <Badge variant="outline" className="ml-2">
                                                                Optional
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Separator />
                                    <div className="flex justify-between items-center font-medium">
                                        <span>Required Parts Cost:</span>
                                        <span>₱{totalPartsCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-medium text-lg">
                                        <span>Total Service Cost:</span>
                                        <span>₱{(mockService.standard_price + totalPartsCost).toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Types Usage */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Types Usage</CardTitle>
                                <CardDescription>Service types that include this common service</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockService.service_types.map((serviceType, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{serviceType.name}</p>
                                                <p className="text-sm text-muted-foreground">Used {serviceType.usage_count} times</p>
                                            </div>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                {serviceType.usage_count} uses
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Usage */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Recent Usage</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockService.recent_usage.map((usage) => (
                                        <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{usage.work_order}</p>
                                                <p className="text-sm text-muted-foreground">{usage.customer}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">₱{usage.price.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">{usage.duration}h • {usage.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-3">
                                    View All Usage History
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Service Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Service Info</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Service ID</span>
                                    <span className="text-sm font-medium">#{mockService.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="text-sm font-medium">{mockService.created_at.split(' ')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Last Updated</span>
                                    <span className="text-sm font-medium">{mockService.updated_at.split(' ')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Created By</span>
                                    <span className="text-sm font-medium">{mockService.created_by}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Usage</span>
                                    <span className="text-sm font-medium">{mockService.usage_count} times</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="h-5 w-5" />
                                    <span>Performance</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Revenue per Use</span>
                                    <span className="text-sm font-medium">₱{(mockService.total_revenue / mockService.usage_count).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Time Efficiency</span>
                                    <span className="text-sm font-medium">{efficiency.toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Price Variance</span>
                                    <span className="text-sm font-medium">+{(((mockService.avg_actual_price / mockService.standard_price) - 1) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Customer Rating</span>
                                    <span className="text-sm font-medium">{mockService.customer_satisfaction}/5</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monthly Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {mockService.monthly_stats.map((stat, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">{stat.month}</span>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">₱{stat.revenue.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{stat.usage} uses</p>
                                        </div>
                                    </div>
                                ))}
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
                                    View Usage History
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Performance Report
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                    <Wrench className="h-4 w-4 mr-2" />
                                    Duplicate Service
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
