import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, Save, User, Mail, Shield, Building2, Key, Loader2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { FormEvent } from 'react';

interface UserData {
    id: number;
    name: string;
    email: string;
    branch_id: number;
    branch?: {
        id: number;
        name: string;
        code: string;
    };
    roles: Array<{
        id: number;
        name: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface Role {
    id: number;
    name: string;
}

interface UserEditProps {
    user: UserData;
    branches: Branch[];
    roles: Role[];
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
        href: '#',
    },
];

export default function UserEdit({ user, branches, roles }: UserEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        branch_id: user.branch_id?.toString() || '',
        role: user.roles[0]?.name || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/user-management/${user.id}`, {
            preserveScroll: true,
            onError: (errors) => {
                console.log('Form submission errors:', errors);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User - ${user.name}`} />
            
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/user-management">
                            <Button variant="outline" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Users
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Users className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">Edit User</h1>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/admin/user-management">
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
                            {processing ? 'Saving...' : 'Save Changes'}
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
                                    <User className="h-5 w-5" />
                                    <span>Basic Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Update the user's personal details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input 
                                        id="name" 
                                        placeholder="e.g., John Doe" 
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required 
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    {!errors.name && <p className="text-xs text-muted-foreground">Minimum 3 characters</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input 
                                        id="email" 
                                        type="email"
                                        placeholder="e.g., john.doe@example.com" 
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required 
                                    />
                                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    {!errors.email && <p className="text-xs text-muted-foreground">Must be a valid email address</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Key className="h-5 w-5" />
                                    <span>Change Password</span>
                                </CardTitle>
                                <CardDescription>
                                    Leave blank to keep current password
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input 
                                        id="password" 
                                        type="password"
                                        placeholder="Enter new password" 
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                                    {!errors.password && <p className="text-xs text-muted-foreground">Minimum 8 characters (optional)</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                    <Input 
                                        id="password_confirmation" 
                                        type="password"
                                        placeholder="Confirm new password" 
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
                                    {!errors.password_confirmation && <p className="text-xs text-muted-foreground">Must match the password above</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building2 className="h-5 w-5" />
                                    <span>Assignment</span>
                                </CardTitle>
                                <CardDescription>
                                    Update branch and role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="branch_id">Branch *</Label>
                                    <Select value={data.branch_id} onValueChange={(value) => setData('branch_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name} ({branch.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.branch_id && <p className="text-sm text-red-600">{errors.branch_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role *</Label>
                                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.name}>
                                                    <div className="flex items-center space-x-2">
                                                        <Shield className="h-3 w-3" />
                                                        <span>{role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">User ID:</span>
                                    <span className="ml-2 font-medium">#{user.id}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="ml-2 font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span className="ml-2 font-medium">{new Date(user.updated_at).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
