import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Plus, Eye, Edit, Shield, Trash2, Mail, Building2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface User {
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

interface Props {
    users: {
        data: User[];
        links: any[];
        meta: any;
    };
    branches: Branch[];
    roles: Role[];
    filters: {
        search?: string;
        branch_id?: string;
        role?: string;
    };
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
    };
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
];

export default function UserManagement({ users, branches, roles, filters, can }: Props) {
    const initialBranch = filters.branch_id && filters.branch_id !== '' ? filters.branch_id : 'all';
    const initialRole = filters.role && filters.role !== '' ? filters.role : 'all';

    const [search, setSearch] = useState(filters.search || '');
    const [branchId, setBranchId] = useState(initialBranch);
    const [role, setRole] = useState(initialRole);

    const applyFilters = () => {
        const trimmedSearch = search.trim();
        const query: Record<string, string> = {};

        if (trimmedSearch) {
            query.search = trimmedSearch;
        }

        if (branchId !== 'all') {
            query.branch_id = branchId;
        }

        if (role !== 'all') {
            query.role = role;
        }

        router.get('/admin/user-management', query, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setSearch('');
        setBranchId('all');
        setRole('all');

        router.get('/admin/user-management', {}, {
            replace: true,
        });
    };

    const hasActiveFilters = search.trim() !== '' || branchId !== 'all' || role !== 'all';

    const handleDelete = (userId: number, userName: string) => {
        if (!can.delete) {
            return;
        }

        if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            router.delete(`/admin/user-management/${userId}`, {
                preserveScroll: true,
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

    const totalUsers = users.meta?.total || users.data.length;
    const usersByBranch = new Set(users.data.map(u => u.branch_id)).size;
    const usersByRole = new Set(users.data.map(u => u.roles[0]?.name)).size;

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
                        {can.create && (
                            <Link href="/admin/user-management/create">
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create User
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsers}</div>
                            <p className="text-xs text-muted-foreground">Active accounts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Branches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{usersByBranch}</div>
                            <p className="text-xs text-muted-foreground">With assigned users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{usersByRole}</div>
                            <p className="text-xs text-muted-foreground">Roles in use</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{roles.length}</div>
                            <p className="text-xs text-muted-foreground">Available roles</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage system users with role-based access control</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                applyFilters();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <Select value={branchId} onValueChange={setBranchId}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Branches</SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id.toString()}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.name}>
                                            {r.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2 md:justify-end">
                                <Button variant="outline" onClick={resetFilters} disabled={!hasActiveFilters}>
                                    Reset
                                </Button>
                                <Button onClick={applyFilters}>
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Users</CardTitle>
                        <CardDescription>Users with role-based permissions and branch assignments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User Details</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {can.create ? (
                                                <>
                                                    No users found.{' '}
                                                    <Link href="/admin/user-management/create" className="text-primary hover:underline">
                                                        Create your first user
                                                    </Link>
                                                </>
                                            ) : (
                                                'No users found.'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                <div className="font-medium">{user.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="text-sm">{user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.branch ? (
                                                    <div className="flex items-center space-x-1">
                                                        <Building2 className="h-3 w-3" />
                                                        <span className="text-sm">{user.branch.name}</span>
                                                        <span className="text-xs text-muted-foreground">({user.branch.code})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No branch</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {user.roles.length > 0 ? (
                                                    getRoleBadge(user.roles[0].name)
                                                ) : (
                                                    <Badge variant="secondary">No role</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Link href={`/admin/user-management/${user.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {can.edit && (
                                                        <Link href={`/admin/user-management/${user.id}/edit`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {can.delete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(user.id, user.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
