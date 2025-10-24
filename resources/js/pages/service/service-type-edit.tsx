import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    ArrowLeft,
    Settings,
    Save,
    Clock,
    DollarSign,
    AlertCircle,
    CheckCircle,
    X
} from 'lucide-react';
import { type BreadcrumbItem, type ServiceType, type CommonService } from '@/types';
import { FormEvent } from 'react';

interface Props {
    serviceType: ServiceType;
    commonServices: CommonService[];
}

export default function ServiceTypeEdit({ serviceType, commonServices }: Props) {
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
            href: `/service/service-types/${serviceType.id}/edit`,
        },
    ];

    const { data, setData, patch, processing, errors } = useForm({
        name: serviceType.name || '',
        code: serviceType.code || '',
        description: serviceType.description || '',
        category: serviceType.category || '',
        interval_type: serviceType.interval_type || 'on_demand',
        interval_value: serviceType.interval_value?.toString() || '',
        estimated_duration: serviceType.estimated_duration?.toString() || '',
        base_price: serviceType.base_price?.toString() || '',
        currency: serviceType.currency || 'PHP',
        status: serviceType.status || 'active',
        is_available: serviceType.is_available ?? true,
        common_service_ids: serviceType.common_services?.map(s => s.id) || [] as number[],
    });

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

    const toggleCommonService = (serviceId: number) => {
        setData('common_service_ids',
            data.common_service_ids.includes(serviceId)
                ? data.common_service_ids.filter(id => id !== serviceId)
                : [...data.common_service_ids, serviceId]
        );
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        patch(`/service/service-types/${serviceType.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${serviceType.name}`} />

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
                                                <strong className="capitalize">{field.replace(/_/g, ' ')}</strong>: {message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/service-types">
                            <Button variant="outline" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Service Types
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Settings className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">Edit Service Type</h1>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/service/service-types">
                            <Button variant="outline" type="button">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Branch Info (Read-only) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Branch Assignment</CardTitle>
                                <CardDescription>Branch cannot be changed after creation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-sm font-medium">{serviceType.branch?.name}</p>
                                    <p className="text-xs text-muted-foreground">Code: {serviceType.branch?.code}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Core details about the service type</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Service Type Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Preventive Maintenance Service (PMS)"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Service Code</Label>
                                    <Input
                                        id="code"
                                        placeholder="e.g., PMS"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className={errors.code ? 'border-red-500' : ''}
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-600">{errors.code}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Unique identifier for this service type
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe what this service includes..."
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category & Classification */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Category & Classification</CardTitle>
                                <CardDescription>Categorize and classify the service type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Service Category *</Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(value) => setData('category', value)}
                                        required
                                    >
                                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    <div className="flex items-center space-x-2">
                                                        <span>{cat.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-red-600">{errors.category}</p>
                                    )}
                                    {data.category && (
                                        <div className="mt-2 p-3 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                {categories.find(c => c.value === data.category)?.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Intervals */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Intervals</CardTitle>
                                <CardDescription>Configure scheduling intervals for this service</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="interval_type">Interval Type *</Label>
                                    <Select
                                        value={data.interval_type}
                                        onValueChange={(value) => setData('interval_type', value)}
                                        required
                                    >
                                        <SelectTrigger className={errors.interval_type ? 'border-red-500' : ''}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {intervalTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.interval_type && (
                                        <p className="text-sm text-red-600">{errors.interval_type}</p>
                                    )}
                                    {data.interval_type && (
                                        <div className="mt-2 p-3 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                {intervalTypes.find(t => t.value === data.interval_type)?.description}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {(data.interval_type === 'mileage' || data.interval_type === 'time') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="interval_value">
                                            {data.interval_type === 'mileage' ? 'Mileage Interval (km) *' : 'Time Interval (months) *'}
                                        </Label>
                                        <Input
                                            id="interval_value"
                                            type="number"
                                            placeholder={data.interval_type === 'mileage' ? 'e.g., 5000' : 'e.g., 6'}
                                            value={data.interval_value}
                                            onChange={(e) => setData('interval_value', e.target.value)}
                                            className={errors.interval_value ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.interval_value && (
                                            <p className="text-sm text-red-600">{errors.interval_value}</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pricing & Duration */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing & Duration</CardTitle>
                                <CardDescription>Set the base price and estimated service duration</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estimated_duration">Estimated Duration (hours)</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="estimated_duration"
                                                type="number"
                                                step="0.5"
                                                placeholder="e.g., 2.5"
                                                value={data.estimated_duration}
                                                onChange={(e) => setData('estimated_duration', e.target.value)}
                                                className={`pl-10 ${errors.estimated_duration ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.estimated_duration && (
                                            <p className="text-sm text-red-600">{errors.estimated_duration}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="base_price">Base Price *</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="base_price"
                                                type="number"
                                                step="0.01"
                                                placeholder="e.g., 2500.00"
                                                value={data.base_price}
                                                onChange={(e) => setData('base_price', e.target.value)}
                                                className={`pl-10 ${errors.base_price ? 'border-red-500' : ''}`}
                                                required
                                            />
                                        </div>
                                        {errors.base_price && (
                                            <p className="text-sm text-red-600">{errors.base_price}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Associated Common Services */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Associated Common Services</CardTitle>
                                <CardDescription>Select common services included in this service type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {commonServices.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No common services available</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {commonServices.map((service) => (
                                            <div key={service.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`service-${service.id}`}
                                                    checked={data.common_service_ids.includes(service.id)}
                                                    onCheckedChange={() => toggleCommonService(service.id)}
                                                />
                                                <Label
                                                    htmlFor={`service-${service.id}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                >
                                                    {service.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Status & Availability */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status & Availability</CardTitle>
                                <CardDescription>Control service type visibility and status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                        required
                                    >
                                        <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>Active</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                <div className="flex items-center space-x-2">
                                                    <AlertCircle className="h-4 w-4 text-gray-600" />
                                                    <span>Inactive</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="discontinued">
                                                <div className="flex items-center space-x-2">
                                                    <X className="h-4 w-4 text-red-600" />
                                                    <span>Discontinued</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_available">Available for Booking</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Allow customers to book this service
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_available"
                                        checked={data.is_available}
                                        onCheckedChange={(checked) => setData('is_available', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Type Preview */}
                        {data.name && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Service Type Preview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium">{data.name || 'Service Name'}</p>
                                        {data.code && (
                                            <p className="text-xs text-muted-foreground">Code: {data.code}</p>
                                        )}
                                    </div>
                                    {data.category && (
                                        <div>
                                            {getCategoryBadge(data.category)}
                                        </div>
                                    )}
                                    {data.estimated_duration && (
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Clock className="h-4 w-4" />
                                            <span>{data.estimated_duration}h estimated</span>
                                        </div>
                                    )}
                                    {data.base_price && (
                                        <div className="flex items-center space-x-2 text-sm">
                                            <DollarSign className="h-4 w-4" />
                                            <span>₱{Number(data.base_price).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {data.common_service_ids.length > 0 && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {data.common_service_ids.length} Common Service{data.common_service_ids.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Guidelines */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>• Branch assignment cannot be changed</p>
                                <p>• Service name should be descriptive and clear</p>
                                <p>• Choose appropriate category for reporting</p>
                                <p>• Set intervals for scheduled services</p>
                                <p>• Base price excludes common services</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
