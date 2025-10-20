import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Car, 
    Edit,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Clock,
    FileSignature,
    Navigation,
    Smartphone,
    Shield,
    CreditCard,
    CheckCircle,
    AlertTriangle,
    Download,
    Copy,
    ExternalLink
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface TestDrive {
    id: number;
    reservation_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    vehicle_vin: string;
    vehicle_details: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    status: string;
    reservation_type: string;
    esignature_status: string;
    esignature_timestamp?: string;
    esignature_device?: string;
    gps_start_coords?: string;
    gps_end_coords?: string;
    gps_start_timestamp?: string;
    gps_end_timestamp?: string;
    route_distance_km?: number;
    max_speed_kmh?: number;
    insurance_verified: boolean;
    license_verified: boolean;
    deposit_amount: number;
    notes?: string;
    created_at: string;
    assigned_user?: {
        id: number;
        name: string;
    };
    branch?: {
        id: number;
        name: string;
        code: string;
    };
}

interface Props {
    testDrive: TestDrive;
    can?: {
        edit?: boolean;
        delete?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Test Drives',
        href: '/sales/test-drives',
    },
    {
        title: 'View',
        href: '#',
    },
];

export default function TestDriveView({ testDrive }: Props) {
    const activityLog = [
        {
            id: 1,
            timestamp: testDrive.created_at,
            action: 'Reservation Created',
            details: `Test drive reservation created for ${testDrive.customer_name}`,
            user: 'System',
            type: 'completion'
        },
        {
            id: 2,
            timestamp: '2025-01-14 10:00:00',
            action: 'Test Drive Started',
            details: 'GPS tracking initiated. Start coordinates logged.',
            user: 'Sarah Sales Rep',
            type: 'start'
        },
        {
            id: 3,
            timestamp: '2025-01-13 09:20:00',
            action: 'E-Signature Captured',
            details: 'Customer signed liability waiver on iPad Pro',
            user: 'Sarah Sales Rep',
            type: 'signature'
        },
        {
            id: 4,
            timestamp: '2025-01-13 09:15:00',
            action: 'Reservation Created',
            details: 'New test drive reservation scheduled',
            user: 'Sarah Sales Rep',
            type: 'creation'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirmed
                    </Badge>
                );
            case 'pending_signature':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <FileSignature className="h-3 w-3 mr-1" />
                        Pending Signature
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="destructive">
                        <Clock className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getReservationTypeBadge = (type: string) => {
        switch (type) {
            case 'scheduled':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Calendar className="h-3 w-3 mr-1" />
                        Scheduled
                    </Badge>
                );
            case 'walk_in':
                return (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        <MapPin className="h-3 w-3 mr-1" />
                        Walk-in
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const getESignatureBadge = (status: string) => {
        switch (status) {
            case 'signed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <FileSignature className="h-3 w-3 mr-1" />
                        Signed
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'not_required':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Not Required
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'completion':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'start':
                return <Navigation className="h-4 w-4 text-blue-600" />;
            case 'signature':
                return <FileSignature className="h-4 w-4 text-purple-600" />;
            case 'creation':
                return <Calendar className="h-4 w-4 text-gray-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Test Drive Details - ${testDrive.reservation_id}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/test-drives">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Test Drives
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Test Drive Reservation</h1>
                            <p className="text-muted-foreground">Reservation ID: {testDrive.reservation_id}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Link href={`/sales/test-drives/${testDrive.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Reservation
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Reservation Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Car className="h-5 w-5 mr-2" />
                                        Reservation Overview
                                    </div>
                                    <div className="flex space-x-2">
                                        {getStatusBadge(testDrive.status)}
                                        {getReservationTypeBadge(testDrive.reservation_type)}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Reservation ID</p>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-lg font-semibold">{testDrive.reservation_id}</p>
                                                <Button variant="ghost" size="sm">
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Created</p>
                                            <p className="text-sm">{testDrive.created_at}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                            <p className="text-sm">{testDrive.duration_minutes} minutes</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Scheduled Date & Time</p>
                                            <p className="text-lg font-semibold">{testDrive.scheduled_date}</p>
                                            <p className="text-sm text-muted-foreground">{testDrive.scheduled_time}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Sales Representative</p>
                                            <p className="text-sm">{testDrive.assigned_user?.name || 'Unassigned'}</p>
                                        </div>
                                        {testDrive.deposit_amount > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Deposit</p>
                                                <p className="text-sm font-semibold text-green-600">${testDrive.deposit_amount}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                            <p className="text-lg font-semibold">{testDrive.customer_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm">{testDrive.customer_phone}</p>
                                                <Button variant="ghost" size="sm">
                                                    <Phone className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm">{testDrive.customer_email}</p>
                                                <Button variant="ghost" size="sm">
                                                    <Mail className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Car className="h-5 w-5 mr-2" />
                                    Vehicle Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                                        <p className="text-lg font-semibold">{testDrive.vehicle_details}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">VIN</p>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-mono">{testDrive.vehicle_vin}</p>
                                            <Button variant="ghost" size="sm">
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* GPS Tracking Data */}
                        {testDrive.gps_start_coords && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Navigation className="h-5 w-5 mr-2" />
                                        GPS Tracking Data
                                    </CardTitle>
                                    <CardDescription>
                                        Route information and driving metrics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Start Coordinates</p>
                                                <p className="text-sm font-mono">{testDrive.gps_start_coords}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">End Coordinates</p>
                                                <p className="text-sm font-mono">{testDrive.gps_end_coords}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Route Distance</p>
                                                <p className="text-lg font-semibold text-blue-600">{testDrive.route_distance_km} km</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                                                <p className="text-sm">{testDrive.gps_start_timestamp}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">End Time</p>
                                                <p className="text-sm">{testDrive.gps_end_timestamp}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Maximum Speed</p>
                                                <p className="text-lg font-semibold text-orange-600">{testDrive.max_speed_kmh} km/h</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Button variant="outline" size="sm">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Route on Map
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Activity Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity Timeline</CardTitle>
                                <CardDescription>
                                    Chronological log of all reservation activities
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {activityLog.map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                            <div className="flex-shrink-0 mt-1">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium">{activity.action}</p>
                                                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                                                <p className="text-xs text-muted-foreground mt-1">by {activity.user}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* E-Signature Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <FileSignature className="h-4 w-4 mr-2" />
                                    E-Signature Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    {getESignatureBadge(testDrive.esignature_status)}
                                </div>
                                {testDrive.esignature_device && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Device</p>
                                        <div className="flex items-center space-x-1">
                                            <Smartphone className="h-3 w-3" />
                                            <span className="text-sm">{testDrive.esignature_device}</span>
                                        </div>
                                    </div>
                                )}
                                {testDrive.esignature_timestamp && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Signed At</p>
                                        <p className="text-sm">{testDrive.esignature_timestamp}</p>
                                    </div>
                                )}
                                <Button variant="outline" size="sm" className="w-full">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Signature
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Verification Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Verification Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Insurance</span>
                                    <div className="flex items-center space-x-1">
                                        <div className={`w-2 h-2 rounded-full ${testDrive.insurance_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-xs">{testDrive.insurance_verified ? 'Verified' : 'Not Verified'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Driver's License</span>
                                    <div className="flex items-center space-x-1">
                                        <div className={`w-2 h-2 rounded-full ${testDrive.license_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-xs">{testDrive.license_verified ? 'Verified' : 'Not Verified'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Customer
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Reschedule
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate Reservation
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {testDrive.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{testDrive.notes}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Related Records */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Related Records</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    <User className="h-4 w-4 mr-2" />
                                    Customer Profile
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    <Car className="h-4 w-4 mr-2" />
                                    Vehicle Details
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Sales Opportunity
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
