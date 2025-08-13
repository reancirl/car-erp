import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Search, Filter, Download, Plus, Eye, Edit, CheckCircle, Clock, MapPin, FileSignature, Calendar, Smartphone, Navigation, User } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Test Drives & Reservations',
        href: '/sales/test-drives',
    },
];

export default function TestDrives() {
    // Mock data for demonstration
    const mockTestDrives = [
        {
            id: 1,
            reservation_id: 'TD-2025-001',
            customer_name: 'John Smith',
            customer_phone: '+1-555-0123',
            customer_email: 'john.smith@email.com',
            vehicle_vin: 'JH4KA8260MC123456',
            vehicle_details: '2024 Honda Civic LX',
            scheduled_date: '2025-01-14',
            scheduled_time: '10:00 AM',
            duration_minutes: 30,
            sales_rep: 'Sarah Sales Rep',
            status: 'confirmed',
            reservation_type: 'scheduled',
            created_at: '2025-01-13 09:15:00',
            esignature_status: 'signed',
            esignature_timestamp: '2025-01-13 09:20:00',
            esignature_device: 'iPad Pro',
            gps_start_coords: '40.7128,-74.0060',
            gps_end_coords: '40.7589,-73.9851',
            gps_start_timestamp: '2025-01-14 10:00:00',
            gps_end_timestamp: '2025-01-14 10:30:00',
            route_distance_km: 12.5,
            max_speed_kmh: 65,
            insurance_verified: true,
            license_verified: true,
            deposit_amount: 0,
            notes: 'Customer interested in financing options'
        },
        {
            id: 2,
            reservation_id: 'TD-2025-002',
            customer_name: 'Maria Rodriguez',
            customer_phone: '+1-555-0124',
            customer_email: 'maria.r@email.com',
            vehicle_vin: 'WVWZZZ1JZ3W123789',
            vehicle_details: '2023 Toyota Camry SE',
            scheduled_date: '2025-01-14',
            scheduled_time: '2:00 PM',
            duration_minutes: 45,
            sales_rep: 'Mike Sales Rep',
            status: 'pending_signature',
            reservation_type: 'scheduled',
            created_at: '2025-01-13 11:30:00',
            esignature_status: 'pending',
            esignature_timestamp: null,
            esignature_device: null,
            gps_start_coords: null,
            gps_end_coords: null,
            gps_start_timestamp: null,
            gps_end_timestamp: null,
            route_distance_km: null,
            max_speed_kmh: null,
            insurance_verified: true,
            license_verified: false,
            deposit_amount: 100,
            notes: 'Trade-in evaluation needed'
        },
        {
            id: 3,
            reservation_id: 'TD-2025-003',
            customer_name: 'Robert Johnson',
            customer_phone: '+1-555-0125',
            customer_email: 'robert.j@email.com',
            vehicle_vin: 'KMHD84LF5EU456123',
            vehicle_details: '2024 BMW X3 xDrive30i',
            scheduled_date: '2025-01-13',
            scheduled_time: '4:30 PM',
            duration_minutes: 60,
            sales_rep: 'Lisa Sales Rep',
            status: 'completed',
            reservation_type: 'walk_in',
            created_at: '2025-01-13 16:25:00',
            esignature_status: 'signed',
            esignature_timestamp: '2025-01-13 16:30:00',
            esignature_device: 'Samsung Tablet',
            gps_start_coords: '41.8781,-87.6298',
            gps_end_coords: '41.9028,-87.6317',
            gps_start_timestamp: '2025-01-13 16:35:00',
            gps_end_timestamp: '2025-01-13 17:35:00',
            route_distance_km: 18.2,
            max_speed_kmh: 72,
            insurance_verified: true,
            license_verified: true,
            deposit_amount: 0,
            notes: 'Walk-in customer, very interested in premium features'
        },
        {
            id: 4,
            reservation_id: 'TD-2025-004',
            customer_name: 'Emily Davis',
            customer_phone: '+1-555-0126',
            customer_email: 'emily.davis@company.com',
            vehicle_vin: 'JF1VA1C60M9876543',
            vehicle_details: '2024 Hyundai Elantra SEL',
            scheduled_date: '2025-01-15',
            scheduled_time: '11:30 AM',
            duration_minutes: 30,
            sales_rep: 'Tom Sales Rep',
            status: 'cancelled',
            reservation_type: 'scheduled',
            created_at: '2025-01-12 14:45:00',
            esignature_status: 'not_required',
            esignature_timestamp: null,
            esignature_device: null,
            gps_start_coords: null,
            gps_end_coords: null,
            gps_start_timestamp: null,
            gps_end_timestamp: null,
            route_distance_km: null,
            max_speed_kmh: null,
            insurance_verified: false,
            license_verified: false,
            deposit_amount: 0,
            notes: 'Customer cancelled due to scheduling conflict'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirmed
                    </Badge>
                );
            case 'pending_signature':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <FileSignature className="h-3 w-3 mr-1" />
                        Pending Signature
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="destructive">
                        <Clock className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getReservationTypeBadge = (type: string) => {
        switch (type) {
            case 'scheduled':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Calendar className="h-3 w-3 mr-1" />
                        Scheduled
                    </Badge>
                );
            case 'walk_in':
                return (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        <MapPin className="h-3 w-3 mr-1" />
                        Walk-in
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const getESignatureBadge = (status: string) => {
        switch (status) {
            case 'signed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <FileSignature className="h-3 w-3 mr-1" />
                        Signed
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'not_required':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Not Required
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Drives & Reservations" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Car className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Test Drives & Reservations</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Calendar View
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Reservation
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">This week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Completed Drives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">Successfully completed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Walk-in Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">25%</div>
                            <p className="text-xs text-muted-foreground">Unscheduled visits</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">E-Signature Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">75%</div>
                            <p className="text-xs text-muted-foreground">Digital signatures</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>E-signature capture on mobile/tablet with GPS timestamp logging</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by customer name, phone, or reservation ID..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="pending_signature">Pending Signature</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="walk_in">Walk-in</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Date Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Drives Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Drive Reservations</CardTitle>
                        <CardDescription>Digital signatures, GPS tracking, and availability management</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reservation Details</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>E-Signature</TableHead>
                                    <TableHead>GPS Tracking</TableHead>
                                    <TableHead>Verification</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockTestDrives.map((drive) => (
                                    <TableRow key={drive.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{drive.reservation_id}</div>
                                                <div className="text-xs text-muted-foreground">{drive.created_at}</div>
                                                {getReservationTypeBadge(drive.reservation_type)}
                                                {drive.deposit_amount > 0 && (
                                                    <Badge variant="outline" className="text-xs mt-1 bg-green-100 text-green-800">
                                                        Deposit: ${drive.deposit_amount}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{drive.customer_name}</div>
                                                <div className="text-xs text-muted-foreground">{drive.customer_phone}</div>
                                                <div className="text-xs text-muted-foreground">{drive.customer_email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{drive.vehicle_details}</div>
                                                <div className="text-xs text-muted-foreground font-mono">VIN: {drive.vehicle_vin.slice(-6)}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{drive.scheduled_date}</div>
                                                <div className="text-sm">{drive.scheduled_time}</div>
                                                <div className="text-xs text-muted-foreground">{drive.duration_minutes} minutes</div>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <User className="h-3 w-3" />
                                                    <span className="text-xs">{drive.sales_rep}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {getESignatureBadge(drive.esignature_status)}
                                                {drive.esignature_device && (
                                                    <div className="flex items-center space-x-1 mt-1">
                                                        <Smartphone className="h-3 w-3" />
                                                        <span className="text-xs">{drive.esignature_device}</span>
                                                    </div>
                                                )}
                                                {drive.esignature_timestamp && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {drive.esignature_timestamp}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {drive.gps_start_coords ? (
                                                <div>
                                                    <div className="flex items-center space-x-1">
                                                        <Navigation className="h-3 w-3 text-green-600" />
                                                        <span className="text-xs">Tracked</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {drive.route_distance_km} km
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Max: {drive.max_speed_kmh} km/h
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {drive.gps_start_timestamp?.split(' ')[1]} - {drive.gps_end_timestamp?.split(' ')[1]}
                                                    </div>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                                    No GPS Data
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-1">
                                                    <div className={`w-2 h-2 rounded-full ${drive.insurance_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <span className="text-xs">Insurance</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <div className={`w-2 h-2 rounded-full ${drive.license_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <span className="text-xs">License</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(drive.status)}</TableCell>
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

                {/* E-Signature & GPS Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>E-Signature Capture</CardTitle>
                            <CardDescription>Mobile and tablet signature collection</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">iPad Pro Integration</div>
                                        <div className="text-sm text-muted-foreground">High-resolution signature capture</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Android Tablet Support</div>
                                        <div className="text-sm text-muted-foreground">Samsung Galaxy Tab compatibility</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Timestamp Verification</div>
                                        <div className="text-sm text-muted-foreground">Cryptographic signature timestamps</div>
                                    </div>
                                    <Badge variant="default" className="bg-blue-100 text-blue-800">Enabled</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>GPS Tracking System</CardTitle>
                            <CardDescription>Raw coordinate logging and route analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Start/End Coordinates</div>
                                        <div className="text-sm text-muted-foreground">Precise GPS location capture</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Logging</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Route Distance</div>
                                        <div className="text-sm text-muted-foreground">Total kilometers traveled</div>
                                    </div>
                                    <Badge variant="default" className="bg-blue-100 text-blue-800">Calculated</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Speed Monitoring</div>
                                        <div className="text-sm text-muted-foreground">Maximum speed tracking</div>
                                    </div>
                                    <Badge variant="outline" className="bg-orange-100 text-orange-800">Safety Alert</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Availability Calendar & Walk-in Management */}
                <Card>
                    <CardHeader>
                        <CardTitle>Availability Calendar & Walk-in Management</CardTitle>
                        <CardDescription>Booking system with walk-in tagging and real-time availability</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-medium">Today's Schedule</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Available time slots</p>
                                <div className="space-y-1">
                                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">9:00 AM - Available</div>
                                    <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">10:00 AM - Booked</div>
                                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">11:30 AM - Available</div>
                                    <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">2:00 PM - Booked</div>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                    <h4 className="font-medium">Walk-in Queue</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Current walk-in customers</p>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">Waiting for test drive</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Car className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium">Vehicle Availability</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Test drive fleet status</p>
                                <div className="text-2xl font-bold">8/10</div>
                                <p className="text-xs text-muted-foreground">Vehicles available</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
