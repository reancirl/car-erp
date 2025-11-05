import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Plus, Eye, Edit, Trash2, Star, Building2, Mail, Phone, TrendingUp, CheckCircle, AlertTriangle, XCircle, Crown } from 'lucide-react';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { useState, FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Customer Experience',
        href: '/sales/customer-experience',
    },
];

interface Customer {
    id: number;
    customer_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    customer_type: string;
    company_name: string | null;
    status: string;
    satisfaction_rating: string | null;
    total_purchases: number;
    total_spent: number;
    loyalty_points: number;
    customer_lifetime_value: number;
    created_at: string;
    deleted_at: string | null;
    branch: {
        id: number;
        name: string;
        code: string;
    };
    assigned_user: {
        id: number;
        name: string;
    } | null;
}

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface Stats {
    total: number;
    active: number;
    vip: number;
    total_lifetime_value: number;
}

interface Props extends PageProps {
    customers: {
        data: Customer[];
        links: any;
        meta: any;
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        customer_type?: string;
        satisfaction_rating?: string;
        branch_id?: number;
        include_deleted?: boolean;
    };
    branches: Branch[] | null;
}

export default function CustomerExperience({ customers, stats, filters, branches, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [customerType, setCustomerType] = useState(filters.customer_type || 'all');
    const [satisfactionRating, setSatisfactionRating] = useState(filters.satisfaction_rating || 'all');
    const [branchId, setBranchId] = useState<string>(filters.branch_id?.toString() || 'all');
    const [includeDeleted, setIncludeDeleted] = useState(filters.include_deleted || false);

    const permissions = auth?.permissions ?? [];
    const canCreate = permissions.includes('customer.create');
    const canEdit = permissions.includes('customer.edit');
    const canDelete = permissions.includes('customer.delete');

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get('/sales/customer-experience', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            customer_type: customerType !== 'all' ? customerType : undefined,
            satisfaction_rating: satisfactionRating !== 'all' ? satisfactionRating : undefined,
            branch_id: branchId !== 'all' ? branchId : undefined,
            include_deleted: includeDeleted || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (customer: Customer) => {
        if (!canDelete) {
            return;
        }

        if (confirm(`Are you sure you want to delete customer ${customer.customer_id}?`)) {
            router.delete(`/sales/customer-experience/${customer.id}`);
        }
    };

    const handleRestore = (customer: Customer) => {
        if (!canCreate) {
            return;
        }

        if (confirm(`Restore customer ${customer.customer_id}?`)) {
            router.post(`/sales/customer-experience/${customer.id}/restore`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case 'vip':
                return (
                    <Badge className="bg-purple-100 text-purple-800">
                        <Crown className="h-3 w-3 mr-1" />
                        VIP
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                    </Badge>
                );
            case 'blacklisted':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Blacklisted
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getSatisfactionBadge = (rating: string | null) => {
        if (!rating) return <span className="text-sm text-muted-foreground">N/A</span>;
        
        switch (rating) {
            case 'very_satisfied':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <Star className="h-3 w-3 mr-1 fill-green-800" />
                        Very Satisfied
                    </Badge>
                );
            case 'satisfied':
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        <Star className="h-3 w-3 mr-1" />
                        Satisfied
                    </Badge>
                );
            case 'neutral':
                return (
                    <Badge variant="secondary">
                        Neutral
                    </Badge>
                );
            case 'dissatisfied':
                return (
                    <Badge className="bg-orange-100 text-orange-800">
                        Dissatisfied
                    </Badge>
                );
            case 'very_dissatisfied':
                return (
                    <Badge variant="destructive">
                        Very Dissatisfied
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{rating}</Badge>;
        }
    };

    const getCustomerTypeBadge = (type: string) => {
        switch (type) {
            case 'individual':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Users className="h-3 w-3 mr-1" />
                        Individual
                    </Badge>
                );
            case 'corporate':
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        <Building2 className="h-3 w-3 mr-1" />
                        Corporate
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Experience" />
            
            <div className="space-y-6 p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center">
                            <Users className="h-8 w-8 mr-3 text-primary" />
                            Customer Experience
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage customer relationships and track satisfaction
                        </p>
                    </div>
                    {canCreate && (
                        <Link href="/sales/customer-experience/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Customer
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">All registered customers</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Currently active</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
                            <Crown className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.vip.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Premium tier</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Lifetime Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                ₱{stats.total_lifetime_value.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Combined CLV</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Customers</CardTitle>
                        <CardDescription>Search and filter customer records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Name, email, phone, ID..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="vip">VIP</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="blacklisted">Blacklisted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Customer Type</label>
                                    <Select value={customerType} onValueChange={setCustomerType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="corporate">Corporate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Satisfaction</label>
                                    <Select value={satisfactionRating} onValueChange={setSatisfactionRating}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All ratings" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Ratings</SelectItem>
                                            <SelectItem value="very_satisfied">Very Satisfied</SelectItem>
                                            <SelectItem value="satisfied">Satisfied</SelectItem>
                                            <SelectItem value="neutral">Neutral</SelectItem>
                                            <SelectItem value="dissatisfied">Dissatisfied</SelectItem>
                                            <SelectItem value="very_dissatisfied">Very Dissatisfied</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {branches && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Branch</label>
                                        <Select value={branchId} onValueChange={setBranchId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All branches" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Branches</SelectItem>
                                                {branches.map((branch) => (
                                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                                        {branch.name} ({branch.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Include Deleted</label>
                                    <div className="flex items-center space-x-2 h-10">
                                        <input
                                            type="checkbox"
                                            id="include_deleted"
                                            checked={includeDeleted}
                                            onChange={(e) => setIncludeDeleted(e.target.checked)}
                                            className="h-4 w-4"
                                        />
                                        <label htmlFor="include_deleted" className="text-sm text-muted-foreground">
                                            Show deleted customers
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit">Apply Filters</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Customers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customers ({customers.meta?.total || 0})</CardTitle>
                        <CardDescription>View and manage all customer records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!customers.data || customers.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {search || status !== 'all' || customerType !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'Get started by adding your first customer'}
                                </p>
                                {canCreate && (
                                    <Link href="/sales/customer-experience/create">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Customer
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Satisfaction</TableHead>
                                            <TableHead>Purchases</TableHead>
                                            <TableHead>Total Spent</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customers.data.map((customer) => (
                                            <TableRow key={customer.id} className={customer.deleted_at ? 'opacity-50' : ''}>
                                                <TableCell className="font-medium">{customer.customer_id}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {customer.first_name} {customer.last_name}
                                                        </div>
                                                        {customer.company_name && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {customer.company_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getCustomerTypeBadge(customer.customer_type)}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-sm">
                                                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                                            {customer.email}
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                                            {customer.phone}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(customer.status)}</TableCell>
                                                <TableCell>{getSatisfactionBadge(customer.satisfaction_rating)}</TableCell>
                                                <TableCell>{customer.total_purchases}</TableCell>
                                                <TableCell>₱{customer.total_spent.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{customer.branch.code}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-1">
                                                        {customer.deleted_at ? (
                                                            canCreate && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRestore(customer)}
                                                                    title="Restore"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                            )
                                                        ) : (
                                                            <>
                                                                <Link href={`/sales/customer-experience/${customer.id}`}>
                                                                    <Button variant="ghost" size="sm" title="View">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                            </Link>
                                                            {canEdit && (
                                                                <Link href={`/sales/customer-experience/${customer.id}/edit`}>
                                                                    <Button variant="ghost" size="sm" title="Edit">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {canDelete && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(customer)}
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {customers.meta?.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {customers.meta.from} to {customers.meta.to} of {customers.meta.total} customers
                                        </div>
                                        <div className="flex space-x-2">
                                            {customers.links?.map((link: any, index: number) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => link.url && router.get(link.url)}
                                                    disabled={!link.url}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
