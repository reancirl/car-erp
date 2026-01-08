import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Search, Filter, Download, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock, MapPin, User, Fuel, Trash2, RotateCcw, ArrowRightLeft, Lock } from 'lucide-react';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { useState, FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/inventory',
    },
    {
        title: 'Vehicle Inventory',
        href: '/inventory/vehicles',
    },
];

interface VehicleUnit {
    id: number;
    vehicle_model_id: number | null;
    branch_id: number;
    assigned_user_id: number | null;
    vin: string;
    stock_number: string;
    status: string;
    sub_status?: string | null;
    location: string;
    is_locked?: boolean;
    conduction_no?: string | null;
    drive_motor_no?: string | null;
    plate_no?: string | null;
    color_code?: string | null;
    purchase_price: number;
    sale_price: number | null;
    msrp_price: number | null;
    currency: string;
    acquisition_date: string | null;
    sold_date: string | null;
    color_exterior: string | null;
    color_interior: string | null;
    odometer: number | null;
    notes: string | null;
    created_at: string;
    deleted_at: string | null;
    vehicle_model: {
        id: number;
        make: string;
        model: string;
        year: number;
        body_type: string | null;
        transmission: string | null;
        fuel_type: string | null;
        variant?: string | null;
    } | null;
    branch: {
        id: number;
        name: string;
        code: string;
    };
    assigned_user: {
        id: number;
        name: string;
        email: string;
    } | null;
    owner?: {
        id: number;
        name?: string;
        full_name?: string;
        display_name?: string;
        email: string;
    } | null;
    lto_transaction_no?: string | null;
    cr_no?: string | null;
}

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface Stats {
    total: number;
    in_stock: number;
    reserved: number;
    sold: number;
    total_value: number;
}

interface Props extends PageProps {
    records: {
        data: VehicleUnit[];
        links: any;
        meta: any;
    };
    stats: Stats;
    filters: {
        search?: string;
        branch_id?: number;
        status?: string;
        vin?: string;
        stock_number?: string;
        include_deleted?: boolean;
    };
    branches: Branch[] | null;
    customers?: any;
}

export default function VehicleInventory({ records, stats, filters, branches, auth }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [branchId, setBranchId] = useState<string>(filters?.branch_id?.toString() || 'all');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [includeDeleted, setIncludeDeleted] = useState(filters?.include_deleted || false);

    const permissions = auth?.permissions ?? [];
    const roles = auth?.roles ?? [];
    const canCreate = permissions.includes('inventory.create');
    const canEdit = permissions.includes('inventory.edit');
    const canDelete = permissions.includes('inventory.delete');
    const canRestore = permissions.includes('inventory.create');

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get('/inventory/vehicles', {
            search: search || undefined,
            branch_id: branchId !== 'all' ? branchId : undefined,
            status: status !== 'all' ? status : undefined,
            include_deleted: includeDeleted || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        if (!canDelete) {
            return;
        }

        if (confirm('Are you sure you want to delete this vehicle unit?')) {
            router.delete(`/inventory/units/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleRestore = (id: number) => {
        if (!canRestore) {
            return;
        }

        if (confirm('Are you sure you want to restore this vehicle unit?')) {
            router.post(`/inventory/units/${id}/restore`, {}, {
                preserveScroll: true,
            });
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: currency || 'PHP',
        }).format(amount);
    };

    const isAdmin = roles.includes('admin') || roles.includes('auditor');

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            in_stock: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'In Stock' },
            reserved: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Reserved' },
            sold: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Sold' },
            in_transit: { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'In Transit' },
            transferred: { color: 'bg-purple-100 text-purple-800', icon: ArrowRightLeft, label: 'Transferred' },
            disposed: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle, label: 'Disposed' },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_stock;
        const IconComponent = config.icon;
        
        return (
            <Badge className={config.color}>
                <IconComponent className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getVehicleTypeBadge = (type: string) => {
        const colors = {
            new: 'bg-green-100 text-green-800',
            used: 'bg-blue-100 text-blue-800',
            demo: 'bg-purple-100 text-purple-800',
            certified: 'bg-yellow-100 text-yellow-800',
        };
        return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type.toUpperCase()}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-red-100 text-red-800',
        };
        return <Badge variant="outline" className={colors[priority as keyof typeof colors]}>{priority.toUpperCase()}</Badge>;
    };

    const getLocationBadge = (location: string) => {
        const labels: Record<string, { label: string; color: string }> = {
            warehouse: { label: 'Warehouse', color: 'bg-slate-100 text-slate-800' },
            gbf: { label: 'GBF', color: 'bg-cyan-100 text-cyan-800' },
            branch: { label: 'Branch', color: 'bg-emerald-100 text-emerald-800' },
            sold: { label: 'Sold', color: 'bg-blue-100 text-blue-800' },
        };
        const entry = labels[location] ?? labels.branch;
        return <Badge className={entry.color}>{entry.label}</Badge>;
    };

    const getSubStatusLabel = (subStatus?: string | null) => {
        if (!subStatus) return null;
        const labels: Record<string, string> = {
            reserved_with_dp: 'Reserved – with DP',
            reserved_no_dp: 'Reserved – no DP',
            for_lto: 'For LTO',
            for_release: 'For Release',
            for_body_repair: 'For Body Repair',
            inspection: 'For Inspection',
        };
        return labels[subStatus] ?? subStatus;
    };

    // Use real stats from API
    const totalInventoryValue = stats.total_value;
    const availableVehicles = stats.in_stock;
    const soldVehicles = stats.sold;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Inventory" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Car className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Vehicle Inventory</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        {canCreate && (
                            <Link href="/inventory/vehicles/create">
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Vehicle
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">In inventory</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.in_stock}</div>
                            <p className="text-xs text-muted-foreground">Available</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
                            <p className="text-xs text-muted-foreground">Pending sale</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue, 'PHP')}</div>
                            <p className="text-xs text-muted-foreground">In stock value</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Search and filter vehicle inventory by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="VIN, stock, make, model..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                {isAdmin && branches && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Branch</label>
                                        <Select value={branchId} onValueChange={setBranchId}>
                                            <SelectTrigger>
                                                <SelectValue />
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
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="in_stock">In Stock</SelectItem>
                                            <SelectItem value="reserved">Reserved</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                            <SelectItem value="in_transit">In Transit</SelectItem>
                                            <SelectItem value="transferred">Transferred</SelectItem>
                                            <SelectItem value="disposed">Disposed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="include_deleted"
                                        checked={includeDeleted}
                                        onChange={(e) => setIncludeDeleted(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="include_deleted" className="text-sm font-medium">
                                        Include deleted records
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => {
                                        setSearch('');
                                        setBranchId('all');
                                        setStatus('all');
                                        setIncludeDeleted(false);
                                        router.get('/inventory/vehicles');
                                    }}>
                                        Clear
                                    </Button>
                                    <Button type="submit">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Vehicle Inventory Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Inventory</CardTitle>
                        <CardDescription>Complete vehicle inventory with pricing, location, and sales information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle Details</TableHead>
                                    <TableHead>Specifications</TableHead>
                                    <TableHead>Pricing</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Sales Info</TableHead>
                                    <TableHead>Days in Inventory</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!records?.data || records.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                            <div className="space-y-3">
                                                <div>No vehicle units found. Try adjusting your filters.</div>
                                                {canCreate && (
                                                    <div>
                                                        <Link href="/inventory/vehicles/create">
                                                            <Button size="sm">
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add Vehicle
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    records.data.map((unit) => (
                                        <TableRow 
                                            key={unit.id} 
                                            className={unit.deleted_at ? 'opacity-50' : ''}
                                        >
                                            {/* Vehicle Details */}
                                            <TableCell className="font-medium">
                                                <div>
                                                    <Badge variant="outline" className="mb-1">{unit.stock_number}</Badge>
                                                <div className="font-medium">
                                                    {unit.vehicle_model
                                                        ? `${unit.vehicle_model.year} ${unit.vehicle_model.make} ${unit.vehicle_model.model}`
                                                        : unit.stock_number}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-mono">VIN: {unit.vin}</div>
                                                {unit.conduction_no && (
                                                    <div className="text-xs text-muted-foreground font-mono">Conduction: {unit.conduction_no}</div>
                                                )}
                                                {unit.plate_no && (
                                                    <div className="text-xs text-muted-foreground font-mono">Plate: {unit.plate_no}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        {/* Specifications */}
                                        <TableCell>
                                            <div className="space-y-1">
                                                    <div className="text-sm">
                                                        {unit.vehicle_model?.body_type || '—'}
                                                    </div>
                                                    {unit.vehicle_model?.transmission && (
                                                        <div className="text-sm">{unit.vehicle_model.transmission}</div>
                                                    )}
                                                    {unit.vehicle_model?.fuel_type && (
                                                        <div className="flex items-center space-x-1">
                                                            <Fuel className="h-3 w-3" />
                                                            <span className="text-sm">{unit.vehicle_model.fuel_type}</span>
                                                        </div>
                                                    )}
                                                    {unit.color_exterior && (
                                                        <div className="text-sm text-muted-foreground">{unit.color_exterior}</div>
                                                    )}
                                                    {unit.color_code && (
                                                        <div className="text-xs text-muted-foreground">Color code: {unit.color_code}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {/* Pricing */}
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm font-medium">
                                                        {formatCurrency(unit.purchase_price, unit.currency)}
                                                    </div>
                                                    {unit.sale_price && (
                                                        <>
                                                            <div className="text-xs text-muted-foreground">
                                                                Sale: {formatCurrency(unit.sale_price, unit.currency)}
                                                            </div>
                                                            <div className="text-xs text-green-600">
                                                                Margin: {formatCurrency(unit.sale_price - unit.purchase_price, unit.currency)}
                                                            </div>
                                                        </>
                                                    )}
                                                    {unit.msrp_price && (
                                                        <div className="text-xs text-muted-foreground">
                                                            MSRP: {formatCurrency(unit.msrp_price, unit.currency)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {/* Location */}
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="text-sm">{unit.branch.name}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">{unit.branch.code}</div>
                                                <div className="mt-1">
                                                    {getLocationBadge(unit.location)}
                                                </div>
                                            </TableCell>
                                            {/* Sales Info */}
                                            <TableCell>
                                                <div>
                                                    {unit.assigned_user ? (
                                                        <div className="flex items-center space-x-1">
                                                            <User className="h-3 w-3" />
                                                            <span className="text-sm">{unit.assigned_user.name}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-muted-foreground">Unassigned</div>
                                                    )}
                                                    {unit.acquisition_date && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Acquired: {new Date(unit.acquisition_date).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {unit.sold_date && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Sold: {new Date(unit.sold_date).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {unit.owner && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Owner: {unit.owner.full_name || unit.owner.display_name || unit.owner.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {/* Days in Inventory */}
                                            <TableCell>
                                                <div className="text-center">
                                                    {unit.acquisition_date && (
                                                        <>
                                                            <div className="text-lg font-medium">
                                                                {Math.floor((new Date().getTime() - new Date(unit.acquisition_date).getTime()) / (1000 * 60 * 60 * 24))}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">days</div>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {/* Status */}
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        {getStatusBadge(unit.status)}
                                                        {unit.is_locked && <Lock className="h-3 w-3 text-amber-600" />}
                                                    </div>
                                                    {getSubStatusLabel(unit.sub_status) && (
                                                        <div className="text-xs text-muted-foreground">{getSubStatusLabel(unit.sub_status)}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {/* Actions */}
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Link href={`/inventory/vehicles/${unit.id}`}>
                                                        <Button variant="ghost" size="sm" title="View">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {!unit.deleted_at && canEdit && (
                                                        <Link href={`/inventory/vehicles/${unit.id}/edit`}>
                                                            <Button variant="ghost" size="sm" title="Edit">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {!unit.deleted_at && canDelete && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => handleDelete(unit.id)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    )}
                                                    {unit.deleted_at && canRestore && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => handleRestore(unit.id)}
                                                            title="Restore"
                                                        >
                                                            <RotateCcw className="h-4 w-4 text-green-600" />
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

                {/* Pagination */}
                {records?.meta?.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {records.meta.from} to {records.meta.to} of {records.meta.total} results
                        </div>
                        <div className="flex gap-2">
                            {records.links?.map((link: any, index: number) => (
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
            </div>
        </AppLayout>
    );
}
