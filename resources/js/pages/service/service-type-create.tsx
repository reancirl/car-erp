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
    Settings, 
    Save, 
    Clock,
    DollarSign,
    Calendar,
    Gauge,
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
        title: 'Service Types',
        href: '/service/service-types',
    },
    {
        title: 'Create Service Type',
        href: '/service/service-types/create',
    },
];

export default function ServiceTypeCreate() {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedIntervalType, setSelectedIntervalType] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const categories = [
        { value: 'maintenance', label: 'Maintenance', description: 'Regular preventive maintenance services' },
        { value: 'repair', label: 'Repair', description: 'Diagnostic and repair services' },
        { value: 'warranty', label: 'Warranty', description: 'Warranty-covered services' },
        { value: 'inspection', label: 'Inspection', description: 'Safety and compliance inspections' },
        { value: 'diagnostic', label: 'Diagnostic', description: 'Computer diagnostic services' }
    ];

    const intervalTypes = [
        { value: 'mileage', label: 'Mileage-Based', description: 'Service based on kilometers driven' },
        { value: 'time', label: 'Time-Based', description: 'Service based on time intervals' },
        { value: 'on_demand', label: 'On Demand', description: 'Service requested as needed' }
    ];

    const availableServices = [
        'Oil Change', 'Filter Replacement', 'Brake Inspection', 'Tire Rotation',
        'Battery Check', 'Fluid Top-up', 'Belt Inspection', 'Spark Plug Replacement',
        'Engine Diagnostic', 'Brake Repair', 'Electrical Repair', 'Transmission Service',
        'Air Conditioning Service', 'Suspension Check', 'Exhaust Inspection', 'Cooling System Service'
    ];

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'maintenance':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Maintenance</Badge>;
            case 'repair':
                return <Badge variant="outline" className="bg-orange-100 text-orange-800">Repair</Badge>;
            case 'warranty':
                return <Badge variant="outline" className="bg-green-100 text-green-800">Warranty</Badge>;
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
            <Head title="Create Service Type" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/service-types">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Service Types
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Settings className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">Create Service Type</h1>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">Cancel</Button>
                        <Button><Save className="h-4 w-4 mr-2" />Create Service Type</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Define the service type name, code, and description</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Service Type Name *</Label>
                                        <Input id="name" placeholder="e.g., Preventive Maintenance Service" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Service Code *</Label>
                                        <Input id="code" placeholder="e.g., PMS" className="uppercase" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Describe the service type and what it includes..." 
                                        rows={3} 
                                        required 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category & Classification */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Category & Classification</CardTitle>
                                <CardDescription>Categorize the service type for organization and filtering</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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

                        {/* Service Intervals */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Service Intervals</span>
                                </CardTitle>
                                <CardDescription>Define when this service should be performed</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="interval_type">Interval Type *</Label>
                                    <Select value={selectedIntervalType} onValueChange={setSelectedIntervalType} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select interval type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {intervalTypes.map((type) => (
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

                                {selectedIntervalType === 'mileage' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="interval_value">Mileage Interval (km) *</Label>
                                        <div className="relative">
                                            <Gauge className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="interval_value" 
                                                type="number" 
                                                placeholder="e.g., 5000" 
                                                className="pl-10"
                                                required 
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedIntervalType === 'time' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="interval_value">Time Interval (months) *</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="interval_value" 
                                                type="number" 
                                                placeholder="e.g., 6" 
                                                className="pl-10"
                                                required 
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedIntervalType === 'on_demand' && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <AlertCircle className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm text-blue-800">
                                                This service will be available on-demand without automatic scheduling.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pricing & Duration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <DollarSign className="h-5 w-5" />
                                    <span>Pricing & Duration</span>
                                </CardTitle>
                                <CardDescription>Set estimated duration and base pricing</CardDescription>
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
                                                step="0.5" 
                                                placeholder="e.g., 2.5" 
                                                className="pl-10"
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="base_price">Base Price (₱)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="base_price" 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="e.g., 2500.00" 
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Leave base price empty or set to 0 for free services (e.g., warranty services)
                                </div>
                            </CardContent>
                        </Card>

                        {/* Common Services */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Associated Common Services</CardTitle>
                                <CardDescription>Select services typically included in this service type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableServices.map((service) => (
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
                                                <Label htmlFor={service.toLowerCase().replace(/\s+/g, '_')} className="text-sm">
                                                    {service}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedServices.length > 0 && (
                                        <div className="mt-4">
                                            <Label className="text-sm font-medium">Selected Services:</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedServices.map((service) => (
                                                    <Badge key={service} variant="outline" className="bg-blue-100 text-blue-800">
                                                        {service}
                                                        <button
                                                            onClick={() => setSelectedServices(selectedServices.filter(s => s !== service))}
                                                            className="ml-1 hover:bg-blue-200 rounded-full"
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
                                        Active Service Type
                                    </Label>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {isActive ? (
                                        <div className="flex items-center space-x-1 text-green-600">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>This service type will be available for work orders</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-1 text-gray-600">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>This service type will be hidden from work orders</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Type Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Category</span>
                                    {selectedCategory ? getCategoryBadge(selectedCategory) : <span className="text-xs text-gray-400">Not selected</span>}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Interval</span>
                                    <span className="text-sm font-medium">
                                        {selectedIntervalType ? intervalTypes.find(t => t.value === selectedIntervalType)?.label : 'Not set'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Services</span>
                                    <span className="text-sm font-medium">{selectedServices.length} selected</span>
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

                        {/* Help */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>• Use clear, descriptive names for service types</p>
                                <p>• Service codes should be short and unique</p>
                                <p>• Set realistic duration estimates</p>
                                <p>• Include relevant common services</p>
                                <p>• Choose appropriate interval types</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
