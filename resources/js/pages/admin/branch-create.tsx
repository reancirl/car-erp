import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Building2, Save, MapPin, Phone, Mail, User, Calendar } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

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

export default function BranchCreate() {
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    // Philippines regions for dropdown
    const philippineRegions = [
        'National Capital Region',
        'Ilocos Region',
        'Cagayan Valley',
        'Central Luzon',
        'Calabarzon',
        'Mimaropa',
        'Bicol Region',
        'Western Visayas',
        'Central Visayas',
        'Eastern Visayas',
        'Zamboanga Peninsula',
        'Northern Mindanao',
        'Davao Region',
        'Soccsksargen',
        'Caraga',
        'Barmm',
        'Cordillera Administrative Region'
    ];

    const services = ['Sales', 'Service', 'Parts', 'Finance'];

    const handleServiceChange = (service: string, checked: boolean) => {
        if (checked) {
            setSelectedServices([...selectedServices, service]);
        } else {
            setSelectedServices(selectedServices.filter(s => s !== service));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Branch" />
            
            <div className="space-y-6 p-6">
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
                        <Button variant="outline">
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Create Branch
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
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="branch_code">Branch Code *</Label>
                                        <Input 
                                            id="branch_code" 
                                            placeholder="e.g., CEB" 
                                            className="uppercase" 
                                            maxLength={5}
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Brief description of the branch..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="established_date">Established Date</Label>
                                    <Input 
                                        id="established_date" 
                                        type="date"
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
                                        <Select required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select region" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {philippineRegions.map((region) => (
                                                    <SelectItem key={region} value={region.toLowerCase().replace(/\s+/g, '_')}>
                                                        {region}
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
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City/Municipality *</Label>
                                        <Input 
                                            id="city" 
                                            placeholder="e.g., Cebu City" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code</Label>
                                        <Input 
                                            id="postal_code" 
                                            placeholder="e.g., 6000" 
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Complete Address *</Label>
                                    <Textarea 
                                        id="address" 
                                        placeholder="Street number, street name, barangay, building details..."
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input 
                                            id="latitude" 
                                            placeholder="e.g., 10.3157" 
                                            type="number" 
                                            step="any" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input 
                                            id="longitude" 
                                            placeholder="e.g., 123.8854" 
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
                                    Branch contact details and communication channels
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input 
                                            id="phone" 
                                            placeholder="+63-32-234-5678" 
                                            required 
                                        />
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
                                            placeholder="branch@dealership.com.ph" 
                                            required 
                                        />
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

                        {/* Management Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Management Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Branch manager and key personnel details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="manager_name">Branch Manager *</Label>
                                        <Input 
                                            id="manager_name" 
                                            placeholder="Manager's full name" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="manager_email">Manager Email *</Label>
                                        <Input 
                                            id="manager_email" 
                                            type="email" 
                                            placeholder="manager@dealership.com.ph" 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="manager_phone">Manager Phone</Label>
                                        <Input 
                                            id="manager_phone" 
                                            placeholder="+63-917-123-4567" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="assistant_manager">Assistant Manager</Label>
                                        <Input 
                                            id="assistant_manager" 
                                            placeholder="Assistant manager's name" 
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Services Offered */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Services Offered</CardTitle>
                                <CardDescription>
                                    Select the services this branch will provide
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {services.map((service) => (
                                    <div key={service} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={service.toLowerCase()}
                                            checked={selectedServices.includes(service)}
                                            onCheckedChange={(checked) => 
                                                handleServiceChange(service, checked as boolean)
                                            }
                                        />
                                        <Label htmlFor={service.toLowerCase()} className="text-sm font-medium">
                                            {service}
                                        </Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

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
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="saturday_hours">Saturday</Label>
                                    <Input 
                                        id="saturday_hours" 
                                        placeholder="8:00 AM - 5:00 PM" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sunday_hours">Sunday</Label>
                                    <Input 
                                        id="sunday_hours" 
                                        placeholder="Closed" 
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
                                    <Select defaultValue="active">
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
                                    <Checkbox id="is_headquarters" />
                                    <Label htmlFor="is_headquarters" className="text-sm">
                                        This is a headquarters location
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
