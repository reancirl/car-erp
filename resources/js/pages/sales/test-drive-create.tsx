import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, X, AlertCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { FormEvent } from 'react';

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface SalesRep {
    id: number;
    name: string;
    branch_id: number;
}

interface VehicleModel {
    id: number;
    make: string;
    model: string;
    year: number;
    body_type: string;
}

interface Props {
    branches?: Branch[] | null;
    salesReps: SalesRep[];
    vehicleModels: VehicleModel[];
}

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
        title: 'Create',
        href: '/sales/test-drives/create',
    },
];

export default function TestDriveCreate({ branches, salesReps, vehicleModels }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        vehicle_vin: '',
        vehicle_details: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '09:00',
        duration_minutes: 30,
        branch_id: branches && branches.length > 0 ? String(branches[0].id) : '',
        assigned_user_id: '',
        reservation_type: 'scheduled',
        insurance_verified: false,
        license_verified: false,
        deposit_amount: 0,
        notes: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/sales/test-drives', {
            preserveScroll: true,
        });
    };

    const handleInsuranceChange = () => {
        setData('insurance_verified', !data.insurance_verified as any);
    };

    const handleLicenseChange = () => {
        setData('license_verified', !data.license_verified as any);
    };

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Test Drive Reservation" />
            
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {/* Validation Error Banner */}
                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-900">Validation Error</h3>
                                    <p className="text-sm text-red-800 mt-1">
                                        Please correct the following errors before submitting:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field}>
                                                <strong className="capitalize">{field.replace(/_/g, ' ')}</strong>: {message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/test-drives">
                            <Button variant="outline" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">New Test Drive Reservation</h1>
                            <p className="text-muted-foreground">Create a new test drive appointment</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/sales/test-drives">
                            <Button variant="outline" type="button">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Reservation'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Reservation Type */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Reservation Details</CardTitle>
                                <CardDescription>Basic reservation information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reservation_type">Reservation Type *</Label>
                                    <Select value={data.reservation_type} onValueChange={(value) => setData('reservation_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="walk_in">Walk-in</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.reservation_type && <p className="text-sm text-red-600">{errors.reservation_type}</p>}
                                </div>

                                {branches && branches.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="branch_id">Branch *</Label>
                                        <Select value={data.branch_id} onValueChange={(value) => setData('branch_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches.map((branch) => (
                                                    <SelectItem key={branch.id} value={String(branch.id)}>
                                                        {branch.name} ({branch.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.branch_id && <p className="text-sm text-red-600">{errors.branch_id}</p>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                                <CardDescription>Customer contact details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_name">Full Name *</Label>
                                    <Input 
                                        id="customer_name" 
                                        value={data.customer_name}
                                        onChange={(e) => setData('customer_name', e.target.value)}
                                        required
                                    />
                                    {errors.customer_name && <p className="text-sm text-red-600">{errors.customer_name}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_phone">Phone Number *</Label>
                                        <Input 
                                            id="customer_phone" 
                                            value={data.customer_phone}
                                            onChange={(e) => setData('customer_phone', e.target.value)}
                                            required
                                        />
                                        {errors.customer_phone && <p className="text-sm text-red-600">{errors.customer_phone}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_email">Email Address</Label>
                                        <Input 
                                            id="customer_email" 
                                            type="email"
                                            value={data.customer_email}
                                            onChange={(e) => setData('customer_email', e.target.value)}
                                        />
                                        {errors.customer_email && <p className="text-sm text-red-600">{errors.customer_email}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Vehicle Information</CardTitle>
                                <CardDescription>Vehicle details for test drive</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_vin">Vehicle VIN *</Label>
                                    <Input 
                                        id="vehicle_vin" 
                                        value={data.vehicle_vin}
                                        onChange={(e) => setData('vehicle_vin', e.target.value)}
                                        placeholder="Enter 17-character VIN"
                                        required
                                    />
                                    {errors.vehicle_vin && <p className="text-sm text-red-600">{errors.vehicle_vin}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_details">Vehicle Model *</Label>
                                    <Select 
                                        value={data.vehicle_details} 
                                        onValueChange={(value) => setData('vehicle_details', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vehicle model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicleModels && vehicleModels.length > 0 ? (
                                                vehicleModels.map((model) => (
                                                    <SelectItem key={model.id} value={`${model.year} ${model.make} ${model.model}`}>
                                                        {model.year} {model.make} {model.model} - {model.body_type}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-muted-foreground">
                                                    No vehicle models available
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Select from available vehicle models
                                    </p>
                                    {errors.vehicle_details && <p className="text-sm text-red-600">{errors.vehicle_details}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule & Duration</CardTitle>
                                <CardDescription>Appointment date and time</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_date">Date *</Label>
                                        <Input 
                                            id="scheduled_date" 
                                            type="date"
                                            value={data.scheduled_date}
                                            onChange={(e) => setData('scheduled_date', e.target.value)}
                                            required
                                        />
                                        {errors.scheduled_date && <p className="text-sm text-red-600">{errors.scheduled_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_time">Time *</Label>
                                        <Select value={data.scheduled_time} onValueChange={(value) => setData('scheduled_time', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.scheduled_time && <p className="text-sm text-red-600">{errors.scheduled_time}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                                    <Select value={String(data.duration_minutes)} onValueChange={(value) => setData('duration_minutes', parseInt(value))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 minutes</SelectItem>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="45">45 minutes</SelectItem>
                                            <SelectItem value="60">60 minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.duration_minutes && <p className="text-sm text-red-600">{errors.duration_minutes}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned_user_id">Assign Sales Rep (Optional)</Label>
                                    <Select value={data.assigned_user_id || undefined} onValueChange={(value) => setData('assigned_user_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Unassigned - Select to assign" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {salesReps.map((rep) => (
                                                <SelectItem key={rep.id} value={String(rep.id)}>
                                                    {rep.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.assigned_user_id && <p className="text-sm text-red-600">{errors.assigned_user_id}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Verification & Requirements</CardTitle>
                                <CardDescription>Document verification and deposit</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="insurance_verified"
                                        checked={data.insurance_verified}
                                        onCheckedChange={handleInsuranceChange}
                                    />
                                    <Label htmlFor="insurance_verified" className="cursor-pointer">
                                        Insurance Verified
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="license_verified"
                                        checked={data.license_verified}
                                        onCheckedChange={handleLicenseChange}
                                    />
                                    <Label htmlFor="license_verified" className="cursor-pointer">
                                        Driver's License Verified
                                    </Label>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deposit_amount">Deposit Amount (₱)</Label>
                                    <Input 
                                        id="deposit_amount" 
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.deposit_amount}
                                        onChange={(e) => setData('deposit_amount', parseFloat(e.target.value) || 0)}
                                    />
                                    {errors.deposit_amount && <p className="text-sm text-red-600">{errors.deposit_amount}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Additional notes or special requirements"
                                        rows={3}
                                    />
                                    {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>• Verify customer's driver's license and insurance</p>
                                <p>• E-signature required before test drive</p>
                                <p>• GPS tracking automatically enabled</p>
                                <p>• Sales rep should accompany customer</p>
                                <p>• Return vehicle with same fuel level</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
