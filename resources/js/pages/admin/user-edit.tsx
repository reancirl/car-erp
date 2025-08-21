import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft, 
    Users, 
    Save, 
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
    Building
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface UserEditProps {
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
        title: 'Edit User',
        href: '/admin/user-management/edit',
    },
];

export default function UserEdit({ userId }: UserEditProps) {
    // Mock user data for editing
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
        direct_permissions: ['pms.override_schedule']
    };

    const [selectedRole, setSelectedRole] = useState(mockUser.role);
    const [selectedBranch, setSelectedBranch] = useState(mockUser.branch_id.toString());
    const [mfaEnabled, setMfaEnabled] = useState(mockUser.mfa_enabled);
    const [emailVerified, setEmailVerified] = useState(mockUser.email_verified);
    const [activeStatus, setActiveStatus] = useState(mockUser.status === 'active');

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

    const departments = [
        'Administration',
        'Sales',
        'Service',
        'Parts',
        'Finance',
        'Audit'
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${mockUser.name}`} />
            
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
                            <h1 className="text-2xl font-bold">Edit {mockUser.name}</h1>
                            {getRoleBadge(selectedRole)}
                            {getStatusBadge(activeStatus ? 'active' : 'inactive')}
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

                {/* User Info Summary */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{mockUser.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {mockUser.email} • Employee ID: {mockUser.employee_id}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Hired: {mockUser.hire_date} • Last login: {mockUser.last_login}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center space-x-2 mb-1">
                                    {getBranchBadge(mockUser.branch_id)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {mockUser.permissions_count} permissions • {mockUser.direct_permissions.length} direct
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Personal Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Update the user's personal details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input 
                                            id="first_name" 
                                            defaultValue={mockUser.first_name}
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input 
                                            id="last_name" 
                                            defaultValue={mockUser.last_name}
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name (Display) *</Label>
                                    <Input 
                                        id="full_name" 
                                        defaultValue={mockUser.name}
                                        required 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            defaultValue={mockUser.email}
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input 
                                            id="phone" 
                                            defaultValue={mockUser.phone}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_id">Employee ID</Label>
                                        <Input 
                                            id="employee_id" 
                                            defaultValue={mockUser.employee_id}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hire_date">Hire Date</Label>
                                        <Input 
                                            id="hire_date" 
                                            type="date"
                                            defaultValue={mockUser.hire_date}
                                        />
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
                                <CardDescription>
                                    Update role and configure access permissions using Spatie system
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Spatie Role *</Label>
                                    <Select value={selectedRole} onValueChange={setSelectedRole} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {spatieRoles.map((role) => (
                                                <SelectItem key={role.name} value={role.name}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{role.display_name}</span>
                                                        <Badge variant="outline" className="ml-2">
                                                            {role.permissions_count} perms
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedRole && (
                                        <p className="text-sm text-muted-foreground">
                                            {spatieRoles.find(r => r.name === selectedRole)?.description}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department *</Label>
                                    <Select defaultValue={mockUser.department.toLowerCase()} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept.toLowerCase()}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {mockUser.direct_permissions.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Direct Permissions</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {mockUser.direct_permissions.map((permission) => (
                                                <Badge key={permission} variant="outline" className="bg-blue-100 text-blue-800">
                                                    {permission}
                                                </Badge>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            These are additional permissions beyond the role's default permissions
                                        </p>
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
                                <CardDescription>
                                    Update the user's branch location assignment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="branch">Branch Location *</Label>
                                    <Select value={selectedBranch} onValueChange={setSelectedBranch} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockBranches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    <div className="flex items-center space-x-2">
                                                        <span>{branch.name} ({branch.code})</span>
                                                        <span className="text-muted-foreground">• {branch.city}</span>
                                                        {branch.type === 'headquarters' && (
                                                            <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                                                                HQ
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedBranch && (
                                        <p className="text-sm text-muted-foreground">
                                            User will be assigned to {mockBranches.find(b => b.id.toString() === selectedBranch)?.name}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Password Reset */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Key className="h-5 w-5" />
                                    <span>Password Management</span>
                                </CardTitle>
                                <CardDescription>
                                    Reset password or update security settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Button variant="outline">
                                        Send Password Reset Email
                                    </Button>
                                    <Button variant="outline">
                                        Generate Temporary Password
                                    </Button>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="force_password_change" />
                                    <Label htmlFor="force_password_change" className="text-sm">
                                        Force password change on next login
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Account Settings</span>
                                </CardTitle>
                                <CardDescription>
                                    Update account status and security options
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="mfa_enabled" 
                                            checked={mfaEnabled}
                                            onCheckedChange={setMfaEnabled}
                                        />
                                        <Label htmlFor="mfa_enabled" className="text-sm font-medium">
                                            Require Multi-Factor Authentication
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="email_verified" 
                                            checked={emailVerified}
                                            onCheckedChange={setEmailVerified}
                                        />
                                        <Label htmlFor="email_verified" className="text-sm font-medium">
                                            Email Verified
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="active_status" 
                                            checked={activeStatus}
                                            onCheckedChange={setActiveStatus}
                                        />
                                        <Label htmlFor="active_status" className="text-sm font-medium">
                                            Active Account
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Role Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Role</CardTitle>
                                <CardDescription>
                                    Current role permissions and access level
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const role = spatieRoles.find(r => r.name === selectedRole);
                                    return role ? (
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-medium">{role.display_name}</h4>
                                                <p className="text-sm text-muted-foreground">{role.description}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Permissions</span>
                                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                    {role.permissions_count} permissions
                                                </Badge>
                                            </div>
                                            {mockUser.direct_permissions.length > 0 && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Direct Permissions</span>
                                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                                        +{mockUser.direct_permissions.length} additional
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ) : null;
                                })()}
                            </CardContent>
                        </Card>

                        {/* Current Branch Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Branch</CardTitle>
                                <CardDescription>
                                    Current branch assignment details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const branch = mockBranches.find(b => b.id.toString() === selectedBranch);
                                    return branch ? (
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-medium">{branch.name}</h4>
                                                <p className="text-sm text-muted-foreground">{branch.city}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Branch Code</span>
                                                <Badge variant="outline">
                                                    {branch.code}
                                                </Badge>
                                            </div>
                                            {branch.type === 'headquarters' && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Type</span>
                                                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                                        Headquarters
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ) : null;
                                })()}
                            </CardContent>
                        </Card>

                        {/* Activity Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity Summary</CardTitle>
                                <CardDescription>
                                    User account activity and statistics
                                </CardDescription>
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
                                    <span className="text-sm text-muted-foreground">MFA Status</span>
                                    <span className="text-sm font-medium">
                                        {mfaEnabled ? 'Enabled' : 'Disabled'}
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
