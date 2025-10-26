import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Wrench,
    Car,
    User,
    Phone,
    Mail,
    Camera,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Clock,
    Calendar,
    TrendingUp,
    XCircle,
    Eye,
    Download
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { FormEvent, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'PMS Work Orders',
        href: '/service/pms-work-orders',
    },
    {
        title: 'View Work Order',
        href: '#',
    },
];

interface WorkOrderPhoto {
    id: number;
    file_path: string;
    file_name: string;
    photo_type: string;
    latitude: number | null;
    longitude: number | null;
    location_address: string | null;
    photo_taken_at: string | null;
    camera_make: string | null;
    camera_model: string | null;
    has_gps_data: boolean;
    has_exif_data: boolean;
    url: string;
    file_size_formatted: string;
}

interface OdometerReading {
    id: number;
    reading: number;
    reading_date: string;
    previous_reading: number | null;
    distance_diff: number | null;
    days_diff: number | null;
    avg_daily_distance: number | null;
    is_anomaly: boolean;
    anomaly_type: string;
    anomaly_notes: string | null;
}

interface FraudAlert {
    type: string;
    message: string;
    data: any;
    detected_at: string;
}

interface WorkOrder {
    id: number;
    work_order_number: string;
    vehicle_vin: string;
    vehicle_plate_number: string | null;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    current_mileage: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    customer_type: string;
    status: string;
    priority: string;
    verification_status: string;
    is_overdue: boolean;
    has_fraud_alerts: boolean;
    fraud_alerts: FraudAlert[] | null;
    pms_interval_km: number;
    next_pms_due_mileage: number | null;
    next_pms_due_date: string | null;
    days_overdue: number | null;
    km_overdue: number | null;
    photos_uploaded: boolean;
    photo_count: number;
    odometer_verified: boolean;
    location_verified: boolean;
    scheduled_at: string | null;
    completed_at: string | null;
    customer_concerns: string | null;
    diagnostic_findings: string | null;
    notes: string | null;
    created_at: string;
    branch: { name: string };
    service_type: { name: string; category: string } | null;
    assigned_technician: { name: string } | null;
    photos: WorkOrderPhoto[];
    odometer_readings: OdometerReading[];
}

interface Props {
    workOrder: WorkOrder;
    photoStats: any;
    odometerHistory: OdometerReading[];
    can: {
        edit: boolean;
        delete: boolean;
    };
    technicianContext?: {
        isTechnician: boolean;
        requiresInitialPhoto: boolean;
        canEditNotes: boolean;
    } | null;
}

export default function PMSWorkOrderShow({ workOrder, photoStats, odometerHistory, can, technicianContext }: Props) {
    const [selectedPhoto, setSelectedPhoto] = useState<WorkOrderPhoto | null>(null);
    const isTechnician = technicianContext?.isTechnician ?? false;
    const requiresInitialPhoto = Boolean(technicianContext?.requiresInitialPhoto && isTechnician);
    const canEditNotes = Boolean(technicianContext?.canEditNotes && isTechnician);

    const initialPhotoForm = useForm<{
        photos: File[];
        photo_type: string;
    }>({
        photos: [],
        photo_type: 'before',
    });

    const generalPhotoForm = useForm<{
        photos: File[];
        photo_type: string;
    }>({
        photos: [],
        photo_type: 'during',
    });

    const notesForm = useForm({
        diagnostic_findings: workOrder.diagnostic_findings ?? '',
        notes: workOrder.notes ?? '',
    });

    useEffect(() => {
        notesForm.setData({
            diagnostic_findings: workOrder.diagnostic_findings ?? '',
            notes: workOrder.notes ?? '',
        });
    }, [workOrder.diagnostic_findings, workOrder.notes]);

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete work order ${workOrder.work_order_number}?`)) {
            router.delete(`/service/pms-work-orders/${workOrder.id}`, {
                onSuccess: () => {
                    router.visit('/service/pms-work-orders');
                }
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
            case 'overdue':
                return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
            case 'cancelled':
                return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getVerificationBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
            case 'flagged':
                return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Flagged</Badge>;
            case 'rejected':
                return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">Pending</Badge>;
        }
    };

    const getPhotoTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            before: 'bg-blue-100 text-blue-800',
            after: 'bg-green-100 text-green-800',
            during: 'bg-purple-100 text-purple-800',
            damage: 'bg-red-100 text-red-800',
            completion: 'bg-teal-100 text-teal-800',
        };
        return <Badge className={colors[type] || ''}>{type}</Badge>;
    };

    const handleInitialPhotoSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!initialPhotoForm.data.photos || initialPhotoForm.data.photos.length === 0) {
            return;
        }

        initialPhotoForm.post(`/service/pms-work-orders/${workOrder.id}/photos`, {
            preserveScroll: true,
            onSuccess: () => {
                initialPhotoForm.reset();
            },
        });
    };

    const handleGeneralPhotoSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!generalPhotoForm.data.photos || generalPhotoForm.data.photos.length === 0) {
            return;
        }

        generalPhotoForm.post(`/service/pms-work-orders/${workOrder.id}/photos`, {
            preserveScroll: true,
            onSuccess: () => {
                generalPhotoForm.reset();
            },
        });
    };

    const handleNotesSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        notesForm.put(route('service.pms-work-orders.update', workOrder.id), {
            preserveScroll: true,
        });
    };

    const handleInitialFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            initialPhotoForm.setData('photos', Array.from(files));
        }
    };

    const handleGeneralFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            generalPhotoForm.setData('photos', Array.from(files));
        }
    };

    const canUploadAdditionalPhotos = isTechnician || can.edit;

    const formatDate = (date: string | null) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (requiresInitialPhoto) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Capture Initial Photo - ${workOrder.work_order_number}`} />

                <div className="space-y-6 p-6">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="text-blue-900">Initial Photo Required</CardTitle>
                            <CardDescription className="text-blue-800">
                                Please capture and upload a "before" photo before viewing this work order.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-blue-900 mb-4">
                                Work Order <span className="font-semibold">{workOrder.work_order_number}</span> • {workOrder.vehicle_make} {workOrder.vehicle_model} ({workOrder.vehicle_year})
                            </p>
                            <form onSubmit={handleInitialPhotoSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="initial-photo">Upload Initial Photo</Label>
                                    <Input
                                        id="initial-photo"
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleInitialFileChange}
                                    />
                                    <p className="text-xs text-muted-foreground">Capture a clear photo of the unit upon arrival.</p>
                                    {initialPhotoForm.errors.photos && <p className="text-sm text-red-600">{initialPhotoForm.errors.photos}</p>}
                                    {initialPhotoForm.errors.photo_type && <p className="text-sm text-red-600">{initialPhotoForm.errors.photo_type}</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={initialPhotoForm.processing}>
                                        {initialPhotoForm.processing ? 'Uploading...' : 'Upload & Continue'}
                                    </Button>
                                    <Link href="/service/pms-work-orders">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Work Order - ${workOrder.work_order_number}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/pms-work-orders">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Work Orders
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Wrench className="h-6 w-6" />
                                {workOrder.work_order_number}
                            </h1>
                            <p className="text-muted-foreground">
                                {workOrder.vehicle_make} {workOrder.vehicle_model} ({workOrder.vehicle_year})
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {can.edit && (
                            <Link href={`/service/pms-work-orders/${workOrder.id}/edit`}>
                                <Button>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {can.delete && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Fraud Alerts */}
                {workOrder.has_fraud_alerts && workOrder.fraud_alerts && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="text-red-900 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Fraud Alerts ({workOrder.fraud_alerts.length})
                            </CardTitle>
                            <CardDescription className="text-red-800">
                                This work order has been flagged for potential fraudulent activity
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {workOrder.fraud_alerts.map((alert, idx) => (
                                    <div key={idx} className="p-3 bg-white rounded-lg border border-red-200">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-medium text-red-900">{alert.type.replace(/_/g, ' ').toUpperCase()}</p>
                                                <p className="text-sm text-red-800">{alert.message}</p>
                                                <p className="text-xs text-red-600 mt-1">Detected: {formatDate(alert.detected_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {canUploadAdditionalPhotos && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Upload Photos
                                    </CardTitle>
                                    <CardDescription>Attach supporting images for this work order.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleGeneralPhotoSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="photo-type">Photo Type</Label>
                                                <Select
                                                    value={generalPhotoForm.data.photo_type}
                                                    onValueChange={(value) => generalPhotoForm.setData('photo_type', value)}
                                                >
                                                    <SelectTrigger id="photo-type">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {['before', 'during', 'after', 'damage', 'completion'].map((value) => (
                                                            <SelectItem key={value} value={value}>
                                                                {value.charAt(0).toUpperCase() + value.slice(1)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="general-photos">Select Photos</Label>
                                                <Input
                                                    id="general-photos"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleGeneralFileChange}
                                                />
                                            </div>
                                        </div>
                                        {generalPhotoForm.errors.photos && <p className="text-sm text-red-600">{generalPhotoForm.errors.photos}</p>}
                                        {generalPhotoForm.errors.photo_type && <p className="text-sm text-red-600">{generalPhotoForm.errors.photo_type}</p>}
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={generalPhotoForm.processing}>
                                                {generalPhotoForm.processing ? 'Uploading...' : 'Upload Photos'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Vehicle Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    Vehicle Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">VIN</p>
                                        <p className="font-medium">{workOrder.vehicle_vin}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Plate Number</p>
                                        <p className="font-medium">{workOrder.vehicle_plate_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Make / Model</p>
                                        <p className="font-medium">{workOrder.vehicle_make} {workOrder.vehicle_model}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Year</p>
                                        <p className="font-medium">{workOrder.vehicle_year}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Mileage</p>
                                        <p className="font-medium">{workOrder.current_mileage.toLocaleString()} km</p>
                                        {workOrder.odometer_verified ? (
                                            <Badge className="mt-1 bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
                                        ) : (
                                            <Badge className="mt-1 bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Next PMS Due</p>
                                        <p className="font-medium">{workOrder.next_pms_due_mileage?.toLocaleString() || 'N/A'} km</p>
                                        {workOrder.is_overdue && (
                                            <Badge className="mt-1 bg-red-100 text-red-800">
                                                {workOrder.km_overdue} km overdue
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{workOrder.customer_name}</span>
                                    <Badge variant="outline">{workOrder.customer_type}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{workOrder.customer_phone}</span>
                                </div>
                                {workOrder.customer_email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{workOrder.customer_email}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Photo Gallery */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    Photo Evidence ({workOrder.photo_count})
                                </CardTitle>
                                <CardDescription>
                                    {photoStats.with_gps_count} with GPS data | {photoStats.verified_count} verified
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {workOrder.photos.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No photos uploaded yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-4">
                                        {workOrder.photos.map((photo) => (
                                            <div key={photo.id} className="relative group">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.file_name}
                                                    className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                                    onClick={() => setSelectedPhoto(photo)}
                                                />
                                                <div className="absolute top-2 right-2">
                                                    {getPhotoTypeBadge(photo.photo_type)}
                                                </div>
                                                {photo.has_gps_data && (
                                                    <div className="absolute bottom-2 left-2">
                                                        <Badge className="bg-green-100 text-green-800">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            GPS
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Odometer History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Odometer Reading History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {odometerHistory.map((reading) => (
                                        <div key={reading.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium">{reading.reading.toLocaleString()} km</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(reading.reading_date)}</p>
                                                {reading.distance_diff && reading.days_diff && (
                                                    <p className="text-xs text-muted-foreground">
                                                        +{reading.distance_diff.toLocaleString()} km in {reading.days_diff} days
                                                        ({reading.avg_daily_distance?.toFixed(1)} km/day)
                                                    </p>
                                                )}
                                            </div>
                                            {reading.is_anomaly && (
                                                <Badge className="bg-red-100 text-red-800">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    {reading.anomaly_type}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Notes & Findings</CardTitle>
                                <CardDescription>
                                    Technician findings and internal notes for this work order
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {canEditNotes ? (
                                    <form className="space-y-4" onSubmit={handleNotesSubmit}>
                                        {workOrder.customer_concerns && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Customer Concerns</p>
                                                <p className="mt-1 text-sm">{workOrder.customer_concerns}</p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="diagnostic_findings">Diagnostic Findings</Label>
                                            <Textarea
                                                id="diagnostic_findings"
                                                rows={4}
                                                value={notesForm.data.diagnostic_findings}
                                                onChange={(e) => notesForm.setData('diagnostic_findings', e.target.value)}
                                            />
                                            {notesForm.errors.diagnostic_findings && (
                                                <p className="text-sm text-red-600">{notesForm.errors.diagnostic_findings}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="internal_notes">Internal Notes</Label>
                                            <Textarea
                                                id="internal_notes"
                                                rows={4}
                                                value={notesForm.data.notes}
                                                onChange={(e) => notesForm.setData('notes', e.target.value)}
                                            />
                                            {notesForm.errors.notes && (
                                                <p className="text-sm text-red-600">{notesForm.errors.notes}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-end">
                                            <Button type="submit" disabled={notesForm.processing}>
                                                {notesForm.processing ? 'Saving...' : 'Save Notes'}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        {workOrder.customer_concerns && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Customer Concerns</p>
                                                <p className="mt-1 text-sm">{workOrder.customer_concerns}</p>
                                            </div>
                                        )}
                                        {workOrder.diagnostic_findings && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Diagnostic Findings</p>
                                                <p className="mt-1 text-sm">{workOrder.diagnostic_findings}</p>
                                            </div>
                                        )}
                                        {workOrder.notes && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Internal Notes</p>
                                                <p className="mt-1 text-sm">{workOrder.notes}</p>
                                            </div>
                                        )}
                                        {!workOrder.customer_concerns && !workOrder.diagnostic_findings && !workOrder.notes && (
                                            <p className="text-sm text-muted-foreground">No notes have been recorded yet.</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Work Order Status</p>
                                    <div className="mt-1">{getStatusBadge(workOrder.status)}</div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Verification Status</p>
                                    <div className="mt-1">{getVerificationBadge(workOrder.verification_status)}</div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Priority</p>
                                    <Badge className="mt-1">{workOrder.priority}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Branch</p>
                                    <p className="font-medium mt-1">{workOrder.branch.name}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification Checklist */}
                        <Card className={workOrder.has_fraud_alerts ? 'border-red-200' : 'border-green-200'}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {workOrder.has_fraud_alerts ? (
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    )}
                                    Verification Checklist
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Photo Evidence</span>
                                    {photoStats.has_required_minimum ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Before/After Photos</span>
                                    {photoStats.has_before_after ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">GPS Verification</span>
                                    {workOrder.location_verified ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Odometer Verified</span>
                                    {workOrder.odometer_verified ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {workOrder.service_type && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Service Type</p>
                                        <p className="font-medium mt-1">{workOrder.service_type.name}</p>
                                        <Badge className="mt-1">{workOrder.service_type.category}</Badge>
                                    </div>
                                )}
                                {workOrder.assigned_technician && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Assigned Technician</p>
                                        <p className="font-medium mt-1">{workOrder.assigned_technician.name}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">PMS Interval</p>
                                    <p className="font-medium mt-1">{workOrder.pms_interval_km.toLocaleString()} km</p>
                                </div>
                                {workOrder.scheduled_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Scheduled</p>
                                        <p className="text-sm mt-1">{formatDate(workOrder.scheduled_at)}</p>
                                    </div>
                                )}
                                {workOrder.completed_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Completed</p>
                                        <p className="text-sm mt-1">{formatDate(workOrder.completed_at)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Photo Modal */}
                {selectedPhoto && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="p-4 border-b flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{selectedPhoto.file_name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {getPhotoTypeBadge(selectedPhoto.photo_type)} • {selectedPhoto.file_size_formatted}
                                    </p>
                                </div>
                                <Button variant="ghost" onClick={() => setSelectedPhoto(null)}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="p-4">
                                <img src={selectedPhoto.url} alt={selectedPhoto.file_name} className="w-full rounded-lg mb-4" />
                                
                                {/* EXIF Data */}
                                {selectedPhoto.has_exif_data && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Photo Metadata (EXIF)</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            {selectedPhoto.photo_taken_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Taken At:</span>
                                                    <span className="font-medium">{formatDate(selectedPhoto.photo_taken_at)}</span>
                                                </div>
                                            )}
                                            {selectedPhoto.camera_make && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Camera:</span>
                                                    <span className="font-medium">{selectedPhoto.camera_make} {selectedPhoto.camera_model}</span>
                                                </div>
                                            )}
                                            {selectedPhoto.has_gps_data && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">GPS Coordinates:</span>
                                                        <span className="font-medium">
                                                            {selectedPhoto.latitude?.toFixed(6)}, {selectedPhoto.longitude?.toFixed(6)}
                                                        </span>
                                                    </div>
                                                    {selectedPhoto.location_address && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Location:</span>
                                                            <span className="font-medium">{selectedPhoto.location_address}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
