import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    FileText, 
    Edit, 
    Car, 
    User, 
    Calendar, 
    Clock,
    DollarSign,
    Package,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Phone,
    Mail,
    Camera,
    Download,
    Printer,
    MessageSquare,
    Upload,
    Eye
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface WarrantyClaimViewProps {
    claimId: string;
}

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
        title: 'View Warranty Claim',
        href: '/service/warranty-claims/view',
    },
];

// Mock warranty claim data
const mockClaim = {
    id: '1',
    claim_number: 'WC-2024-001',
    claim_date: '2024-01-15',
    claim_type: 'parts',
    priority: 'medium',
    status: 'approved',
    description: 'Defective brake pads causing noise and reduced braking performance. Customer reported grinding noise during braking. Inspection confirmed worn brake pads beyond normal wear pattern.',
    customer: {
        name: 'Juan Dela Cruz',
        phone: '+63 912 345 6789',
        email: 'juan.delacruz@email.com',
        address: '123 Main Street, Makati City'
    },
    vehicle: {
        make: 'Toyota',
        model: 'Vios',
        year: '2022',
        plate: 'ABC 1234',
        vin: 'JTDKB20U123456789',
        mileage: 25000,
        purchase_date: '2022-06-15'
    },
    parts_claimed: [
        { name: 'Brake Pad Set', price: 2500, warranty: '24 months', quantity: 1 },
        { name: 'Brake Fluid', price: 150, warranty: '12 months', quantity: 1 }
    ],
    labor_hours: 2.5,
    labor_rate: 800,
    total_parts_cost: 2650,
    total_labor_cost: 2000,
    total_claim_value: 4650,
    submitted_by: 'Service Advisor - Maria Santos',
    approved_by: 'Service Manager - Carlos Rodriguez',
    approval_date: '2024-01-18',
    expected_payment: '2024-01-25',
    notes: 'Customer reported grinding noise during braking. Inspection confirmed worn brake pads beyond normal wear pattern. Parts covered under 24-month warranty.',
    photos: [
        { id: 1, name: 'brake_pads_before.jpg', uploaded: '2024-01-15' },
        { id: 2, name: 'brake_pads_after.jpg', uploaded: '2024-01-15' },
        { id: 3, name: 'invoice_receipt.pdf', uploaded: '2024-01-15' }
    ],
    status_history: [
        { status: 'submitted', date: '2024-01-15', user: 'Maria Santos', notes: 'Initial claim submission' },
        { status: 'under_review', date: '2024-01-16', user: 'Carlos Rodriguez', notes: 'Reviewing documentation and warranty coverage' },
        { status: 'approved', date: '2024-01-18', user: 'Carlos Rodriguez', notes: 'Approved for warranty coverage. Parts and labor covered.' },
    ]
};

export default function WarrantyClaimView({ claimId }: WarrantyClaimViewProps) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock },
            under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Eye },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
            paid: { color: 'bg-purple-100 text-purple-800', icon: DollarSign },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
        const IconComponent = config.icon;
        
        return (
            <Badge className={config.color}>
                <IconComponent className="h-3 w-3 mr-1" />
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const getClaimTypeBadge = (type: string) => {
        const colors = {
            parts: 'bg-blue-100 text-blue-800',
            labor: 'bg-green-100 text-green-800',
            goodwill: 'bg-yellow-100 text-yellow-800',
            recall: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type.toUpperCase()}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{priority.toUpperCase()}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Warranty Claim - ${mockClaim.claim_number}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/service/warranty-claims">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Claims
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Warranty Claim {mockClaim.claim_number}</h1>
                            <div className="flex items-center space-x-2 mt-1">
                                {getStatusBadge(mockClaim.status)}
                                {getClaimTypeBadge(mockClaim.claim_type)}
                                {getPriorityBadge(mockClaim.priority)}
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Link href={`/service/warranty-claims/${claimId}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Claim
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Claim Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Claim Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Claim Date</p>
                                        <p className="font-medium">{new Date(mockClaim.claim_date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Submitted By</p>
                                        <p className="font-medium">{mockClaim.submitted_by}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Approved By</p>
                                        <p className="font-medium">{mockClaim.approved_by}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Expected Payment</p>
                                        <p className="font-medium">{new Date(mockClaim.expected_payment).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                                    <p className="text-sm">{mockClaim.description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer & Vehicle Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="font-medium">{mockClaim.customer.name}</p>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                                            <Phone className="h-4 w-4" />
                                            <span>{mockClaim.customer.phone}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            <span>{mockClaim.customer.email}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="text-sm">{mockClaim.customer.address}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Car className="h-5 w-5 mr-2" />
                                        Vehicle Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="font-medium">{mockClaim.vehicle.year} {mockClaim.vehicle.make} {mockClaim.vehicle.model}</p>
                                        <p className="text-sm text-muted-foreground">Plate: {mockClaim.vehicle.plate}</p>
                                        <p className="text-sm text-muted-foreground">VIN: {mockClaim.vehicle.vin}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Mileage</p>
                                            <p className="text-sm font-medium">{mockClaim.vehicle.mileage.toLocaleString()} km</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Purchase Date</p>
                                            <p className="text-sm font-medium">{new Date(mockClaim.vehicle.purchase_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Parts & Labor Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Parts & Labor Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-3">Parts Claimed</h4>
                                        <div className="space-y-2">
                                            {mockClaim.parts_claimed.map((part, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{part.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Warranty: {part.warranty} | Qty: {part.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium">₱{part.price.toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div>
                                        <h4 className="font-medium mb-3">Labor Details</h4>
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">Labor Hours</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {mockClaim.labor_hours} hours @ ₱{mockClaim.labor_rate}/hour
                                                </p>
                                            </div>
                                            <p className="font-medium">₱{mockClaim.total_labor_cost.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documentation */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Camera className="h-5 w-5 mr-2" />
                                    Documentation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {mockClaim.photos.map((photo) => (
                                        <div key={photo.id} className="border rounded-lg p-4">
                                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                                                <Camera className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium">{photo.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Uploaded: {new Date(photo.uploaded).toLocaleDateString()}
                                            </p>
                                            <Button variant="outline" size="sm" className="w-full mt-2">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2" />
                                    Status History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockClaim.status_history.map((entry, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium">{entry.status.replace('_', ' ').toUpperCase()}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">By: {entry.user}</p>
                                                <p className="text-sm">{entry.notes}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Claim Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Claim Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">Parts Cost:</span>
                                    <span className="text-sm font-medium">₱{mockClaim.total_parts_cost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Labor Cost:</span>
                                    <span className="text-sm font-medium">₱{mockClaim.total_labor_cost.toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="font-medium">Total Claim:</span>
                                    <span className="font-medium text-green-600">₱{mockClaim.total_claim_value.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Add Note
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Document
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Contact Customer
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Update
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Warranty Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Warranty Coverage</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Coverage Type</p>
                                    <p className="text-sm font-medium">Parts & Labor</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Remaining Coverage</p>
                                    <p className="text-sm font-medium">18 months</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Mileage Limit</p>
                                    <p className="text-sm font-medium">100,000 km</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Coverage Status</p>
                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Additional Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{mockClaim.notes}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
