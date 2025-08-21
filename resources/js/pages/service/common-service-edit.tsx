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
    Clock,
    DollarSign,
    Package,
    AlertCircle,
    CheckCircle,
    Plus,
    X
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface CommonServiceEditProps {
    serviceId: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'Common Services',
        href: '/service/common-services',
    },
    {
        title: 'Edit Common Service',
        href: '/service/common-services/edit',
    },
];

// Mock data for editing
const mockCommonService = {
    id: '1',
    name: 'Engine Oil Change',
    code: 'OIL-CHG-001',
    description: 'Complete engine oil replacement with high-quality synthetic oil',
    category: 'maintenance',
    estimated_duration: 30,
    standard_price: 800,
    is_active: true,
    required_parts: ['engine-oil', 'oil-filter'],
    service_types: ['oil-service', 'basic-maintenance']
};

export default function CommonServiceEdit({ serviceId }: CommonServiceEditProps) {
    const [selectedCategory, setSelectedCategory] = useState(mockCommonService.category);
    const [isActive, setIsActive] = useState(mockCommonService.is_active);
    const [selectedParts, setSelectedParts] = useState<string[]>(mockCommonService.required_parts);
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(mockCommonService.service_types);

    const categories = [
        { value: 'maintenance', label: 'Maintenance', description: 'Regular maintenance services' },
        { value: 'repair', label: 'Repair', description: 'Repair and replacement services' },
        { value: 'inspection', label: 'Inspection', description: 'Inspection and testing services' },
        { value: 'diagnostic', label: 'Diagnostic', description: 'Diagnostic and analysis services' },
    ];

    const availableParts = [
        { id: 'engine-oil', name: 'Engine Oil (5W-30)', price: 450, required: true },
        { id: 'oil-filter', name: 'Oil Filter', price: 250, required: true },
        { id: 'air-filter', name: 'Air Filter', price: 300, required: false },
        { id: 'cabin-filter', name: 'Cabin Air Filter', price: 200, required: false },
        { id: 'spark-plugs', name: 'Spark Plugs (Set of 4)', price: 800, required: false },
        { id: 'brake-fluid', name: 'Brake Fluid', price: 150, required: false },
    ];

    const serviceTypes = [
        { id: 'oil-service', name: 'Oil Change Service', interval: '5,000 km' },
        { id: 'basic-maintenance', name: 'Basic Maintenance', interval: '10,000 km' },
        { id: 'major-service', name: 'Major Service', interval: '20,000 km' },
        { id: 'engine-service', name: 'Engine Service', interval: '15,000 km' },
    ];

    const getCategoryBadge = (category: string) => {
        const colors = {
            maintenance: 'bg-blue-100 text-blue-800',
            repair: 'bg-red-100 text-red-800',
            inspection: 'bg-yellow-100 text-yellow-800',
            diagnostic: 'bg-purple-100 text-purple-800',
        };
        return <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
    };

    const togglePart = (partId: string) => {
        setSelectedParts(prev => 
            prev.includes(partId) 
                ? prev.filter(id => id !== partId)
                : [...prev, partId]
        );
    };

    const toggleServiceType = (serviceTypeId: string) => {
        setSelectedServiceTypes(prev => 
            prev.includes(serviceTypeId) 
                ? prev.filter(id => id !== serviceTypeId)
                : [...prev, serviceTypeId]
        );
    };

    const calculatePartsCost = () => {
        return availableParts
            .filter(part => selectedParts.includes(part.id))
            .reduce((total, part) => total + part.price, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Common Service" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/common-services">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Common Services
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Common Service</h1>
                            <p className="text-muted-foreground">Update common service details and configuration</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Update Service
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Wrench className="h-5 w-5 mr-2" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Update the fundamental details of this common service
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Service Name</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g., Engine Oil Change"
                                            defaultValue={mockCommonService.name}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Service Code</Label>
                                        <Input 
                                            id="code" 
                                            placeholder="e.g., OIL-CHG-001"
                                            defaultValue={mockCommonService.code}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Detailed description of the service"
                                        defaultValue={mockCommonService.description}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.value} value={category.value}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{category.label}</span>
                                                        <span className="text-xs text-muted-foreground ml-2">{category.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Duration & Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2" />
                                    Duration & Pricing
                                </CardTitle>
                                <CardDescription>
                                    Set estimated duration and standard pricing
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                                        <Input 
                                            id="duration" 
                                            type="number" 
                                            placeholder="e.g., 30"
                                            defaultValue={mockCommonService.estimated_duration}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Standard Price (₱)</Label>
                                        <Input 
                                            id="price" 
                                            type="number" 
                                            placeholder="e.g., 800"
                                            defaultValue={mockCommonService.standard_price}
                                        />
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Pricing Guidelines:</strong> Include labor cost and markup. Parts cost will be added separately based on selected parts.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Required Parts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Parts Required
                                </CardTitle>
                                <CardDescription>
                                    Select parts that are required or optional for this service
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
                                                <div className="flex items-center space-x-2">
                                                    <Label htmlFor={part.id} className="font-medium cursor-pointer">
                                                        {part.name}
                                                    </Label>
                                                    {part.required && (
                                                        <Badge variant="secondary" className="text-xs">Required</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">₱{part.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Associated Service Types */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Associated Service Types
                                </CardTitle>
                                <CardDescription>
                                    Select service types that include this common service
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {serviceTypes.map((serviceType) => (
                                        <div key={serviceType.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <Checkbox 
                                                id={serviceType.id}
                                                checked={selectedServiceTypes.includes(serviceType.id)}
                                                onCheckedChange={() => toggleServiceType(serviceType.id)}
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor={serviceType.id} className="font-medium cursor-pointer">
                                                    {serviceType.name}
                                                </Label>
                                                <p className="text-sm text-muted-foreground">Every {serviceType.interval}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Service Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Checkbox 
                                        id="active"
                                        checked={isActive}
                                        onCheckedChange={(checked) => setIsActive(checked as boolean)}
                                    />
                                    <div>
                                        <Label htmlFor="active" className="font-medium cursor-pointer">
                                            Active Service
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Available for service types and work orders
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {isActive ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-green-600">Active</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-sm text-red-600">Inactive</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Category</p>
                                    {selectedCategory && getCategoryBadge(selectedCategory)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Selected Parts</p>
                                    <p className="text-sm font-medium">{selectedParts.length} parts</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Parts Cost</p>
                                    <p className="text-sm font-medium">₱{calculatePartsCost().toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Service Types</p>
                                    <p className="text-sm font-medium">{selectedServiceTypes.length} types</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Estimated Cost</p>
                                    <p className="text-sm font-medium text-green-600">
                                        ₱{(mockCommonService.standard_price + calculatePartsCost()).toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cost Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Cost Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Service Fee:</span>
                                    <span>₱{mockCommonService.standard_price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Parts Cost:</span>
                                    <span>₱{calculatePartsCost().toLocaleString()}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Total:</span>
                                    <span>₱{(mockCommonService.standard_price + calculatePartsCost()).toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guidelines */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>• Use descriptive names for easy identification</p>
                                <p>• Set realistic duration estimates</p>
                                <p>• Include all necessary parts for the service</p>
                                <p>• Price should include labor and overhead</p>
                                <p>• Associate with relevant service types</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
