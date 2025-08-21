import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, 
    Building2, 
    Edit, 
    MapPin, 
    Phone, 
    Mail, 
    User, 
    Calendar,
    CheckCircle,
    AlertTriangle,
    Clock,
    Crown,
    Building,
    Users,
    Settings,
    Activity,
    Star,
    Navigation,
    Clock3
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface BranchViewProps {
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
        title: 'Branch Details',
        href: '/admin/branch-management/view',
    },
];

export default function BranchView({ branchId }: BranchViewProps) {
    // Mock branch data for viewing
    const mockBranch = {
        id: parseInt(branchId) || 2,
        name: 'Cebu Branch',
        code: 'CEB',
        type: 'branch',
        description: 'Main dealership branch serving Central Visayas region with comprehensive automotive services including sales, service, parts, and finance.',
        address: '456 Colon Street, Lahug, Cebu City, Cebu 6000',
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
        is_headquarters: false,
        monthly_sales: 45,
        customer_satisfaction: 4.7,
        service_capacity: 25,
        parts_inventory_value: 2500000
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
            <Head title={`${mockBranch.name} - Branch Details`} />
            
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
                            <h1 className="text-2xl font-bold">{mockBranch.name}</h1>
                            {getTypeBadge(mockBranch.type)}
                            {getStatusBadge(mockBranch.status)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/admin/branch-management/${mockBranch.id}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Branch
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Branch Overview Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Location</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Code:</span> {mockBranch.code}</p>
                                    <p className="text-sm"><span className="font-medium">City:</span> {mockBranch.city}</p>
                                    <p className="text-sm"><span className="font-medium">Region:</span> {mockBranch.region}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Management</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Manager:</span> {mockBranch.manager}</p>
                                    <p className="text-sm"><span className="font-medium">Assistant:</span> {mockBranch.assistant_manager}</p>
                                    <p className="text-sm"><span className="font-medium">Staff:</span> {mockBranch.user_count} members</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Services</h3>
                                <div className="flex flex-wrap gap-1">
                                    {mockBranch.services.map((service) => (
                                        <Badge key={service} variant="outline" className="text-xs">
                                            {service}
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-sm mt-1"><span className="font-medium">Established:</span> {mockBranch.established_date}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Performance</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Monthly Sales:</span> {mockBranch.monthly_sales} units</p>
                                    <p className="text-sm"><span className="font-medium">Satisfaction:</span> {mockBranch.customer_satisfaction}/5.0</p>
                                    <p className="text-sm"><span className="font-medium">Capacity:</span> {mockBranch.service_capacity} vehicles/day</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building2 className="h-5 w-5" />
                                    <span>Basic Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Branch Name</Label>
                                        <p className="text-sm font-medium">{mockBranch.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Branch Code</Label>
                                        <p className="text-sm font-medium">{mockBranch.code}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                    <p className="text-sm">{mockBranch.description}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Established Date</Label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">{mockBranch.established_date}</p>
                                    </div>
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
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Region</Label>
                                        <p className="text-sm font-medium">{mockBranch.region}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Province</Label>
                                        <p className="text-sm font-medium">{mockBranch.province}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">City/Municipality</Label>
                                        <p className="text-sm font-medium">{mockBranch.city}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Postal Code</Label>
                                        <p className="text-sm font-medium">{mockBranch.postal_code}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Complete Address</Label>
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <p className="text-sm">{mockBranch.address}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Latitude</Label>
                                        <div className="flex items-center space-x-2">
                                            <Navigation className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockBranch.coordinates.lat}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Longitude</Label>
                                        <div className="flex items-center space-x-2">
                                            <Navigation className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockBranch.coordinates.lng}</p>
                                        </div>
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
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockBranch.phone}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Mobile Number</Label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockBranch.mobile}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockBranch.email}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Fax Number</Label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockBranch.fax}</p>
                                        </div>
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
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Branch Manager</Label>
                                        <p className="text-sm font-medium">{mockBranch.manager}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Manager Email</Label>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockBranch.manager_email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Manager Phone</Label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockBranch.manager_phone}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Assistant Manager</Label>
                                        <p className="text-sm font-medium">{mockBranch.assistant_manager}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Branch Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Branch Status</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    {getStatusBadge(mockBranch.status)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Type</span>
                                    {getTypeBadge(mockBranch.type)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Staff Count</span>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                        {mockBranch.user_count} members
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Services Offered */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Services Offered</CardTitle>
                                <CardDescription>
                                    Available services at this branch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {mockBranch.services.map((service) => (
                                    <div key={service} className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">{service}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Operating Hours */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock3 className="h-5 w-5" />
                                    <span>Operating Hours</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Weekdays</span>
                                    <span className="text-sm font-medium">{mockBranch.weekday_hours}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Saturday</span>
                                    <span className="text-sm font-medium">{mockBranch.saturday_hours}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Sunday</span>
                                    <span className="text-sm font-medium">{mockBranch.sunday_hours}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Star className="h-5 w-5" />
                                    <span>Performance Metrics</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Monthly Sales</span>
                                    <span className="text-sm font-medium">{mockBranch.monthly_sales} units</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                                    <div className="flex items-center space-x-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium">{mockBranch.customer_satisfaction}/5.0</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Service Capacity</span>
                                    <span className="text-sm font-medium">{mockBranch.service_capacity}/day</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Parts Inventory</span>
                                    <span className="text-sm font-medium">₱{mockBranch.parts_inventory_value.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/admin/branch-management/${mockBranch.id}/edit`}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Branch Details
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Users className="h-4 w-4 mr-2" />
                                    Manage Staff
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Branch Settings
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Activity className="h-4 w-4 mr-2" />
                                    View Reports
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
    return <label className={className}>{children}</label>;
}
