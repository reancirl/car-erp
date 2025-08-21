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
    FileText, 
    Save, 
    Car,
    User,
    Calendar,
    DollarSign,
    Package,
    AlertTriangle,
    CheckCircle,
    Upload,
    X,
    Camera
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface WarrantyClaimEditProps {
    claimId: string;
}

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
        href: '/service/warranty-claims/edit',
    },
];

// Mock data for editing
const mockClaim = {
    id: '1',
    claim_number: 'WC-2024-001',
    claim_date: '2024-01-15',
    claim_type: 'parts',
    priority: 'medium',
    description: 'Defective brake pads causing noise and reduced braking performance',
    customer_id: '1',
    vehicle_id: '1',
    mileage: 25000,
    purchase_date: '2022-06-15',
    labor_hours: 2.5,
    parts: ['brake-pads', 'brake-fluid'],
    has_photos: true,
    notes: 'Customer reported grinding noise during braking. Inspection confirmed worn brake pads beyond normal wear pattern.',
    status: 'pending'
};

export default function WarrantyClaimEdit({ claimId }: WarrantyClaimEditProps) {
    const [selectedClaimType, setSelectedClaimType] = useState(mockClaim.claim_type);
    const [selectedPriority, setSelectedPriority] = useState(mockClaim.priority);
    const [selectedParts, setSelectedParts] = useState<string[]>(mockClaim.parts);
    const [hasPhotos, setHasPhotos] = useState(mockClaim.has_photos);

    const claimTypes = [
        { value: 'parts', label: 'Parts Defect', description: 'Defective or faulty parts' },
        { value: 'labor', label: 'Labor Warranty', description: 'Service or repair warranty' },
        { value: 'goodwill', label: 'Goodwill', description: 'Customer satisfaction gesture' },
        { value: 'recall', label: 'Recall', description: 'Manufacturer recall campaign' },
    ];

    const priorities = [
        { value: 'low', label: 'Low', description: 'Non-urgent claim' },
        { value: 'medium', label: 'Medium', description: 'Standard processing' },
        { value: 'high', label: 'High', description: 'Urgent claim' },
        { value: 'critical', label: 'Critical', description: 'Safety-related issue' },
    ];

    const availableParts = [
        { id: 'engine-oil', name: 'Engine Oil Filter', price: 450, warranty: '12 months' },
        { id: 'brake-pads', name: 'Brake Pad Set', price: 2500, warranty: '24 months' },
        { id: 'air-filter', name: 'Air Filter', price: 300, warranty: '6 months' },
        { id: 'spark-plugs', name: 'Spark Plugs (Set)', price: 800, warranty: '12 months' },
        { id: 'battery', name: 'Car Battery', price: 4500, warranty: '36 months' },
        { id: 'brake-fluid', name: 'Brake Fluid', price: 150, warranty: '12 months' },
    ];

    const customers = [
        { id: '1', name: 'Juan Dela Cruz', phone: '+63 912 345 6789' },
        { id: '2', name: 'Maria Santos', phone: '+63 917 234 5678' },
        { id: '3', name: 'Pedro Rodriguez', phone: '+63 922 345 6789' },
    ];

    const vehicles = [
        { id: '1', make: 'Toyota', model: 'Vios', year: '2022', plate: 'ABC 1234' },
        { id: '2', make: 'Honda', model: 'City', year: '2021', plate: 'XYZ 5678' },
        { id: '3', make: 'Mitsubishi', model: 'Mirage', year: '2023', plate: 'DEF 9012' },
    ];

    const getClaimTypeBadge = (type: string) => {
        const colors = {
            parts: 'bg-blue-100 text-blue-800',
            labor: 'bg-green-100 text-green-800',
            goodwill: 'bg-yellow-100 text-yellow-800',
            recall: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{priority}</Badge>;
    };

    const togglePart = (partId: string) => {
        setSelectedParts(prev => 
            prev.includes(partId) 
                ? prev.filter(id => id !== partId)
                : [...prev, partId]
        );
    };

    const calculateTotalClaim = () => {
        return availableParts
            .filter(part => selectedParts.includes(part.id))
            .reduce((total, part) => total + part.price, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Warranty Claim" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/warranty-claims">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Warranty Claims
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Warranty Claim</h1>
                            <p className="text-muted-foreground">Update warranty claim details and status</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Update Claim
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Claim Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Claim Information
                                </CardTitle>
                                <CardDescription>
                                    Update warranty claim details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="claim-number">Claim Number</Label>
                                        <Input 
                                            id="claim-number" 
                                            disabled
                                            value={mockClaim.claim_number}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="claim-date">Claim Date</Label>
                                        <Input 
                                            id="claim-date" 
                                            type="date"
                                            defaultValue={mockClaim.claim_date}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="claim-type">Claim Type</Label>
                                        <Select value={selectedClaimType} onValueChange={setSelectedClaimType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select claim type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {claimTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{type.label}</span>
                                                            <span className="text-xs text-muted-foreground ml-2">{type.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priorities.map((priority) => (
                                                    <SelectItem key={priority.value} value={priority.value}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{priority.label}</span>
                                                            <span className="text-xs text-muted-foreground ml-2">{priority.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Claim Description</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Detailed description of the warranty issue"
                                        rows={3}
                                        defaultValue={mockClaim.description}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer & Vehicle */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Customer & Vehicle Information
                                </CardTitle>
                                <CardDescription>
                                    Update customer and vehicle details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer">Customer</Label>
                                        <Select defaultValue={mockClaim.customer_id}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id}>
                                                        <div>
                                                            <div className="font-medium">{customer.name}</div>
                                                            <div className="text-xs text-muted-foreground">{customer.phone}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle">Vehicle</Label>
                                        <Select defaultValue={mockClaim.vehicle_id}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vehicle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vehicles.map((vehicle) => (
                                                    <SelectItem key={vehicle.id} value={vehicle.id}>
                                                        <div>
                                                            <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                                                            <div className="text-xs text-muted-foreground">{vehicle.plate}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mileage">Current Mileage</Label>
                                        <Input 
                                            id="mileage" 
                                            type="number" 
                                            placeholder="e.g., 25000"
                                            defaultValue={mockClaim.mileage}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purchase-date">Purchase Date</Label>
                                        <Input 
                                            id="purchase-date" 
                                            type="date"
                                            defaultValue={mockClaim.purchase_date}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parts & Labor */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Parts & Labor Claimed
                                </CardTitle>
                                <CardDescription>
                                    Update parts and labor covered under warranty
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {availableParts.map((part) => (
                                        <div key={part.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <Checkbox 
                                                id={part.id}
                                                checked={selectedParts.includes(part.id)}
                                                onCheckedChange={() => togglePart(part.id)}
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor={part.id} className="font-medium cursor-pointer">
                                                    {part.name}
                                                </Label>
                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <span>₱{part.price.toLocaleString()}</span>
                                                    <span>{part.warranty} warranty</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 space-y-2">
                                    <Label htmlFor="labor-hours">Labor Hours</Label>
                                    <Input 
                                        id="labor-hours" 
                                        type="number" 
                                        placeholder="e.g., 2.5"
                                        step="0.5"
                                        defaultValue={mockClaim.labor_hours}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documentation */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Camera className="h-5 w-5 mr-2" />
                                    Documentation
                                </CardTitle>
                                <CardDescription>
                                    Update photos and supporting documents
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Checkbox 
                                        id="photos"
                                        checked={hasPhotos}
                                        onCheckedChange={(checked) => setHasPhotos(checked as boolean)}
                                    />
                                    <Label htmlFor="photos" className="font-medium cursor-pointer">
                                        Photos uploaded
                                    </Label>
                                </div>
                                {hasPhotos && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Camera className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Camera className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Camera className="h-6 w-6 text-gray-400" />
                                        </div>
                                    </div>
                                )}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">
                                        Drag and drop files here, or click to browse
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supported formats: JPG, PNG, PDF (Max 10MB each)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        placeholder="Any additional information or special instructions"
                                        rows={3}
                                        defaultValue={mockClaim.notes}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Claim Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Claim Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Claim Number</p>
                                    <p className="text-sm font-medium">{mockClaim.claim_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Claim Type</p>
                                    {selectedClaimType && getClaimTypeBadge(selectedClaimType)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Priority</p>
                                    {selectedPriority && getPriorityBadge(selectedPriority)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Selected Parts</p>
                                    <p className="text-sm font-medium">{selectedParts.length} parts</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Claim Value</p>
                                    <p className="text-sm font-medium text-green-600">₱{calculateTotalClaim().toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Documentation</p>
                                    <div className="flex items-center space-x-2">
                                        {hasPhotos ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="text-sm text-green-600">Complete</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                                <span className="text-sm text-orange-600">Pending</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Status History</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Submitted</p>
                                        <p className="text-xs text-muted-foreground">Jan 15, 2024</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Under Review</p>
                                        <p className="text-xs text-muted-foreground">Jan 16, 2024</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">Pending Approval</p>
                                        <p className="text-xs text-muted-foreground">Waiting</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guidelines */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Update Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>• Changes to submitted claims require approval</p>
                                <p>• Upload additional documentation if needed</p>
                                <p>• Priority changes may affect processing time</p>
                                <p>• Contact customer for any clarifications</p>
                                <p>• Maintain audit trail for all modifications</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
