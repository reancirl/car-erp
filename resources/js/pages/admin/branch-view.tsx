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
    status: 'active' | 'inactive';
    business_hours?: any;
    latitude?: number;
    longitude?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface BranchViewProps {
    branch: Branch;
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

export default function BranchView({ branch }: BranchViewProps) {

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
            <Head title={`${branch.name} - Branch Details`} />
            
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
                            <h1 className="text-2xl font-bold">{branch.name}</h1>
                            {getStatusBadge(branch.status)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/admin/branch-management/${branch.id}/edit`}>
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
                                    <p className="text-sm"><span className="font-medium">Code:</span> {branch.code}</p>
                                    <p className="text-sm"><span className="font-medium">City:</span> {branch.city}</p>
                                    <p className="text-sm"><span className="font-medium">State:</span> {branch.state}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Contact</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Phone:</span> {branch.phone}</p>
                                    <p className="text-sm"><span className="font-medium">Email:</span> {branch.email}</p>
                                    <p className="text-sm"><span className="font-medium">Country:</span> {branch.country}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Details</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Status:</span> {branch.status}</p>
                                    <p className="text-sm"><span className="font-medium">Postal Code:</span> {branch.postal_code}</p>
                                    <p className="text-sm"><span className="font-medium">Created:</span> {new Date(branch.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Location</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Latitude:</span> {branch.latitude || 'N/A'}</p>
                                    <p className="text-sm"><span className="font-medium">Longitude:</span> {branch.longitude || 'N/A'}</p>
                                    <p className="text-sm"><span className="font-medium">Updated:</span> {new Date(branch.updated_at).toLocaleDateString()}</p>
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
                                        <p className="text-sm font-medium">{branch.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Branch Code</Label>
                                        <p className="text-sm font-medium">{branch.code}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                    <p className="text-sm">{branch.notes || 'No additional notes available.'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">{new Date(branch.created_at).toLocaleDateString()}</p>
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
                                        <p className="text-sm font-medium">{branch.state}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Province</Label>
                                        <p className="text-sm font-medium">{branch.state}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">City/Municipality</Label>
                                        <p className="text-sm font-medium">{branch.city}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Postal Code</Label>
                                        <p className="text-sm font-medium">{branch.postal_code}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Complete Address</Label>
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <p className="text-sm">{branch.address}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Latitude</Label>
                                        <div className="flex items-center space-x-2">
                                            <Navigation className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{branch.latitude || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Longitude</Label>
                                        <div className="flex items-center space-x-2">
                                            <Navigation className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{branch.longitude || 'N/A'}</p>
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
                                            <p className="text-sm font-medium">{branch.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Mobile Number</Label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">N/A</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{branch.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Fax Number</Label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">N/A</p>
                                        </div>
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
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                                    <p className="text-sm">{branch.notes || 'No additional notes available.'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                                        <p className="text-sm font-medium">{branch.country}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                        <p className="text-sm font-medium">{new Date(branch.updated_at).toLocaleDateString()}</p>
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
                                    {getStatusBadge(branch.status)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Type</span>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                        <Building className="h-3 w-3 mr-1" />
                                        {branch.code === 'HQ' ? 'Headquarters' : 'Branch'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Staff Count</span>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                        Active
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Hours */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Business Hours</CardTitle>
                                <CardDescription>
                                    Operating schedule for this branch
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {branch.business_hours ? (
                                    Object.entries(branch.business_hours).map(([day, hours]: [string, any]) => (
                                        <div key={day} className="flex items-center justify-between">
                                            <span className="text-sm font-medium capitalize">{day}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {hours?.open && hours?.close ? `${hours.open} - ${hours.close}` : 'Closed'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No business hours set</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Branch Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Branch Statistics</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Branch Code</span>
                                    <span className="text-sm font-medium">{branch.code}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span className="text-sm font-medium capitalize">{branch.status}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="text-sm font-medium">{new Date(branch.created_at).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/admin/branch-management/${branch.id}/edit`}>
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
