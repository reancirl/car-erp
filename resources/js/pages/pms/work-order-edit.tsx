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
    Wrench, 
    Save, 
    Car, 
    User, 
    Calendar, 
    Clock,
    AlertTriangle,
    CheckCircle,
    Settings,
    FileText,
    Activity,
    PlayCircle,
    PauseCircle,
    XCircle
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface WorkOrderEditProps {
    workOrderId: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'PMS',
        href: '/pms',
    },
    {
        title: 'Work Orders',
        href: '/pms/work-orders',
    },
    {
        title: 'Edit Work Order',
        href: '/pms/work-orders/edit',
    },
];

export default function WorkOrderEdit({ workOrderId }: WorkOrderEditProps) {
    // Mock work order data
    const mockWorkOrder = {
        id: parseInt(workOrderId) || 1,
        work_order_number: 'WO-2025-001',
        status: 'in_progress',
        priority: 'high',
        service_type: 'pms',
        created_at: '2025-01-15 09:30:00',
        scheduled_date: '2025-01-16',
        scheduled_time: '10:00',
        estimated_hours: 3.5,
        estimated_cost: 4500.00,
        actual_hours: 2.0,
        actual_cost: 3200.00,
        vehicle: {
            plate_number: 'ABC-1234',
            make: 'Toyota',
            model: 'Vios',
            year: 2023,
            mileage: 15000
        },
        customer: {
            name: 'Maria Santos',
            phone: '+63-917-123-4567',
            email: 'maria.santos@email.com',
            type: 'individual'
        },
        work_description: 'Preventive Maintenance Service - 15,000km service including oil change, filter replacements, and general inspection.',
        assigned_technician_id: 1,
        services: ['Oil Change', 'Filter Replacement', 'Brake Inspection', 'Battery Check']
    };

    const [selectedServiceType, setSelectedServiceType] = useState(mockWorkOrder.service_type);
    const [selectedPriority, setSelectedPriority] = useState(mockWorkOrder.priority);
    const [selectedTechnician, setSelectedTechnician] = useState(mockWorkOrder.assigned_technician_id.toString());
    const [selectedServices, setSelectedServices] = useState<string[]>(mockWorkOrder.services);
    const [workOrderStatus, setWorkOrderStatus] = useState(mockWorkOrder.status);

    const serviceTypes = [
        { value: 'pms', label: 'Preventive Maintenance Service (PMS)' },
        { value: 'repair', label: 'Repair Service' },
        { value: 'warranty', label: 'Warranty Service' },
        { value: 'inspection', label: 'Vehicle Inspection' },
        { value: 'diagnostic', label: 'Diagnostic Service' }
    ];

    const priorities = [
        { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
        { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
        { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
        { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
    ];

    const statuses = [
        { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: Clock },
        { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Calendar },
        { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: PlayCircle },
        { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800', icon: PauseCircle },
        { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
    ];

    const technicians = [
        { id: 1, name: 'Carlos Mendoza', specialization: 'Engine & Transmission' },
        { id: 2, name: 'Maria Rodriguez', specialization: 'Electrical Systems' },
        { id: 3, name: 'Juan Santos', specialization: 'Brake & Suspension' },
        { id: 4, name: 'Ana Reyes', specialization: 'Air Conditioning' },
        { id: 5, name: 'Roberto Cruz', specialization: 'General Maintenance' }
    ];

    const commonServices = [
        'Oil Change', 'Filter Replacement', 'Brake Inspection', 'Tire Rotation',
        'Battery Check', 'Fluid Top-up', 'Belt Inspection', 'Spark Plug Replacement'
    ];

    const getStatusBadge = (status: string) => {
        const statusInfo = statuses.find(s => s.value === status);
        if (!statusInfo) return null;
        const IconComponent = statusInfo.icon;
        return (
            <Badge variant="outline" className={statusInfo.color}>
                <IconComponent className="h-3 w-3 mr-1" />
                {statusInfo.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Work Order ${mockWorkOrder.work_order_number}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/pms/work-orders">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Work Orders
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Wrench className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">Edit Work Order {mockWorkOrder.work_order_number}</h1>
                            {getStatusBadge(workOrderStatus)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">Cancel Changes</Button>
                        <Button><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                    </div>
                </div>

                {/* Work Order Summary */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Vehicle</h3>
                                <p className="text-sm"><span className="font-medium">Plate:</span> {mockWorkOrder.vehicle.plate_number}</p>
                                <p className="text-sm"><span className="font-medium">Vehicle:</span> {mockWorkOrder.vehicle.year} {mockWorkOrder.vehicle.make} {mockWorkOrder.vehicle.model}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Customer</h3>
                                <p className="text-sm"><span className="font-medium">Name:</span> {mockWorkOrder.customer.name}</p>
                                <p className="text-sm"><span className="font-medium">Phone:</span> {mockWorkOrder.customer.phone}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Progress</h3>
                                <p className="text-sm"><span className="font-medium">Estimated:</span> {mockWorkOrder.estimated_hours}h / ₱{mockWorkOrder.estimated_cost.toLocaleString()}</p>
                                <p className="text-sm"><span className="font-medium">Actual:</span> {mockWorkOrder.actual_hours}h / ₱{mockWorkOrder.actual_cost.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vehicle Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Car className="h-5 w-5" />
                                    <span>Vehicle Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="plate_number">Plate Number *</Label>
                                        <Input id="plate_number" defaultValue={mockWorkOrder.vehicle.plate_number} className="uppercase" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="make">Make *</Label>
                                        <Select defaultValue={mockWorkOrder.vehicle.make.toLowerCase()} required>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="toyota">Toyota</SelectItem>
                                                <SelectItem value="honda">Honda</SelectItem>
                                                <SelectItem value="mitsubishi">Mitsubishi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="model">Model *</Label>
                                        <Input id="model" defaultValue={mockWorkOrder.vehicle.model} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Year *</Label>
                                        <Input id="year" defaultValue={mockWorkOrder.vehicle.year.toString()} type="number" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mileage">Current Mileage (km)</Label>
                                    <Input id="mileage" defaultValue={mockWorkOrder.vehicle.mileage.toString()} type="number" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Customer Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_name">Customer Name *</Label>
                                        <Input id="customer_name" defaultValue={mockWorkOrder.customer.name} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_phone">Phone Number *</Label>
                                        <Input id="customer_phone" defaultValue={mockWorkOrder.customer.phone} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_email">Email Address</Label>
                                    <Input id="customer_email" type="email" defaultValue={mockWorkOrder.customer.email} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Service Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="service_type">Service Type *</Label>
                                    <Select value={selectedServiceType} onValueChange={setSelectedServiceType} required>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {serviceTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="work_description">Work Description *</Label>
                                    <Textarea id="work_description" defaultValue={mockWorkOrder.work_description} rows={4} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Services Performed</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {commonServices.map((service) => (
                                            <div key={service} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={service.toLowerCase().replace(/\s+/g, '_')}
                                                    checked={selectedServices.includes(service)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked === true) {
                                                            setSelectedServices([...selectedServices, service]);
                                                        } else {
                                                            setSelectedServices(selectedServices.filter(s => s !== service));
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={service.toLowerCase().replace(/\s+/g, '_')} className="text-sm">{service}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scheduling */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Scheduling & Progress</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                                        <Input id="scheduled_date" type="date" defaultValue={mockWorkOrder.scheduled_date} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_time">Scheduled Time</Label>
                                        <Input id="scheduled_time" type="time" defaultValue={mockWorkOrder.scheduled_time} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="assigned_technician">Assigned Technician</Label>
                                    <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {technicians.map((tech) => (
                                                <SelectItem key={tech.id} value={tech.id.toString()}>
                                                    {tech.name} - {tech.specialization}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estimated_hours">Estimated Hours</Label>
                                        <Input id="estimated_hours" type="number" step="0.5" defaultValue={mockWorkOrder.estimated_hours.toString()} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="actual_hours">Actual Hours</Label>
                                        <Input id="actual_hours" type="number" step="0.5" defaultValue={mockWorkOrder.actual_hours.toString()} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status & Priority */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span>Status & Priority</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Work Order Status</Label>
                                    <Select value={workOrderStatus} onValueChange={setWorkOrderStatus}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    <Badge variant="outline" className={status.color}>
                                                        <status.icon className="h-3 w-3 mr-1" />
                                                        {status.label}
                                                    </Badge>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority Level</Label>
                                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {priorities.map((priority) => (
                                                <SelectItem key={priority.value} value={priority.value}>
                                                    <Badge variant="outline" className={priority.color}>{priority.label}</Badge>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Work Order Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Work Order Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">WO Number</span>
                                    <span className="text-sm font-medium">{mockWorkOrder.work_order_number}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="text-sm font-medium">{mockWorkOrder.created_at.split(' ')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Services</span>
                                    <span className="text-sm font-medium">{selectedServices.length} items</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selected Services */}
                        {selectedServices.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selected Services</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {selectedServices.map((service) => (
                                            <div key={service} className="flex items-center space-x-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="text-sm">{service}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Progress Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Add Progress Note</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea placeholder="Enter progress update..." rows={3} />
                                <Button size="sm" className="mt-2 w-full">Add Note</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
