import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Search, Filter, Download, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock, Camera, Trash2, RefreshCw } from 'lucide-react';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'Warranty Claims',
        href: '/service/warranty-claims',
    },
];

interface Branch {
    id: number;
    name: string;
}

interface Customer {
    id: number;
    customer_id: string;
    first_name: string;
    last_name: string;
}

interface VehicleUnit {
    id: number;
    vin: string;
    vehicle_model?: {
        make: string;
        model: string;
        year: number;
    };
}

interface WarrantyClaim {
    id: number;
    claim_id: string;
    branch?: Branch;
    customer?: Customer;
    vehicle_unit?: VehicleUnit;
    claim_type: string;
    claim_date: string;
    failure_description: string;
    warranty_type?: string;
    warranty_provider?: string;
    warranty_start_date?: string;
    warranty_end_date?: string;
    status: string;
    total_claimed_amount: number;
    currency: string;
    created_at: string;
    deleted_at?: string;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    total_claimed: number;
}

interface Props extends PageProps {
    claims: {
        data: WarrantyClaim[];
        links: any[];
        current_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        claim_type?: string;
        warranty_type?: string;
        branch_id?: string;
        include_deleted?: boolean;
    };
    branches?: Branch[];
}

export default function WarrantyClaims({ claims, stats, filters, branches, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [claimType, setClaimType] = useState(filters.claim_type || 'all');
    const [warrantyType, setWarrantyType] = useState(filters.warranty_type || 'all');
    const [branchId, setBranchId] = useState(filters.branch_id || 'all');
    const [includeDeleted, setIncludeDeleted] = useState(filters.include_deleted || false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [claimToDelete, setClaimToDelete] = useState<WarrantyClaim | null>(null);

    const permissions = auth?.permissions ?? [];
    const canCreate = permissions.includes('warranty.create');
    const canEdit = permissions.includes('warranty.edit');
    const canDelete = permissions.includes('warranty.delete');
    const canRestore = permissions.includes('warranty.create');

    const handleFilter = () => {
        router.get('/service/warranty-claims', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            claim_type: claimType !== 'all' ? claimType : undefined,
            warranty_type: warrantyType !== 'all' ? warrantyType : undefined,
            branch_id: branchId !== 'all' ? branchId : undefined,
            include_deleted: includeDeleted || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (claim: WarrantyClaim) => {
        if (!canDelete) {
            return;
        }

        setClaimToDelete(claim);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!claimToDelete || !canDelete) {
            setDeleteDialogOpen(false);
            setClaimToDelete(null);
            return;
        }

        if (claimToDelete) {
            router.delete(`/service/warranty-claims/${claimToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setClaimToDelete(null);
                },
            });
        }
    };

    const handleRestore = (id: number) => {
        if (!canRestore) {
            return;
        }

        router.post(`/service/warranty-claims/${id}/restore`, {}, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Draft
                    </Badge>
                );
            case 'submitted':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Submitted
                    </Badge>
                );
            case 'under_review':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Under Review
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case 'partially_approved':
                return (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                        Partially Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            case 'paid':
                return (
                    <Badge variant="default" className="bg-purple-100 text-purple-800">
                        Paid
                    </Badge>
                );
            case 'closed':
                return (
                    <Badge variant="outline">
                        Closed
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getClaimTypeBadge = (type: string) => {
        switch (type) {
            case 'parts':
                return <Badge className="bg-blue-100 text-blue-800">Parts Only</Badge>;
            case 'labor':
                return <Badge className="bg-green-100 text-green-800">Labor Only</Badge>;
            case 'both':
                return <Badge className="bg-purple-100 text-purple-800">Parts & Labor</Badge>;
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Warranty Claims" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Warranty Claims</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        {canCreate && (
                            <Link href="/service/warranty-claims/create">
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Claim
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Awaiting review</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground">Successfully approved</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Claimed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{stats.total_claimed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">Total amount</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Find warranty claims by customer, vehicle, or status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by claim ID, customer, or VIN..."
                                            className="pl-10"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                        />
                                    </div>
                                </div>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="under_review">Under Review</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="partially_approved">Partially Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={claimType} onValueChange={setClaimType}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Claim Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="parts">Parts Only</SelectItem>
                                        <SelectItem value="labor">Labor Only</SelectItem>
                                        <SelectItem value="both">Parts & Labor</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={warrantyType} onValueChange={setWarrantyType}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Warranty Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Warranties</SelectItem>
                                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                                        <SelectItem value="extended">Extended</SelectItem>
                                        <SelectItem value="dealer">Dealer</SelectItem>
                                    </SelectContent>
                                </Select>
                                {branches && branches.length > 0 && (
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
                                <Button onClick={handleFilter}>
                                    <Filter className="h-4 w-4 mr-2" />
                                    Apply
                                </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="include_deleted"
                                    checked={includeDeleted}
                                    onCheckedChange={(checked) => setIncludeDeleted(checked as boolean)}
                                />
                                <label
                                    htmlFor="include_deleted"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Include deleted claims
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Claims Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Warranty Claims ({claims.total})</CardTitle>
                        <CardDescription>Manage warranty claims with photos, parts tracking, and status updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {claims.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Claim Details</TableHead>
                                            <TableHead>Customer & Vehicle</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Failure Description</TableHead>
                                            <TableHead>Warranty</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {claims.data.map((claim) => (
                                            <TableRow key={claim.id} className={claim.deleted_at ? 'bg-gray-50' : ''}>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <div className="font-medium">{claim.claim_id}</div>
                                                        <div className="text-xs text-muted-foreground">{new Date(claim.claim_date).toLocaleDateString()}</div>
                                                        {claim.deleted_at && (
                                                            <Badge variant="destructive" className="text-xs mt-1">Deleted</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        {claim.customer && (
                                                            <>
                                                                <div className="font-medium">{claim.customer.first_name} {claim.customer.last_name}</div>
                                                                <div className="text-xs text-muted-foreground">{claim.customer.customer_id}</div>
                                                            </>
                                                        )}
                                                        {claim.vehicle_unit && claim.vehicle_unit.vehicle_model && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {claim.vehicle_unit.vehicle_model.year} {claim.vehicle_unit.vehicle_model.make} {claim.vehicle_unit.vehicle_model.model}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getClaimTypeBadge(claim.claim_type)}</TableCell>
                                                <TableCell className="max-w-xs">
                                                    <div className="truncate" title={claim.failure_description}>
                                                        {claim.failure_description}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        {claim.warranty_type && (
                                                            <div className="text-sm">{claim.warranty_type}</div>
                                                        )}
                                                        {claim.warranty_provider && (
                                                            <div className="text-xs text-muted-foreground">{claim.warranty_provider}</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        ₱{claim.total_claimed_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-1">
                                                        {claim.deleted_at ? (
                                                            canRestore ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRestore(claim.id)}
                                                                >
                                                                    <RefreshCw className="h-4 w-4" />
                                                                </Button>
                                                            ) : null
                                                        ) : (
                                                            <>
                                                                <Link href={`/service/warranty-claims/${claim.id}`}>
                                                                    <Button variant="ghost" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                {claim.status === 'draft' && canEdit && (
                                                                    <>
                                                                        <Link href={`/service/warranty-claims/${claim.id}/edit`}>
                                                                            <Button variant="ghost" size="sm">
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                        </Link>
                                                                        {canDelete && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDelete(claim)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </>
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
                                {claims.links.length > 3 && (
                                    <div className="flex items-center justify-center space-x-2 mt-4">
                                        {claims.links.map((link, index) => (
                                            link.url ? (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => router.visit(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No warranty claims found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {filters.search || filters.status || filters.claim_type || filters.warranty_type
                                        ? 'Try adjusting your filters'
                                        : 'Get started by creating your first warranty claim'}
                                </p>
                                {canCreate && (
                                    <Link href="/service/warranty-claims/create">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Warranty Claim
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Warranty Claim</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete claim <strong>{claimToDelete?.claim_id}</strong>?
                            This action can be undone by restoring the claim later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={!canDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
