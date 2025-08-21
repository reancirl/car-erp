import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Filter, Download, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock, Camera, DollarSign, Calendar, User, Package } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

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

export default function WarrantyClaims() {
    // Mock data for demonstration
    const mockClaims = [
        {
            id: 1,
            claim_no: 'WC-2025-001',
            vehicle_vin: 'JH4KA8260MC123456',
            customer_name: 'John Smith',
            vehicle_make: 'Honda',
            vehicle_model: 'Civic',
            vehicle_year: 2023,
            purchase_date: '2023-03-15',
            current_odometer: 15000,
            warranty_type: 'Powertrain',
            warranty_expiry_date: '2028-03-15',
            warranty_expiry_km: 100000,
            issue_description: 'Engine making unusual noise during acceleration',
            parts_used: ['Engine Mount', 'Timing Belt'],
            labor_hours: 4.5,
            parts_cost: 285.50,
            labor_cost: 450.00,
            total_claim_amount: 735.50,
            technician: 'Mike Johnson',
            status: 'pending_approval',
            priority: 'medium',
            submitted_at: '2025-01-12 09:30:00',
            photos_count: 3,
            audit_triggered: false,
            is_repeat_claim: false,
            previous_claims_count: 0
        },
        {
            id: 2,
            claim_no: 'WC-2025-002',
            vehicle_vin: 'WVWZZZ1JZ3W123789',
            customer_name: 'Sarah Davis',
            vehicle_make: 'Volkswagen',
            vehicle_model: 'Golf',
            vehicle_year: 2022,
            purchase_date: '2022-06-20',
            current_odometer: 25000,
            warranty_type: 'Comprehensive',
            warranty_expiry_date: '2025-06-20',
            warranty_expiry_km: 60000,
            issue_description: 'Air conditioning system not cooling properly',
            parts_used: ['AC Compressor', 'Refrigerant'],
            labor_hours: 3.0,
            parts_cost: 450.00,
            labor_cost: 300.00,
            total_claim_amount: 750.00,
            technician: 'Lisa Brown',
            status: 'approved',
            priority: 'low',
            submitted_at: '2025-01-10 14:15:00',
            photos_count: 5,
            audit_triggered: false,
            is_repeat_claim: false,
            previous_claims_count: 1
        },
        {
            id: 3,
            claim_no: 'WC-2025-003',
            vehicle_vin: 'KMHD84LF5EU456123',
            customer_name: 'Robert Chen',
            vehicle_make: 'Hyundai',
            vehicle_model: 'Elantra',
            vehicle_year: 2021,
            purchase_date: '2021-09-10',
            current_odometer: 45000,
            warranty_type: 'Extended',
            warranty_expiry_date: '2026-09-10',
            warranty_expiry_km: 80000,
            issue_description: 'Transmission slipping during gear changes',
            parts_used: ['Transmission Fluid', 'Filter Kit', 'Solenoid'],
            labor_hours: 6.5,
            parts_cost: 680.00,
            labor_cost: 650.00,
            total_claim_amount: 1330.00,
            technician: 'Tom Wilson',
            status: 'audit_required',
            priority: 'high',
            submitted_at: '2025-01-11 11:20:00',
            photos_count: 8,
            audit_triggered: true,
            is_repeat_claim: true,
            previous_claims_count: 2
        },
        {
            id: 4,
            claim_no: 'WC-2025-004',
            vehicle_vin: 'JF1VA1C60M9876543',
            customer_name: 'Emily Johnson',
            vehicle_make: 'Subaru',
            vehicle_model: 'Impreza',
            vehicle_year: 2020,
            purchase_date: '2020-11-25',
            current_odometer: 35000,
            warranty_type: 'Basic',
            warranty_expiry_date: '2023-11-25',
            warranty_expiry_km: 60000,
            issue_description: 'Brake system malfunction - pedal feels spongy',
            parts_used: ['Brake Pads', 'Brake Fluid'],
            labor_hours: 2.0,
            parts_cost: 120.00,
            labor_cost: 200.00,
            total_claim_amount: 320.00,
            technician: 'David Kim',
            status: 'rejected',
            priority: 'medium',
            submitted_at: '2025-01-09 16:45:00',
            photos_count: 2,
            audit_triggered: false,
            is_repeat_claim: false,
            previous_claims_count: 0,
            rejection_reason: 'Warranty expired - outside coverage period'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_approval':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Approval
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            case 'audit_required':
                return (
                    <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Audit Required
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
            case 'medium':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const isInWarranty = (purchaseDate: string, expiryDate: string, currentKm: number, expiryKm: number) => {
        const purchase = new Date(purchaseDate);
        const expiry = new Date(expiryDate);
        const now = new Date();
        
        return now <= expiry && currentKm <= expiryKm;
    };

    const getWarrantyStatus = (claim: any) => {
        const inWarranty = isInWarranty(claim.purchase_date, claim.warranty_expiry_date, claim.current_odometer, claim.warranty_expiry_km);
        return inWarranty ? (
            <Badge variant="default" className="bg-green-100 text-green-800">In Warranty</Badge>
        ) : (
            <Badge variant="destructive">Out of Warranty</Badge>
        );
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
                        <Link href="/service/warranty-claims/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Claim
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">Awaiting review</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Audit Required</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">1</div>
                            <p className="text-xs text-muted-foreground">High-value or repeat</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$3,135.50</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage warranty claims with media, parts tracking, and automated audit triggers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by claim number, VIN, or customer..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="audit_required">Audit Required</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Warranty Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                    <SelectItem value="powertrain">Powertrain</SelectItem>
                                    <SelectItem value="extended">Extended</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Claims Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Warranty Claims</CardTitle>
                        <CardDescription>Claims with media, parts used, labor hours, and warranty scope enforcement</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Claim Details</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Warranty Status</TableHead>
                                    <TableHead>Issue</TableHead>
                                    <TableHead>Parts & Labor</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Technician</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockClaims.map((claim) => (
                                    <TableRow key={claim.id} className={claim.audit_triggered ? 'bg-orange-50' : ''}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{claim.claim_no}</div>
                                                <div className="text-xs text-muted-foreground">{claim.submitted_at}</div>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <div className="flex items-center space-x-1">
                                                        <Camera className="h-3 w-3 text-blue-600" />
                                                        <span className="text-xs">{claim.photos_count}</span>
                                                    </div>
                                                    {claim.is_repeat_claim && (
                                                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                                                            Repeat ({claim.previous_claims_count})
                                                        </Badge>
                                                    )}
                                                    {claim.audit_triggered && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Audit
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{claim.vehicle_year} {claim.vehicle_make} {claim.vehicle_model}</div>
                                                <div className="text-xs text-muted-foreground">{claim.customer_name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{claim.vehicle_vin.slice(-6)}</div>
                                                <div className="text-xs text-muted-foreground">{claim.current_odometer.toLocaleString()} km</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {getWarrantyStatus(claim)}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    <div>{claim.warranty_type}</div>
                                                    <div>Exp: {claim.warranty_expiry_date}</div>
                                                    <div>{claim.warranty_expiry_km.toLocaleString()} km</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="truncate" title={claim.issue_description}>
                                                {claim.issue_description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-sm font-medium">Parts: ${claim.parts_cost}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {claim.parts_used.join(', ')}
                                                </div>
                                                <div className="text-sm">Labor: {claim.labor_hours}h (${claim.labor_cost})</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-lg">${claim.total_claim_amount}</div>
                                            {claim.total_claim_amount > 1000 && (
                                                <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                                                    High Value
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <User className="h-3 w-3" />
                                                <span className="text-sm">{claim.technician}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                        <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Link href={`/service/warranty-claims/${claim.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/service/warranty-claims/${claim.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
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

                {/* Warranty Scope Enforcement & Audit Triggers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Warranty Scope Enforcement</CardTitle>
                            <CardDescription>Automated validation by date and mileage</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Date Validation</div>
                                        <div className="text-sm text-muted-foreground">Check warranty expiry date</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Mileage Validation</div>
                                        <div className="text-sm text-muted-foreground">Check odometer against warranty km limit</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Coverage Scope</div>
                                        <div className="text-sm text-muted-foreground">Validate parts/labor against warranty type</div>
                                    </div>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">Manual Review</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Auto-Audit Triggers</CardTitle>
                            <CardDescription>Automated flags for high-value or repeat claims</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">High-Value Claims</div>
                                        <div className="text-sm text-muted-foreground">Claims over $1,000 require audit</div>
                                    </div>
                                    <Badge variant="destructive" className="bg-orange-100 text-orange-800">1 Triggered</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Repeat Claims</div>
                                        <div className="text-sm text-muted-foreground">Multiple claims for same vehicle/issue</div>
                                    </div>
                                    <Badge variant="destructive" className="bg-orange-100 text-orange-800">1 Triggered</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Pattern Detection</div>
                                        <div className="text-sm text-muted-foreground">Unusual claim patterns by technician</div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">No Issues</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reconciliation Dashboard */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reconciliation Dashboard</CardTitle>
                        <CardDescription>Cross-reference against inventory withdrawals and technician hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-medium">Parts Reconciliation</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Match claimed parts with inventory withdrawals</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Matched: 95%</span>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                    <h4 className="font-medium">Labor Hours</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Verify claimed hours against time logs</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Matched: 88%</span>
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Review</Badge>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium">Cost Validation</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Validate pricing against standard rates</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Variance: &lt;5%</span>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
