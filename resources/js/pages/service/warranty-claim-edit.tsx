import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Save,
    AlertCircle,
    Plus,
    Trash2,
} from 'lucide-react';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'Warranty Claims',
        href: '/service/warranty-claims',
    },
    {
        title: 'Edit Warranty Claim',
        href: '#',
    },
];

interface Branch {
    id: number;
    name: string;
}

interface Customer {
    id: number;
    customer_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

interface VehicleModel {
    id: number;
    make: string;
    model: string;
    year: number;
}

interface VehicleUnit {
    id: number;
    vehicle_model_id: number;
    vin: string;
    stock_number: string;
    odometer: number;
    vehicle_model?: VehicleModel;
}

interface PartInventory {
    id: number;
    part_number: string;
    part_name: string;
    selling_price: number;
    unit_cost: number;
}

interface ServiceType {
    id: number;
    name: string;
    code: string;
    category: string;
    base_price: number;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Part {
    part_inventory_id: number | null;
    part_number: string;
    part_name: string;
    description: string;
    quantity: number;
    unit_price: number;
}

interface Service {
    service_type_id: number | null;
    service_code: string;
    service_name: string;
    description: string;
    labor_hours: number;
    labor_rate: number;
}

interface WarrantyClaim {
    id: number;
    claim_id: string;
    branch_id: number;
    customer_id: number | null;
    vehicle_unit_id: number | null;
    claim_type: string;
    claim_date: string;
    incident_date: string | null;
    failure_description: string;
    diagnosis: string | null;
    repair_actions: string | null;
    odometer_reading: number | null;
    warranty_type: string | null;
    warranty_provider: string | null;
    warranty_number: string | null;
    warranty_start_date: string | null;
    warranty_end_date: string | null;
    status: string;
    assigned_to: number | null;
    notes: string | null;
    currency: string;
    branch?: Branch;
    parts?: Array<{
        part_inventory_id: number | null;
        part_number: string | null;
        part_name: string;
        description: string | null;
        quantity: number;
        unit_price: number;
    }>;
    services?: Array<{
        service_type_id: number | null;
        service_code: string | null;
        service_name: string;
        description: string | null;
        labor_hours: number;
        labor_rate: number;
    }>;
}

interface Props extends PageProps {
    claim: WarrantyClaim;
    customers: Customer[];
    vehicleUnits: VehicleUnit[];
    partsInventory: PartInventory[];
    serviceTypes: ServiceType[];
    users: User[];
}

export default function WarrantyClaimEdit({ claim, customers, vehicleUnits, partsInventory, serviceTypes, users, auth, errors }: Props) {
    const { data, setData, put, processing } = useForm({
        customer_id: claim.customer_id?.toString() || '',
        vehicle_unit_id: claim.vehicle_unit_id?.toString() || '',
        claim_type: claim.claim_type,
        claim_date: claim.claim_date,
        incident_date: claim.incident_date || '',
        failure_description: claim.failure_description,
        diagnosis: claim.diagnosis || '',
        repair_actions: claim.repair_actions || '',
        odometer_reading: claim.odometer_reading?.toString() || '',
        warranty_type: claim.warranty_type || '',
        warranty_provider: claim.warranty_provider || '',
        warranty_number: claim.warranty_number || '',
        warranty_start_date: claim.warranty_start_date || '',
        warranty_end_date: claim.warranty_end_date || '',
        status: claim.status,
        assigned_to: claim.assigned_to?.toString() || '',
        notes: claim.notes || '',
        parts: (claim.parts || []).map(p => ({
            part_inventory_id: p.part_inventory_id,
            part_number: p.part_number || '',
            part_name: p.part_name,
            description: p.description || '',
            quantity: p.quantity,
            unit_price: p.unit_price,
        })) as Part[],
        services: (claim.services || []).map(s => ({
            service_type_id: s.service_type_id,
            service_code: s.service_code || '',
            service_name: s.service_name,
            description: s.description || '',
            labor_hours: s.labor_hours,
            labor_rate: s.labor_rate,
        })) as Service[],
        currency: claim.currency,
    });

    const [selectedVehicle, setSelectedVehicle] = useState<VehicleUnit | null>(null);
    const fieldError = (field: string): string | undefined => {
        return (errors as Record<string, string | undefined>)[field];
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/service/warranty-claims/${claim.id}`);
    };

    const addPart = () => {
        setData('parts', [
            ...data.parts,
            {
                part_inventory_id: null,
                part_number: '',
                part_name: '',
                description: '',
                quantity: 1,
                unit_price: 0,
            },
        ]);
    };

    const removePart = (index: number) => {
        const updatedParts = data.parts.filter((_, i) => i !== index);
        setData('parts', updatedParts);
    };

    const updatePart = (index: number, field: keyof Part, value: any) => {
        const updatedParts = [...data.parts];
        updatedParts[index] = { ...updatedParts[index], [field]: value };
        setData('parts', updatedParts);
    };

    const handlePartInventoryChange = (index: number, partId: string) => {
        const part = partsInventory.find(p => p.id === parseInt(partId));
        if (part) {
            updatePart(index, 'part_inventory_id', part.id);
            updatePart(index, 'part_number', part.part_number);
            updatePart(index, 'part_name', part.part_name);
            updatePart(index, 'unit_price', part.selling_price);
        }
    };

    const addService = () => {
        setData('services', [
            ...data.services,
            {
                service_type_id: null,
                service_code: '',
                service_name: '',
                description: '',
                labor_hours: 1,
                labor_rate: 0,
            },
        ]);
    };

    const removeService = (index: number) => {
        const updatedServices = data.services.filter((_, i) => i !== index);
        setData('services', updatedServices);
    };

    const updateService = (index: number, field: keyof Service, value: any) => {
        const updatedServices = [...data.services];
        updatedServices[index] = { ...updatedServices[index], [field]: value };
        setData('services', updatedServices);
    };

    const handleServiceTypeChange = (index: number, serviceId: string) => {
        const service = serviceTypes.find(s => s.id === parseInt(serviceId));
        if (service) {
            updateService(index, 'service_type_id', service.id);
            updateService(index, 'service_code', service.code);
            updateService(index, 'service_name', service.name);
            updateService(index, 'labor_rate', service.base_price);
        }
    };

    const handleVehicleChange = (vehicleId: string) => {
        setData('vehicle_unit_id', vehicleId);
        const vehicle = vehicleUnits.find(v => v.id === parseInt(vehicleId));
        setSelectedVehicle(vehicle || null);
        if (vehicle && vehicle.odometer) {
            setData('odometer_reading', vehicle.odometer.toString());
        }
    };

    const calculatePartsTotal = () => {
        return data.parts.reduce((sum, part) => sum + (part.quantity * part.unit_price), 0);
    };

    const calculateServicesTotal = () => {
        return data.services.reduce((sum, service) => sum + (service.labor_hours * service.labor_rate), 0);
    };

    const calculateGrandTotal = () => {
        return calculatePartsTotal() + calculateServicesTotal();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Claim ${claim.claim_id}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold">Edit Warranty Claim</h1>
                        <Badge>{claim.claim_id}</Badge>
                    </div>
                    <Link href="/service/warranty-claims">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Claims
                        </Button>
                    </Link>
                </div>

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
                                                <strong className="capitalize">
                                                    {field.replace(/_/g, ' ').replace(/\./g, ' ')}
                                                </strong>: {message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content (2/3) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Claim details and description</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="claim_type">Claim Type *</Label>
                                            <Select
                                                value={data.claim_type}
                                                onValueChange={(value) => setData('claim_type', value)}
                                                required
                                            >
                                                <SelectTrigger className={errors.claim_type ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select claim type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="parts">Parts Only</SelectItem>
                                                    <SelectItem value="labor">Labor Only</SelectItem>
                                                    <SelectItem value="both">Parts & Labor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.claim_type && <p className="text-sm text-red-600">{errors.claim_type}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="claim_date">Claim Date *</Label>
                                            <Input
                                                id="claim_date"
                                                type="date"
                                                value={data.claim_date}
                                                onChange={(e) => setData('claim_date', e.target.value)}
                                                className={errors.claim_date ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.claim_date && <p className="text-sm text-red-600">{errors.claim_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="incident_date">Incident Date</Label>
                                            <Input
                                                id="incident_date"
                                                type="date"
                                                value={data.incident_date}
                                                onChange={(e) => setData('incident_date', e.target.value)}
                                                className={errors.incident_date ? 'border-red-500' : ''}
                                            />
                                            {errors.incident_date && <p className="text-sm text-red-600">{errors.incident_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status *</Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) => setData('status', value)}
                                                required
                                            >
                                                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="submitted">Submitted</SelectItem>
                                                    <SelectItem value="under_review">Under Review</SelectItem>
                                                    <SelectItem value="approved">Approved</SelectItem>
                                                    <SelectItem value="partially_approved">Partially Approved</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                    <SelectItem value="paid">Paid</SelectItem>
                                                    <SelectItem value="closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="failure_description">Failure Description *</Label>
                                        <Textarea
                                            id="failure_description"
                                            value={data.failure_description}
                                            onChange={(e) => setData('failure_description', e.target.value)}
                                            className={errors.failure_description ? 'border-red-500' : ''}
                                            placeholder="Describe the failure or issue in detail..."
                                            rows={4}
                                            required
                                        />
                                        {errors.failure_description && <p className="text-sm text-red-600">{errors.failure_description}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="diagnosis">Diagnosis</Label>
                                        <Textarea
                                            id="diagnosis"
                                            value={data.diagnosis}
                                            onChange={(e) => setData('diagnosis', e.target.value)}
                                            className={errors.diagnosis ? 'border-red-500' : ''}
                                            placeholder="Technical diagnosis of the issue..."
                                            rows={3}
                                        />
                                        {errors.diagnosis && <p className="text-sm text-red-600">{errors.diagnosis}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="repair_actions">Repair Actions</Label>
                                        <Textarea
                                            id="repair_actions"
                                            value={data.repair_actions}
                                            onChange={(e) => setData('repair_actions', e.target.value)}
                                            className={errors.repair_actions ? 'border-red-500' : ''}
                                            placeholder="Actions taken to repair the issue..."
                                            rows={3}
                                        />
                                        {errors.repair_actions && <p className="text-sm text-red-600">{errors.repair_actions}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer & Vehicle Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer & Vehicle Information</CardTitle>
                                    <CardDescription>Select customer and associated vehicle</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_id">Customer</Label>
                                            <Select
                                                value={data.customer_id}
                                                onValueChange={(value) => setData('customer_id', value)}
                                            >
                                                <SelectTrigger className={errors.customer_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select customer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.first_name} {customer.last_name} ({customer.customer_id})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="vehicle_unit_id">Vehicle</Label>
                                            <Select
                                                value={data.vehicle_unit_id}
                                                onValueChange={handleVehicleChange}
                                            >
                                                <SelectTrigger className={errors.vehicle_unit_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select vehicle" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicleUnits.map((vehicle) => (
                                                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                                            {vehicle.vehicle_model ?
                                                                `${vehicle.vehicle_model.year} ${vehicle.vehicle_model.make} ${vehicle.vehicle_model.model}`
                                                                : vehicle.vin} - {vehicle.vin.slice(-6)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.vehicle_unit_id && <p className="text-sm text-red-600">{errors.vehicle_unit_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="odometer_reading">Odometer Reading (km)</Label>
                                            <Input
                                                id="odometer_reading"
                                                type="number"
                                                value={data.odometer_reading}
                                                onChange={(e) => setData('odometer_reading', e.target.value)}
                                                className={errors.odometer_reading ? 'border-red-500' : ''}
                                                placeholder="0"
                                            />
                                            {errors.odometer_reading && <p className="text-sm text-red-600">{errors.odometer_reading}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Warranty Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Warranty Information</CardTitle>
                                    <CardDescription>Warranty coverage details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="warranty_type">Warranty Type</Label>
                                            <Input
                                                id="warranty_type"
                                                value={data.warranty_type}
                                                onChange={(e) => setData('warranty_type', e.target.value)}
                                                className={errors.warranty_type ? 'border-red-500' : ''}
                                                placeholder="e.g., Manufacturer, Extended"
                                            />
                                            {errors.warranty_type && <p className="text-sm text-red-600">{errors.warranty_type}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="warranty_provider">Warranty Provider</Label>
                                            <Input
                                                id="warranty_provider"
                                                value={data.warranty_provider}
                                                onChange={(e) => setData('warranty_provider', e.target.value)}
                                                className={errors.warranty_provider ? 'border-red-500' : ''}
                                                placeholder="Provider name"
                                            />
                                            {errors.warranty_provider && <p className="text-sm text-red-600">{errors.warranty_provider}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="warranty_number">Warranty Number</Label>
                                            <Input
                                                id="warranty_number"
                                                value={data.warranty_number}
                                                onChange={(e) => setData('warranty_number', e.target.value)}
                                                className={errors.warranty_number ? 'border-red-500' : ''}
                                                placeholder="Warranty/Policy number"
                                            />
                                            {errors.warranty_number && <p className="text-sm text-red-600">{errors.warranty_number}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="warranty_start_date">Warranty Start Date</Label>
                                            <Input
                                                id="warranty_start_date"
                                                type="date"
                                                value={data.warranty_start_date}
                                                onChange={(e) => setData('warranty_start_date', e.target.value)}
                                                className={errors.warranty_start_date ? 'border-red-500' : ''}
                                            />
                                            {errors.warranty_start_date && <p className="text-sm text-red-600">{errors.warranty_start_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="warranty_end_date">Warranty End Date</Label>
                                            <Input
                                                id="warranty_end_date"
                                                type="date"
                                                value={data.warranty_end_date}
                                                onChange={(e) => setData('warranty_end_date', e.target.value)}
                                                className={errors.warranty_end_date ? 'border-red-500' : ''}
                                            />
                                            {errors.warranty_end_date && <p className="text-sm text-red-600">{errors.warranty_end_date}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Parts - Same as create page */}
                            {(data.claim_type === 'parts' || data.claim_type === 'both') && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Parts</CardTitle>
                                                <CardDescription>Parts used in this claim</CardDescription>
                                            </div>
                                            <Button type="button" size="sm" onClick={addPart}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Part
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {data.parts.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No parts added yet. Click "Add Part" to add parts to this claim.
                                            </p>
                                        ) : (
                                            data.parts.map((part, index) => {
                                                const partInventoryError = fieldError(`parts.${index}.part_inventory_id`);
                                                const partQuantityError = fieldError(`parts.${index}.quantity`);
                                                const partUnitPriceError = fieldError(`parts.${index}.unit_price`);

                                                return (
                                                    <Card key={index} className="p-4">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                            <Badge>Part #{index + 1}</Badge>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removePart(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Select from Inventory</Label>
                                                                <Select
                                                                    value={part.part_inventory_id?.toString() || ''}
                                                                    onValueChange={(value) => handlePartInventoryChange(index, value)}
                                                                >
                                                                    <SelectTrigger className={partInventoryError ? 'border-red-500' : ''} aria-invalid={!!partInventoryError}>
                                                                        <SelectValue placeholder="Select part" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {partsInventory.map((p) => (
                                                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                                                {p.part_number} - {p.part_name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {partInventoryError && (
                                                                    <p className="text-sm text-red-600">{partInventoryError}</p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Part Number</Label>
                                                                <Input
                                                                    value={part.part_number || ''}
                                                                    readOnly
                                                                    placeholder="Part number"
                                                                    className="bg-muted"
                                                                />
                                                            </div>

                                                            <div className="space-y-2 md:col-span-2">
                                                                <Label>Part Name *</Label>
                                                                <Input
                                                                    value={part.part_name || ''}
                                                                    readOnly
                                                                    placeholder="Part name"
                                                                    className="bg-muted"
                                                                />
                                                            </div>

                                                            <div className="space-y-2 md:col-span-2">
                                                                <Label>Description</Label>
                                                                <Textarea
                                                                    value={part.description}
                                                                    onChange={(e) => updatePart(index, 'description', e.target.value)}
                                                                    placeholder="Additional details"
                                                                    rows={2}
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Quantity *</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={part.quantity}
                                                                    onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 0)}
                                                                    min="1"
                                                                    required
                                                                    className={partQuantityError ? 'border-red-500' : ''}
                                                                />
                                                                {partQuantityError && (
                                                                    <p className="text-sm text-red-600">{partQuantityError}</p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Unit Price (₱) *</Label>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={part.unit_price}
                                                                    onChange={(e) => updatePart(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                                    min="0"
                                                                    required
                                                                    className={partUnitPriceError ? 'border-red-500' : ''}
                                                                />
                                                                {partUnitPriceError && (
                                                                    <p className="text-sm text-red-600">{partUnitPriceError}</p>
                                                                )}
                                                            </div>

                                                            <div className="md:col-span-2">
                                                                <p className="text-sm font-semibold">
                                                                    Subtotal: ₱{(part.quantity * part.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })
                                    )}

                                        {data.parts.length > 0 && (
                                            <div className="border-t pt-4">
                                                <p className="text-lg font-bold">
                                                    Parts Total: ₱{calculatePartsTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Services - Same structure as create page... [truncated for brevity - would be identical] */}
                            {(data.claim_type === 'labor' || data.claim_type === 'both') && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Labor / Services</CardTitle>
                                                <CardDescription>Services performed in this claim</CardDescription>
                                            </div>
                                            <Button type="button" size="sm" onClick={addService}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Service
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {data.services.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No services added yet. Click "Add Service" to add services to this claim.
                                            </p>
                                        ) : (
                                            data.services.map((service, index) => {
                                                const serviceTypeError = fieldError(`services.${index}.service_type_id`);
                                                const laborHoursError = fieldError(`services.${index}.labor_hours`);
                                                const laborRateError = fieldError(`services.${index}.labor_rate`);

                                                return (
                                                    <Card key={index} className="p-4">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <Badge>Service #{index + 1}</Badge>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeService(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Select Service Type</Label>
                                                                    <Select
                                                                        value={service.service_type_id?.toString() || ''}
                                                                        onValueChange={(value) => handleServiceTypeChange(index, value)}
                                                                    >
                                                                        <SelectTrigger className={serviceTypeError ? 'border-red-500' : ''} aria-invalid={!!serviceTypeError}>
                                                                            <SelectValue placeholder="Select service" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {serviceTypes.map((s) => (
                                                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                                                    {s.code} - {s.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {serviceTypeError && (
                                                                        <p className="text-sm text-red-600">{serviceTypeError}</p>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label>Service Code</Label>
                                                                    <Input
                                                                        value={service.service_code || ''}
                                                                        readOnly
                                                                        placeholder="Service code"
                                                                        className="bg-muted"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2 md:col-span-2">
                                                                    <Label>Service Name *</Label>
                                                                    <Input
                                                                        value={service.service_name || ''}
                                                                        readOnly
                                                                        placeholder="Service name"
                                                                        className="bg-muted"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2 md:col-span-2">
                                                                    <Label>Description</Label>
                                                                    <Textarea
                                                                        value={service.description}
                                                                        onChange={(e) => updateService(index, 'description', e.target.value)}
                                                                        placeholder="Additional details"
                                                                        rows={2}
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label>Labor Hours *</Label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={service.labor_hours}
                                                                        onChange={(e) => updateService(index, 'labor_hours', parseFloat(e.target.value) || 0)}
                                                                        min="0.01"
                                                                        required
                                                                        className={laborHoursError ? 'border-red-500' : ''}
                                                                    />
                                                                    {laborHoursError && (
                                                                        <p className="text-sm text-red-600">{laborHoursError}</p>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label>Labor Rate (₱/hour) *</Label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={service.labor_rate}
                                                                        onChange={(e) => updateService(index, 'labor_rate', parseFloat(e.target.value) || 0)}
                                                                        min="0"
                                                                        required
                                                                        className={laborRateError ? 'border-red-500' : ''}
                                                                    />
                                                                    {laborRateError && (
                                                                        <p className="text-sm text-red-600">{laborRateError}</p>
                                                                    )}
                                                                </div>

                                                                <div className="md:col-span-2">
                                                                    <p className="text-sm font-semibold">
                                                                        Subtotal: ₱{(service.labor_hours * service.labor_rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })
                                        )}

                                        {data.services.length > 0 && (
                                            <div className="border-t pt-4">
                                                <p className="text-lg font-bold">
                                                    Services Total: ₱{calculateServicesTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className={errors.notes ? 'border-red-500' : ''}
                                        placeholder="Any additional notes or comments..."
                                        rows={4}
                                    />
                                    {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar (1/3) */}
                        <div className="space-y-6">
                            {/* Branch Display (Read-only) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Branch</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-muted-foreground">Branch (Cannot be changed)</p>
                                        <p className="font-medium">{claim.branch?.name}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Assignment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assignment</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="assigned_to">Assigned To</Label>
                                        <Select
                                            value={data.assigned_to}
                                            onValueChange={(value) => setData('assigned_to', value)}
                                        >
                                            <SelectTrigger className={errors.assigned_to ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.assigned_to && <p className="text-sm text-red-600">{errors.assigned_to}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Claim Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Claim Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Currency:</span>
                                        <Badge>{data.currency}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Parts Total:</span>
                                        <span className="font-semibold">
                                            ₱{calculatePartsTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Labor Total:</span>
                                        <span className="font-semibold">
                                            ₱{calculateServicesTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                        <span>Grand Total:</span>
                                        <span>
                                            ₱{calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <Card>
                                <CardContent className="pt-6 space-y-2">
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Updating...' : 'Update Warranty Claim'}
                                    </Button>
                                    <Link href="/service/warranty-claims">
                                        <Button type="button" variant="outline" className="w-full">
                                            Cancel
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
