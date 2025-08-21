import { Head, Link } from '@inertiajs/react';
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
    Mail, 
    User, 
    Calendar,
    Crown,
    Building,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface BranchEditProps {
    branchId: string;
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

export default function BranchEdit({ branchId }: BranchEditProps) {
    // Mock data for the branch being edited
    const mockBranch = {
        id: parseInt(branchId) || 2,
        name: 'Cebu Branch',
        code: 'CEB',
        type: 'branch',
        description: 'Main dealership branch serving Central Visayas region with comprehensive automotive services.',
        address: '456 Colon Street, Cebu City, Cebu',
        region: 'Central Visayas',
        province: 'Cebu',
        city: 'Cebu City',
        postal_code: '6000',
        phone: '+63-32-234-5678',
        mobile: '+63-917-234-5678',
        email: 'cebu@dealership.com.ph',
        fax: '+63-32-234-5679',
        manager: 'Maria Santos',
        manager_email: 'maria.santos@dealership.com.ph',
        manager_phone: '+63-917-345-6789',
        assistant_manager: 'Carlos Reyes',
        status: 'active',
        established_date: '2021-03-20',
        user_count: 12,
        services: ['Sales', 'Service', 'Parts'],
        coordinates: { lat: 10.3157, lng: 123.8854 },
        weekday_hours: '8:00 AM - 6:00 PM',
        saturday_hours: '8:00 AM - 5:00 PM',
        sunday_hours: 'Closed',
        is_headquarters: false
    };

    const [selectedServices, setSelectedServices] = useState<string[]>(mockBranch.services);
    const [branchStatus, setBranchStatus] = useState(mockBranch.status);

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

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'headquarters':
                return (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        <Crown className="h-3 w-3 mr-1" />
                        Headquarters
                    </Badge>
                );
            case 'branch':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Building className="h-3 w-3 mr-1" />
                        Branch
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${mockBranch.name}`} />
            
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
                            <h1 className="text-2xl font-bold">Edit {mockBranch.name}</h1>
                            {getTypeBadge(mockBranch.type)}
                            {getStatusBadge(branchStatus)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            Cancel Changes
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Branch Info Summary */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{mockBranch.name} ({mockBranch.code})</h3>
                                <p className="text-sm text-muted-foreground">
                                    Established: {mockBranch.established_date} • {mockBranch.user_count} staff members
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {mockBranch.city}, {mockBranch.province} • {mockBranch.region}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">Manager: {mockBranch.manager}</p>
                                <p className="text-sm text-muted-foreground">{mockBranch.manager_email}</p>
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
                                            defaultValue={mockBranch.name}
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="branch_code">Branch Code *</Label>
                                        <Input 
                                            id="branch_code" 
                                            defaultValue={mockBranch.code}
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
                                        defaultValue={mockBranch.description}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="established_date">Established Date</Label>
                                    <Input 
                                        id="established_date" 
                                        type="date"
                                        defaultValue={mockBranch.established_date}
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
                                        <Select defaultValue="central_visayas" required>
                                            <SelectTrigger>
                                                <SelectValue />
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
                                            defaultValue={mockBranch.province}
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City/Municipality *</Label>
                                        <Input 
                                            id="city" 
                                            defaultValue={mockBranch.city}
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code</Label>
                                        <Input 
                                            id="postal_code" 
                                            defaultValue={mockBranch.postal_code}
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Complete Address *</Label>
                                    <Textarea 
                                        id="address" 
                                        defaultValue={mockBranch.address}
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input 
                                            id="latitude" 
                                            defaultValue={mockBranch.coordinates.lat.toString()}
                                            type="number" 
                                            step="any" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input 
                                            id="longitude" 
                                            defaultValue={mockBranch.coordinates.lng.toString()}
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
                                            defaultValue={mockBranch.phone}
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile Number</Label>
                                        <Input 
                                            id="mobile" 
                                            defaultValue={mockBranch.mobile}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            defaultValue={mockBranch.email}
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fax">Fax Number</Label>
                                        <Input 
                                            id="fax" 
                                            defaultValue={mockBranch.fax}
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
                                    Update branch manager and key personnel details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="manager_name">Branch Manager *</Label>
                                        <Input 
                                            id="manager_name" 
                                            defaultValue={mockBranch.manager}
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="manager_email">Manager Email *</Label>
                                        <Input 
                                            id="manager_email" 
                                            type="email" 
                                            defaultValue={mockBranch.manager_email}
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="manager_phone">Manager Phone</Label>
                                        <Input 
                                            id="manager_phone" 
                                            defaultValue={mockBranch.manager_phone}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="assistant_manager">Assistant Manager</Label>
                                        <Input 
                                            id="assistant_manager" 
                                            defaultValue={mockBranch.assistant_manager}
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
                                    Update the services this branch provides
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
                                    Update the branch operating schedule
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weekday_hours">Weekdays</Label>
                                    <Input 
                                        id="weekday_hours" 
                                        defaultValue={mockBranch.weekday_hours}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="saturday_hours">Saturday</Label>
                                    <Input 
                                        id="saturday_hours" 
                                        defaultValue={mockBranch.saturday_hours}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sunday_hours">Sunday</Label>
                                    <Input 
                                        id="sunday_hours" 
                                        defaultValue={mockBranch.sunday_hours}
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
                                    <Select value={branchStatus} onValueChange={setBranchStatus}>
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
                                        checked={mockBranch.is_headquarters}
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
                                    <span className="text-sm text-muted-foreground">Staff Members</span>
                                    <span className="font-medium">{mockBranch.user_count}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Services</span>
                                    <span className="font-medium">{selectedServices.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Years Operating</span>
                                    <span className="font-medium">
                                        {new Date().getFullYear() - new Date(mockBranch.established_date).getFullYear()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
