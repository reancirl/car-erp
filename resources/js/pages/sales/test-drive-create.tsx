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
    AlertTriangle,
    Plus
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
        title: 'New Reservation',
        href: '/sales/test-drives/create',
    },
];

export default function TestDriveCreate() {
    const [selectedType, setSelectedType] = useState('scheduled');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedSalesRep, setSelectedSalesRep] = useState('');
    const [insuranceVerified, setInsuranceVerified] = useState(false);
    const [licenseVerified, setLicenseVerified] = useState(false);
    const [requiresDeposit, setRequiresDeposit] = useState(false);

    const reservationTypes = [
        { value: 'scheduled', label: 'Scheduled', description: 'Pre-booked appointment' },
        { value: 'walk_in', label: 'Walk-in', description: 'Immediate availability' },
    ];

    const salesReps = [
        { id: '1', name: 'Sarah Sales Rep', specialties: ['Honda', 'Toyota'], availability: 'Available', workload: 'Light' },
        { id: '2', name: 'Mike Sales Rep', specialties: ['BMW', 'Mercedes'], availability: 'Busy', workload: 'Heavy' },
        { id: '3', name: 'Lisa Sales Rep', specialties: ['Hyundai', 'Kia'], availability: 'Available', workload: 'Medium' },
        { id: '4', name: 'Tom Sales Rep', specialties: ['Ford', 'Chevrolet'], availability: 'Available', workload: 'Light' },
    ];

    const vehicles = [
        { vin: 'JH4KA8260MC123456', details: '2024 Honda Civic LX', status: 'Available', color: 'Silver', mileage: '12 miles' },
        { vin: 'WVWZZZ1JZ3W123789', details: '2023 Toyota Camry SE', status: 'Available', color: 'Blue', mileage: '8,450 miles' },
        { vin: 'KMHD84LF5EU456123', details: '2024 BMW X3 xDrive30i', status: 'Available', color: 'Black', mileage: '25 miles' },
        { vin: 'JF1VA1C60M9876543', details: '2024 Hyundai Elantra SEL', status: 'Maintenance', color: 'White', mileage: '156 miles' },
        { vin: 'WBXHT3C39P5A12345', details: '2024 Mercedes-Benz C-Class', status: 'Available', color: 'Gray', mileage: '45 miles' },
    ];

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    const durations = [
        { value: '15', label: '15 minutes', description: 'Quick drive' },
        { value: '30', label: '30 minutes', description: 'Standard test drive' },
        { value: '45', label: '45 minutes', description: 'Extended test drive' },
        { value: '60', label: '60 minutes', description: 'Comprehensive evaluation' },
    ];

    const getTypeBadge = (type: string) => {
        const colors = {
            scheduled: 'bg-blue-100 text-blue-800',
            walk_in: 'bg-purple-100 text-purple-800',
        };
        return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type.replace('_', ' ')}</Badge>;
    };

    const getAvailabilityBadge = (availability: string) => {
        const colors = {
            Available: 'bg-green-100 text-green-800',
            Busy: 'bg-red-100 text-red-800',
            Maintenance: 'bg-yellow-100 text-yellow-800',
        };
        return <Badge className={colors[availability as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{availability}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Test Drive Reservation" />
            
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
                            <h1 className="text-2xl font-bold">New Test Drive Reservation</h1>
                            <p className="text-muted-foreground">Create a new test drive appointment</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Create Reservation
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Reservation Type */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Car className="h-5 w-5 mr-2" />
                                    Reservation Type
                                </CardTitle>
                                <CardDescription>
                                    Select the type of test drive reservation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reservation-id">Reservation ID</Label>
                                    <Input 
                                        id="reservation-id" 
                                        placeholder="Auto-generated"
                                        disabled
                                        value="TD-2025-005"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={selectedType} onValueChange={setSelectedType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select reservation type" />
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
                                        placeholder="Enter customer's full name"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer-phone">Phone Number *</Label>
                                        <Input 
                                            id="customer-phone" 
                                            placeholder="Enter phone number"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer-email">Email Address</Label>
                                        <Input 
                                            id="customer-email" 
                                            type="email"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Car className="h-5 w-5 mr-2" />
                                    Vehicle Selection
                                </CardTitle>
                                <CardDescription>
                                    Choose the vehicle for the test drive
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle">Vehicle *</Label>
                                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vehicle for test drive" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles.map((vehicle) => (
                                                <SelectItem 
                                                    key={vehicle.vin} 
                                                    value={vehicle.vin} 
                                                    disabled={vehicle.status !== 'Available'}
                                                >
                                                    <div className="w-full">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-medium">{vehicle.details}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    VIN: {vehicle.vin.slice(-6)} • {vehicle.color} • {vehicle.mileage}
                                                                </div>
                                                            </div>
                                                            {getAvailabilityBadge(vehicle.status)}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Schedule & Duration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Schedule & Duration
                                </CardTitle>
                                <CardDescription>
                                    Set the appointment date, time, and duration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled-date">Date *</Label>
                                        <Input 
                                            id="scheduled-date" 
                                            type="date"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled-time">Time *</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select time slot" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration</Label>
                                    <Select defaultValue="30">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {durations.map((duration) => (
                                                <SelectItem key={duration.value} value={duration.value}>
                                                    <div>
                                                        <div className="font-medium">{duration.label}</div>
                                                        <div className="text-xs text-muted-foreground">{duration.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sales-rep">Assign Sales Rep</Label>
                                    <Select value={selectedSalesRep} onValueChange={setSelectedSalesRep}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Auto-assign or select manually" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">Auto-assign (Recommended)</SelectItem>
                                            {salesReps.map((rep) => (
                                                <SelectItem key={rep.id} value={rep.id}>
                                                    <div>
                                                        <div className="font-medium">{rep.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {rep.specialties.join(', ')} • {rep.availability} • {rep.workload} workload
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification & Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Verification & Requirements
                                </CardTitle>
                                <CardDescription>
                                    Document verification and special requirements
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
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="requires-deposit"
                                                checked={requiresDeposit}
                                                onCheckedChange={(checked) => setRequiresDeposit(checked === true)}
                                            />
                                            <Label htmlFor="requires-deposit" className="cursor-pointer">
                                                Requires Deposit
                                            </Label>
                                        </div>
                                    </div>
                                    {requiresDeposit && (
                                        <div className="space-y-2">
                                            <Label htmlFor="deposit-amount">Deposit Amount ($)</Label>
                                            <Input 
                                                id="deposit-amount" 
                                                type="number"
                                                placeholder="100"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes & Special Instructions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes & Special Instructions</CardTitle>
                                <CardDescription>
                                    Any special requirements or notes about the reservation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        placeholder="Any special instructions, customer preferences, or additional information"
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Reservation Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Reservation Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Type</p>
                                    {getTypeBadge(selectedType)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Reservation ID</p>
                                    <p className="text-sm font-medium">TD-2025-005</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Preview */}
                        {selectedVehicle && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Selected Vehicle</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {(() => {
                                        const vehicle = vehicles.find(v => v.vin === selectedVehicle);
                                        return vehicle ? (
                                            <>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Vehicle</p>
                                                    <p className="text-sm font-medium">{vehicle.details}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">VIN</p>
                                                    <p className="text-sm font-mono">{vehicle.vin.slice(-6)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Details</p>
                                                    <p className="text-sm">{vehicle.color} • {vehicle.mileage}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Status</p>
                                                    {getAvailabilityBadge(vehicle.status)}
                                                </div>
                                            </>
                                        ) : null;
                                    })()}
                                </CardContent>
                            </Card>
                        )}

                        {/* Sales Rep Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Sales Rep Assignment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Assignment Method</p>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                        {selectedSalesRep === 'auto' || !selectedSalesRep ? 'Auto-assign' : 'Manual'}
                                    </Badge>
                                </div>
                                {selectedSalesRep && selectedSalesRep !== 'auto' && (
                                    <>
                                        {(() => {
                                            const rep = salesReps.find(r => r.id === selectedSalesRep);
                                            return rep ? (
                                                <>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Assigned Rep</p>
                                                        <p className="text-sm font-medium">{rep.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Specialties</p>
                                                        <p className="text-sm">{rep.specialties.join(', ')}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Status</p>
                                                        {getAvailabilityBadge(rep.availability)}
                                                    </div>
                                                </>
                                            ) : null;
                                        })()}
                                    </>
                                )}
                                {(!selectedSalesRep || selectedSalesRep === 'auto') && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Recommended</p>
                                        <p className="text-sm font-medium">Sarah Sales Rep</p>
                                        <p className="text-xs text-muted-foreground">Based on availability and specialties</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* E-Signature Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <FileSignature className="h-4 w-4 mr-2" />
                                    E-Signature Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Liability Waiver</span>
                                        <Badge variant="outline" className="bg-orange-100 text-orange-800">Required</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Terms & Conditions</span>
                                        <Badge variant="outline" className="bg-orange-100 text-orange-800">Required</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Insurance Verification</span>
                                        <Badge variant="outline" className={insuranceVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {insuranceVerified ? 'Verified' : 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Available Time Slots */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Today's Availability</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-center">9:00 AM</div>
                                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-center">9:30 AM</div>
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-center">10:00 AM</div>
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-center">10:30 AM</div>
                                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-center">11:00 AM</div>
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-center">11:30 AM</div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded mr-1"></span>Available
                                    <span className="inline-block w-2 h-2 bg-red-500 rounded mr-1 ml-3"></span>Booked
                                </p>
                            </CardContent>
                        </Card>

                        {/* Guidelines */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Reservation Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>• Verify customer's driver's license and insurance</p>
                                <p>• E-signature required before test drive</p>
                                <p>• GPS tracking automatically enabled</p>
                                <p>• Sales rep must accompany customer</p>
                                <p>• Maximum speed limit: 80 km/h</p>
                                <p>• Return vehicle with same fuel level</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
