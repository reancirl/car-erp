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
        title: 'Create Common Service',
        href: '/service/common-services/create',
    },
];

export default function CommonServiceCreate() {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [selectedParts, setSelectedParts] = useState<string[]>([]);
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);

    const categories = [
        { value: 'maintenance', label: 'Maintenance', description: 'Regular maintenance services' },
        { value: 'repair', label: 'Repair', description: 'Repair and replacement services' },
        { value: 'inspection', label: 'Inspection', description: 'Inspection and testing services' },
        { value: 'diagnostic', label: 'Diagnostic', description: 'Diagnostic and analysis services' }
    ];

    const availableParts = [
        'Engine Oil', 'Oil Filter', 'Air Filter', 'Cabin Filter', 'Fuel Filter',
        'Spark Plugs', 'Brake Pads', 'Brake Fluid', 'Transmission Fluid',
        'Coolant', 'Battery Terminal Cleaner', 'Windshield Washer Fluid',
        'Power Steering Fluid', 'Differential Oil', 'Grease'
    ];

    const availableServiceTypes = [
        'PMS - 5K Service', 'PMS - 10K Service', 'PMS - 15K Service', 'PMS - 20K Service',
        'General Repair', 'Warranty Service', 'Vehicle Inspection', 'Diagnostic Service'
    ];

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'maintenance':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Maintenance</Badge>;
            case 'repair':
                return <Badge variant="outline" className="bg-orange-100 text-orange-800">Repair</Badge>;
            case 'inspection':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800">Inspection</Badge>;
            case 'diagnostic':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Diagnostic</Badge>;
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Common Service" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/common-services">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Common Services
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Wrench className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">Create Common Service</h1>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">Cancel</Button>
                        <Button><Save className="h-4 w-4 mr-2" />Create Service</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Define the service name, code, and description</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Service Name *</Label>
                                        <Input id="name" placeholder="e.g., Oil Change" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Service Code *</Label>
                                        <Input id="code" placeholder="e.g., OIL_CHANGE" className="uppercase" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Describe what this service includes..." 
                                        rows={3} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Service Category *</Label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select service category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.value} value={category.value}>
                                                    <div className="flex items-center space-x-2">
                                                        <span>{category.label}</span>
                                                        <span className="text-xs text-muted-foreground">- {category.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedCategory && (
                                        <div className="mt-2">
                                            {getCategoryBadge(selectedCategory)}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Duration & Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5" />
                                    <span>Duration & Pricing</span>
                                </CardTitle>
                                <CardDescription>Set estimated duration and standard pricing</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estimated_duration">Estimated Duration (hours) *</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="estimated_duration" 
                                                type="number" 
                                                step="0.25" 
                                                placeholder="e.g., 0.5" 
                                                className="pl-10"
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="standard_price">Standard Price (₱) *</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="standard_price" 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="e.g., 800.00" 
                                                className="pl-10"
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Duration should include setup and cleanup time. Price excludes parts cost.
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parts Required */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Package className="h-5 w-5" />
                                    <span>Parts Required</span>
                                </CardTitle>
                                <CardDescription>Select parts typically needed for this service</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableParts.map((part) => (
                                            <div key={part} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={part.toLowerCase().replace(/\s+/g, '_')}
                                                    checked={selectedParts.includes(part)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked === true) {
                                                            setSelectedParts([...selectedParts, part]);
                                                        } else {
                                                            setSelectedParts(selectedParts.filter(p => p !== part));
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={part.toLowerCase().replace(/\s+/g, '_')} className="text-sm">
                                                    {part}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedParts.length > 0 && (
                                        <div className="mt-4">
                                            <Label className="text-sm font-medium">Selected Parts:</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedParts.map((part) => (
                                                    <Badge key={part} variant="outline" className="bg-blue-100 text-blue-800">
                                                        {part}
                                                        <button
                                                            onClick={() => setSelectedParts(selectedParts.filter(p => p !== part))}
                                                            className="ml-1 hover:bg-blue-200 rounded-full"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedParts.length === 0 && (
                                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <AlertCircle className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm text-gray-600">
                                                    No parts required - this is a labor-only service.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Associated Service Types */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Associated Service Types</CardTitle>
                                <CardDescription>Select service types that typically include this common service</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableServiceTypes.map((serviceType) => (
                                            <div key={serviceType} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={serviceType.toLowerCase().replace(/\s+/g, '_')}
                                                    checked={selectedServiceTypes.includes(serviceType)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked === true) {
                                                            setSelectedServiceTypes([...selectedServiceTypes, serviceType]);
                                                        } else {
                                                            setSelectedServiceTypes(selectedServiceTypes.filter(st => st !== serviceType));
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={serviceType.toLowerCase().replace(/\s+/g, '_')} className="text-sm">
                                                    {serviceType}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedServiceTypes.length > 0 && (
                                        <div className="mt-4">
                                            <Label className="text-sm font-medium">Associated Service Types:</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedServiceTypes.map((serviceType) => (
                                                    <Badge key={serviceType} variant="outline" className="bg-green-100 text-green-800">
                                                        {serviceType}
                                                        <button
                                                            onClick={() => setSelectedServiceTypes(selectedServiceTypes.filter(st => st !== serviceType))}
                                                            className="ml-1 hover:bg-green-200 rounded-full"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status & Availability</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active"
                                        checked={isActive}
                                        onCheckedChange={(checked) => setIsActive(checked === true)}
                                    />
                                    <Label htmlFor="is_active" className="text-sm">
                                        Active Service
                                    </Label>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {isActive ? (
                                        <div className="flex items-center space-x-1 text-green-600">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>This service will be available for selection</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-1 text-gray-600">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>This service will be hidden from selection</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Category</span>
                                    {selectedCategory ? getCategoryBadge(selectedCategory) : <span className="text-xs text-gray-400">Not selected</span>}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Parts Required</span>
                                    <span className="text-sm font-medium">{selectedParts.length} parts</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Service Types</span>
                                    <span className="text-sm font-medium">{selectedServiceTypes.length} types</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    {isActive ? (
                                        <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-gray-100 text-gray-800">Inactive</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cost Estimation */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cost Estimation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Labor Cost</span>
                                    <span className="text-sm font-medium">Set by price</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Parts Cost</span>
                                    <span className="text-sm font-medium">Variable</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Cost</span>
                                    <span className="text-sm font-medium">Labor + Parts</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Final cost will include parts markup and any additional charges.
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guidelines */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>• Use clear, descriptive service names</p>
                                <p>• Service codes should be unique and uppercase</p>
                                <p>• Include realistic time estimates</p>
                                <p>• Select all required parts</p>
                                <p>• Associate with relevant service types</p>
                                <p>• Price should reflect labor cost only</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
