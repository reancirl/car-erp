import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Search, Filter, Download, Plus, Eye, Edit, Clock, CheckCircle, AlertCircle, Trash2, RotateCcw } from 'lucide-react';
import { type BreadcrumbItem, type ServiceType, type PaginatedResponse, type Branch } from '@/types';
import { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'Service Types',
        href: '/service/service-types',
    },
];

interface Stats {
    total_service_types: number;
    active_services: number;
    inactive_services: number;
    mileage_based: number;
    time_based: number;
}

interface CategoryStats {
    [key: string]: number;
}

interface Filters {
    search?: string;
    category?: string;
    status?: string;
    interval_type?: string;
    branch_id?: string;
    include_deleted?: boolean | string;
}

interface Permissions {
    create: boolean;
    edit: boolean;
    delete: boolean;
    restore: boolean;
}

interface Props {
    serviceTypes: PaginatedResponse<ServiceType>;
    stats: Stats;
    categoryStats: CategoryStats;
    filters: Filters;
    branches?: Branch[] | null;
    can: Permissions;
}

export default function ServiceTypes({ serviceTypes, stats, categoryStats, filters, branches, can }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [intervalType, setIntervalType] = useState(filters.interval_type || 'all');
    const [branchId, setBranchId] = useState(filters.branch_id || 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [includeDeleted, setIncludeDeleted] = useState(
        filters.include_deleted === true || filters.include_deleted === '1'
    );
    const [restoringId, setRestoringId] = useState<number | null>(null);

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'maintenance':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Maintenance</Badge>;
            case 'repair':
                return <Badge variant="outline" className="bg-orange-100 text-orange-800">Repair</Badge>;
            case 'warranty':
                return <Badge variant="outline" className="bg-green-100 text-green-800">Warranty</Badge>;
            case 'inspection':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800">Inspection</Badge>;
            case 'diagnostic':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Diagnostic</Badge>;
            default:
                return <Badge variant="secondary">{category}</Badge>;
        }
    };

    const getIntervalDisplay = (serviceType: ServiceType) => {
        if (serviceType.interval_description) {
            return serviceType.interval_description;
        }
        if (serviceType.interval_type === 'on_demand') return 'On Demand';
        if (serviceType.interval_type === 'mileage' && serviceType.interval_value) {
            return `${serviceType.interval_value.toLocaleString()} km`;
        }
        if (serviceType.interval_type === 'time' && serviceType.interval_value) {
            return `${serviceType.interval_value} months`;
        }
        return 'Not Set';
    };

    const getStatusBadge = (serviceType: ServiceType) => {
        if (serviceType.deleted_at) {
            return (
                <Badge variant="outline" className="bg-red-100 text-red-800">
                    Deleted
                </Badge>
            );
        }

        if (serviceType.status === 'active' && serviceType.is_available) {
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                </Badge>
            );
        }

        return (
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Inactive
            </Badge>
        );
    };

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();

        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (category && category !== 'all') params.category = category;
        if (status && status !== 'all') params.status = status;
        if (intervalType && intervalType !== 'all') params.interval_type = intervalType;
        if (branchId && branchId !== 'all') params.branch_id = branchId;
        if (includeDeleted) params.include_deleted = '1';

        router.get('/service/service-types', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRestore = (serviceType: ServiceType) => {
        setRestoringId(serviceType.id);
        router.post(
            route('service-types.restore', serviceType.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setRestoringId(null),
            }
        );
    };

    const handleDelete = (serviceType: ServiceType) => {
        setSelectedServiceType(serviceType);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedServiceType) return;

        setDeleting(true);
        router.delete(route('service-types.destroy', selectedServiceType.id), {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSelectedServiceType(null);
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Types" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Settings className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Service Types</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export List
                        </Button>
                        {can.create && (
                            <Link href="/service/service-types/create">
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Service Type
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Service Types</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_service_types}</div>
                            <p className="text-xs text-muted-foreground">{stats.active_services} active</p>
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
                            <CardTitle className="text-sm font-medium">Mileage Based</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.mileage_based}</div>
                            <p className="text-xs text-muted-foreground">Km-based intervals</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Time Based</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.time_based}</div>
                            <p className="text-xs text-muted-foreground">Time-based intervals</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage service types, categories, intervals, and pricing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, code, or description..."
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            {branches && (
                                <Select value={branchId} onValueChange={setBranchId}>
                                    <SelectTrigger className="w-full md:w-[180px]">
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
                            )}
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="repair">Repair</SelectItem>
                                    <SelectItem value="warranty">Warranty</SelectItem>
                                    <SelectItem value="inspection">Inspection</SelectItem>
                                    <SelectItem value="diagnostic">Diagnostic</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="discontinued">Discontinued</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={intervalType} onValueChange={setIntervalType}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Interval Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Intervals</SelectItem>
                                    <SelectItem value="mileage">Mileage Based</SelectItem>
                                    <SelectItem value="time">Time Based</SelectItem>
                                    <SelectItem value="on_demand">On Demand</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Checkbox
                                    id="include_deleted"
                                    checked={includeDeleted}
                                    onCheckedChange={(checked) => setIncludeDeleted(Boolean(checked))}
                                />
                                <label htmlFor="include_deleted">Include deleted</label>
                            </div>
                            <Button type="submit">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Service Types Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Service Types ({serviceTypes.total})</CardTitle>
                        <CardDescription>Manage service categories, intervals, pricing, and associated common services</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {serviceTypes.data.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No service types found</p>
                                <Link href="/service/service-types/create">
                                    <Button size="sm" className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Service Type
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Service Type</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Interval</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Base Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {serviceTypes.data.map((serviceType) => (
                                            <TableRow
                                                key={serviceType.id}
                                                className={serviceType.deleted_at ? 'opacity-60' : ''}
                                            >
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <div className="font-medium">{serviceType.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Code: {serviceType.code}
                                                        </div>
                                                        {serviceType.description && (
                                                            <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                                                {serviceType.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getCategoryBadge(serviceType.category)}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {getIntervalDisplay(serviceType)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span className="text-sm">
                                                            {serviceType.formatted_estimated_duration || serviceType.estimated_duration ? `${serviceType.estimated_duration}h` : 'N/A'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {serviceType.formatted_base_price || (Number(serviceType.base_price) > 0 ? `₱${Number(serviceType.base_price).toLocaleString()}` : 'Free')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(serviceType)}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-1">
                                                        <Link href={`/service/service-types/${serviceType.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {can.edit && !serviceType.deleted_at && (
                                                            <Link href={`/service/service-types/${serviceType.id}/edit`}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {serviceType.deleted_at ? (
                                                            can.restore && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRestore(serviceType)}
                                                                    disabled={restoringId === serviceType.id}
                                                                >
                                                                    <RotateCcw className="h-4 w-4" />
                                                                </Button>
                                                            )
                                                        ) : (
                                                            can.delete && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(serviceType)}
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
                                {serviceTypes.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {serviceTypes.from} to {serviceTypes.to} of {serviceTypes.total} results
                                        </div>
                                        <div className="flex gap-2">
                                            {serviceTypes.links.map((link, index) => (
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

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Categories</CardTitle>
                            <CardDescription>Distribution of service types by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(categoryStats).map(([category, count]) => (
                                    <div key={category} className="flex items-center justify-between">
                                        <span className="text-sm capitalize">{category}</span>
                                        {getCategoryBadge(category)}
                                        <Badge variant="outline">{count} type{count !== 1 ? 's' : ''}</Badge>
                                    </div>
                                ))}
                                {Object.keys(categoryStats).length === 0 && (
                                    <p className="text-sm text-muted-foreground">No categories yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Service Intervals</CardTitle>
                            <CardDescription>Service scheduling and interval configuration</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Mileage-Based Services</span>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">{stats.mileage_based} service{stats.mileage_based !== 1 ? 's' : ''}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Time-Based Services</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">{stats.time_based} service{stats.time_based !== 1 ? 's' : ''}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">On-Demand Services</span>
                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                        {stats.total_service_types - stats.mileage_based - stats.time_based} service{(stats.total_service_types - stats.mileage_based - stats.time_based) !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Service Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedServiceType?.name}"? This action can be undone from the activity logs.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
