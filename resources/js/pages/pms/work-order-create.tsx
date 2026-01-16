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
    PhilippinePeso
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

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
        title: 'Create Work Order',
        href: '/pms/work-orders/create',
    },
];

export default function WorkOrderCreate() {
    const [selectedServiceType, setSelectedServiceType] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('normal');
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    // Mock data
    const serviceTypes = [
        { value: 'pms', label: 'Preventive Maintenance Service (PMS)', description: 'Regular scheduled maintenance' },
        { value: 'repair', label: 'Repair Service', description: 'Fix specific issues or problems' },
        { value: 'warranty', label: 'Warranty Service', description: 'Covered under manufacturer warranty' },
        { value: 'inspection', label: 'Vehicle Inspection', description: 'Safety and compliance inspection' },
        { value: 'diagnostic', label: 'Diagnostic Service', description: 'Identify vehicle problems' }
    ];

    const priorities = [
        { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
        { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
        { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
        { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
    ];

    const technicians = [
        { id: 1, name: 'Carlos Mendoza', specialization: 'Engine & Transmission', experience: '8 years' },
        { id: 2, name: 'Maria Rodriguez', specialization: 'Electrical Systems', experience: '6 years' },
        { id: 3, name: 'Juan Santos', specialization: 'Brake & Suspension', experience: '10 years' },
        { id: 4, name: 'Ana Reyes', specialization: 'Air Conditioning', experience: '5 years' },
        { id: 5, name: 'Roberto Cruz', specialization: 'General Maintenance', experience: '12 years' }
    ];

    const commonServices = [
        'Oil Change',
        'Filter Replacement',
        'Brake Inspection',
        'Tire Rotation',
        'Battery Check',
        'Fluid Top-up',
        'Belt Inspection',
        'Spark Plug Replacement',
        'Air Filter Replacement',
        'Transmission Service'
    ];

    const handleServiceToggle = (service: string) => {
        setSelectedServices(prev => 
            prev.includes(service) 
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Work Order" />
            
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
                            <h1 className="text-2xl font-bold">Create Work Order</h1>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            Save as Draft
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Create Work Order
                        </Button>
                    </div>
                </div>

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
                                <CardDescription>
                                    Select or enter vehicle details for this work order
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="plate_number">Plate Number *</Label>
                                        <Input 
                                            id="plate_number" 
                                            placeholder="e.g., ABC-1234" 
                                            className="uppercase"
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vin">VIN/Chassis Number</Label>
                                        <Input 
                                            id="vin" 
                                            placeholder="e.g., 1HGBH41JXMN109186" 
                                            className="uppercase"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="make">Make *</Label>
                                        <Select required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select make" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="toyota">Toyota</SelectItem>
                                                <SelectItem value="honda">Honda</SelectItem>
                                                <SelectItem value="mitsubishi">Mitsubishi</SelectItem>
                                                <SelectItem value="nissan">Nissan</SelectItem>
                                                <SelectItem value="hyundai">Hyundai</SelectItem>
                                                <SelectItem value="ford">Ford</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="model">Model *</Label>
                                        <Input 
                                            id="model" 
                                            placeholder="e.g., Vios" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Year *</Label>
                                        <Input 
                                            id="year" 
                                            placeholder="e.g., 2023" 
                                            type="number"
                                            min="1990"
                                            max="2025"
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mileage">Current Mileage (km)</Label>
                                        <Input 
                                            id="mileage" 
                                            placeholder="e.g., 25000" 
                                            type="number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="engine_number">Engine Number</Label>
                                        <Input 
                                            id="engine_number" 
                                            placeholder="e.g., 1NZ-FE123456" 
                                            className="uppercase"
                                        />
                                    </div>
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
                                <CardDescription>
                                    Vehicle owner or customer details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_name">Customer Name *</Label>
                                        <Input 
                                            id="customer_name" 
                                            placeholder="e.g., Juan Dela Cruz" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_phone">Phone Number *</Label>
                                        <Input 
                                            id="customer_phone" 
                                            placeholder="+63-917-123-4567" 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_email">Email Address</Label>
                                        <Input 
                                            id="customer_email" 
                                            type="email"
                                            placeholder="customer@email.com" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_type">Customer Type</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="individual">Individual</SelectItem>
                                                <SelectItem value="corporate">Corporate</SelectItem>
                                                <SelectItem value="fleet">Fleet</SelectItem>
                                                <SelectItem value="insurance">Insurance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_address">Address</Label>
                                    <Textarea 
                                        id="customer_address" 
                                        placeholder="Complete address..."
                                        rows={2}
                                    />
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
                                <CardDescription>
                                    Specify the type of service and work to be performed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="service_type">Service Type *</Label>
                                    <Select value={selectedServiceType} onValueChange={setSelectedServiceType} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select service type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex flex-col">
                                                        <span>{type.label}</span>
                                                        <span className="text-xs text-muted-foreground">{type.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="work_description">Work Description *</Label>
                                    <Textarea 
                                        id="work_description" 
                                        placeholder="Describe the work to be performed..."
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Common Services</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {commonServices.map((service) => (
                                            <div key={service} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={service.toLowerCase().replace(/\s+/g, '_')}
                                                    checked={selectedServices.includes(service)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked === true) {
                                                            handleServiceToggle(service);
                                                        } else {
                                                            handleServiceToggle(service);
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={service.toLowerCase().replace(/\s+/g, '_')} className="text-sm">
                                                    {service}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_complaint">Customer Complaint/Request</Label>
                                    <Textarea 
                                        id="customer_complaint" 
                                        placeholder="What did the customer report or request?"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scheduling & Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Scheduling & Assignment</span>
                                </CardTitle>
                                <CardDescription>
                                    Schedule the work and assign technician
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                                        <Input 
                                            id="scheduled_date" 
                                            type="date"
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled_time">Scheduled Time</Label>
                                        <Input 
                                            id="scheduled_time" 
                                            type="time"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="assigned_technician">Assigned Technician</Label>
                                    <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select technician" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {technicians.map((tech) => (
                                                <SelectItem key={tech.id} value={tech.id.toString()}>
                                                    <div className="flex flex-col">
                                                        <span>{tech.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {tech.specialization} • {tech.experience}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estimated_hours">Estimated Hours</Label>
                                        <Input 
                                            id="estimated_hours" 
                                            type="number"
                                            step="0.5"
                                            placeholder="e.g., 2.5"
                                            value={estimatedHours}
                                            onChange={(e) => setEstimatedHours(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estimated_cost">Estimated Cost (₱)</Label>
                                        <Input 
                                            id="estimated_cost" 
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g., 2500.00"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Priority & Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span>Priority & Status</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority Level</Label>
                                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {priorities.map((priority) => (
                                                <SelectItem key={priority.value} value={priority.value}>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant="outline" className={priority.color}>
                                                            {priority.label}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Initial Status</Label>
                                    <Select defaultValue="pending">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Work Order Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Work Order Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="work_order_number">Work Order Number</Label>
                                    <Input 
                                        id="work_order_number" 
                                        placeholder="Auto-generated"
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Will be auto-generated upon creation
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reference_number">Reference Number</Label>
                                    <Input 
                                        id="reference_number" 
                                        placeholder="Optional reference"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="warranty_claim">Warranty Claim</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="warranty_claim" />
                                        <Label htmlFor="warranty_claim" className="text-sm">
                                            This is a warranty claim
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selected Services Preview */}
                        {selectedServices.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selected Services</CardTitle>
                                    <CardDescription>
                                        Services to be performed
                                    </CardDescription>
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

                        {/* Technician Preview */}
                        {selectedTechnician && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assigned Technician</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        const tech = technicians.find(t => t.id.toString() === selectedTechnician);
                                        return tech ? (
                                            <div className="space-y-2">
                                                <h4 className="font-medium">{tech.name}</h4>
                                                <p className="text-sm text-muted-foreground">{tech.specialization}</p>
                                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                    {tech.experience}
                                                </Badge>
                                            </div>
                                        ) : null;
                                    })()}
                                </CardContent>
                            </Card>
                        )}

                        {/* Cost Estimate */}
                        {estimatedHours && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <PhilippinePeso className="h-5 w-5" />
                                        <span>Cost Estimate</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Labor Hours</span>
                                        <span className="text-sm font-medium">{estimatedHours} hrs</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Labor Rate</span>
                                        <span className="text-sm font-medium">₱800/hr</span>
                                    </div>
                                    <div className="flex justify-between items-center font-medium">
                                        <span className="text-sm">Estimated Labor</span>
                                        <span className="text-sm">₱{(parseFloat(estimatedHours) * 800).toLocaleString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
