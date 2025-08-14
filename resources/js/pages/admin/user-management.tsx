import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Search, Filter, Download, Plus, Eye, Edit, Shield, UserCheck, AlertTriangle, CheckCircle, Clock, Mail, Phone, Calendar } from 'lucide-react';
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
];

export default function UserManagement() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');

    // Mock data for demonstration - based on Spatie roles and permissions
    const mockUsers = [
        {
            id: 1,
            name: 'John Admin',
            email: 'john.admin@dealership.com',
            phone: '+1-555-0101',
            role: 'admin',
            permissions_count: 67, // All permissions
            status: 'active',
            last_login: '2025-01-13 18:30:00',
            created_at: '2024-12-01 09:00:00',
            mfa_enabled: true,
            email_verified: true,
            department: 'Administration',
            direct_permissions: []
        },
        {
            id: 2,
            name: 'Sarah Service Manager',
            email: 'sarah.service@dealership.com',
            phone: '+1-555-0102',
            role: 'service_manager',
            permissions_count: 25,
            status: 'active',
            last_login: '2025-01-13 17:45:00',
            created_at: '2024-12-15 10:30:00',
            mfa_enabled: true,
            email_verified: true,
            department: 'Service',
            direct_permissions: ['pms.override_schedule'] // Additional direct permission
        },
        {
            id: 3,
            name: 'Mike Sales Rep',
            email: 'mike.sales@dealership.com',
            phone: '+1-555-0103',
            role: 'sales_rep',
            permissions_count: 18,
            status: 'active',
            last_login: '2025-01-13 16:20:00',
            created_at: '2025-01-05 14:15:00',
            mfa_enabled: false,
            email_verified: true,
            department: 'Sales',
            direct_permissions: []
        },
        {
            id: 4,
            name: 'Lisa Parts Head',
            email: 'lisa.parts@dealership.com',
            phone: '+1-555-0104',
            role: 'parts_head',
            permissions_count: 16,
            status: 'inactive',
            last_login: '2025-01-10 12:00:00',
            created_at: '2024-11-20 08:45:00',
            mfa_enabled: true,
            email_verified: false,
            department: 'Parts',
            direct_permissions: ['inventory.emergency_override']
        },
        {
            id: 5,
            name: 'Tom Technician',
            email: 'tom.tech@dealership.com',
            phone: '+1-555-0105',
            role: 'technician',
            permissions_count: 12,
            status: 'active',
            last_login: '2025-01-13 15:30:00',
            created_at: '2025-01-02 11:20:00',
            mfa_enabled: false,
            email_verified: true,
            department: 'Service',
            direct_permissions: []
        }
    ];

    // Spatie roles with their permission counts (from seeder analysis)
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

    // Permission categories from seeder
    const permissionCategories = [
        { name: 'PMS', permissions: ['pms.view', 'pms.create', 'pms.edit', 'pms.delete', 'pms.assign_technician', 'pms.complete', 'pms.override_schedule'] },
        { name: 'Inventory', permissions: ['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.approve', 'inventory.issue', 'inventory.return', 'inventory.audit', 'inventory.reorder'] },
        { name: 'Warranty', permissions: ['warranty.view', 'warranty.create', 'warranty.edit', 'warranty.delete', 'warranty.approve', 'warranty.audit', 'warranty.reconcile'] },
        { name: 'Sales', permissions: ['sales.view', 'sales.create', 'sales.edit', 'sales.delete', 'sales.assign_lead', 'sales.manage_pipeline', 'sales.test_drive', 'sales.close_deal'] },
        { name: 'Customer', permissions: ['customer.view', 'customer.create', 'customer.edit', 'customer.delete', 'customer.send_survey', 'customer.view_history'] },
        { name: 'Reporting', permissions: ['reports.view', 'reports.create', 'reports.export', 'reports.kpi_dashboard', 'reports.financial'] },
        { name: 'Users', permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.assign_roles', 'users.reset_password'] },
        { name: 'Audit', permissions: ['audit.view', 'audit.export', 'audit.supervisor_override', 'compliance.view', 'compliance.manage'] },
        { name: 'System', permissions: ['system.settings', 'system.backup', 'system.maintenance', 'system.logs'] }
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Users className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">User Management</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Users
                        </Button>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New User</DialogTitle>
                                    <DialogDescription>
                                        Create a new user with Spatie role-based permissions
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" placeholder="John Doe" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" placeholder="john@dealership.com" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input id="phone" placeholder="+1-555-0123" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="administration">Administration</SelectItem>
                                                    <SelectItem value="sales">Sales</SelectItem>
                                                    <SelectItem value="service">Service</SelectItem>
                                                    <SelectItem value="parts">Parts</SelectItem>
                                                    <SelectItem value="audit">Audit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Spatie Role</Label>
                                        <Select value={selectedRole} onValueChange={setSelectedRole}>
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
                                    <div className="grid gap-2">
                                        <Label>Additional Settings</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="mfa" />
                                            <Label htmlFor="mfa">Require MFA</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="email_verified" defaultChecked />
                                            <Label htmlFor="email_verified">Email Verified</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="active" defaultChecked />
                                            <Label htmlFor="active">Active Status</Label>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => setIsCreateDialogOpen(false)}>
                                        Create User
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5</div>
                            <p className="text-xs text-muted-foreground">Active accounts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8</div>
                            <p className="text-xs text-muted-foreground">Spatie roles defined</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">MFA Enabled</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">60%</div>
                            <p className="text-xs text-muted-foreground">3 of 5 users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">67</div>
                            <p className="text-xs text-muted-foreground">Available permissions</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage users with Spatie role-based permissions and MFA settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by name, email, or role..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {spatieRoles.map((role) => (
                                        <SelectItem key={role.name} value={role.name}>
                                            {role.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    <SelectItem value="administration">Administration</SelectItem>
                                    <SelectItem value="sales">Sales</SelectItem>
                                    <SelectItem value="service">Service</SelectItem>
                                    <SelectItem value="parts">Parts</SelectItem>
                                    <SelectItem value="audit">Audit</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Users</CardTitle>
                        <CardDescription>Users with Spatie role-based permissions and security settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User Details</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Role & Permissions</TableHead>
                                    <TableHead>Security</TableHead>
                                    <TableHead>Activity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-muted-foreground">{user.department}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Created: {user.created_at.split(' ')[0]}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="flex items-center space-x-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="text-sm">{user.email}</span>
                                                    {user.email_verified && (
                                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <Phone className="h-3 w-3" />
                                                    <span className="text-sm">{user.phone}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {getRoleBadge(user.role)}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {user.permissions_count} permissions
                                                </div>
                                                {user.direct_permissions.length > 0 && (
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        +{user.direct_permissions.length} direct
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-1">
                                                    <div className={`w-2 h-2 rounded-full ${user.mfa_enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <span className="text-xs">MFA</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <div className={`w-2 h-2 rounded-full ${user.email_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <span className="text-xs">Email</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="text-xs">Last login:</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {user.last_login}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <UserCheck className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Spatie Roles Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Spatie Roles Overview</CardTitle>
                        <CardDescription>Predefined roles with their permission counts and descriptions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {spatieRoles.map((role) => (
                                <div key={role.name} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{role.display_name}</h4>
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                            {role.permissions_count} permissions
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{role.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Permission Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle>Permission Categories</CardTitle>
                        <CardDescription>Available permissions organized by module</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {permissionCategories.map((category) => (
                                <div key={category.name} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{category.name}</h4>
                                        <Badge variant="outline">
                                            {category.permissions.length} perms
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        {category.permissions.slice(0, 3).map((permission) => (
                                            <div key={permission} className="text-xs text-muted-foreground">
                                                • {permission}
                                            </div>
                                        ))}
                                        {category.permissions.length > 3 && (
                                            <div className="text-xs text-blue-600">
                                                +{category.permissions.length - 3} more...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
