import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    Building2, 
    Search, 
    Filter, 
    Download, 
    Plus, 
    Eye, 
    Edit, 
    MapPin, 
    Users, 
    Phone, 
    Mail, 
    Calendar,
    CheckCircle,
    AlertTriangle,
    Clock,
    Crown,
    Building,
    UserPlus
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

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

interface Props {
    branches: {
        data: Branch[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
    };
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
];

export default function BranchManagement({ branches, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/admin/branch-management', { search: value, status }, { 
            preserveState: true, 
            replace: true 
        });
    };

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        router.get('/admin/branch-management', { search, status: value === 'all' ? '' : value }, { 
            preserveState: true, 
            replace: true 
        });
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
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const activeBranches = branches.data.filter(branch => branch.status === 'active');
    const totalBranches = branches.data.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Management" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Building2 className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Branch Management</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/admin/branch-management/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Branch
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalBranches}</div>
                            <p className="text-xs text-muted-foreground">Total locations</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeBranches.length}</div>
                            <p className="text-xs text-muted-foreground">{totalBranches > 0 ? Math.round((activeBranches.length / totalBranches) * 100) : 0}% operational</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">States/Provinces</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(branches.data.map(b => b.state)).size}</div>
                            <p className="text-xs text-muted-foreground">Coverage areas</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Cities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(branches.data.map(b => b.city)).size}</div>
                            <p className="text-xs text-muted-foreground">Unique cities</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage dealership branches across the Philippines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by name, code, city..." 
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Select value={status || 'all'} onValueChange={handleStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Branches Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branch Locations</CardTitle>
                        <CardDescription>Dealershipss branches and headquarters across the Philippines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Branch Details</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {branches.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No branches found. <Link href="/admin/branch-management/create" className="text-primary hover:underline">Create your first branch</Link>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    branches.data.map((branch) => (
                                        <TableRow key={branch.id}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-medium">{branch.name}</div>
                                                    <div className="text-xs text-muted-foreground">Code: {branch.code}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="text-sm">{branch.city}, {branch.state}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{branch.country}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {branch.postal_code}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    {branch.phone && (
                                                        <div className="flex items-center space-x-1">
                                                            <Phone className="h-3 w-3" />
                                                            <span className="text-sm">{branch.phone}</span>
                                                        </div>
                                                    )}
                                                    {branch.email && (
                                                        <div className="flex items-center space-x-1 mt-1">
                                                            <Mail className="h-3 w-3" />
                                                            <span className="text-sm">{branch.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(branch.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Link href={`/admin/branch-management/${branch.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/branch-management/${branch.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
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
