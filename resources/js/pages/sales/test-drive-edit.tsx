import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Car, 
    Save, 
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Clock,
    FileSignature,
    Navigation,
    Smartphone,
    Shield,
    CreditCard,
    X,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Test Drives',
        href: '/sales/test-drives',
    },
    {
        title: 'Edit Reservation',
        href: '/sales/test-drives/1/edit',
    },
];

export default function TestDriveEdit() {
    const mockTestDrive = {
        id: 1,
        reservation_id: 'TD-2025-001',
        customer_name: 'John Smith',
        customer_phone: '+1-555-0123',
        customer_email: 'john.smith@email.com',
        vehicle_vin: 'JH4KA8260MC123456',
        vehicle_details: '2024 Honda Civic LX',
        scheduled_date: '2025-01-14',
        scheduled_time: '10:00',
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
    };

    const [selectedStatus, setSelectedStatus] = useState(mockTestDrive.status);
    const [selectedType, setSelectedType] = useState(mockTestDrive.reservation_type);
    const [insuranceVerified, setInsuranceVerified] = useState(mockTestDrive.insurance_verified);
    const [licenseVerified, setLicenseVerified] = useState(mockTestDrive.license_verified);

    const statuses = [
        { value: 'confirmed', label: 'Confirmed', description: 'Ready for test drive' },
        { value: 'pending_signature', label: 'Pending Signature', description: 'Awaiting e-signature' },
        { value: 'completed', label: 'Completed', description: 'Test drive finished' },
        { value: 'cancelled', label: 'Cancelled', description: 'Reservation cancelled' },
        { value: 'no_show', label: 'No Show', description: 'Customer did not arrive' },
    ];

    const reservationTypes = [
        { value: 'scheduled', label: 'Scheduled', description: 'Pre-booked appointment' },
        { value: 'walk_in', label: 'Walk-in', description: 'Unscheduled visit' },
    ];

    const salesReps = [
        { id: '1', name: 'Sarah Sales Rep', specialties: ['Honda', 'Toyota'], availability: 'Available' },
        { id: '2', name: 'Mike Sales Rep', specialties: ['BMW', 'Mercedes'], availability: 'Busy' },
        { id: '3', name: 'Lisa Sales Rep', specialties: ['Hyundai', 'Kia'], availability: 'Available' },
        { id: '4', name: 'Tom Sales Rep', specialties: ['Ford', 'Chevrolet'], availability: 'Available' },
    ];

    const vehicles = [
        { vin: 'JH4KA8260MC123456', details: '2024 Honda Civic LX', status: 'Available' },
        { vin: 'WVWZZZ1JZ3W123789', details: '2023 Toyota Camry SE', status: 'In Use' },
        { vin: 'KMHD84LF5EU456123', details: '2024 BMW X3 xDrive30i', status: 'Available' },
        { vin: 'JF1VA1C60M9876543', details: '2024 Hyundai Elantra SEL', status: 'Maintenance' },
    ];

    const getStatusBadge = (status: string) => {
        const colors = {
            confirmed: 'bg-green-100 text-green-800',
            pending_signature: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800',
            no_show: 'bg-gray-100 text-gray-800',
        };
        return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{status.replace('_', ' ')}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            scheduled: 'bg-blue-100 text-blue-800',
            walk_in: 'bg-purple-100 text-purple-800',
        };
        return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type.replace('_', ' ')}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Reservation - ${mockTestDrive.reservation_id}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/test-drives">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Test Drives
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Test Drive Reservation</h1>
                            <p className="text-muted-foreground">Reservation ID: {mockTestDrive.reservation_id}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Reservation Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Car className="h-5 w-5 mr-2" />
                                    Reservation Details
                                </CardTitle>
                                <CardDescription>
                                    Basic reservation information and identification
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reservation-id">Reservation ID</Label>
                                        <Input 
                                            id="reservation-id" 
                                            value={mockTestDrive.reservation_id}
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="created-date">Created Date</Label>
                                        <Input 
                                            id="created-date" 
                                            value={mockTestDrive.created_at.split(' ')[0]}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        <div>
                                                            <div className="font-medium">{status.label}</div>
                                                            <div className="text-xs text-muted-foreground">{status.description}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Reservation Type</Label>
                                        <Select value={selectedType} onValueChange={setSelectedType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {reservationTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <div>
                                                            <div className="font-medium">{type.label}</div>
                                                            <div className="text-xs text-muted-foreground">{type.description}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Customer Information
                                </CardTitle>
                                <CardDescription>
                                    Customer contact and identification details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer-name">Full Name *</Label>
                                    <Input 
                                        id="customer-name" 
                                        defaultValue={mockTestDrive.customer_name}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer-phone">Phone Number *</Label>
                                        <Input 
                                            id="customer-phone" 
                                            defaultValue={mockTestDrive.customer_phone}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer-email">Email Address</Label>
                                        <Input 
                                            id="customer-email" 
                                            type="email"
                                            defaultValue={mockTestDrive.customer_email}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle & Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Vehicle & Schedule
                                </CardTitle>
                                <CardDescription>
                                    Vehicle selection and appointment scheduling
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle">Vehicle</Label>
                                    <Select defaultValue={mockTestDrive.vehicle_vin}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles.map((vehicle) => (
                                                <SelectItem key={vehicle.vin} value={vehicle.vin} disabled={vehicle.status !== 'Available'}>
                                                    <div>
                                                        <div className="font-medium">{vehicle.details}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            VIN: {vehicle.vin.slice(-6)} • {vehicle.status}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled-date">Date</Label>
                                        <Input 
                                            id="scheduled-date" 
                                            type="date"
                                            defaultValue={mockTestDrive.scheduled_date}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled-time">Time</Label>
                                        <Input 
                                            id="scheduled-time" 
                                            type="time"
                                            defaultValue={mockTestDrive.scheduled_time}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (minutes)</Label>
                                        <Select defaultValue={mockTestDrive.duration_minutes.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Duration" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">60 minutes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sales-rep">Assigned Sales Rep</Label>
                                    <Select defaultValue="1">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select sales rep" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {salesReps.map((rep) => (
                                                <SelectItem key={rep.id} value={rep.id}>
                                                    <div>
                                                        <div className="font-medium">{rep.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {rep.specialties.join(', ')} • {rep.availability}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification & Deposit */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Verification & Deposit
                                </CardTitle>
                                <CardDescription>
                                    Document verification and deposit requirements
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="insurance-verified"
                                                checked={insuranceVerified}
                                                onCheckedChange={(checked) => setInsuranceVerified(checked === true)}
                                            />
                                            <Label htmlFor="insurance-verified" className="cursor-pointer">
                                                Insurance Verified
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="license-verified"
                                                checked={licenseVerified}
                                                onCheckedChange={(checked) => setLicenseVerified(checked === true)}
                                            />
                                            <Label htmlFor="license-verified" className="cursor-pointer">
                                                Driver's License Verified
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deposit-amount">Deposit Amount ($)</Label>
                                        <Input 
                                            id="deposit-amount" 
                                            type="number"
                                            defaultValue={mockTestDrive.deposit_amount}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes & Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes & Additional Information</CardTitle>
                                <CardDescription>
                                    Special instructions and notes about the reservation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        defaultValue={mockTestDrive.notes}
                                        placeholder="Any special instructions, customer preferences, or additional information"
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Current Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Current Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Reservation Status</p>
                                    {getStatusBadge(selectedStatus)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Type</p>
                                    {getTypeBadge(selectedType)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Created</p>
                                    <p className="text-sm font-medium">{mockTestDrive.created_at}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* E-Signature Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <FileSignature className="h-4 w-4 mr-2" />
                                    E-Signature Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Signed
                                    </Badge>
                                </div>
                                {mockTestDrive.esignature_device && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Device</p>
                                        <div className="flex items-center space-x-1">
                                            <Smartphone className="h-3 w-3" />
                                            <span className="text-sm">{mockTestDrive.esignature_device}</span>
                                        </div>
                                    </div>
                                )}
                                {mockTestDrive.esignature_timestamp && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Signed At</p>
                                        <p className="text-sm">{mockTestDrive.esignature_timestamp}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* GPS Tracking */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <Navigation className="h-4 w-4 mr-2" />
                                    GPS Tracking
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {mockTestDrive.gps_start_coords ? (
                                    <>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Route Distance</p>
                                            <p className="text-sm font-medium">{mockTestDrive.route_distance_km} km</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Max Speed</p>
                                            <p className="text-sm font-medium">{mockTestDrive.max_speed_kmh} km/h</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Duration</p>
                                            <p className="text-sm font-medium">
                                                {mockTestDrive.gps_start_timestamp?.split(' ')[1]} - {mockTestDrive.gps_end_timestamp?.split(' ')[1]}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                            No GPS Data
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            GPS tracking will begin when test drive starts
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Verification Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Verification Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Insurance</span>
                                    <div className="flex items-center space-x-1">
                                        <div className={`w-2 h-2 rounded-full ${insuranceVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-xs">{insuranceVerified ? 'Verified' : 'Not Verified'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Driver's License</span>
                                    <div className="flex items-center space-x-1">
                                        <div className={`w-2 h-2 rounded-full ${licenseVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-xs">{licenseVerified ? 'Verified' : 'Not Verified'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <FileSignature className="h-4 w-4 mr-2" />
                                    Request E-Signature
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Customer
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Reschedule
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
