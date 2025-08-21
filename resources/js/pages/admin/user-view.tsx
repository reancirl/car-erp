import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, 
    Users, 
    Edit, 
    User, 
    Mail, 
    Phone, 
    Shield, 
    Building2,
    Key,
    Settings,
    CheckCircle,
    AlertTriangle,
    Clock,
    Crown,
    Building,
    Calendar,
    MapPin,
    UserCheck,
    Activity
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface UserViewProps {
    userId: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administration',
        href: '/admin',
    },
    {
        title: 'User Management',
        href: '/admin/user-management',
    },
    {
        title: 'User Details',
        href: '/admin/user-management/view',
    },
];

export default function UserView({ userId }: UserViewProps) {
    // Mock user data for viewing
    const mockUser = {
        id: parseInt(userId) || 2,
        name: 'Sarah Service Manager',
        first_name: 'Sarah',
        last_name: 'Santos',
        email: 'sarah.service@dealership.com.ph',
        phone: '+63-917-234-5678',
        employee_id: 'EMP-2024-015',
        hire_date: '2024-12-15',
        role: 'service_manager',
        department: 'Service',
        branch_id: 2,
        permissions_count: 25,
        status: 'active',
        last_login: '2025-01-13 17:45:00',
        created_at: '2024-12-15 10:30:00',
        mfa_enabled: true,
        email_verified: true,
        direct_permissions: ['pms.override_schedule'],
        login_count: 156,
        password_changed_at: '2024-12-20 14:30:00'
    };

    // Mock branches data
    const mockBranches = [
        { id: 1, name: 'Headquarters', code: 'HQ', city: 'Makati City', type: 'headquarters' },
        { id: 2, name: 'Cebu Branch', code: 'CEB', city: 'Cebu City', type: 'branch' },
        { id: 3, name: 'Davao Branch', code: 'DAV', city: 'Davao City', type: 'branch' },
        { id: 4, name: 'Iloilo Branch', code: 'ILO', city: 'Iloilo City', type: 'branch' },
        { id: 5, name: 'Baguio Branch', code: 'BAG', city: 'Baguio City', type: 'branch' }
    ];

    // Spatie roles with their permission counts
    const spatieRoles = [
        { name: 'admin', display_name: 'Administrator', permissions_count: 67, description: 'Full system access' },
        { name: 'service_manager', display_name: 'Service Manager', permissions_count: 25, description: 'PMS, warranty, customer management' },
        { name: 'parts_head', display_name: 'Parts Head', permissions_count: 16, description: 'Full inventory and parts management' },
        { name: 'sales_manager', display_name: 'Sales Manager', permissions_count: 22, description: 'Full sales and customer management' },
        { name: 'sales_rep', display_name: 'Sales Representative', permissions_count: 18, description: 'Sales, customer, basic reporting' },
        { name: 'technician', display_name: 'Technician', permissions_count: 12, description: 'Limited PMS, warranty, inventory' },
        { name: 'auditor', display_name: 'Auditor', permissions_count: 20, description: 'Audit permissions, view-only access' },
        { name: 'parts_clerk', display_name: 'Parts Clerk', permissions_count: 8, description: 'Limited inventory operations' }
    ];

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
            case 'suspended':
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Suspended
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        const roleInfo = spatieRoles.find(r => r.name === role);
        const colorMap: Record<string, string> = {
            'admin': 'bg-purple-100 text-purple-800',
            'service_manager': 'bg-blue-100 text-blue-800',
            'parts_head': 'bg-orange-100 text-orange-800',
            'sales_manager': 'bg-green-100 text-green-800',
            'sales_rep': 'bg-cyan-100 text-cyan-800',
            'technician': 'bg-yellow-100 text-yellow-800',
            'auditor': 'bg-indigo-100 text-indigo-800',
            'parts_clerk': 'bg-gray-100 text-gray-800'
        };

        return (
            <Badge variant="outline" className={colorMap[role] || 'bg-gray-100 text-gray-800'}>
                <Shield className="h-3 w-3 mr-1" />
                {roleInfo?.display_name || role}
            </Badge>
        );
    };

    const getBranchBadge = (branchId: number) => {
        const branch = mockBranches.find(b => b.id === branchId);
        if (!branch) return null;

        return branch.type === 'headquarters' ? (
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
                <Crown className="h-3 w-3 mr-1" />
                {branch.name}
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Building className="h-3 w-3 mr-1" />
                {branch.name}
            </Badge>
        );
    };

    const currentRole = spatieRoles.find(r => r.name === mockUser.role);
    const currentBranch = mockBranches.find(b => b.id === mockUser.branch_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${mockUser.name} - User Details`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/user-management">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Users
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Users className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">{mockUser.name}</h1>
                            {getRoleBadge(mockUser.role)}
                            {getStatusBadge(mockUser.status)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/admin/user-management/${mockUser.id}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* User Overview Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Email:</span> {mockUser.email}</p>
                                    <p className="text-sm"><span className="font-medium">Phone:</span> {mockUser.phone}</p>
                                    <p className="text-sm"><span className="font-medium">Employee ID:</span> {mockUser.employee_id}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Role & Department</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Role:</span> {currentRole?.display_name}</p>
                                    <p className="text-sm"><span className="font-medium">Department:</span> {mockUser.department}</p>
                                    <p className="text-sm"><span className="font-medium">Permissions:</span> {mockUser.permissions_count}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Branch & Status</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Branch:</span> {currentBranch?.name}</p>
                                    <p className="text-sm"><span className="font-medium">Location:</span> {currentBranch?.city}</p>
                                    <p className="text-sm"><span className="font-medium">Hire Date:</span> {mockUser.hire_date}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Personal Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                                        <p className="text-sm font-medium">{mockUser.first_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                                        <p className="text-sm font-medium">{mockUser.last_name}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Full Name (Display)</Label>
                                    <p className="text-sm font-medium">{mockUser.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockUser.email}</p>
                                            {mockUser.email_verified && (
                                                <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockUser.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Employee ID</Label>
                                        <p className="text-sm font-medium">{mockUser.employee_id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Hire Date</Label>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{mockUser.hire_date}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Role & Permissions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5" />
                                    <span>Role & Permissions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Spatie Role</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {getRoleBadge(mockUser.role)}
                                        <span className="text-sm text-muted-foreground">
                                            • {currentRole?.description}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                                    <p className="text-sm font-medium">{mockUser.department}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Total Permissions</Label>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                            {mockUser.permissions_count} permissions
                                        </Badge>
                                        {mockUser.direct_permissions.length > 0 && (
                                            <Badge variant="outline" className="bg-green-100 text-green-800">
                                                +{mockUser.direct_permissions.length} direct
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {mockUser.direct_permissions.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Direct Permissions</Label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {mockUser.direct_permissions.map((permission) => (
                                                <Badge key={permission} variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                                                    {permission}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Branch Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building2 className="h-5 w-5" />
                                    <span>Branch Assignment</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Assigned Branch</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {getBranchBadge(mockUser.branch_id)}
                                        <span className="text-sm text-muted-foreground">
                                            • {currentBranch?.code}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">{currentBranch?.city}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Branch Type</Label>
                                    <p className="text-sm font-medium capitalize">{currentBranch?.type}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Account Status</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    {getStatusBadge(mockUser.status)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">MFA Enabled</span>
                                    <Badge variant={mockUser.mfa_enabled ? "default" : "outline"} 
                                           className={mockUser.mfa_enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                        {mockUser.mfa_enabled ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Email Verified</span>
                                    <Badge variant={mockUser.email_verified ? "default" : "outline"} 
                                           className={mockUser.email_verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                        {mockUser.email_verified ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Key className="h-5 w-5" />
                                    <span>Security Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Account Created</span>
                                    <span className="text-sm font-medium">{mockUser.created_at.split(' ')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Last Login</span>
                                    <span className="text-sm font-medium">{mockUser.last_login.split(' ')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Login Count</span>
                                    <span className="text-sm font-medium">{mockUser.login_count}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Password Changed</span>
                                    <span className="text-sm font-medium">{mockUser.password_changed_at.split(' ')[0]}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/admin/user-management/${mockUser.id}/edit`}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit User Details
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Key className="h-4 w-4 mr-2" />
                                    Reset Password
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Manage Permissions
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Activity className="h-4 w-4 mr-2" />
                                    View Activity Log
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
