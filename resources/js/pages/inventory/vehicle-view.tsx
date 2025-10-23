import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car, Edit, ArrowLeft, Share2, Printer, Download, MapPin, Calendar, User, DollarSign, Fuel, Gauge, Palette, Settings, History, Camera, FileText, CheckCircle, Clock, AlertTriangle, Star, TestTube, Globe } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface VehicleUnit {
    id: number;
    vehicle_master_id: number;
    vehicle_model_id: number | null;
    branch_id: number;
    assigned_user_id: number | null;
    vin: string;
    stock_number: string;
    status: string;
    purchase_price: number;
    sale_price: number | null;
    currency: string;
    acquisition_date: string | null;
    sold_date: string | null;
    color_exterior: string | null;
    color_interior: string | null;
    odometer: number | null;
    notes: string | null;
    images: string[] | null;
    specs: {
        features?: string[];
        documents?: Array<{
            name: string;
            url: string;
        }>;
        [key: string]: any;
    } | null;
    created_at: string;
    deleted_at: string | null;
    master: {
        id: number;
        make: string;
        model: string;
        year: number;
        trim?: string | null;
        body_type: string | null;
        transmission: string | null;
        fuel_type: string | null;
    };
    vehicle_model: {
        id: number;
        make: string;
        model: string;
        year: number;
        trim?: string | null;
        body_type: string | null;
        transmission: string | null;
        fuel_type: string | null;
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
}

interface ActivityLog {
    id: number;
    action: string;
    user: string;
    timestamp: string;
    event: string;
    module: string;
}

interface Props {
    vehicle: VehicleUnit;
    activityLogs: ActivityLog[];
}

export default function VehicleView({ vehicle, activityLogs }: Props) {
    const vehicleDisplay = vehicle.vehicle_model || vehicle.master;
    const vehicleTitle = `${vehicleDisplay.year} ${vehicleDisplay.make} ${vehicleDisplay.model}${vehicleDisplay.trim ? ' ' + vehicleDisplay.trim : ''}`;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inventory Management',
            href: '/inventory',
        },
        {
            title: 'Vehicle Inventory',
            href: '/inventory/vehicles',
        },
        {
            title: vehicleTitle,
            href: `/inventory/vehicles/${vehicle.id}`,
        },
    ];

    // Calculate days in inventory
    const daysInInventory = vehicle.acquisition_date 
        ? Math.floor((new Date().getTime() - new Date(vehicle.acquisition_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Mock data for features not yet in database
    const mockVehicle = {
        priority: 'medium',
        featured: false,
        allow_test_drive: true,
        online_listing: true,
    };

    // Parse images from vehicle data
    const vehicleImages = vehicle.images || [];
    
    // Parse features from vehicle specs
    const vehicleFeatures = vehicle.specs?.features || [];

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            in_stock: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'In Stock' },
            available: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Available' },
            sold: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Sold' },
            reserved: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Reserved' },
            demo: { color: 'bg-purple-100 text-purple-800', icon: Car, label: 'Demo' },
            in_transit: { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'In Transit' },
            transferred: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'Transferred' },
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

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-red-100 text-red-800',
        };
        return <Badge variant="outline" className={colors[priority as keyof typeof colors]}>{priority.toUpperCase()}</Badge>;
    };

    const calculateMargin = () => {
        if (!vehicle.sale_price) return 0;
        return vehicle.sale_price - vehicle.purchase_price;
    };

    const calculateMarginPercentage = () => {
        if (!vehicle.sale_price) return '0.0';
        return ((calculateMargin() / vehicle.sale_price) * 100).toFixed(1);
    };

    const formatCurrency = (amount: number, currency: string = 'PHP') => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={vehicleTitle} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/inventory/vehicles">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Inventory
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <Car className="h-6 w-6" />
                                <h1 className="text-2xl font-bold">{vehicleDisplay.year} {vehicleDisplay.make} {vehicleDisplay.model}</h1>
                                {mockVehicle.featured && (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        <Star className="h-3 w-3 mr-1" />
                                        Featured
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">{vehicleDisplay.trim || 'Standard'} • {vehicleDisplay.body_type} • Stock: {vehicle.stock_number}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/inventory/vehicles/${vehicle.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Vehicle
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                                    <div className="mt-1">{getStatusBadge(vehicle.status)}</div>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Days in Inventory</div>
                                    <div className="text-2xl font-bold">{daysInInventory}</div>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Purchase Price</div>
                                    <div className="text-2xl font-bold">{formatCurrency(vehicle.purchase_price, vehicle.currency)}</div>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Activity Logs</div>
                                    <div className="text-2xl font-bold">{activityLogs.length}</div>
                                </div>
                                <History className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vehicle Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Car className="h-5 w-5" />
                                    <span>Vehicle Details</span>
                                </CardTitle>
                                <CardDescription>Complete vehicle information and specifications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Basic Information</div>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex justify-between">
                                                    <span>VIN:</span>
                                                    <span className="font-mono text-sm">{vehicle.vin}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Stock Number:</span>
                                                    <span>{vehicle.stock_number}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Year:</span>
                                                    <span>{vehicleDisplay.year}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Make:</span>
                                                    <span>{vehicleDisplay.make}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Model:</span>
                                                    <span>{vehicleDisplay.model}</span>
                                                </div>
                                                {vehicleDisplay.trim && (
                                                    <div className="flex justify-between">
                                                        <span>Trim:</span>
                                                        <span>{vehicleDisplay.trim}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span>Body Type:</span>
                                                    <span>{vehicleDisplay.body_type || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Specifications</div>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Transmission:</span>
                                                    <span>{vehicleDisplay.transmission || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="flex items-center space-x-1">
                                                        <Fuel className="h-4 w-4" />
                                                        <span>Fuel Type:</span>
                                                    </span>
                                                    <span>{vehicleDisplay.fuel_type || 'N/A'}</span>
                                                </div>
                                                {vehicle.odometer && (
                                                    <div className="flex justify-between">
                                                        <span className="flex items-center space-x-1">
                                                            <Gauge className="h-4 w-4" />
                                                            <span>Odometer:</span>
                                                        </span>
                                                        <span>{vehicle.odometer.toLocaleString()} km</span>
                                                    </div>
                                                )}
                                                {vehicle.color_exterior && (
                                                    <div className="flex justify-between">
                                                        <span className="flex items-center space-x-1">
                                                            <Palette className="h-4 w-4" />
                                                            <span>Exterior:</span>
                                                        </span>
                                                        <span>{vehicle.color_exterior}</span>
                                                    </div>
                                                )}
                                                {vehicle.color_interior && (
                                                    <div className="flex justify-between">
                                                        <span>Interior:</span>
                                                        <span>{vehicle.color_interior}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Features & Options */}
                        {vehicleFeatures.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Features & Options</CardTitle>
                                    <CardDescription>Standard and optional equipment included with this vehicle</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {vehicleFeatures.map((feature: string, index: number) => (
                                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Photos */}
                        {vehicleImages.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Camera className="h-5 w-5" />
                                        <span>Vehicle Photos ({vehicleImages.length})</span>
                                    </CardTitle>
                                    <CardDescription>High-quality images of the vehicle</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {vehicleImages.map((photo: string, index: number) => (
                                            <a key={index} href={photo} target="_blank" rel="noopener noreferrer" className="aspect-video bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                                                <img src={photo} alt={`Vehicle photo ${index + 1}`} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pricing Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <DollarSign className="h-5 w-5" />
                                    <span>Pricing Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Purchase Price:</span>
                                        <span className="font-medium">{formatCurrency(vehicle.purchase_price, vehicle.currency)}</span>
                                    </div>
                                    {vehicle.sale_price && (
                                        <>
                                            <Separator />
                                            <div className="flex justify-between">
                                                <span className="font-medium">Sale Price:</span>
                                                <span className="font-bold text-lg">{formatCurrency(vehicle.sale_price, vehicle.currency)}</span>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-green-800">Profit Margin:</span>
                                                    <div className="text-right">
                                                        <div className="font-bold text-green-600">{formatCurrency(calculateMargin(), vehicle.currency)}</div>
                                                        <div className="text-xs text-green-600">{calculateMarginPercentage()}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location & Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5" />
                                    <span>Location & Assignment</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Branch:</span>
                                        <Badge variant="outline">{vehicle.branch.name}</Badge>
                                    </div>
                                    {vehicle.assigned_user && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Assigned To:</span>
                                            <span className="font-medium">{vehicle.assigned_user.name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Priority:</span>
                                        <span>{getPriorityBadge(mockVehicle.priority)}</span>
                                    </div>
                                    {vehicle.acquisition_date && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Acquisition Date:</span>
                                            <span className="font-medium">{new Date(vehicle.acquisition_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Settings & Options */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings & Options</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Star className="h-4 w-4" />
                                            <span className="text-sm">Featured Vehicle</span>
                                        </div>
                                        <Badge className={mockVehicle.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                                            {mockVehicle.featured ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <TestTube className="h-4 w-4" />
                                            <span className="text-sm">Test Drives</span>
                                        </div>
                                        <Badge className={mockVehicle.allow_test_drive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {mockVehicle.allow_test_drive ? 'Allowed' : 'Not Allowed'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Globe className="h-4 w-4" />
                                            <span className="text-sm">Online Listing</span>
                                        </div>
                                        <Badge className={mockVehicle.online_listing ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                                            {mockVehicle.online_listing ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        {vehicle.specs?.documents && vehicle.specs.documents.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <FileText className="h-5 w-5" />
                                        <span>Documents ({vehicle.specs.documents.length})</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {vehicle.specs.documents.map((doc: any, index: number) => (
                                            <a key={index} href={doc.url} download className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="text-sm">{doc.name || `Document ${index + 1}`}</span>
                                                </div>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Activity History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <History className="h-5 w-5" />
                                    <span>Recent Activity</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {activityLogs.length > 0 ? (
                                    <>
                                        <div className="space-y-3">
                                            {activityLogs.slice(0, 5).map((activity) => (
                                                <div key={activity.id} className="flex items-start space-x-2">
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${
                                                        activity.event === 'updated' ? 'bg-blue-500' :
                                                        activity.event === 'created' ? 'bg-green-500' :
                                                        activity.event === 'deleted' ? 'bg-red-500' :
                                                        'bg-gray-500'
                                                    }`}></div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium">{activity.action}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {activity.user} • {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {activityLogs.length > 5 && (
                                            <Button variant="outline" size="sm" className="w-full mt-4">
                                                View Full History ({activityLogs.length} total)
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No activity logs yet</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Internal Notes */}
                        {vehicle.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Internal Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-gray-50 p-3 rounded text-sm">
                                        {vehicle.notes}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
