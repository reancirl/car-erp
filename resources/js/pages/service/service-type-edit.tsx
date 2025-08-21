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

interface ServiceTypeEditProps {
    serviceTypeId: string;
}

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
        title: 'Edit Service Type',
        href: '/service/service-types/edit',
    },
];

// Mock data for editing
const mockServiceType = {
    id: '1',
    name: 'Oil Change Service',
    code: 'OIL-001',
    description: 'Complete engine oil and filter replacement service',
    category: 'maintenance',
    interval_type: 'mileage',
    interval_value: 5000,
    estimated_duration: 45,
    standard_price: 2500,
    is_active: true,
    common_services: ['oil-change', 'filter-replacement']
};

export default function ServiceTypeEdit({ serviceTypeId }: ServiceTypeEditProps) {
    const [selectedCategory, setSelectedCategory] = useState(mockServiceType.category);
    const [selectedIntervalType, setSelectedIntervalType] = useState(mockServiceType.interval_type);
    const [isActive, setIsActive] = useState(mockServiceType.is_active);
    const [selectedServices, setSelectedServices] = useState<string[]>(mockServiceType.common_services);

    const categories = [
        { value: 'maintenance', label: 'Maintenance', description: 'Regular preventive maintenance services' },
        { value: 'repair', label: 'Repair', description: 'Diagnostic and repair services' },
        { value: 'inspection', label: 'Inspection', description: 'Safety and compliance inspections' },
        { value: 'diagnostic', label: 'Diagnostic', description: 'System diagnostic and testing services' },
    ];

    const intervalTypes = [
        { value: 'mileage', label: 'Mileage-based', description: 'Based on vehicle mileage' },
        { value: 'time', label: 'Time-based', description: 'Based on time intervals' },
        { value: 'on-demand', label: 'On-demand', description: 'As needed basis' },
    ];

    const commonServices = [
        { id: 'oil-change', name: 'Engine Oil Change', price: 800 },
        { id: 'filter-replacement', name: 'Oil Filter Replacement', price: 300 },
        { id: 'brake-inspection', name: 'Brake System Inspection', price: 500 },
        { id: 'tire-rotation', name: 'Tire Rotation', price: 400 },
        { id: 'battery-test', name: 'Battery Test', price: 200 },
        { id: 'coolant-check', name: 'Coolant Level Check', price: 150 },
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

    const toggleService = (serviceId: string) => {
        setSelectedServices(prev => 
            prev.includes(serviceId) 
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const calculateTotalPrice = () => {
        return commonServices
            .filter(service => selectedServices.includes(service.id))
            .reduce((total, service) => total + service.price, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Service Type" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/service-types">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Service Types
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Service Type</h1>
                            <p className="text-muted-foreground">Update service type configuration and settings</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Update Service Type
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
                                    <Settings className="h-5 w-5 mr-2" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Update the fundamental details of this service type
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Service Type Name</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g., Oil Change Service"
                                            defaultValue={mockServiceType.name}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Service Code</Label>
                                        <Input 
                                            id="code" 
                                            placeholder="e.g., OIL-001"
                                            defaultValue={mockServiceType.code}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Detailed description of the service type"
                                        defaultValue={mockServiceType.description}
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

                        {/* Service Intervals */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Service Intervals
                                </CardTitle>
                                <CardDescription>
                                    Configure when this service should be performed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="interval-type">Interval Type</Label>
                                    <Select value={selectedIntervalType} onValueChange={setSelectedIntervalType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select interval type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {intervalTypes.map((type) => (
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
                                {selectedIntervalType && selectedIntervalType !== 'on-demand' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="interval-value">
                                            Interval Value {selectedIntervalType === 'mileage' ? '(kilometers)' : '(months)'}
                                        </Label>
                                        <Input 
                                            id="interval-value" 
                                            type="number" 
                                            placeholder={selectedIntervalType === 'mileage' ? 'e.g., 5000' : 'e.g., 6'}
                                            defaultValue={mockServiceType.interval_value}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pricing & Duration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2" />
                                    Pricing & Duration
                                </CardTitle>
                                <CardDescription>
                                    Set standard pricing and estimated completion time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                                        <Input 
                                            id="duration" 
                                            type="number" 
                                            placeholder="e.g., 45"
                                            defaultValue={mockServiceType.estimated_duration}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Standard Price (₱)</Label>
                                        <Input 
                                            id="price" 
                                            type="number" 
                                            placeholder="e.g., 2500"
                                            defaultValue={mockServiceType.standard_price}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Common Services */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Associated Common Services
                                </CardTitle>
                                <CardDescription>
                                    Select the common services included in this service type
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {commonServices.map((service) => (
                                        <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <Checkbox 
                                                id={service.id}
                                                checked={selectedServices.includes(service.id)}
                                                onCheckedChange={() => toggleService(service.id)}
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor={service.id} className="font-medium cursor-pointer">
                                                    {service.name}
                                                </Label>
                                                <p className="text-sm text-muted-foreground">₱{service.price.toLocaleString()}</p>
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
                                <CardTitle className="text-sm">Service Type Status</CardTitle>
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
                                            Active Service Type
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Available for scheduling and work orders
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
                                    <p className="text-xs text-muted-foreground">Selected Services</p>
                                    <p className="text-sm font-medium">{selectedServices.length} services</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Service Cost</p>
                                    <p className="text-sm font-medium">₱{calculateTotalPrice().toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Interval</p>
                                    <p className="text-sm font-medium">
                                        {selectedIntervalType === 'on-demand' ? 'On-demand' : 
                                         selectedIntervalType === 'mileage' ? 'Every 5,000 km' : 
                                         selectedIntervalType === 'time' ? 'Every 6 months' : 'Not set'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guidelines */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>• Use clear, descriptive names for service types</p>
                                <p>• Set realistic duration estimates for scheduling</p>
                                <p>• Include all necessary common services</p>
                                <p>• Review pricing regularly for accuracy</p>
                                <p>• Deactivate obsolete service types instead of deleting</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
