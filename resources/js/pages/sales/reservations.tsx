import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type PageProps } from '@/types';
import { useState, type FormEvent } from 'react';
import { Calendar, Car, CheckCircle2, Filter, Lock, Plus, Search, XCircle } from 'lucide-react';

interface ReservationVehicle {
    id: number;
    stock_number: string;
    vin: string;
    status: string;
    allocation_status?: string | null;
    vehicle_model?: {
        make: string;
        model: string;
        year: number;
    } | null;
}

interface ReservationCustomer {
    id: number;
    first_name?: string;
    last_name?: string;
    company_name?: string | null;
    email?: string | null;
    display_name?: string;
}

interface Reservation {
    id: number;
    reservation_ref: string;
    reservation_date: string;
    payment_type: string;
    target_release_date?: string | null;
    status: string;
    remarks?: string | null;
    branch?: { id: number; name: string; code: string } | null;
    handled_by_branch?: { id: number; name: string; code: string } | null;
    vehicle_unit: ReservationVehicle;
    customer: ReservationCustomer;
}

interface Props extends PageProps {
    reservations: {
        data: Reservation[];
        meta: any;
        links: any;
    };
    filters: {
        status?: string;
        branch_id?: number;
        search?: string;
    };
    branches?: { id: number; name: string; code: string }[] | null;
    paymentTypes: string[];
}

const statusConfig: Record<
    string,
    { label: string; color: string; icon: typeof CheckCircle2 | typeof XCircle | typeof Calendar }
> = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Calendar },
    confirmed: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
    released: { label: 'Released', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700', icon: XCircle },
};

const paymentLabels: Record<string, string> = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    gcash: 'GCash',
    credit_card: 'Credit Card',
    check: 'Check',
    other: 'Other',
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

export default function ReservationsPage({ reservations, filters, branches, auth }: Props) {
    const permissions = auth?.permissions ?? [];
    const canCreate = permissions.includes('sales.create');
    const canEdit = permissions.includes('sales.edit');

    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [branchFilter, setBranchFilter] = useState(filters.branch_id?.toString() ?? 'all');
    const [search, setSearch] = useState(filters.search ?? '');

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            '/sales/reservations',
            {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                branch_id: branchFilter !== 'all' ? branchFilter : undefined,
                search: search || undefined,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleStatusChange = (reservationId: number, value: string) => {
        if (!canEdit) return;
        router.patch(
            `/sales/reservations/${reservationId}`,
            { status: value },
            { preserveScroll: true, preserveState: true },
        );
    };

    const renderStatusBadge = (status: string) => {
        const config = statusConfig[status] ?? statusConfig.pending;
        const Icon = config.icon;
        return (
            <Badge className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const renderPayment = (paymentType: string) => paymentLabels[paymentType] ?? paymentType;

    return (
        <AppLayout breadcrumbs={[{ title: 'Sales & Customer', href: '/sales' }, { title: 'Reservations', href: '/sales/reservations' }]}>
            <Head title="Reservations" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Reservations
                        </h1>
                        <p className="text-muted-foreground text-sm">Allocate inventory units to customers with reservation details.</p>
                    </div>
                    {canCreate && (
                        <Link href="/sales/reservations/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Reservation
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Refine reservations by status, branch, or search</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Search className="h-4 w-4" /> Search
                                </label>
                                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ref, customer, VIN, stock #" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Filter className="h-4 w-4" /> Status
                                </label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="released">Released</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {branches && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <Car className="h-4 w-4" /> Branch
                                    </label>
                                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All branches" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All branches</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name} ({branch.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="flex items-end">
                                <Button type="submit" className="w-full md:w-auto">
                                    Apply
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Reservations</CardTitle>
                        <CardDescription>Current allocation records linked to inventory units</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservations?.data?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                            No reservations found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {reservations?.data?.map((reservation) => (
                                    <TableRow key={reservation.id}>
                                        <TableCell>
                                            <div className="font-semibold">{reservation.reservation_ref}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(reservation.reservation_date)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {reservation.customer?.display_name ||
                                                    `${reservation.customer?.first_name ?? ''} ${reservation.customer?.last_name ?? ''}`}
                                            </div>
                                            {reservation.customer?.email && (
                                                <div className="text-xs text-muted-foreground">{reservation.customer.email}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {reservation.vehicle_unit?.vehicle_model
                                                    ? `${reservation.vehicle_unit.vehicle_model.year} ${reservation.vehicle_unit.vehicle_model.make} ${reservation.vehicle_unit.vehicle_model.model}`
                                                    : 'Unit'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {reservation.vehicle_unit?.stock_number} • {reservation.vehicle_unit?.vin}
                                            </div>
                                            {reservation.vehicle_unit?.allocation_status && (
                                                <div className="text-[11px] text-amber-700 flex items-center gap-1 mt-1">
                                                    <Lock className="h-3 w-3" />
                                                    <span className="truncate">{reservation.vehicle_unit.allocation_status}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{renderPayment(reservation.payment_type)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">Target: {formatDate(reservation.target_release_date)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                {renderStatusBadge(reservation.status)}
                                                {canEdit && (
                                                    <Select
                                                        value={reservation.status}
                                                        onValueChange={(value) => handleStatusChange(reservation.id, value)}
                                                    >
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                                            <SelectItem value="released">Released</SelectItem>
                                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{reservation.branch?.name ?? '—'}</div>
                                            {reservation.handled_by_branch && (
                                                <div className="text-xs text-muted-foreground">
                                                    Handling: {reservation.handled_by_branch.name}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/inventory/vehicles/${reservation.vehicle_unit.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View Unit
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
