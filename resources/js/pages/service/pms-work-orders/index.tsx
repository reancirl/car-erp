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
    Plus,
    Eye,
    Edit,
    Trash2,
    RotateCcw,
    AlertTriangle,
    CheckCircle,
    Clock,
    Camera,
    XCircle
} from 'lucide-react';
import { type BreadcrumbItem, type Branch } from '@/types';
import { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'PMS Work Orders',
        href: '/service/pms-work-orders',
    },
];

interface WorkOrder {
    id: number;
    work_order_number: string;
    vehicle_vin: string;
    vehicle_plate_number: string | null;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    customer_name: string;
    current_mileage: number;
    status: 'draft' | 'pending' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    verification_status: 'pending' | 'verified' | 'flagged' | 'rejected';
    is_overdue: boolean;
    has_fraud_alerts: boolean;
    photos_uploaded: boolean;
    photo_count: number;
    scheduled_at: string | null;
    deleted_at: string | null;
    branch?: { name: string };
}

interface Stats {
    total_work_orders: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
    with_fraud_alerts: number;
    flagged: number;
}

interface MissedPMS {
    work_order_id: number;
    work_order_number: string;
    vehicle_vin: string;
    vehicle_plate: string | null;
    vehicle_info: string;
    current_mileage: number;
    next_pms_mileage: number | null;
    km_overdue: number | null;
    next_pms_date: string | null;
    days_overdue: number | null;
    branch: string;
}

interface Filters {
    search?: string;
    status?: string;
    priority?: string;
    verification_status?: string;
    branch_id?: string;
    has_fraud_alerts?: string;
    is_overdue?: string;
    include_deleted?: boolean | string;
}

interface Permissions {
    create: boolean;
    edit: boolean;
    delete: boolean;
    restore: boolean;
}

interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    workOrders: PaginatedResponse<WorkOrder>;
    stats: Stats;
    missedPMS: MissedPMS[];
    filters: Filters;
    branches?: Branch[] | null;
    can: Permissions;
}

export default function PMSWorkOrders({ workOrders, stats, missedPMS, filters, branches, can }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [priority, setPriority] = useState(filters.priority || 'all');
    const [verificationStatus, setVerificationStatus] = useState(filters.verification_status || 'all');
    const [branchId, setBranchId] = useState(filters.branch_id || 'all');
    const [hasFraudAlerts, setHasFraudAlerts] = useState(filters.has_fraud_alerts === 'true');
    const [isOverdue, setIsOverdue] = useState(filters.is_overdue === 'true');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [includeDeleted, setIncludeDeleted] = useState(
        filters.include_deleted === true || filters.include_deleted === '1'
    );
    const [restoringId, setRestoringId] = useState<number | null>(null);

    const getStatusBadge = (workOrder: WorkOrder) => {
        if (workOrder.deleted_at) {
            return <Badge variant="outline" className="bg-red-100 text-red-800">Deleted</Badge>;
        }

        switch (workOrder.status) {
            case 'completed':
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                    </Badge>
                );
            case 'overdue':
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="outline">{workOrder.status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <Badge className="bg-red-500">Urgent</Badge>;
            case 'high':
                return <Badge className="bg-orange-500">High</Badge>;
            case 'normal':
                return <Badge variant="secondary">Normal</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const getVerificationBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                    </Badge>
                );
            case 'flagged':
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Flagged
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="outline">Pending</Badge>;
        }
    };

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();

        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status && status !== 'all') params.status = status;
        if (priority && priority !== 'all') params.priority = priority;
        if (verificationStatus && verificationStatus !== 'all') params.verification_status = verificationStatus;
        if (branchId && branchId !== 'all') params.branch_id = branchId;
        if (hasFraudAlerts) params.has_fraud_alerts = 'true';
        if (isOverdue) params.is_overdue = 'true';
        if (includeDeleted) params.include_deleted = '1';

        router.get('/service/pms-work-orders', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (workOrder: WorkOrder) => {
        setSelectedWorkOrder(workOrder);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedWorkOrder) return;

        setDeleting(true);
        router.delete(`/service/pms-work-orders/${selectedWorkOrder.id}`, {
            preserveState: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSelectedWorkOrder(null);
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    const handleRestore = (id: number) => {
        setRestoringId(id);
        router.post(
            `/service/pms-work-orders/${id}/restore`,
            {},
            {
                preserveState: true,
                onFinish: () => {
                    setRestoringId(null);
                },
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="PMS Work Orders" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Wrench className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">PMS Work Orders</h1>
                    </div>
                    <div className="flex space-x-2">
                        {can.create && (
                            <Link href="/service/pms-work-orders/create">
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Work Order
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Missed PMS Alert */}
                {missedPMS && missedPMS.length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="text-red-900 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Overdue PMS ({missedPMS.length})
                            </CardTitle>
                            <CardDescription className="text-red-800">
                                Vehicles that have exceeded their maintenance intervals
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {missedPMS.slice(0, 5).map((pms) => (
                                    <div
                                        key={pms.work_order_id}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{pms.vehicle_info}</p>
                                            <p className="text-sm text-muted-foreground">
                                                VIN: {pms.vehicle_vin} • {pms.vehicle_plate || 'No plate'}
                                            </p>
                                        </div>
                                        <div className="text-right mr-4">
                                            {pms.km_overdue && (
                                                <p className="text-sm font-medium text-red-600">
                                                    {pms.km_overdue} km overdue
                                                </p>
                                            )}
                                            {pms.days_overdue && (
                                                <p className="text-sm text-red-600">
                                                    {pms.days_overdue} days overdue
                                                </p>
                                            )}
                                        </div>
                                        <Link href={`/service/pms-work-orders/${pms.work_order_id}`}>
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_work_orders}</div>
                            <p className="text-xs text-muted-foreground">All work orders</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
                            <p className="text-xs text-muted-foreground">Active services</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.with_fraud_alerts}</div>
                            <p className="text-xs text-muted-foreground">Flagged for review</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Search and filter work orders by multiple criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by WO#, VIN, plate, or customer..."
                                            className="pl-10"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {branches && (
                                    <Select value={branchId} onValueChange={setBranchId}>
                                        <SelectTrigger className="w-full md:w-[180px]">
                                            <SelectValue placeholder="All Branches" />
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

                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={verificationStatus} onValueChange={setVerificationStatus}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="All Verification" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Verification</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="flagged">Flagged</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="fraud-alerts"
                                        checked={hasFraudAlerts}
                                        onCheckedChange={(checked) => setHasFraudAlerts(checked as boolean)}
                                    />
                                    <label htmlFor="fraud-alerts" className="text-sm font-medium cursor-pointer">
                                        Fraud Alerts Only
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="overdue"
                                        checked={isOverdue}
                                        onCheckedChange={(checked) => setIsOverdue(checked as boolean)}
                                    />
                                    <label htmlFor="overdue" className="text-sm font-medium cursor-pointer">
                                        Overdue Only
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="include-deleted"
                                        checked={includeDeleted}
                                        onCheckedChange={(checked) => setIncludeDeleted(checked as boolean)}
                                    />
                                    <label htmlFor="include-deleted" className="text-sm font-medium cursor-pointer">
                                        Include Deleted
                                    </label>
                                </div>

                                <Button type="submit" size="sm" className="ml-auto">
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Work Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Work Orders</CardTitle>
                        <CardDescription>
                            Showing {workOrders.data.length} of {workOrders.total} work orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>WO Number</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Mileage</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Verification</TableHead>
                                    <TableHead>Photos</TableHead>
                                    <TableHead>Alerts</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workOrders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                            No work orders found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    workOrders.data.map((workOrder) => (
                                        <TableRow key={workOrder.id}>
                                            <TableCell className="font-medium">
                                                {workOrder.work_order_number}
                                                {workOrder.branch && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {workOrder.branch.name}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {workOrder.vehicle_make} {workOrder.vehicle_model}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {workOrder.vehicle_vin}
                                                </div>
                                            </TableCell>
                                            <TableCell>{workOrder.customer_name}</TableCell>
                                            <TableCell>
                                                {workOrder.current_mileage.toLocaleString()} km
                                                {workOrder.is_overdue && (
                                                    <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 text-xs">
                                                        Overdue
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(workOrder)}</TableCell>
                                            <TableCell>{getVerificationBadge(workOrder.verification_status)}</TableCell>
                                            <TableCell>
                                                {workOrder.photos_uploaded ? (
                                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                                        <Camera className="h-3 w-3 mr-1" />
                                                        {workOrder.photo_count || 0}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-gray-100 text-xs">
                                                        None
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {workOrder.has_fraud_alerts ? (
                                                    <Badge variant="outline" className="bg-red-100 text-red-800">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Alert
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                                                        OK
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-1">
                                                    <Link href={`/service/pms-work-orders/${workOrder.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    {workOrder.deleted_at ? (
                                                        can.restore && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRestore(workOrder.id)}
                                                                disabled={restoringId === workOrder.id}
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        )
                                                    ) : (
                                                        <>
                                                            {can.edit && (
                                                                <Link
                                                                    href={`/service/pms-work-orders/${workOrder.id}/edit`}
                                                                >
                                                                    <Button variant="ghost" size="sm">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {can.delete && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(workOrder)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {workOrders.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Page {workOrders.current_page} of {workOrders.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {workOrders.links.map((link, index) => (
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
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete work order{' '}
                            <span className="font-semibold">{selectedWorkOrder?.work_order_number}</span>?
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
