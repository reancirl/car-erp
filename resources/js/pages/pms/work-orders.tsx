import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Search, Filter, Download, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock, Camera, MapPin, User, Calendar, PlayCircle, PauseCircle, XCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'PMS',
        href: '/pms',
    },
    {
        title: 'Work Orders',
        href: '/pms/work-orders',
    },
];

export default function WorkOrders() {
    // Mock data for demonstration
    const mockWorkOrders = [
        {
            id: 1,
            work_order_number: 'WO-2025-001',
            vehicle: {
                plate_number: 'ABC-1234',
                make: 'Toyota',
                model: 'Vios',
                year: 2023,
                vin: 'JH4KA8260MC123456'
            },
            customer: {
                name: 'Maria Santos',
                phone: '+63-917-123-4567',
                type: 'individual'
            },
            service_type: 'PMS - 15K Service',
            current_mileage: 15000,
            last_service_km: 5000,
            due_date: '2025-01-20',
            assigned_technician: 'Carlos Mendoza',
            status: 'in_progress',
            priority: 'high',
            created_at: '2025-01-15 09:30:00',
            estimated_hours: 3.5,
            actual_hours: 2.0,
            estimated_cost: 4500.00,
            actual_cost: 3200.00,
            completion_percentage: 65,
            photos_uploaded: true,
            checklist_completed: false
        },
        {
            id: 2,
            work_order_number: 'WO-2025-002',
            vehicle: {
                plate_number: 'XYZ-5678',
                make: 'Honda',
                model: 'Civic',
                year: 2022,
                vin: 'WVWZZZ1JZ3W123789'
            },
            customer: {
                name: 'John Smith',
                phone: '+63-917-987-6543',
                type: 'corporate'
            },
            service_type: 'PMS - 20K Service',
            current_mileage: 25000,
            last_service_km: 10000,
            due_date: '2025-01-18',
            assigned_technician: 'Maria Rodriguez',
            status: 'overdue',
            priority: 'urgent',
            created_at: '2025-01-10 08:15:00',
            estimated_hours: 4.0,
            actual_hours: null,
            estimated_cost: 6500.00,
            actual_cost: null,
            completion_percentage: 0,
            photos_uploaded: false,
            checklist_completed: false
        },
        {
            id: 3,
            work_order_number: 'WO-2025-003',
            vehicle: {
                plate_number: 'DEF-9012',
                make: 'Mitsubishi',
                model: 'Mirage',
                year: 2021,
                vin: 'KMHD84LF5EU456123'
            },
            customer: {
                name: 'Sarah Davis',
                phone: '+63-917-555-0123',
                type: 'individual'
            },
            service_type: 'PMS - 10K Service',
            current_mileage: 12000,
            last_service_km: 2000,
            due_date: '2025-01-25',
            assigned_technician: 'Juan Santos',
            status: 'scheduled',
            priority: 'normal',
            created_at: '2025-01-12 14:20:00',
            estimated_hours: 2.5,
            actual_hours: null,
            estimated_cost: 3500.00,
            actual_cost: null,
            completion_percentage: 0,
            photos_uploaded: false,
            checklist_completed: false
        },
        {
            id: 4,
            work_order_number: 'WO-2025-004',
            vehicle: {
                plate_number: 'GHI-3456',
                make: 'Hyundai',
                model: 'Accent',
                year: 2020,
                vin: 'JF1VA1C60M9876543'
            },
            customer: {
                name: 'Robert Chen',
                phone: '+63-917-444-5678',
                type: 'individual'
            },
            service_type: 'PMS - 30K Service',
            current_mileage: 35000,
            last_service_km: 20000,
            due_date: '2025-01-12',
            assigned_technician: 'Ana Reyes',
            status: 'completed',
            priority: 'normal',
            created_at: '2025-01-08 11:45:00',
            estimated_hours: 5.0,
            actual_hours: 4.8,
            estimated_cost: 8500.00,
            actual_cost: 8200.00,
            completion_percentage: 100,
            photos_uploaded: true,
            checklist_completed: true
        },
        {
            id: 5,
            work_order_number: 'WO-2025-005',
            vehicle: {
                plate_number: 'JKL-7890',
                make: 'Nissan',
                model: 'Almera',
                year: 2023,
                vin: 'LNBPG2JA5FJ123456'
            },
            customer: {
                name: 'Emily Johnson',
                phone: '+63-917-333-4567',
                type: 'corporate'
            },
            service_type: 'PMS - 5K Service',
            current_mileage: 6500,
            last_service_km: 0,
            due_date: '2025-02-01',
            assigned_technician: 'Roberto Cruz',
            status: 'pending',
            priority: 'low',
            created_at: '2025-01-14 16:30:00',
            estimated_hours: 2.0,
            actual_hours: null,
            estimated_cost: 2500.00,
            actual_cost: null,
            completion_percentage: 0,
            photos_uploaded: false,
            checklist_completed: false
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'scheduled':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Calendar className="h-3 w-3 mr-1" />
                        Scheduled
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                        <PlayCircle className="h-3 w-3 mr-1" />
                        In Progress
                    </Badge>
                );
            case 'on_hold':
                return (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                        <PauseCircle className="h-3 w-3 mr-1" />
                        On Hold
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'overdue':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <Badge variant="destructive">Urgent</Badge>;
            case 'high':
                return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
            case 'normal':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Normal</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const isOverdue = (dueDate: string) => {
        const due = new Date(dueDate);
        const now = new Date();
        return due < now;
    };

    // Calculate stats
    const totalWorkOrders = mockWorkOrders.length;
    const overdueCount = mockWorkOrders.filter(wo => wo.status === 'overdue').length;
    const inProgressCount = mockWorkOrders.filter(wo => wo.status === 'in_progress').length;
    const completedCount = mockWorkOrders.filter(wo => wo.status === 'completed').length;
    const avgCompletionTime = mockWorkOrders
        .filter(wo => wo.actual_hours)
        .reduce((sum, wo) => sum + (wo.actual_hours || 0), 0) / 
        mockWorkOrders.filter(wo => wo.actual_hours).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="PMS Work Orders" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Wrench className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">PMS Work Orders</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Link href="/pms/work-orders/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Work Order
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalWorkOrders}</div>
                            <p className="text-xs text-muted-foreground">Active this month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Overdue Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
                            <p className="text-xs text-muted-foreground">Require immediate attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inProgressCount}</div>
                            <p className="text-xs text-muted-foreground">Currently being serviced</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgCompletionTime.toFixed(1)}h</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage PMS work orders with scheduling, progress tracking, and technician assignments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by work order, plate number, or customer..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Technician" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Technicians</SelectItem>
                                    <SelectItem value="carlos_mendoza">Carlos Mendoza</SelectItem>
                                    <SelectItem value="maria_rodriguez">Maria Rodriguez</SelectItem>
                                    <SelectItem value="juan_santos">Juan Santos</SelectItem>
                                    <SelectItem value="ana_reyes">Ana Reyes</SelectItem>
                                    <SelectItem value="roberto_cruz">Roberto Cruz</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Work Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Work Orders</CardTitle>
                        <CardDescription>Preventive maintenance service orders with progress tracking and completion status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Work Order</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Service Type</TableHead>
                                    <TableHead>Mileage</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Technician</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockWorkOrders.map((order) => (
                                    <TableRow key={order.id} className={order.status === 'overdue' ? 'bg-red-50' : ''}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{order.work_order_number}</div>
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {order.vehicle.vin.slice(-6)}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{order.vehicle.plate_number}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{order.customer.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    <Badge variant="outline" className="text-xs">
                                                        {order.customer.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{order.service_type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{order.current_mileage.toLocaleString()} km</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Last: {order.last_service_km.toLocaleString()} km
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className={order.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                                            <div>
                                                <div>{order.due_date}</div>
                                                {isOverdue(order.due_date) && order.status !== 'completed' && (
                                                    <div className="text-xs text-red-600">Overdue</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <User className="h-3 w-3" />
                                                <span className="text-sm">{order.assigned_technician}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px]">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full" 
                                                        style={{ width: `${order.completion_percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-medium">{order.completion_percentage}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                        <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Link href={`/pms/work-orders/${order.id}/view`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/pms/work-orders/${order.id}/edit`}>
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
                            <CardTitle>Service Intervals & Tracking</CardTitle>
                            <CardDescription>Automated PMS scheduling based on mileage and time intervals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">5K Service Interval</div>
                                        <div className="text-sm text-muted-foreground">Basic maintenance every 5,000 km</div>
                                    </div>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">1 Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">10K Service Interval</div>
                                        <div className="text-sm text-muted-foreground">Comprehensive check every 10,000 km</div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">1 Scheduled</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">15K+ Service Intervals</div>
                                        <div className="text-sm text-muted-foreground">Extended maintenance services</div>
                                    </div>
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">3 Active</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quality Assurance</CardTitle>
                            <CardDescription>Photo documentation and completion verification</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Photo Documentation</div>
                                        <div className="text-sm text-muted-foreground">Before/after photos required</div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Camera className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">2/5 Complete</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Digital Checklists</div>
                                        <div className="text-sm text-muted-foreground">Service completion verification</div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">1/5 Complete</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Time Tracking</div>
                                        <div className="text-sm text-muted-foreground">Actual vs estimated hours</div>
                                    </div>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                        {avgCompletionTime.toFixed(1)}h avg
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
