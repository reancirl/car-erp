import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Wrench,
    Edit,
    Trash2,
    Clock,
    DollarSign,
    CheckCircle,
    AlertCircle,
    MapPin,
    Layers,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type BreadcrumbItem, type CommonService } from '@/types';

interface Overview {
    service_type_usage: number;
    is_active: boolean;
}

interface Permissions {
    edit: boolean;
    delete: boolean;
}

interface Props {
    commonService: CommonService;
    overview: Overview;
    can: Permissions;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Service & Parts', href: '/service' },
    { title: 'Common Services', href: '/service/common-services' },
];

const getStatusBadge = (isActive: boolean) =>
    isActive ? (
        <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
        </Badge>
    ) : (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Inactive
        </Badge>
    );

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

const formatPrice = (value: number | string | undefined, currency = 'PHP') => {
    const numericValue = Number(value ?? 0);
    return `${currency} ${numericValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export default function CommonServiceView({ commonService, overview, can }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/service/common-services/${commonService.id}`, {
            onSuccess: () => setDeleteDialogOpen(false),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={[...breadcrumbs, { title: commonService.name, href: `/service/common-services/${commonService.id}` }]}>
            <Head title={`Common Service: ${commonService.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/common-services">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Common Services
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Wrench className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">{commonService.name}</h1>
                            {getStatusBadge(overview.is_active)}
                            {getCategoryBadge(commonService.category)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {can.edit && (
                            <Link href={`/service/common-services/${commonService.id}/edit`}>
                                <Button size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {can.delete && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-3">
                                <Clock className="h-9 w-9 text-blue-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Estimated Duration</p>
                                    <p className="text-xl font-semibold">
                                        {commonService.formatted_estimated_duration ??
                                            `${Number(commonService.estimated_duration ?? 0).toFixed(2)} hrs`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <DollarSign className="h-9 w-9 text-green-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Standard Price</p>
                                    <p className="text-xl font-semibold">
                                        {commonService.formatted_standard_price ??
                                            formatPrice(commonService.standard_price, commonService.currency)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Layers className="h-9 w-9 text-purple-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Used in Service Types</p>
                                    <p className="text-xl font-semibold">{overview.service_type_usage}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Details</CardTitle>
                                <CardDescription>All configuration details for this reusable service item</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Service Code</span>
                                        <p className="font-medium font-mono">{commonService.code}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Currency</span>
                                        <p className="font-medium">{commonService.currency ?? 'PHP'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Branch</span>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{commonService.branch?.name ?? '—'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <div className="mt-1">{getStatusBadge(Boolean(commonService.is_active))}</div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <span className="text-sm text-muted-foreground">Description</span>
                                    <p className="mt-2 whitespace-pre-wrap text-sm">
                                        {commonService.description || 'No description provided.'}
                                    </p>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Created</span>
                                        <p className="font-medium">
                                            {new Date(commonService.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Last Updated</span>
                                        <p className="font-medium">
                                            {new Date(commonService.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Associated Service Types</CardTitle>
                                <CardDescription>Service templates that include this common service</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {commonService.service_types && commonService.service_types.length > 0 ? (
                                    <div className="space-y-3">
                                        {commonService.service_types.map((serviceType) => (
                                            <div
                                                key={serviceType.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div>
                                                    <p className="font-medium">{serviceType.name}</p>
                                                    <p className="text-xs text-muted-foreground uppercase">
                                                        {serviceType.code}
                                                    </p>
                                                </div>
                                                <Link href={`/service/service-types/${serviceType.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        This service is not yet linked to any service types.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                                <CardDescription>Operational metrics for this service</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Standard Duration</span>
                                    <span className="font-medium">
                                        {commonService.formatted_estimated_duration ??
                                            `${Number(commonService.estimated_duration ?? 0).toFixed(2)} hrs`}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Standard Price</span>
                                    <span className="font-medium">
                                        {commonService.formatted_standard_price ??
                                            formatPrice(commonService.standard_price, commonService.currency)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    {getStatusBadge(Boolean(commonService.is_active))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Category</span>
                                    {getCategoryBadge(commonService.category)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Common Service</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{commonService.name}</strong>? The record can be
                            restored later from the list if needed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex items-center justify-end space-x-2">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
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

