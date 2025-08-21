import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Search, Filter, Download, Plus, Eye, Edit, Clock, DollarSign, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'Common Services',
        href: '/service/common-services',
    },
];

export default function CommonServices() {
    // Mock data for demonstration
    const mockCommonServices = [
        {
            id: 1,
            name: 'Oil Change',
            code: 'OIL_CHANGE',
            description: 'Engine oil and filter replacement service',
            category: 'maintenance',
            estimated_duration: 0.5,
            standard_price: 800.00,
            parts_required: ['Engine Oil', 'Oil Filter'],
            is_active: true,
            created_at: '2025-01-10 09:00:00',
            usage_count: 45,
            avg_actual_duration: 0.4,
            total_revenue: 36000.00,
            service_types: ['PMS', 'Maintenance']
        },
        {
            id: 2,
            name: 'Filter Replacement',
            code: 'FILTER_REPL',
            description: 'Air filter, cabin filter, and fuel filter replacement',
            category: 'maintenance',
            estimated_duration: 0.75,
            standard_price: 1200.00,
            parts_required: ['Air Filter', 'Cabin Filter', 'Fuel Filter'],
            is_active: true,
            created_at: '2025-01-08 14:30:00',
            usage_count: 38,
            avg_actual_duration: 0.7,
            total_revenue: 45600.00,
            service_types: ['PMS', 'Maintenance']
        },
        {
            id: 3,
            name: 'Brake Inspection',
            code: 'BRAKE_INSP',
            description: 'Comprehensive brake system inspection and testing',
            category: 'inspection',
            estimated_duration: 1.0,
            standard_price: 500.00,
            parts_required: [],
            is_active: true,
            created_at: '2025-01-05 11:15:00',
            usage_count: 32,
            avg_actual_duration: 0.9,
            total_revenue: 16000.00,
            service_types: ['PMS', 'Inspection', 'Repair']
        },
        {
            id: 4,
            name: 'Battery Check',
            code: 'BATTERY_CHK',
            description: 'Battery voltage, load test, and terminal cleaning',
            category: 'diagnostic',
            estimated_duration: 0.25,
            standard_price: 300.00,
            parts_required: ['Battery Terminal Cleaner'],
            is_active: true,
            created_at: '2025-01-03 16:45:00',
            usage_count: 28,
            avg_actual_duration: 0.3,
            total_revenue: 8400.00,
            service_types: ['PMS', 'Diagnostic']
        },
        {
            id: 5,
            name: 'Tire Rotation',
            code: 'TIRE_ROT',
            description: 'Tire rotation and pressure adjustment',
            category: 'maintenance',
            estimated_duration: 0.5,
            standard_price: 400.00,
            parts_required: [],
            is_active: true,
            created_at: '2024-12-28 10:20:00',
            usage_count: 22,
            avg_actual_duration: 0.45,
            total_revenue: 8800.00,
            service_types: ['PMS', 'Maintenance']
        },
        {
            id: 6,
            name: 'Engine Diagnostic',
            code: 'ENG_DIAG',
            description: 'Computer diagnostic scan and error code analysis',
            category: 'diagnostic',
            estimated_duration: 1.5,
            standard_price: 1500.00,
            parts_required: [],
            is_active: true,
            created_at: '2024-12-25 09:30:00',
            usage_count: 15,
            avg_actual_duration: 1.3,
            total_revenue: 22500.00,
            service_types: ['Repair', 'Diagnostic']
        },
        {
            id: 7,
            name: 'Spark Plug Replacement',
            code: 'SPARK_REPL',
            description: 'Spark plug inspection and replacement',
            category: 'maintenance',
            estimated_duration: 1.0,
            standard_price: 1000.00,
            parts_required: ['Spark Plugs'],
            is_active: false,
            created_at: '2024-12-20 15:15:00',
            usage_count: 8,
            avg_actual_duration: 1.1,
            total_revenue: 8000.00,
            service_types: ['PMS', 'Maintenance']
        }
    ];

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

    const getEfficiencyBadge = (estimated: number, actual: number) => {
        const efficiency = (estimated / actual) * 100;
        if (efficiency >= 90) {
            return <Badge variant="outline" className="bg-green-100 text-green-800">Efficient</Badge>;
        } else if (efficiency >= 75) {
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Moderate</Badge>;
        } else {
            return <Badge variant="outline" className="bg-red-100 text-red-800">Needs Review</Badge>;
        }
    };

    // Calculate stats
    const totalServices = mockCommonServices.length;
    const activeServices = mockCommonServices.filter(s => s.is_active).length;
    const totalUsage = mockCommonServices.reduce((sum, s) => sum + s.usage_count, 0);
    const totalRevenue = mockCommonServices.reduce((sum, s) => sum + s.total_revenue, 0);
    const avgPrice = mockCommonServices.reduce((sum, s) => sum + s.standard_price, 0) / totalServices;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Common Services" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Wrench className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Common Services</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export List
                        </Button>
                        <Link href="/service/common-services/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Common Service
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalServices}</div>
                            <p className="text-xs text-muted-foreground">{activeServices} active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsage}</div>
                            <p className="text-xs text-muted-foreground">Times performed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Generated revenue</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{avgPrice.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Per service</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage individual service items, pricing, duration, and parts requirements</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by name, code, or description..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="repair">Repair</SelectItem>
                                    <SelectItem value="inspection">Inspection</SelectItem>
                                    <SelectItem value="diagnostic">Diagnostic</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Usage" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Usage</SelectItem>
                                    <SelectItem value="high">High Usage (30+)</SelectItem>
                                    <SelectItem value="medium">Medium Usage (15-29)</SelectItem>
                                    <SelectItem value="low">Low Usage (&lt;15)</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Common Services Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Common Services</CardTitle>
                        <CardDescription>Individual service items with pricing, duration estimates, and usage statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Efficiency</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockCommonServices.map((service) => (
                                    <TableRow key={service.id} className={!service.is_active ? 'opacity-60' : ''}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{service.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Code: {service.code}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                                    {service.description}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getCategoryBadge(service.category)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-sm">{service.estimated_duration}h</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Avg: {service.avg_actual_duration}h
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <DollarSign className="h-3 w-3" />
                                                <span className="font-medium">₱{service.standard_price.toLocaleString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                {service.usage_count} times
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getEfficiencyBadge(service.estimated_duration, service.avg_actual_duration)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span className="font-medium">₱{service.total_revenue.toLocaleString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(service.is_active)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Link href={`/service/common-services/${service.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/service/common-services/${service.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Categories</CardTitle>
                            <CardDescription>Distribution of common services by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Maintenance Services</span>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">4 services</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Diagnostic Services</span>
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">2 services</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Inspection Services</span>
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800">1 service</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Most Used Category</span>
                                    <span className="text-sm font-medium">Maintenance</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>Service efficiency and revenue analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Top Revenue Service</span>
                                    <span className="text-sm font-medium">Filter Replacement</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Most Used Service</span>
                                    <span className="text-sm font-medium">Oil Change</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Avg Efficiency</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">92%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Revenue per Service</span>
                                    <span className="text-sm font-medium">₱{(totalRevenue / totalUsage).toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
