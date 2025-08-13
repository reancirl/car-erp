import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Search, Filter, Download, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock, Camera, MapPin, User, Calendar } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'PMS Work Orders',
        href: '/service/pms-work-orders',
    },
];

export default function PMSWorkOrders() {
    // Mock data for demonstration
    const mockWorkOrders = [
        {
            id: 1,
            work_order_no: 'WO-2025-001',
            vehicle_vin: 'JH4KA8260MC123456',
            customer_name: 'John Smith',
            vehicle_make: 'Honda',
            vehicle_model: 'Civic',
            vehicle_year: 2023,
            current_odometer: 15000,
            service_type: '10K Service',
            service_interval: 10000,
            last_service_km: 5000,
            last_service_date: '2024-10-15',
            due_date: '2025-01-20',
            assigned_technician: 'Mike Johnson',
            status: 'overdue',
            priority: 'high',
            created_at: '2025-01-10 08:30:00',
            photos_uploaded: false,
            checklist_completed: false,
            estimated_hours: 2.5,
            actual_hours: null
        },
        {
            id: 2,
            work_order_no: 'WO-2025-002',
            vehicle_vin: 'WVWZZZ1JZ3W123789',
            customer_name: 'Sarah Davis',
            vehicle_make: 'Volkswagen',
            vehicle_model: 'Golf',
            vehicle_year: 2022,
            current_odometer: 25000,
            service_type: '20K Service',
            service_interval: 20000,
            last_service_km: 10000,
            last_service_date: '2024-08-15',
            due_date: '2025-01-15',
            assigned_technician: 'Tom Wilson',
            status: 'in_progress',
            priority: 'medium',
            created_at: '2025-01-12 09:15:00',
            photos_uploaded: true,
            checklist_completed: false,
            estimated_hours: 3.0,
            actual_hours: 1.5
        },
        {
            id: 3,
            work_order_no: 'WO-2025-003',
            vehicle_vin: 'KMHD84LF5EU456123',
            customer_name: 'Robert Chen',
            vehicle_make: 'Hyundai',
            vehicle_model: 'Elantra',
            vehicle_year: 2021,
            current_odometer: 45000,
            service_type: '40K Service',
            service_interval: 40000,
            last_service_km: 30000,
            last_service_date: '2024-06-20',
            due_date: '2025-01-25',
            assigned_technician: 'Lisa Brown',
            status: 'scheduled',
            priority: 'medium',
            created_at: '2025-01-11 14:20:00',
            photos_uploaded: false,
            checklist_completed: false,
            estimated_hours: 4.0,
            actual_hours: null
        },
        {
            id: 4,
            work_order_no: 'WO-2025-004',
            vehicle_vin: 'JF1VA1C60M9876543',
            customer_name: 'Emily Johnson',
            vehicle_make: 'Subaru',
            vehicle_model: 'Impreza',
            vehicle_year: 2020,
            current_odometer: 35000,
            service_type: '30K Service',
            service_interval: 30000,
            last_service_km: 20000,
            last_service_date: '2024-05-10',
            due_date: '2025-02-01',
            assigned_technician: 'David Kim',
            status: 'completed',
            priority: 'low',
            created_at: '2025-01-08 11:45:00',
            photos_uploaded: true,
            checklist_completed: true,
            estimated_hours: 3.5,
            actual_hours: 3.2
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
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
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
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
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
            case 'medium':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const isOverdue = (dueDate: string, currentOdometer: number, lastServiceKm: number) => {
        const due = new Date(dueDate);
        const now = new Date();
        const kmDiff = currentOdometer - lastServiceKm;
        
        return due < now || kmDiff >= 10000;
    };

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
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Work Order
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">Active this month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Overdue Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">1</div>
                            <p className="text-xs text-muted-foreground">≥10,000 km or 6 months</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">Currently being serviced</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3.2h</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage service jobs with km/time intervals, odometer tracking, and technician assignments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by work order, VIN, or customer..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Technician" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Technicians</SelectItem>
                                    <SelectItem value="mike_johnson">Mike Johnson</SelectItem>
                                    <SelectItem value="tom_wilson">Tom Wilson</SelectItem>
                                    <SelectItem value="lisa_brown">Lisa Brown</SelectItem>
                                    <SelectItem value="david_kim">David Kim</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Service Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="10k">10K Service</SelectItem>
                                    <SelectItem value="20k">20K Service</SelectItem>
                                    <SelectItem value="30k">30K Service</SelectItem>
                                    <SelectItem value="40k">40K Service</SelectItem>
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
                        <CardTitle>Active Work Orders</CardTitle>
                        <CardDescription>Service jobs with odometer tracking, VIN entry, and automated overdue flagging</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Work Order</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Service Type</TableHead>
                                    <TableHead>Odometer</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Technician</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Photos</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockWorkOrders.map((order) => (
                                    <TableRow key={order.id} className={order.status === 'overdue' ? 'bg-red-50' : ''}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{order.work_order_no}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{order.vehicle_vin}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{order.vehicle_year} {order.vehicle_make} {order.vehicle_model}</div>
                                                <div className="text-xs text-muted-foreground">VIN: {order.vehicle_vin.slice(-6)}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{order.customer_name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{order.service_type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{order.current_odometer.toLocaleString()} km</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Last: {order.last_service_km.toLocaleString()} km
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className={order.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                                            {order.due_date}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <User className="h-3 w-3" />
                                                <span className="text-sm">{order.assigned_technician}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                        <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Camera className={`h-4 w-4 ${order.photos_uploaded ? 'text-green-600' : 'text-gray-400'}`} />
                                                <span className="text-xs">
                                                    {order.photos_uploaded ? 'Uploaded' : 'Pending'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Technician Assignment & Photo Upload Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Technician Assignment Rules</CardTitle>
                            <CardDescription>Randomized assignments to avoid favoritism</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Auto-Assignment</div>
                                        <div className="text-sm text-muted-foreground">Randomly assign available technicians</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Workload Balancing</div>
                                        <div className="text-sm text-muted-foreground">Consider current workload in assignment</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Skill Matching</div>
                                        <div className="text-sm text-muted-foreground">Match technician expertise to service type</div>
                                    </div>
                                    <Badge variant="outline">Optional</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Photo Upload Requirements</CardTitle>
                            <CardDescription>Mandatory geotagged before/after photos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Before Photos</div>
                                        <div className="text-sm text-muted-foreground">Required before starting work</div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">Geotagged</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">After Photos</div>
                                        <div className="text-sm text-muted-foreground">Required upon completion</div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">Geotagged</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Quality Check</div>
                                        <div className="text-sm text-muted-foreground">Minimum resolution & clarity requirements</div>
                                    </div>
                                    <Badge variant="default" className="bg-blue-100 text-blue-800">Auto-Verified</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* End-of-Day Digital Checklist */}
                <Card>
                    <CardHeader>
                        <CardTitle>End-of-Day Digital Checklist</CardTitle>
                        <CardDescription>Daily completion requirements for all active work orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium">Work Progress</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Update completion status for all assigned orders</p>
                                <Badge variant="outline" className="bg-green-100 text-green-800">2/2 Completed</Badge>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Camera className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-medium">Photo Verification</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Ensure all required photos are uploaded</p>
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">1/2 Pending</Badge>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                    <h4 className="font-medium">Time Logging</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Record actual hours spent on each job</p>
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">All Updated</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
