import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, X, AlertCircle, Wrench, Car, User, Calendar, Camera, MapPin } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'PMS Work Orders',
        href: '/service/pms-work-orders',
    },
    {
        title: 'Create Work Order',
        href: '/service/pms-work-orders/create',
    },
];

interface VehicleUnit {
    id: number;
    stock_number: string;
    vin: string;
    vehicle_model_id: number | null;
    odometer: number;
    branch_id: number;
    color_exterior: string | null;
    vehicle_model?: {
        id: number;
        make: string;
        model: string;
        year: number;
        trim: string | null;
    };
}

interface Customer {
    id: number;
    customer_id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    customer_type: 'individual' | 'corporate';
}

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface ServiceType {
    id: number;
    name: string;
    category: string;
    interval_type: string;
    interval_value: number | null;
}

interface Technician {
    id: number;
    name: string;
    email: string;
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    branches: Branch[] | null;
    serviceTypes: ServiceType[];
    technicians: Technician[];
    vehicles: VehicleUnit[];
    customers: Customer[];
    auth: {
        user: {
            roles?: Role[];
            branch_id?: number;
        };
    };
}

export default function PMSWorkOrderCreate({ branches, serviceTypes, technicians, vehicles, customers, auth }: Props) {
    const isAdmin = auth.user.roles?.some(role => role.name === 'admin' || role.name === 'auditor');

    const { data, setData, post, processing, errors, transform } = useForm({
        branch_id: !isAdmin && auth.user.branch_id ? auth.user.branch_id.toString() : '',
        service_type_id: '',
        job_type: 'pms',
        reference_number: '',
        requested_at: new Date().toISOString().slice(0, 10),
        actual_service_date: '',

        // Vehicle Selection (NEW)
        vehicle_unit_id: '',

        // Vehicle Details (snapshot - auto-filled from selection)
        vehicle_plate_number: '',
        vehicle_vin: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year: '',
        current_mileage: '',
        last_service_mileage: '',

        // Customer Selection (NEW)
        customer_id: '',

        // Customer Details (snapshot - auto-filled from selection)
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_type: 'individual',

        // Scheduling
        status: 'pending',
        priority: 'normal',
        scheduled_at: '',
        due_date: '',
        started_at: '',
        completed_at: '',

        // Assignment
        assigned_to: 'unassigned',
        assigned_technician_name: '',

        // Estimates
        estimated_hours: '',
        estimated_cost: '',
        actual_hours: '',
        actual_cost: '',
        labor_cost: '',

        // PMS Tracking (CHANGED TO INPUT)
        pms_interval_km: '',
        time_interval_months: '',

        // Service Location
        service_location_lat: '',
        service_location_lng: '',
        service_location_address: '',

        // Metadata
        is_warranty_claim: false,
        warranty_charge_to: 'none',
        customer_concerns: '',
        diagnostic_findings: '',
        service_details: '',
        recurring_issue_notes: '',
        notes: '',

        // Fraud Prevention
        requires_photo_verification: true,
        minimum_photos_required: '2',

        // Parts list
        parts: [
            { part_number: '', description: '', quantity: '', unit_cost: '', unit_price: '' },
        ],
    });

    const [odometerValidation, setOdometerValidation] = useState<any>(null);
    const [validatingOdometer, setValidatingOdometer] = useState(false);

    const updatePart = (index: number, field: string, value: string) => {
        const updated = [...(data.parts as any[])];
        updated[index] = { ...updated[index], [field]: value };
        setData('parts', updated);
    };

    const addPartRow = () => {
        setData('parts', [
            ...(data.parts as any[]),
            { part_number: '', description: '', quantity: '', unit_cost: '', unit_price: '' },
        ]);
    };

    const removePartRow = (index: number) => {
        const updated = [...(data.parts as any[])];
        updated.splice(index, 1);
        setData('parts', updated.length ? updated : [{ part_number: '', description: '', quantity: '', unit_cost: '', unit_price: '' }]);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        transform((formData) => ({
            ...formData,
            assigned_to: formData.assigned_to && formData.assigned_to !== 'unassigned' ? formData.assigned_to : null,
            service_type_id: formData.service_type_id || null,
            requested_at: formData.requested_at || null,
            actual_service_date: formData.actual_service_date || null,
            started_at: formData.started_at || null,
            completed_at: formData.completed_at || null,
        }));
        post('/service/pms-work-orders', {
            preserveScroll: true,
        });
    };

    // Validate odometer reading
    const validateOdometer = async () => {
        if (!data.vehicle_vin || !data.current_mileage) {
            return;
        }

        setValidatingOdometer(true);
        try {
            const response = await fetch('/service/validate-odometer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    vin: data.vehicle_vin,
                    reading: parseInt(data.current_mileage),
                }),
            });
            const result = await response.json();
            setOdometerValidation(result);
        } catch (error) {
            console.error('Odometer validation failed:', error);
        } finally {
            setValidatingOdometer(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create PMS Work Order" />

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
                        <Link href="/service/pms-work-orders">
                            <Button variant="outline" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Work Orders
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Wrench className="h-6 w-6" />
                                Create PMS Work Order
                            </h1>
                            <p className="text-muted-foreground">Create a new preventive maintenance service work order</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/service/pms-work-orders">
                            <Button variant="outline" type="button">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Work Order'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Branch Assignment (Admin Only) */}
                        {isAdmin && branches && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Branch Assignment</CardTitle>
                                    <CardDescription>Select which branch this work order belongs to (Required)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="branch_id">Branch *</Label>
                                        <Select value={data.branch_id} onValueChange={(value) => setData('branch_id', value)} required>
                                            <SelectTrigger className={errors.branch_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select branch (Required)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches.map((branch) => (
                                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                                        {branch.name} ({branch.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.branch_id && <p className="text-sm text-red-600">{errors.branch_id}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Vehicle Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    Vehicle Information
                                </CardTitle>
                                <CardDescription>Select vehicle from existing units</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_unit_id">Vehicle Unit *</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Select
                                                value={data.vehicle_unit_id}
                                                onValueChange={(value) => {
                                                    setData('vehicle_unit_id', value);
                                                    // Auto-fill vehicle details
                                                    const vehicle = vehicles.find(v => v.id.toString() === value);
                                                    const model = vehicle?.vehicle_model;
                                                    if (vehicle && model) {
                                                        setData({
                                                            ...data,
                                                            vehicle_unit_id: value,
                                                            vehicle_vin: vehicle.vin,
                                                            vehicle_plate_number: '', // No plate_number in vehicle_units
                                                            vehicle_make: model.make,
                                                            vehicle_model: model.model,
                                                            vehicle_year: model.year?.toString() ?? '',
                                                            current_mileage: vehicle.odometer?.toString() ?? '',
                                                        });
                                                    } else if (vehicle) {
                                                        setData({
                                                            ...data,
                                                            vehicle_unit_id: value,
                                                            vehicle_vin: vehicle.vin,
                                                            vehicle_plate_number: '',
                                                            vehicle_make: '',
                                                            vehicle_model: '',
                                                            vehicle_year: '',
                                                            current_mileage: vehicle.odometer?.toString() ?? '',
                                                        });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className={errors.vehicle_unit_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a vehicle unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicles.map((vehicle) => (
                                                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                                            {vehicle.stock_number} - {vehicle.vehicle_model?.make ?? 'N/A'} {vehicle.vehicle_model?.model ?? ''} ({vehicle.vin})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.vehicle_unit_id && <p className="text-sm text-red-600 mt-1">{errors.vehicle_unit_id}</p>}
                                        </div>
                                        <Link href="/inventory/vehicles/create">
                                            <Button type="button" variant="outline">
                                                Create Vehicle
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {/* Show selected vehicle details (read-only) */}
                                {data.vehicle_unit_id && (
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">VIN</Label>
                                            <p className="font-mono text-sm">{data.vehicle_vin}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Make & Model</Label>
                                            <p className="text-sm">{data.vehicle_make} {data.vehicle_model}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Year</Label>
                                            <p className="text-sm">{data.vehicle_year}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Current Mileage - Editable */}
                                <div className="space-y-2">
                                    <Label htmlFor="current_mileage">Current Mileage (km) *</Label>
                                    <Input
                                        id="current_mileage"
                                        type="number"
                                        value={data.current_mileage}
                                        onChange={(e) => setData('current_mileage', e.target.value)}
                                        onBlur={validateOdometer}
                                        className={errors.current_mileage ? 'border-red-500' : ''}
                                        placeholder="Enter current odometer reading"
                                        required
                                    />
                                    {errors.current_mileage && <p className="text-sm text-red-600">{errors.current_mileage}</p>}
                                    {validatingOdometer && <p className="text-sm text-blue-600">Validating odometer reading...</p>}
                                    {odometerValidation && (
                                        <div className={`text-sm p-3 rounded-md ${odometerValidation.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                            {odometerValidation.message}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_service_mileage">Last Service Mileage (km)</Label>
                                    <Input
                                        id="last_service_mileage"
                                        type="number"
                                        value={data.last_service_mileage}
                                        onChange={(e) => setData('last_service_mileage', e.target.value)}
                                        placeholder="Enter last service mileage"
                                    />
                                    {errors.last_service_mileage && <p className="text-sm text-red-600">{errors.last_service_mileage}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                                <CardDescription>Select customer from existing records</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_id">Customer *</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Select
                                                value={data.customer_id}
                                                onValueChange={(value) => {
                                                    setData('customer_id', value);
                                                    // Auto-fill customer details
                                                    const customer = customers.find(c => c.id.toString() === value);
                                                    if (customer) {
                                                        setData({
                                                            ...data,
                                                            customer_id: value,
                                                            customer_name: `${customer.first_name} ${customer.last_name}`,
                                                            customer_phone: customer.phone || '',
                                                            customer_email: customer.email || '',
                                                            customer_type: customer.customer_type,
                                                        });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className={errors.customer_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a customer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.first_name} {customer.last_name} - {customer.customer_id} ({customer.customer_type})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.customer_id && <p className="text-sm text-red-600 mt-1">{errors.customer_id}</p>}
                                        </div>
                                        <Link href="/sales/customer-experience/create">
                                            <Button type="button" variant="outline">
                                                Create Customer
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {/* Show selected customer details (read-only) */}
                                {data.customer_id && (
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Customer Name</Label>
                                            <p className="text-sm">{data.customer_name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Type</Label>
                                            <p className="text-sm capitalize">{data.customer_type}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Phone</Label>
                                            <p className="text-sm">{data.customer_phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Email</Label>
                                            <p className="text-sm">{data.customer_email || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Concerns */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Concerns & Notes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_concerns">Customer Concerns</Label>
                                    <Textarea
                                        id="customer_concerns"
                                        value={data.customer_concerns}
                                        onChange={(e) => setData('customer_concerns', e.target.value)}
                                        placeholder="Describe any issues or concerns reported by the customer..."
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="service_details">Details of PMS / Repair</Label>
                                    <Textarea
                                        id="service_details"
                                        value={data.service_details}
                                        onChange={(e) => setData('service_details', e.target.value)}
                                        placeholder="Work performed, steps taken, findings..."
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="diagnostic_findings">Diagnostic Findings</Label>
                                    <Textarea
                                        id="diagnostic_findings"
                                        value={data.diagnostic_findings}
                                        onChange={(e) => setData('diagnostic_findings', e.target.value)}
                                        placeholder="Diagnosis results, fault codes, inspection notes"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recurring_issue_notes">Recurring Issue Notes</Label>
                                    <Textarea
                                        id="recurring_issue_notes"
                                        value={data.recurring_issue_notes}
                                        onChange={(e) => setData('recurring_issue_notes', e.target.value)}
                                        placeholder="Battery health, charger issues, repeat concerns..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_warranty_claim"
                                        checked={data.is_warranty_claim}
                                        onCheckedChange={(checked) => setData('is_warranty_claim', Boolean(checked))}
                                    />
                                    <Label htmlFor="is_warranty_claim">Warranty claim</Label>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="warranty_charge_to">Charge To</Label>
                                    <Select value={data.warranty_charge_to} onValueChange={(value) => setData('warranty_charge_to', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="wuling">Wuling principal</SelectItem>
                                            <SelectItem value="supplier">Supplier</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Internal Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any additional notes or observations..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parts & Materials */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Parts & Materials</CardTitle>
                                <CardDescription>Track replaced parts with quantities and pricing</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(data.parts as any[]).map((part, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-end border rounded-md p-3">
                                        <div className="md:col-span-2 space-y-1">
                                            <Label className="text-xs">Part No.</Label>
                                            <Input
                                                value={part.part_number}
                                                onChange={(e) => updatePart(index, 'part_number', e.target.value)}
                                                placeholder="SKU / PN"
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-1">
                                            <Label className="text-xs">Description</Label>
                                            <Input
                                                value={part.description}
                                                onChange={(e) => updatePart(index, 'description', e.target.value)}
                                                placeholder="Part description"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <Label className="text-xs">Qty</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={part.quantity}
                                                onChange={(e) => updatePart(index, 'quantity', e.target.value)}
                                                placeholder="1"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <Label className="text-xs">Unit Cost</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={part.unit_cost}
                                                onChange={(e) => updatePart(index, 'unit_cost', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <Label className="text-xs">Unit SRP</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={part.unit_price}
                                                onChange={(e) => updatePart(index, 'unit_price', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="md:col-span-12 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removePartRow(index)}
                                                className="text-destructive"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" size="sm" onClick={addPartRow} className="w-full">
                                    Add Part
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Service Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="service_type_id">Service Type</Label>
                                    <Select value={data.service_type_id} onValueChange={(value) => setData('service_type_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select service type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name} ({type.category})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="job_type">Type</Label>
                                    <Select value={data.job_type} onValueChange={(value) => setData('job_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pms">PMS</SelectItem>
                                            <SelectItem value="warranty">Warranty</SelectItem>
                                            <SelectItem value="accident">Accident</SelectItem>
                                            <SelectItem value="customer_pay">Customer-pay</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reference_number">Reference Number</Label>
                                    <Input
                                        id="reference_number"
                                        value={data.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                        placeholder="Optional external reference"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="requested_at">Date of Request</Label>
                                        <Input
                                            id="requested_at"
                                            type="date"
                                            value={data.requested_at}
                                            onChange={(e) => setData('requested_at', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="actual_service_date">Date of Actual PMS / Repair</Label>
                                        <Input
                                            id="actual_service_date"
                                            type="date"
                                            value={data.actual_service_date}
                                            onChange={(e) => setData('actual_service_date', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* PMS Tracking */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    PMS Interval Configuration
                                </CardTitle>
                                <CardDescription>Set maintenance interval thresholds</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pms_interval_km">PMS Interval (km) *</Label>
                                    <div className="relative">
                                        <Input
                                            id="pms_interval_km"
                                            type="number"
                                            value={data.pms_interval_km}
                                            onChange={(e) => setData('pms_interval_km', e.target.value)}
                                            placeholder="e.g., 5000"
                                            className={errors.pms_interval_km ? 'border-red-500' : ''}
                                            required
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            km
                                        </span>
                                    </div>
                                    {errors.pms_interval_km && <p className="text-sm text-red-600">{errors.pms_interval_km}</p>}
                                    <p className="text-xs text-muted-foreground">
                                        Next service due at: {data.current_mileage && data.pms_interval_km
                                            ? (parseInt(data.current_mileage) + parseInt(data.pms_interval_km)).toLocaleString()
                                            : '--'} km
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="time_interval_months">Time Interval (months)</Label>
                                    <div className="relative">
                                        <Input
                                            id="time_interval_months"
                                            type="number"
                                            value={data.time_interval_months}
                                            onChange={(e) => setData('time_interval_months', e.target.value)}
                                            placeholder="e.g., 6"
                                            className={errors.time_interval_months ? 'border-red-500' : ''}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            months
                                        </span>
                                    </div>
                                    {errors.time_interval_months && <p className="text-sm text-red-600">{errors.time_interval_months}</p>}
                                    <p className="text-xs text-muted-foreground">
                                        Whichever comes first: mileage or time interval
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_at">Scheduled Date</Label>
                                    <Input
                                        id="scheduled_at"
                                        type="datetime-local"
                                        value={data.scheduled_at}
                                        onChange={(e) => setData('scheduled_at', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned_to">Assign to Technician</Label>
                                    <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select technician (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {technicians.map((tech) => (
                                                <SelectItem key={tech.id} value={tech.id.toString()}>
                                                    {tech.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned_technician_name">Mechanic / Technician Name</Label>
                                    <Input
                                        id="assigned_technician_name"
                                        value={data.assigned_technician_name}
                                        onChange={(e) => setData('assigned_technician_name', e.target.value)}
                                        placeholder="Name of mechanic attending"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estimated_hours">Estimated Hours</Label>
                                    <Input
                                        id="estimated_hours"
                                        type="number"
                                        step="0.5"
                                        value={data.estimated_hours}
                                        onChange={(e) => setData('estimated_hours', e.target.value)}
                                        placeholder="2.5"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estimated_cost">Estimated Cost (PHP)</Label>
                                    <Input
                                        id="estimated_cost"
                                        type="number"
                                        step="0.01"
                                        value={data.estimated_cost}
                                        onChange={(e) => setData('estimated_cost', e.target.value)}
                                        placeholder="5000.00"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="actual_hours">Actual Labor Hours</Label>
                                        <Input
                                            id="actual_hours"
                                            type="number"
                                            step="0.25"
                                            value={data.actual_hours}
                                            onChange={(e) => setData('actual_hours', e.target.value)}
                                            placeholder="0.0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="labor_cost">Labor Cost (PHP)</Label>
                                        <Input
                                            id="labor_cost"
                                            type="number"
                                            step="0.01"
                                            value={data.labor_cost}
                                            onChange={(e) => setData('labor_cost', e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fraud Prevention Settings */}
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="text-blue-900 flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    Fraud Prevention
                                </CardTitle>
                                <CardDescription className="text-blue-800">
                                    Photo evidence requirements
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minimum_photos_required">Minimum Photos Required</Label>
                                    <Select value={data.minimum_photos_required} onValueChange={(value) => setData('minimum_photos_required', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 photo</SelectItem>
                                            <SelectItem value="2">2 photos (Before/After)</SelectItem>
                                            <SelectItem value="3">3 photos</SelectItem>
                                            <SelectItem value="5">5 photos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <p className="text-xs text-blue-700">
                                    Photos will be checked for GPS coordinates and EXIF data to verify service location
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
