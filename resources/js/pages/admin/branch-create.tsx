import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Building2, Save, MapPin, Phone, Mail, User, Calendar, Loader2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState, FormEvent } from 'react';

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
        title: 'Create Branch',
        href: '/admin/branch-management/create',
    },
];

interface BranchCreateProps {
    regions: Record<string, string>;
}

export default function BranchCreate({ regions }: BranchCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        region: '',
        state: '', // This maps to province in the UI
        city: '',
        postal_code: '',
        country: 'Philippines',
        address: '',
        latitude: '',
        longitude: '',
        phone: '',
        mobile: '',
        email: '',
        fax: '',
        notes: '',
        weekday_hours: '',
        saturday_hours: '',
        sunday_hours: '',
        status: 'active'
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/branch-management', {
            preserveScroll: true,
            onError: (errors) => {
                console.log('Form submission errors:', errors);
            }
        });
    };

    // Get regions from backend
    const regionEntries = Object.entries(regions);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Branch" />
            
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
                            <h1 className="text-2xl font-bold">Create New Branch</h1>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/admin/branch-management">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {processing ? 'Creating...' : 'Create Branch'}
                        </Button>
                    </div>
                </div>

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
                                    Enter the basic details for the new branch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="branch_name">Branch Name *</Label>
                                        <Input 
                                            id="branch_name" 
                                            placeholder="e.g., Cebu Branch" 
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
                                            placeholder="e.g., CEB" 
                                            className="uppercase" 
                                            maxLength={10}
                                            minLength={2}
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
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
                                        placeholder="Brief description of the branch..."
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
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
                                    Specify the physical location of the branch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="region">Region *</Label>
                                        <Select value={data.region} onValueChange={(value) => setData('region', value)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select region" />
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
                                            placeholder="e.g., Cebu" 
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
                                            placeholder="e.g., Cebu City" 
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
                                            placeholder="e.g., 6000" 
                                            maxLength={4}
                                            minLength={4}
                                            pattern="[0-9]{4}"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value.replace(/\D/g, ''))}
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
                                        placeholder="Street number, street name, barangay, building details..."
                                        rows={3}
                                        maxLength={500}
                                        minLength={10}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
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
                                            placeholder="e.g., 10.3157" 
                                            type="number" 
                                            step="any" 
                                            value={data.latitude}
                                            onChange={(e) => setData('latitude', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input 
                                            id="longitude" 
                                            placeholder="e.g., 123.8854" 
                                            type="number" 
                                            step="any" 
                                            value={data.longitude}
                                            onChange={(e) => setData('longitude', e.target.value)}
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
                                    Branch contact details and communication channels
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input 
                                            id="phone" 
                                            type="tel"
                                            placeholder="+63-32-234-5678" 
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
                                            value={data.mobile}
                                            onChange={(e) => setData('mobile', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            placeholder="branch@dealership.com.ph" 
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
                                            value={data.fax}
                                            onChange={(e) => setData('fax', e.target.value)}
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
                                        placeholder="Any additional notes about this branch..."
                                        rows={4}
                                        maxLength={1000}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
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
                                    Set the branch operating schedule
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weekday_hours">Weekdays</Label>
                                    <Input 
                                        id="weekday_hours" 
                                        placeholder="8:00 AM - 6:00 PM" 
                                        value={data.weekday_hours}
                                        onChange={(e) => setData('weekday_hours', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="saturday_hours">Saturday</Label>
                                    <Input 
                                        id="saturday_hours" 
                                        placeholder="8:00 AM - 5:00 PM" 
                                        value={data.saturday_hours}
                                        onChange={(e) => setData('saturday_hours', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sunday_hours">Sunday</Label>
                                    <Input 
                                        id="sunday_hours" 
                                        placeholder="Closed" 
                                        value={data.sunday_hours}
                                        onChange={(e) => setData('sunday_hours', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Branch Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Branch Status</CardTitle>
                                <CardDescription>
                                    Set the initial status of the branch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
