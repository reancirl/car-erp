import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
    Settings
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

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
        title: 'Create User',
        href: '/admin/user-management/create',
    },
];

export default function UserCreate() {
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [emailVerified, setEmailVerified] = useState(true);
    const [activeStatus, setActiveStatus] = useState(true);

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            
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
                            <h1 className="text-2xl font-bold">Create New User</h1>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Create User
                        </Button>
                    </div>
                </div>

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
                                    Enter the user's personal details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input 
                                            id="first_name" 
                                            placeholder="e.g., Juan" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input 
                                            id="last_name" 
                                            placeholder="e.g., Dela Cruz" 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name (Display) *</Label>
                                    <Input 
                                        id="full_name" 
                                        placeholder="e.g., Juan Dela Cruz" 
                                        required 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            placeholder="user@dealership.com.ph" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input 
                                            id="phone" 
                                            placeholder="+63-917-123-4567" 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_id">Employee ID</Label>
                                        <Input 
                                            id="employee_id" 
                                            placeholder="e.g., EMP-2025-001" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hire_date">Hire Date</Label>
                                        <Input 
                                            id="hire_date" 
                                            type="date"
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
                                    Assign role and configure access permissions using Spatie system
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Spatie Role *</Label>
                                    <Select value={selectedRole} onValueChange={setSelectedRole} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
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
                                    <Select required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
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
                                    Assign the user to a specific branch location
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="branch">Branch Location *</Label>
                                    <Select value={selectedBranch} onValueChange={setSelectedBranch} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select branch" />
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

                        {/* Account Security */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Key className="h-5 w-5" />
                                    <span>Account Security</span>
                                </CardTitle>
                                <CardDescription>
                                    Configure password and security settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Temporary Password *</Label>
                                        <Input 
                                            id="password" 
                                            type="password" 
                                            placeholder="Enter temporary password" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm_password">Confirm Password *</Label>
                                        <Input 
                                            id="confirm_password" 
                                            type="password" 
                                            placeholder="Confirm password" 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="force_password_change" 
                                        defaultChecked 
                                    />
                                    <Label htmlFor="force_password_change" className="text-sm">
                                        Force password change on first login
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
                                    Configure account status and security options
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="mfa_enabled" 
                                            checked={mfaEnabled}
                                            onCheckedChange={(checked) => setMfaEnabled(checked === true)}
                                        />
                                        <Label htmlFor="mfa_enabled" className="text-sm font-medium">
                                            Require Multi-Factor Authentication
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="email_verified" 
                                            checked={emailVerified}
                                            onCheckedChange={(checked) => setEmailVerified(checked === true)}
                                        />
                                        <Label htmlFor="email_verified" className="text-sm font-medium">
                                            Email Verified
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="active_status" 
                                            checked={activeStatus}
                                            onCheckedChange={(checked) => setActiveStatus(checked === true)}
                                        />
                                        <Label htmlFor="active_status" className="text-sm font-medium">
                                            Active Account
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Role Preview */}
                        {selectedRole && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Role Preview</CardTitle>
                                    <CardDescription>
                                        Selected role permissions and access level
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
                                            </div>
                                        ) : null;
                                    })()}
                                </CardContent>
                            </Card>
                        )}

                        {/* Branch Preview */}
                        {selectedBranch && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Branch Assignment</CardTitle>
                                    <CardDescription>
                                        Selected branch location details
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
                        )}

                        {/* Security Notice */}
                        <Card className="bg-yellow-50 border-yellow-200">
                            <CardHeader>
                                <CardTitle className="text-yellow-800">Security Notice</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-yellow-700">
                                    The user will receive an email with their temporary password and will be required to change it on first login for security purposes.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
