import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Search, Filter, Plus, Eye, Edit, CheckCircle, Clock, MapPin, FileSignature, Calendar, Smartphone, Navigation, User, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface TestDrive {
    id: number;
    reservation_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    vehicle_vin: string;
    vehicle_details: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    status: string;
    reservation_type: string;
    esignature_status: string;
    esignature_timestamp?: string;
    esignature_device?: string;
    gps_start_coords?: string;
    gps_end_coords?: string;
    gps_start_timestamp?: string;
    gps_end_timestamp?: string;
    route_distance_km?: number;
    max_speed_kmh?: number;
    insurance_verified: boolean;
    license_verified: boolean;
    deposit_amount: number;
    assigned_user?: {
        id: number;
        name: string;
    };
    branch?: {
        id: number;
        name: string;
        code: string;
    };
    created_at: string;
}

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface Props {
    testDrives: {
        data: TestDrive[];
        links: any[];
        meta: any;
    };
    stats: {
        total: number;
        completed: number;
        walk_in_rate: number;
        esignature_rate: number;
    };
    filters: {
        search?: string;
        status?: string;
        reservation_type?: string;
        esignature_status?: string;
        date_range?: string;
        branch_id?: string;
        include_deleted?: boolean;
    };
    branches?: Branch[] | null;
}

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

export default function TestDrives({ testDrives, stats, filters, branches }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [reservationType, setReservationType] = useState(filters.reservation_type || '');
    const [dateRange, setDateRange] = useState(filters.date_range || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/sales/test-drives', { 
            search: value, 
            status, 
            reservation_type: reservationType,
            date_range: dateRange,
            branch_id: branchId 
        }, { 
            preserveState: true, 
            replace: true 
        });
    };

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        router.get('/sales/test-drives', { 
            search, 
            status: value === 'all' ? '' : value,
            reservation_type: reservationType,
            date_range: dateRange,
            branch_id: branchId 
        }, { 
            preserveState: true, 
            replace: true 
        });
    };

    const handleTypeFilter = (value: string) => {
        setReservationType(value);
        router.get('/sales/test-drives', { 
            search, 
            status,
            reservation_type: value === 'all' ? '' : value,
            date_range: dateRange,
            branch_id: branchId 
        }, { 
            preserveState: true, 
            replace: true 
        });
    };

    const handleDateRangeFilter = (value: string) => {
        setDateRange(value);
        router.get('/sales/test-drives', { 
            search, 
            status,
            reservation_type: reservationType,
            date_range: value === 'all' ? '' : value,
            branch_id: branchId 
        }, { 
            preserveState: true, 
            replace: true 
        });
    };

    const handleBranchFilter = (value: string) => {
        setBranchId(value);
        router.get('/sales/test-drives', { 
            search, 
            status,
            reservation_type: reservationType,
            date_range: dateRange,
            branch_id: value === 'all' ? '' : value 
        }, { 
            preserveState: true, 
            replace: true 
        });
    };

    const handleDelete = (id: number, reservationId: string) => {
        if (confirm(`Are you sure you want to delete test drive ${reservationId}?`)) {
            router.delete(`/sales/test-drives/${id}`, {
                preserveScroll: true,
            });
        }
    };


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
                        <Link href="/sales/test-drives/calendar">
                            <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Calendar View
                            </Button>
                        </Link>
                        <Link href="/sales/test-drives/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Reservation
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Total reservations</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Completed Drives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground">Successfully completed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Walk-in Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.walk_in_rate}%</div>
                            <p className="text-xs text-muted-foreground">Unscheduled visits</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">E-Signature Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.esignature_rate}%</div>
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
                                    <Input 
                                        placeholder="Search by customer name, phone, or reservation ID..." 
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Select value={status || 'all'} onValueChange={handleStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending_signature">Pending Signature</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="no_show">No Show</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={reservationType || 'all'} onValueChange={handleTypeFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="walk_in">Walk-in</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={dateRange || 'all'} onValueChange={handleDateRangeFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Date Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                </SelectContent>
                            </Select>
                            {branches && branches.length > 0 && (
                                <Select value={branchId || 'all'} onValueChange={handleBranchFilter}>
                                    <SelectTrigger className="w-full md:w-[200px]">
                                        <SelectValue placeholder="Branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                {branch.name} ({branch.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
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
                                {testDrives.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                            No test drives found. <Link href="/sales/test-drives/create" className="text-primary hover:underline">Create your first reservation</Link>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    testDrives.data.map((drive) => (
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
                                                    {drive.customer_email && (
                                                        <div className="text-xs text-muted-foreground">{drive.customer_email}</div>
                                                    )}
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
                                                    {drive.assigned_user && (
                                                        <div className="flex items-center space-x-1 mt-1">
                                                            <User className="h-3 w-3" />
                                                            <span className="text-xs">{drive.assigned_user.name}</span>
                                                        </div>
                                                    )}
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
                                                <Link href={`/sales/test-drives/${drive.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/sales/test-drives/${drive.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDelete(drive.id, drive.reservation_id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Availability Calendar & Walk-in Management */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                        <CardDescription>Real-time reservation overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-medium">Today's Reservations</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Scheduled for today</p>
                                <div className="text-2xl font-bold">
                                    {testDrives.data.filter(drive => drive.scheduled_date === new Date().toISOString().split('T')[0]).length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {testDrives.data.filter(drive => 
                                        drive.scheduled_date === new Date().toISOString().split('T')[0] && 
                                        drive.status === 'confirmed'
                                    ).length} confirmed
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                    <h4 className="font-medium">Walk-in Reservations</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Total walk-in type</p>
                                <div className="text-2xl font-bold">
                                    {testDrives.data.filter(drive => drive.reservation_type === 'walk_in').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {Math.round((testDrives.data.filter(drive => drive.reservation_type === 'walk_in').length / (testDrives.data.length || 1)) * 100)}% of total
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium">Pending Signatures</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Awaiting e-signature</p>
                                <div className="text-2xl font-bold">
                                    {testDrives.data.filter(drive => drive.esignature_status === 'pending').length}
                                </div>
                                <p className="text-xs text-muted-foreground">Require attention</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
