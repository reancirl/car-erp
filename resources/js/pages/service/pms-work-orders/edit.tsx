import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Technician {
    id: number;
    name: string;
    email: string;
}

interface ServiceType {
    id: number;
    name: string;
    category: string;
}

interface WorkOrder {
    id: number;
    work_order_number: string;
    branch_id: number;
    branch?: { name: string; code: string } | null;
    service_type_id: number | null;
    reference_number: string | null;
    vehicle_plate_number: string | null;
    vehicle_vin: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    current_mileage: number;
    last_service_mileage: number | null;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    customer_type: 'individual' | 'corporate';
    status: string;
    priority: string;
    scheduled_at: string | null;
    due_date: string | null;
    assigned_to: number | null;
    assigned_technician_name: string | null;
    estimated_hours: string | number | null;
    estimated_cost: string | number | null;
    pms_interval_km: number | null;
    time_interval_months: number | null;
    service_location_lat: number | null;
    service_location_lng: number | null;
    service_location_address: string | null;
    is_warranty_claim: boolean;
    customer_concerns: string | null;
    diagnostic_findings: string | null;
    notes: string | null;
    requires_photo_verification: boolean;
    minimum_photos_required: number;
}

interface Props {
    workOrder: WorkOrder;
    serviceTypes: ServiceType[];
    technicians: Technician[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Service & Parts', href: '/service' },
    { title: 'PMS Work Orders', href: '/service/pms-work-orders' },
    { title: 'Edit Work Order', href: '#' },
];

const STATUS_OPTIONS = ['draft', 'pending', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'overdue'];
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent'];

const formatDateTimeLocal = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formatDate = (value: string | null) => (value ? value.slice(0, 10) : '');

export default function PMSWorkOrderEdit({ workOrder, serviceTypes, technicians }: Props) {
    const { data, setData, put, processing, errors, transform } = useForm({
        branch_id: workOrder.branch_id?.toString() || '',
        service_type_id: workOrder.service_type_id ? workOrder.service_type_id.toString() : '',
        reference_number: workOrder.reference_number || '',
        vehicle_plate_number: workOrder.vehicle_plate_number || '',
        vehicle_vin: workOrder.vehicle_vin || '',
        vehicle_make: workOrder.vehicle_make || '',
        vehicle_model: workOrder.vehicle_model || '',
        vehicle_year: workOrder.vehicle_year?.toString() || '',
        current_mileage: workOrder.current_mileage?.toString() || '',
        last_service_mileage: workOrder.last_service_mileage?.toString() || '',
        customer_name: workOrder.customer_name || '',
        customer_phone: workOrder.customer_phone || '',
        customer_email: workOrder.customer_email || '',
        customer_type: workOrder.customer_type || 'individual',
        status: workOrder.status || 'pending',
        priority: workOrder.priority || 'normal',
        scheduled_at: formatDateTimeLocal(workOrder.scheduled_at),
        due_date: formatDate(workOrder.due_date),
        assigned_to: workOrder.assigned_to ? workOrder.assigned_to.toString() : 'unassigned',
        assigned_technician_name: workOrder.assigned_technician_name || '',
        estimated_hours: workOrder.estimated_hours?.toString() || '',
        estimated_cost: workOrder.estimated_cost?.toString() || '',
        pms_interval_km: workOrder.pms_interval_km?.toString() || '',
        time_interval_months: workOrder.time_interval_months?.toString() || '',
        service_location_lat: workOrder.service_location_lat?.toString() || '',
        service_location_lng: workOrder.service_location_lng?.toString() || '',
        service_location_address: workOrder.service_location_address || '',
        is_warranty_claim: workOrder.is_warranty_claim || false,
        customer_concerns: workOrder.customer_concerns || '',
        diagnostic_findings: workOrder.diagnostic_findings || '',
        notes: workOrder.notes || '',
        requires_photo_verification: workOrder.requires_photo_verification ?? true,
        minimum_photos_required: workOrder.minimum_photos_required?.toString() || '2',
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        transform((formData) => ({
            ...formData,
            assigned_to: formData.assigned_to && formData.assigned_to !== 'unassigned' ? formData.assigned_to : null,
            service_type_id: formData.service_type_id || null,
            scheduled_at: formData.scheduled_at || null,
            due_date: formData.due_date || null,
        }));
        put(route('service.pms-work-orders.update', workOrder.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Work Order - ${workOrder.work_order_number}`} />

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
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

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/pms-work-orders">
                            <Button variant="outline" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Work Orders
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Work Order</h1>
                            <p className="text-muted-foreground">Update PMS work order {workOrder.work_order_number}</p>
                        </div>
                    </div>
                    <Button type="submit" disabled={processing}>
                        <Save className="h-4 w-4 mr-2" />
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Order Details</CardTitle>
                                <CardDescription>Core information about this PMS visit</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="service_type_id">Service Type</Label>
                                    <Select value={data.service_type_id || ''} onValueChange={(value) => setData('service_type_id', value)}>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reference_number">Reference Number</Label>
                                        <Input
                                            id="reference_number"
                                            value={data.reference_number}
                                            onChange={(e) => setData('reference_number', e.target.value)}
                                            placeholder="External reference if any"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pms_interval_km">PMS Interval (KM)</Label>
                                        <Input
                                            id="pms_interval_km"
                                            type="number"
                                            value={data.pms_interval_km}
                                            onChange={(e) => setData('pms_interval_km', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="time_interval_months">Time Interval (months)</Label>
                                        <Input
                                            id="time_interval_months"
                                            type="number"
                                            value={data.time_interval_months}
                                            onChange={(e) => setData('time_interval_months', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option.replace(/_/g, ' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRIORITY_OPTIONS.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Vehicle Information</CardTitle>
                                <CardDescription>Snapshot of the serviced unit</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    ['VIN', 'vehicle_vin'],
                                    ['Plate Number', 'vehicle_plate_number'],
                                    ['Make', 'vehicle_make'],
                                    ['Model', 'vehicle_model'],
                                    ['Year', 'vehicle_year'],
                                    ['Current Mileage', 'current_mileage'],
                                    ['Last Service Mileage', 'last_service_mileage'],
                                ].map(([label, field]) => (
                                    <div key={field} className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">{label}</Label>
                                        <Input
                                            value={(data as any)[field] || ''}
                                            onChange={(e) => setData(field as keyof typeof data, e.target.value)}
                                            readOnly={['vehicle_vin', 'vehicle_make', 'vehicle_model', 'vehicle_year'].includes(field)}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_name">Name</Label>
                                    <Input id="customer_name" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_phone">Phone</Label>
                                    <Input id="customer_phone" value={data.customer_phone} onChange={(e) => setData('customer_phone', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_email">Email</Label>
                                    <Input id="customer_email" type="email" value={data.customer_email} onChange={(e) => setData('customer_email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_type">Customer Type</Label>
                                    <Select value={data.customer_type} onValueChange={(value) => setData('customer_type', value as 'individual' | 'corporate')}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="corporate">Corporate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Scheduling & Assignment</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_at">Scheduled Date</Label>
                                    <Input
                                        id="scheduled_at"
                                        type="datetime-local"
                                        value={data.scheduled_at || ''}
                                        onChange={(e) => setData('scheduled_at', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input id="due_date" type="date" value={data.due_date || ''} onChange={(e) => setData('due_date', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="assigned_to">Assign Technician</Label>
                                    <Select
                                        value={data.assigned_to || ''}
                                        onValueChange={(value) => setData('assigned_to', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select technician" />
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
                                    <Label htmlFor="assigned_technician_name">Technician Notes</Label>
                                    <Input
                                        id="assigned_technician_name"
                                        value={data.assigned_technician_name}
                                        onChange={(e) => setData('assigned_technician_name', e.target.value)}
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
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Notes & Findings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_concerns">Customer Concerns</Label>
                                    <Textarea
                                        id="customer_concerns"
                                        value={data.customer_concerns}
                                        onChange={(e) => setData('customer_concerns', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="diagnostic_findings">Diagnostic Findings</Label>
                                    <Textarea
                                        id="diagnostic_findings"
                                        value={data.diagnostic_findings}
                                        onChange={(e) => setData('diagnostic_findings', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Internal Notes</Label>
                                    <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={3} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_warranty_claim"
                                        checked={data.is_warranty_claim}
                                        onCheckedChange={(checked) => setData('is_warranty_claim', Boolean(checked))}
                                    />
                                    <Label htmlFor="is_warranty_claim">Warranty claim</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="requires_photo_verification"
                                        checked={data.requires_photo_verification}
                                        onCheckedChange={(checked) => setData('requires_photo_verification', Boolean(checked))}
                                    />
                                    <Label htmlFor="requires_photo_verification">Requires photo verification</Label>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minimum_photos_required">Minimum Photos Required</Label>
                                    <Select value={data.minimum_photos_required} onValueChange={(value) => setData('minimum_photos_required', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['1', '2', '3', '5'].map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option} photo{Number(option) > 1 ? 's' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Branch</CardTitle>
                                <CardDescription>Branch assignment (read-only)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium">
                                    {workOrder.branch ? `${workOrder.branch.name} (${workOrder.branch.code})` : 'N/A'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Service Location</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="service_location_lat">Latitude</Label>
                                    <Input
                                        id="service_location_lat"
                                        value={data.service_location_lat}
                                        onChange={(e) => setData('service_location_lat', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="service_location_lng">Longitude</Label>
                                    <Input
                                        id="service_location_lng"
                                        value={data.service_location_lng}
                                        onChange={(e) => setData('service_location_lng', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="service_location_address">Address</Label>
                                    <Textarea
                                        id="service_location_address"
                                        value={data.service_location_address}
                                        onChange={(e) => setData('service_location_address', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
