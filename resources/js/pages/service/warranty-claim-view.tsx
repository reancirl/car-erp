import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft,
    Edit,
    Trash2,
    FileText,
    User,
    Car,
    Calendar,
    Shield,
    CheckCircle,
    AlertTriangle,
    Clock,
    Package,
    Wrench,
    Camera,
    PhilippinePeso,
} from 'lucide-react';
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
    {
        title: 'View Claim',
        href: '#',
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
    email: string;
    phone: string;
}

interface VehicleModel {
    id: number;
    make: string;
    model: string;
    year: number;
}

interface VehicleUnit {
    id: number;
    vin: string;
    stock_number: string;
    odometer: number;
    vehicle_model?: VehicleModel;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface WarrantyClaimPart {
    id: number;
    part_number: string | null;
    part_name: string;
    description: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface WarrantyClaimService {
    id: number;
    service_code: string | null;
    service_name: string;
    description: string | null;
    labor_hours: number;
    labor_rate: number;
    subtotal: number;
}

interface WarrantyClaimPhoto {
    id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    caption: string | null;
    uploaded_by: number;
    uploaded_at: string;
    uploaded_by_user?: User;
}

interface WarrantyClaim {
    id: number;
    claim_id: string;
    branch_id: number;
    customer_id: number | null;
    vehicle_unit_id: number | null;
    claim_type: string;
    claim_date: string;
    incident_date: string | null;
    failure_description: string;
    diagnosis: string | null;
    repair_actions: string | null;
    odometer_reading: number | null;
    warranty_type: string | null;
    warranty_provider: string | null;
    warranty_number: string | null;
    warranty_start_date: string | null;
    warranty_end_date: string | null;
    status: string;
    assigned_to: number | null;
    notes: string | null;
    total_claimed_amount: number;
    currency: string;
    created_at: string;
    updated_at: string;
    branch?: Branch;
    customer?: Customer;
    vehicle_unit?: VehicleUnit;
    assigned_to_user?: User;
    parts?: WarrantyClaimPart[];
    services?: WarrantyClaimService[];
    photos?: WarrantyClaimPhoto[];
}

interface Props extends PageProps {
    claim: WarrantyClaim;
    can: {
        edit: boolean;
        delete: boolean;
    };
}

export default function WarrantyClaimView({ claim, can, auth }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDelete = () => {
        router.delete(`/service/warranty-claims/${claim.id}`, {
            onSuccess: () => {
                router.visit('/service/warranty-claims');
            },
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

    const calculatePartsTotal = () => {
        return claim.parts?.reduce((sum, part) => sum + part.subtotal, 0) || 0;
    };

    const calculateServicesTotal = () => {
        return claim.services?.reduce((sum, service) => sum + service.subtotal, 0) || 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Claim ${claim.claim_id}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Warranty Claim</h1>
                        <Badge variant="outline">{claim.claim_id}</Badge>
                        {getStatusBadge(claim.status)}
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/service/warranty-claims">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Claims
                            </Button>
                        </Link>
                        {can.edit && (
                            <Link href={`/service/warranty-claims/${claim.id}/edit`}>
                                <Button size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {can.delete && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Claim Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Claim Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Claim ID</p>
                                        <p className="font-medium">{claim.claim_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Claim Type</p>
                                        <div className="mt-1">{getClaimTypeBadge(claim.claim_type)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Claim Date</p>
                                        <p className="font-medium">
                                            <Calendar className="inline h-4 w-4 mr-1" />
                                            {new Date(claim.claim_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {claim.incident_date && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Incident Date</p>
                                            <p className="font-medium">
                                                {new Date(claim.incident_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <div className="mt-1">{getStatusBadge(claim.status)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Branch</p>
                                        <p className="font-medium">{claim.branch?.name}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm text-muted-foreground mb-2">Failure Description</p>
                                    <p className="whitespace-pre-wrap">{claim.failure_description}</p>
                                </div>

                                {claim.diagnosis && (
                                    <div className="border-t pt-4">
                                        <p className="text-sm text-muted-foreground mb-2">Diagnosis</p>
                                        <p className="whitespace-pre-wrap">{claim.diagnosis}</p>
                                    </div>
                                )}

                                {claim.repair_actions && (
                                    <div className="border-t pt-4">
                                        <p className="text-sm text-muted-foreground mb-2">Repair Actions</p>
                                        <p className="whitespace-pre-wrap">{claim.repair_actions}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer & Vehicle Information */}
                        {(claim.customer || claim.vehicle_unit) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer & Vehicle Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {claim.customer && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                <User className="inline h-4 w-4 mr-1" />
                                                Customer
                                            </p>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <p className="font-medium">
                                                    {claim.customer.first_name} {claim.customer.last_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">ID: {claim.customer.customer_id}</p>
                                                <p className="text-sm text-muted-foreground">{claim.customer.email}</p>
                                                <p className="text-sm text-muted-foreground">{claim.customer.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {claim.vehicle_unit && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                <Car className="inline h-4 w-4 mr-1" />
                                                Vehicle
                                            </p>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                {claim.vehicle_unit.vehicle_model && (
                                                    <p className="font-medium">
                                                        {claim.vehicle_unit.vehicle_model.year}{' '}
                                                        {claim.vehicle_unit.vehicle_model.make}{' '}
                                                        {claim.vehicle_unit.vehicle_model.model}
                                                    </p>
                                                )}
                                                <p className="text-sm text-muted-foreground">VIN: {claim.vehicle_unit.vin}</p>
                                                {claim.odometer_reading && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Odometer: {claim.odometer_reading.toLocaleString()} km
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Warranty Information */}
                        {(claim.warranty_type || claim.warranty_provider) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Shield className="inline h-5 w-5 mr-2" />
                                        Warranty Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {claim.warranty_type && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Warranty Type</p>
                                                <p className="font-medium">{claim.warranty_type}</p>
                                            </div>
                                        )}
                                        {claim.warranty_provider && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Provider</p>
                                                <p className="font-medium">{claim.warranty_provider}</p>
                                            </div>
                                        )}
                                        {claim.warranty_number && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Warranty Number</p>
                                                <p className="font-medium">{claim.warranty_number}</p>
                                            </div>
                                        )}
                                        {claim.warranty_start_date && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Start Date</p>
                                                <p className="font-medium">
                                                    {new Date(claim.warranty_start_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        {claim.warranty_end_date && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">End Date</p>
                                                <p className="font-medium">
                                                    {new Date(claim.warranty_end_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Parts */}
                        {claim.parts && claim.parts.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Package className="inline h-5 w-5 mr-2" />
                                        Parts ({claim.parts.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Part Number</TableHead>
                                                <TableHead>Part Name</TableHead>
                                                <TableHead className="text-right">Qty</TableHead>
                                                <TableHead className="text-right">Unit Price</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {claim.parts.map((part, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-mono text-sm">
                                                        {part.part_number || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{part.part_name}</div>
                                                            {part.description && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {part.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">{part.quantity}</TableCell>
                                                    <TableCell className="text-right">
                                                        ₱{part.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        ₱{part.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-right font-bold">
                                                    Parts Total:
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    ₱{calculatePartsTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {/* Services */}
                        {claim.services && claim.services.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Wrench className="inline h-5 w-5 mr-2" />
                                        Labor / Services ({claim.services.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Service Code</TableHead>
                                                <TableHead>Service Name</TableHead>
                                                <TableHead className="text-right">Hours</TableHead>
                                                <TableHead className="text-right">Rate</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {claim.services.map((service, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-mono text-sm">
                                                        {service.service_code || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{service.service_name}</div>
                                                            {service.description && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {service.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">{service.labor_hours}h</TableCell>
                                                    <TableCell className="text-right">
                                                        ₱{service.labor_rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/h
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        ₱{service.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-right font-bold">
                                                    Services Total:
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    ₱{calculateServicesTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {/* Photos */}
                        {claim.photos && claim.photos.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Camera className="inline h-5 w-5 mr-2" />
                                        Photos ({claim.photos.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {claim.photos.map((photo) => (
                                            <div key={photo.id} className="space-y-2">
                                                <div className="aspect-square rounded-md overflow-hidden bg-gray-100">
                                                    <img
                                                        src={`/storage/${photo.file_path}`}
                                                        alt={photo.caption || 'Claim photo'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {photo.caption && (
                                                    <p className="text-sm text-muted-foreground">{photo.caption}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(photo.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes */}
                        {claim.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap">{claim.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar (1/3) */}
                    <div className="space-y-6">
                        {/* Claim Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <PhilippinePeso className="inline h-5 w-5 mr-2" />
                                    Claim Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">Currency:</span>
                                    <Badge>{claim.currency}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Parts:</span>
                                    <span className="font-medium">
                                        ₱{calculatePartsTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Labor:</span>
                                    <span className="font-medium">
                                        ₱{calculateServicesTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="border-t pt-3 flex justify-between">
                                    <span className="font-bold">Total Claimed:</span>
                                    <span className="text-lg font-bold">
                                        ₱{claim.total_claimed_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {claim.assigned_to_user ? (
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-muted-foreground">Assigned To</p>
                                        <p className="font-medium">{claim.assigned_to_user.name}</p>
                                        <p className="text-xs text-muted-foreground">{claim.assigned_to_user.email}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Unassigned</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timestamps */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Timestamps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Created</p>
                                    <p className="text-sm font-medium">
                                        {new Date(claim.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Updated</p>
                                    <p className="text-sm font-medium">
                                        {new Date(claim.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {can.edit && (
                                    <Link href={`/service/warranty-claims/${claim.id}/edit`}>
                                        <Button className="w-full" variant="outline">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Claim
                                        </Button>
                                    </Link>
                                )}
                                <Link href="/service/warranty-claims">
                                    <Button variant="outline" className="w-full">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to List
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Warranty Claim</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete claim <strong>{claim.claim_id}</strong>?
                            This action can be undone by restoring the claim later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
