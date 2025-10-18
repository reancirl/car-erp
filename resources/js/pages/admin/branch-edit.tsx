import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft, 
    Building2, 
    Save, 
    MapPin, 
    Phone, 
    AlertTriangle,
    CheckCircle,
    Clock,
    Loader2
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState, FormEvent } from 'react';

interface Branch {
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    email?: string;
    status: 'active' | 'inactive' | 'maintenance';
    business_hours?: Record<string, { open: string; close: string }> | null;
    latitude?: number;
    longitude?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface BranchEditProps {
    branch: Branch;
    regions: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administration',
        href: '/admin',
    },
    {
        title: 'Branch Management',
        href: '/admin/branch-management',
    },
    {
        title: 'Edit Branch',
        href: '/admin/branch-management/edit',
    },
];

export default function BranchEdit({ branch, regions }: BranchEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: branch.name,
        code: branch.code,
        address: branch.address,
        city: branch.city,
        state: branch.state,
        postal_code: branch.postal_code,
        country: branch.country,
        phone: branch.phone || '',
        email: branch.email || '',
        status: branch.status,
        latitude: branch.latitude?.toString() || '',
        longitude: branch.longitude?.toString() || '',
        notes: branch.notes || '',
        business_hours: branch.business_hours || null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/branch-management/${branch.id}`, {
            preserveScroll: true,
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    const handleCancel = () => {
        router.visit('/admin/branch-management');
    };

    // Get regions from backend
    const regionEntries = Object.entries(regions);


    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Inactive
                    </Badge>
                );
            case 'maintenance':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Maintenance
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${branch.name}`} />
            
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/branch-management">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Branches
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">Edit {branch.name}</h1>
                            {getStatusBadge(data.status)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" type="button" onClick={handleCancel}>
                            Cancel Changes
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {/* Branch Info Summary */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{branch.name} ({branch.code})</h3>
                                <p className="text-sm text-muted-foreground">
                                    {branch.city}, {branch.state}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {branch.country} • {branch.postal_code}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">Status: {getStatusBadge(branch.status)}</p>
                                <p className="text-sm text-muted-foreground">Contact: {branch.phone}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building2 className="h-5 w-5" />
                                    <span>Basic Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Update the basic details for this branch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="branch_name">Branch Name *</Label>
                                        <Input 
                                            id="branch_name" 
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            maxLength={255}
                                            minLength={3}
                                            required 
                                        />
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                        {!errors.name && <p className="text-xs text-muted-foreground">Minimum 3 characters</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="branch_code">Branch Code *</Label>
                                        <Input 
                                            id="branch_code" 
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            className="uppercase" 
                                            maxLength={10}
                                            minLength={2}
                                            required 
                                        />
                                        {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                                        {!errors.code && <p className="text-xs text-muted-foreground">2-10 characters, unique code</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea 
                                        id="description" 
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5" />
                                    <span>Location Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Update the physical location of the branch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="region">Region *</Label>
                                        <Select value={data.state} onValueChange={(value) => setData('state', value)} required>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {regionEntries.map(([key, name]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="province">Province *</Label>
                                        <Input 
                                            id="province" 
                                            value={data.state}
                                            onChange={(e) => setData('state', e.target.value)}
                                            required 
                                        />
                                        {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City/Municipality *</Label>
                                        <Input 
                                            id="city" 
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            required 
                                        />
                                        {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code *</Label>
                                        <Input 
                                            id="postal_code" 
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value.replace(/\D/g, ''))}
                                            maxLength={4}
                                            minLength={4}
                                            pattern="[0-9]{4}"
                                            required
                                        />
                                        {errors.postal_code && <p className="text-sm text-red-600">{errors.postal_code}</p>}
                                        {!errors.postal_code && <p className="text-xs text-muted-foreground">Exactly 4 digits</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country *</Label>
                                    <Input 
                                        id="country" 
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Complete Address *</Label>
                                    <Textarea 
                                        id="address" 
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                        maxLength={500}
                                        minLength={10}
                                        required
                                    />
                                    {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                                    {!errors.address && <p className="text-xs text-muted-foreground">Minimum 10 characters, maximum 500</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input 
                                            id="latitude" 
                                            value={data.latitude}
                                            onChange={(e) => setData('latitude', e.target.value)}
                                            type="number" 
                                            step="any" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input 
                                            id="longitude" 
                                            value={data.longitude}
                                            onChange={(e) => setData('longitude', e.target.value)}
                                            type="number" 
                                            step="any" 
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Phone className="h-5 w-5" />
                                    <span>Contact Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Update branch contact details and communication channels
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input 
                                            id="phone" 
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            pattern="^\+?63[-\s]?[0-9]{1,2}[-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$"
                                            required 
                                        />
                                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                                        {!errors.phone && <p className="text-xs text-muted-foreground">Format: +63-2-8123-4567</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile Number</Label>
                                        <Input 
                                            id="mobile" 
                                            placeholder="+63-917-123-4567"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required 
                                        />
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fax">Fax Number</Label>
                                        <Input 
                                            id="fax" 
                                            placeholder="+63-32-234-5679"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building2 className="h-5 w-5" />
                                    <span>Additional Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Additional notes and branch-specific information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any additional notes about this branch..."
                                        rows={4}
                                        maxLength={1000}
                                    />
                                    <p className="text-xs text-muted-foreground text-right">{data.notes.length}/1000 characters</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Operating Hours */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Operating Hours</CardTitle>
                                <CardDescription>
                                    Update the branch operating schedule
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weekday_hours">Weekdays</Label>
                                    <Input 
                                        id="weekday_hours" 
                                        defaultValue={branch.business_hours?.monday ? `${branch.business_hours.monday.open} - ${branch.business_hours.monday.close}` : ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="saturday_hours">Saturday</Label>
                                    <Input 
                                        id="saturday_hours" 
                                        defaultValue={branch.business_hours?.saturday ? `${branch.business_hours.saturday.open} - ${branch.business_hours.saturday.close}` : ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sunday_hours">Sunday</Label>
                                    <Input 
                                        id="sunday_hours" 
                                        defaultValue={branch.business_hours?.sunday?.open ? `${branch.business_hours.sunday.open} - ${branch.business_hours.sunday.close}` : 'Closed'}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Branch Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Branch Status</CardTitle>
                                <CardDescription>
                                    Update the status of the branch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'inactive' | 'maintenance')}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="maintenance">Under Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_headquarters" 
                                        checked={branch.code === 'HQ'}
                                    />
                                    <Label htmlFor="is_headquarters" className="text-sm">
                                        This is a headquarters location
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Branch Statistics</CardTitle>
                                <CardDescription>
                                    Current branch metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Branch Code</span>
                                    <span className="font-medium">{branch.code}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span className="font-medium">{branch.status}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="font-medium">
                                        {new Date(branch.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
