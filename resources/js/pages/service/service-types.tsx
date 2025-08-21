import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Search, Filter, Download, Plus, Eye, Edit, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

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

export default function ServiceTypes() {
    // Mock data for demonstration
    const mockServiceTypes = [
        {
            id: 1,
            name: 'Preventive Maintenance Service (PMS)',
            code: 'PMS',
            description: 'Regular maintenance service based on mileage intervals to prevent breakdowns and ensure optimal vehicle performance.',
            category: 'maintenance',
            interval_type: 'mileage',
            interval_value: 5000,
            estimated_duration: 2.5,
            base_price: 2500.00,
            is_active: true,
            created_at: '2025-01-10 09:00:00',
            work_orders_count: 15,
            common_services: ['Oil Change', 'Filter Replacement', 'Brake Inspection']
        },
        {
            id: 2,
            name: 'General Repair Service',
            code: 'REPAIR',
            description: 'Diagnostic and repair services for vehicle issues and component failures.',
            category: 'repair',
            interval_type: 'on_demand',
            interval_value: null,
            estimated_duration: 4.0,
            base_price: 1500.00,
            is_active: true,
            created_at: '2025-01-08 14:30:00',
            work_orders_count: 8,
            common_services: ['Engine Diagnostic', 'Brake Repair', 'Electrical Repair']
        },
        {
            id: 3,
            name: 'Warranty Service',
            code: 'WARRANTY',
            description: 'Services covered under manufacturer or extended warranty programs.',
            category: 'warranty',
            interval_type: 'on_demand',
            interval_value: null,
            estimated_duration: 3.0,
            base_price: 0.00,
            is_active: true,
            created_at: '2025-01-05 11:15:00',
            work_orders_count: 3,
            common_services: ['Warranty Inspection', 'Component Replacement', 'Software Update']
        },
        {
            id: 4,
            name: 'Vehicle Inspection',
            code: 'INSPECTION',
            description: 'Comprehensive vehicle safety and emissions inspection for regulatory compliance.',
            category: 'inspection',
            interval_type: 'time',
            interval_value: 12,
            estimated_duration: 1.5,
            base_price: 800.00,
            is_active: true,
            created_at: '2025-01-03 16:45:00',
            work_orders_count: 12,
            common_services: ['Safety Check', 'Emissions Test', 'Documentation Review']
        },
        {
            id: 5,
            name: 'Diagnostic Service',
            code: 'DIAGNOSTIC',
            description: 'Computer diagnostic and troubleshooting for vehicle electronic systems.',
            category: 'diagnostic',
            interval_type: 'on_demand',
            interval_value: null,
            estimated_duration: 1.0,
            base_price: 1200.00,
            is_active: false,
            created_at: '2024-12-28 10:20:00',
            work_orders_count: 2,
            common_services: ['OBD Scan', 'System Analysis', 'Error Code Reading']
        }
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

    const getIntervalDisplay = (type: string, value: number | null) => {
        if (type === 'on_demand') return 'On Demand';
        if (type === 'mileage' && value) return `${value.toLocaleString()} km`;
        if (type === 'time' && value) return `${value} months`;
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

    // Calculate stats
    const totalServiceTypes = mockServiceTypes.length;
    const activeServiceTypes = mockServiceTypes.filter(st => st.is_active).length;
    const totalWorkOrders = mockServiceTypes.reduce((sum, st) => sum + st.work_orders_count, 0);
    const avgDuration = mockServiceTypes.reduce((sum, st) => sum + st.estimated_duration, 0) / totalServiceTypes;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Types" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Settings className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Service Types</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export List
                        </Button>
                        <Link href="/service/service-types/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Service Type
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Service Types</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalServiceTypes}</div>
                            <p className="text-xs text-muted-foreground">{activeServiceTypes} active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeServiceTypes}</div>
                            <p className="text-xs text-muted-foreground">Currently available</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalWorkOrders}</div>
                            <p className="text-xs text-muted-foreground">Across all service types</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgDuration.toFixed(1)}h</div>
                            <p className="text-xs text-muted-foreground">Estimated completion time</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage service types, categories, intervals, and pricing</CardDescription>
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
                                    <SelectItem value="warranty">Warranty</SelectItem>
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
                                    <SelectValue placeholder="Interval Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Intervals</SelectItem>
                                    <SelectItem value="mileage">Mileage Based</SelectItem>
                                    <SelectItem value="time">Time Based</SelectItem>
                                    <SelectItem value="on_demand">On Demand</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Service Types Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Service Types</CardTitle>
                        <CardDescription>Manage service categories, intervals, pricing, and associated common services</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service Type</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Interval</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Base Price</TableHead>
                                    <TableHead>Work Orders</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockServiceTypes.map((serviceType) => (
                                    <TableRow key={serviceType.id} className={!serviceType.is_active ? 'opacity-60' : ''}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{serviceType.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Code: {serviceType.code}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                                    {serviceType.description}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getCategoryBadge(serviceType.category)}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {getIntervalDisplay(serviceType.interval_type, serviceType.interval_value)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-sm">{serviceType.estimated_duration}h</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {serviceType.base_price > 0 ? `₱${serviceType.base_price.toLocaleString()}` : 'Free'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                {serviceType.work_orders_count} orders
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(serviceType.is_active)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Link href={`/service/service-types/${serviceType.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/service/service-types/${serviceType.id}/edit`}>
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
                            <CardDescription>Distribution of service types by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Maintenance Services</span>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">1 type</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Repair Services</span>
                                    <Badge variant="outline" className="bg-orange-100 text-orange-800">1 type</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Warranty Services</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">1 type</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Inspection Services</span>
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800">1 type</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Diagnostic Services</span>
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">1 type</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Service Intervals</CardTitle>
                            <CardDescription>Service scheduling and interval configuration</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Mileage-Based Services</span>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">1 service</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Time-Based Services</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">1 service</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">On-Demand Services</span>
                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">3 services</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Average Interval</span>
                                    <span className="text-sm font-medium">5,000 km / 12 months</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
