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
        title: 'Create Warranty Claim',
        href: '/service/warranty-claims/create',
    },
];

export default function WarrantyClaimCreate() {
    const [selectedClaimType, setSelectedClaimType] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('');
    const [selectedParts, setSelectedParts] = useState<string[]>([]);
    const [hasPhotos, setHasPhotos] = useState(false);

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
        { id: 'alternator', name: 'Alternator', price: 8500, warranty: '24 months' },
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
            <Head title="Create Warranty Claim" />
            
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
                            <h1 className="text-2xl font-bold">Create Warranty Claim</h1>
                            <p className="text-muted-foreground">Submit a new warranty claim for processing</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Submit Claim
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
                                    Basic details about the warranty claim
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="claim-number">Claim Number</Label>
                                        <Input 
                                            id="claim-number" 
                                            placeholder="Auto-generated"
                                            disabled
                                            value="WC-2024-001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="claim-date">Claim Date</Label>
                                        <Input 
                                            id="claim-date" 
                                            type="date"
                                            defaultValue={new Date().toISOString().split('T')[0]}
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
                                    Select the customer and vehicle for this claim
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer">Customer</Label>
                                        <Select>
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
                                        <Select>
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
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purchase-date">Purchase Date</Label>
                                        <Input 
                                            id="purchase-date" 
                                            type="date"
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
                                    Select parts and labor covered under warranty
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
                                    Upload photos and supporting documents
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

                        {/* Processing Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Expected Processing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <span className="text-sm">Submission: Today</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    <span className="text-sm">Review: 1-2 days</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    <span className="text-sm">Approval: 3-5 days</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    <span className="text-sm">Payment: 7-10 days</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guidelines */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Claim Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>• Ensure all required documentation is uploaded</p>
                                <p>• Provide clear photos of the defective parts</p>
                                <p>• Include original purchase receipts when available</p>
                                <p>• Verify warranty coverage before submission</p>
                                <p>• Contact manufacturer for recall campaigns</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
