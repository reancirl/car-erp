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
import { Switch } from '@/components/ui/switch';
import {
    ArrowLeft,
    Wrench,
    Save,
    AlertCircle,
    X,
} from 'lucide-react';
import { type BreadcrumbItem, type Branch, type CommonService, type ServiceType } from '@/types';

interface CategoryOption {
    value: string;
    label: string;
}

interface Props {
    commonService: CommonService;
    serviceTypes: ServiceType[];
    branches?: Branch[] | null;
    meta?: {
        categories?: CategoryOption[];
    };
    auth: {
        user: {
            roles?: Array<{ name: string }>;
            branch_id?: number | null;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Service & Parts', href: '/service' },
    { title: 'Common Services', href: '/service/common-services' },
    { title: 'Edit Common Service', href: '/service/common-services/edit' },
];

export default function CommonServiceEdit({ commonService, serviceTypes, branches, meta, auth }: Props) {
    const isAdmin = auth.user.roles?.some((role) => role.name === 'admin' || role.name === 'auditor') ?? false;
    const categoryOptions = meta?.categories ?? [
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'repair', label: 'Repair' },
        { value: 'inspection', label: 'Inspection' },
        { value: 'diagnostic', label: 'Diagnostic' },
    ];

    const initialServiceTypeIds = commonService.service_types?.map((serviceType) => serviceType.id) ?? [];

    const { data, setData, put, processing, errors, wasSuccessful } = useForm({
        name: commonService.name ?? '',
        code: commonService.code ?? '',
        description: commonService.description ?? '',
        category: commonService.category ?? categoryOptions[0]?.value ?? '',
        estimated_duration: commonService.estimated_duration?.toString() ?? '',
        standard_price: commonService.standard_price?.toString() ?? '',
        currency: commonService.currency ?? 'PHP',
        is_active: Boolean(commonService.is_active),
        service_type_ids: initialServiceTypeIds,
    });

    const toggleServiceType = (serviceTypeId: number) => {
        setData(
            'service_type_ids',
            data.service_type_ids.includes(serviceTypeId)
                ? data.service_type_ids.filter((id) => id !== serviceTypeId)
                : [...data.service_type_ids, serviceTypeId]
        );
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        put(`/service/common-services/${commonService.id}`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${commonService.name}`} />

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div className="flex-1 space-y-2">
                                    <h3 className="font-semibold text-red-900">Validation Error</h3>
                                    <p className="text-sm text-red-800">
                                        Please correct the following errors before submitting:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
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
                        <Link href="/service/common-services">
                            <Button variant="outline" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Common Services
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Wrench className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">Edit Common Service</h1>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/service/common-services/${commonService.id}`}>
                            <Button variant="outline" type="button">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : wasSuccessful ? 'Saved' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Update the core details and classification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isAdmin && branches && (
                                    <div className="space-y-2">
                                        <Label>Branch</Label>
                                        <Input
                                            value={
                                                branches.find((branch) => branch.id === commonService.branch_id)?.name ??
                                                'N/A'
                                            }
                                            disabled
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Branch assignment cannot be changed after creation.
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Service Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                            className={errors.name ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Service Code</Label>
                                        <Input
                                            id="code"
                                            value={data.code ?? ''}
                                            onChange={(event) => setData('code', event.target.value.toUpperCase())}
                                            maxLength={50}
                                            className={errors.code ? 'border-red-500' : ''}
                                        />
                                        {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description ?? ''}
                                        onChange={(event) => setData('description', event.target.value)}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(value) => setData('category', value)}
                                        required
                                    >
                                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Duration & Pricing</CardTitle>
                                <CardDescription>Adjust the standard duration and pricing references</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estimated_duration">Estimated Duration (hours) *</Label>
                                        <Input
                                            id="estimated_duration"
                                            type="number"
                                            step="0.25"
                                            min="0"
                                            value={data.estimated_duration}
                                            onChange={(event) => setData('estimated_duration', event.target.value)}
                                            className={errors.estimated_duration ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.estimated_duration && (
                                            <p className="text-sm text-red-600">{errors.estimated_duration}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="standard_price">Standard Price *</Label>
                                        <Input
                                            id="standard_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.standard_price}
                                            onChange={(event) => setData('standard_price', event.target.value)}
                                            className={errors.standard_price ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.standard_price && (
                                            <p className="text-sm text-red-600">{errors.standard_price}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input
                                        id="currency"
                                        value="PHP"
                                        disabled
                                        readOnly
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Currency is fixed to Philippine Peso (PHP) for all common services.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                                <CardDescription>Control the availability of this service template</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Active</p>
                                        <p className="text-sm text-muted-foreground">
                                            Toggle to make this template selectable in workflows.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Service Type Associations</CardTitle>
                                <CardDescription>Identify service types where this common service is used</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {serviceTypes.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No service types available for association.
                                    </p>
                                ) : (
                                    serviceTypes.map((serviceType) => (
                                        <div key={serviceType.id} className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`service-type-${serviceType.id}`}
                                                checked={data.service_type_ids.includes(serviceType.id)}
                                                onCheckedChange={() => toggleServiceType(serviceType.id)}
                                            />
                                            <div>
                                                <Label htmlFor={`service-type-${serviceType.id}`} className="font-medium">
                                                    {serviceType.name}
                                                </Label>
                                                <p className="text-xs text-muted-foreground uppercase">
                                                    {serviceType.code}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {errors.service_type_ids && (
                                    <p className="text-sm text-red-600">{errors.service_type_ids}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
