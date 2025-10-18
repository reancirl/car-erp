import { Head, Link, router } from '@inertiajs/react';
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
    Building2,
    Shield,
    Calendar,
    Trash2
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

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
    permissions?: Array<{
        id: number;
        name: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface UserViewProps {
    user: UserData;
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
        href: '#',
    },
];

export default function UserView({ user }: UserViewProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            router.delete(`/admin/user-management/${user.id}`, {
                onSuccess: () => {
                    router.visit('/admin/user-management');
                }
            });
        }
    };

    const getRoleBadge = (roleName: string) => {
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
            <Badge variant="outline" className={colorMap[roleName] || 'bg-gray-100 text-gray-800'}>
                <Shield className="h-3 w-3 mr-1" />
                {roleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} - User Details`} />
            
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
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            {user.roles.length > 0 && getRoleBadge(user.roles[0].name)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/admin/user-management/${user.id}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* User Overview Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Contact</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Name:</span> {user.name}</p>
                                    <p className="text-sm"><span className="font-medium">Email:</span> {user.email}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Branch</h3>
                                <div className="space-y-1">
                                    {user.branch ? (
                                        <>
                                            <p className="text-sm"><span className="font-medium">Name:</span> {user.branch.name}</p>
                                            <p className="text-sm"><span className="font-medium">Code:</span> {user.branch.code}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No branch assigned</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Role</h3>
                                <div className="space-y-1">
                                    {user.roles.length > 0 ? (
                                        <>
                                            <p className="text-sm"><span className="font-medium">Role:</span> {user.roles[0].name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                            {user.permissions && (
                                                <p className="text-sm"><span className="font-medium">Permissions:</span> {user.permissions.length}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No role assigned</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Dates</h3>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                                    <p className="text-sm"><span className="font-medium">Updated:</span> {new Date(user.updated_at).toLocaleDateString()}</p>
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
                                    <User className="h-5 w-5" />
                                    <span>Basic Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                        <p className="text-sm font-medium">{user.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                                        <p className="text-sm font-medium">#{user.id}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">{new Date(user.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Branch Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building2 className="h-5 w-5" />
                                    <span>Branch Assignment</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {user.branch ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Branch Name</Label>
                                                <p className="text-sm font-medium">{user.branch.name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Branch Code</Label>
                                                <p className="text-sm font-medium">{user.branch.code}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Link href={`/admin/branch-management/${user.branch.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Branch Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No branch assigned to this user.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Role & Permissions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5" />
                                    <span>Role & Permissions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Assigned Role</span>
                                    {user.roles.length > 0 ? (
                                        getRoleBadge(user.roles[0].name)
                                    ) : (
                                        <Badge variant="secondary">No role</Badge>
                                    )}
                                </div>
                                {user.permissions && user.permissions.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Total Permissions</Label>
                                        <p className="text-2xl font-bold">{user.permissions.length}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/admin/user-management/${user.id}/edit`}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit User Details
                                    </Button>
                                </Link>
                                {user.branch && (
                                    <Link href={`/admin/branch-management/${user.branch.id}`}>
                                        <Button variant="outline" size="sm" className="w-full justify-start">
                                            <Building2 className="h-4 w-4 mr-2" />
                                            View Branch
                                        </Button>
                                    </Link>
                                )}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full justify-start text-red-600 hover:text-red-700"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
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
