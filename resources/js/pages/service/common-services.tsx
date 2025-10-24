import { useState, FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Wrench,
    Search,
    Filter,
    Download,
    Plus,
    Eye,
    Edit,
    Trash2,
    RotateCcw,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type BreadcrumbItem, type Branch, type CommonService, type PaginatedResponse } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Service & Parts', href: '/service' },
    { title: 'Common Services', href: '/service/common-services' },
];

interface Stats {
    total_services: number;
    active_services: number;
    inactive_services: number;
    average_price: number;
    total_standard_price: number;
}

type CategoryStats = Record<string, number>;

interface Filters {
    search?: string;
    category?: string;
    status?: string;
    branch_id?: string;
    include_deleted?: boolean | string;
}

interface CategoryOption {
    value: string;
    label: string;
}

interface Permissions {
    create: boolean;
    edit: boolean;
    delete: boolean;
}

interface Props {
    commonServices: PaginatedResponse<CommonService>;
    stats: Stats;
    categoryStats: CategoryStats;
    filters: Filters;
    branches?: Branch[] | null;
    meta?: {
        categories?: CategoryOption[];
    };
    can: Permissions;
}

const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const formatPrice = (value: number | string | undefined) => {
    const numericValue = Number(value ?? 0);
    return `₱${numericValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const getCategoryBadge = (category: string) => {
    switch (category) {
        case 'maintenance':
            return <Badge variant="outline" className="bg-blue-100 text-blue-800">Maintenance</Badge>;
        case 'repair':
            return <Badge variant="outline" className="bg-orange-100 text-orange-800">Repair</Badge>;
        case 'inspection':
            return <Badge variant="outline" className="bg-purple-100 text-purple-800">Inspection</Badge>;
        case 'diagnostic':
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Diagnostic</Badge>;
        default:
            return <Badge variant="secondary" className="capitalize">{category}</Badge>;
    }
};

const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
        <Badge variant="outline" className="bg-green-100 text-green-800">
            Active
        </Badge>
    ) : (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Inactive
        </Badge>
    );
};

export default function CommonServices({
    commonServices,
    stats,
    categoryStats,
    filters,
    branches,
    meta,
    can,
}: Props) {
    const categoryOptions = meta?.categories ?? [
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'repair', label: 'Repair' },
        { value: 'inspection', label: 'Inspection' },
        { value: 'diagnostic', label: 'Diagnostic' },
    ];

    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? 'all');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [branchId, setBranchId] = useState(filters.branch_id ?? 'all');
    const [includeDeleted, setIncludeDeleted] = useState(
        filters.include_deleted === true || filters.include_deleted === '1'
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<CommonService | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [restoringId, setRestoringId] = useState<number | null>(null);

    const handleFilter = (event: FormEvent) => {
        event.preventDefault();

        const params: Record<string, string> = {};

        if (search) params.search = search;
        if (category && category !== 'all') params.category = category;
        if (status && status !== 'all') params.status = status;
        if (branchId && branchId !== 'all') params.branch_id = branchId;
        if (includeDeleted) params.include_deleted = '1';

        router.get('/service/common-services', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (service: CommonService) => {
        setSelectedService(service);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedService) return;

        setDeleting(true);
        router.delete(route('common-services.destroy', selectedService.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSelectedService(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const handleRestore = (service: CommonService) => {
        setRestoringId(service.id);
        router.post(
            route('common-services.restore', service.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setRestoringId(null),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Common Services" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Wrench className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Common Services</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export List
                        </Button>
                        {can.create && (
                            <Link href="/service/common-services/create">
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Common Service
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_services}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_services} active
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_services}</div>
                            <p className="text-xs text-muted-foreground">Currently available</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Inactive Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.inactive_services}</div>
                            <p className="text-xs text-muted-foreground">Hidden from selection</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(stats.average_price)}</div>
                            <p className="text-xs text-muted-foreground">
                                Total catalog value {formatPrice(stats.total_standard_price)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Refine the service catalog by name, category, or status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by service name or code"
                                            className="pl-9"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Filter className="h-4 w-4" />
                                    <span>Advanced Filters</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All categories</SelectItem>
                                        {categoryOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {branches && (
                                    <Select value={branchId} onValueChange={setBranchId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All branches</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="include_deleted"
                                        checked={includeDeleted}
                                        onCheckedChange={(checked) => setIncludeDeleted(Boolean(checked))}
                                    />
                                    <label htmlFor="include_deleted" className="text-sm text-muted-foreground">
                                        Include deleted
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit">Apply Filters</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Common Services Catalog</CardTitle>
                        <CardDescription>
                            Manage reusable service templates, pricing, and duration references
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {commonServices.data.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No common services found. Adjust your filters or create a new service.
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Standard Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {commonServices.data.map((service) => (
                                            <TableRow key={service.id} className={service.deleted_at ? 'opacity-60' : ''}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{service.name}</div>
                                                        <div className="text-xs text-muted-foreground uppercase">
                                                            {service.code}
                                                        </div>
                                                        {service.description && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {service.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getCategoryBadge(service.category)}</TableCell>
                                                <TableCell>
                                                    {service.formatted_estimated_duration ??
                                                        `${Number(service.estimated_duration ?? 0).toFixed(2)} hrs`}
                                                </TableCell>
                                                <TableCell>
                                                    {service.formatted_standard_price ?? formatPrice(service.standard_price)}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(Boolean(service.is_active))}</TableCell>
                                                <TableCell>{service.branch?.name ?? '—'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Link href={`/service/common-services/${service.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {can.edit && (
                                                            <Link href={`/service/common-services/${service.id}/edit`}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {service.deleted_at && can.delete ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRestore(service)}
                                                                disabled={restoringId === service.id}
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            can.delete && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(service)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {commonServices.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {commonServices.from} to {commonServices.to} of {commonServices.total} results
                                        </div>
                                        <div className="flex gap-2">
                                            {commonServices.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
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

                {/* Category Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                        <CardDescription>Understand how services are distributed across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(categoryStats).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No categories recorded yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(categoryStats).map(([categoryName, count]) => (
                                    <div
                                        key={categoryName}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium capitalize">{categoryName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {count} service{count !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        {getCategoryBadge(categoryName)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Common Service</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">{selectedService?.name}</span>? This action can be
                            undone by restoring the record later.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex items-center justify-end space-x-2">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
