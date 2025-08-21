import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car, Edit, ArrowLeft, Share2, Printer, Download, MapPin, Calendar, User, DollarSign, Fuel, Gauge, Palette, Settings, History, Camera, FileText, CheckCircle, Clock, AlertTriangle, Star, TestTube, Globe } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

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
        title: '2024 Honda Civic Sport',
        href: '/inventory/vehicles/1',
    },
];

export default function VehicleView() {
    // Mock vehicle data
    const mockVehicle = {
        id: 1,
        vin: 'JH4KA8260MC123456',
        stock_number: 'NEW-2024-001',
        year: 2024,
        make: 'Honda',
        model: 'Civic',
        trim: 'Sport',
        body_type: 'Sedan',
        exterior_color: 'Crystal Black Pearl',
        interior_color: 'Black Cloth',
        engine: '2.0L 4-Cylinder',
        transmission: 'CVT Automatic',
        fuel_type: 'Gasoline',
        mileage: 12,
        msrp: 1250000,
        dealer_cost: 1100000,
        current_price: 1200000,
        status: 'available',
        location: 'Showroom A-1',
        date_received: '2024-01-10',
        days_in_inventory: 15,
        assigned_sales_rep: 'Maria Santos',
        priority: 'high',
        vehicle_type: 'new',
        featured: true,
        allow_test_drive: true,
        online_listing: true,
        notes: 'Popular model with high demand. Consider for featured listing.',
        features: ['Apple CarPlay', 'Honda Sensing', 'Sunroof', 'Alloy Wheels', 'Heated Seats', 'Backup Camera'],
        photos: ['front.jpg', 'rear.jpg', 'interior.jpg', 'engine.jpg'],
        documents: ['title.pdf', 'inspection.pdf', 'warranty.pdf']
    };

    const mockActivity = [
        { id: 1, action: 'Price updated to ₱1,200,000', user: 'Maria Santos', timestamp: '2024-01-25 14:30', type: 'price' },
        { id: 2, action: 'Test drive scheduled with Juan Dela Cruz', user: 'Carlos Rodriguez', timestamp: '2024-01-24 10:15', type: 'test_drive' },
        { id: 3, action: 'Photos uploaded (4 images)', user: 'System', timestamp: '2024-01-23 16:45', type: 'photos' },
        { id: 4, action: 'Vehicle moved to Showroom A-1', user: 'Pedro Martinez', timestamp: '2024-01-22 09:00', type: 'location' },
        { id: 5, action: 'Vehicle added to inventory', user: 'Admin', timestamp: '2024-01-10 08:30', type: 'created' }
    ];

    const mockInterest = [
        { id: 1, customer: 'Juan Dela Cruz', phone: '+63 917 123 4567', email: 'juan@email.com', interest_date: '2024-01-24', status: 'test_drive_scheduled', notes: 'Interested in financing options' },
        { id: 2, customer: 'Maria Garcia', phone: '+63 918 234 5678', email: 'maria.g@email.com', interest_date: '2024-01-23', status: 'inquiry', notes: 'Comparing with other models' },
        { id: 3, customer: 'Robert Santos', phone: '+63 919 345 6789', email: 'robert@email.com', interest_date: '2024-01-22', status: 'follow_up', notes: 'Waiting for trade-in appraisal' }
    ];

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            available: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Available' },
            sold: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Sold' },
            reserved: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Reserved' },
            demo: { color: 'bg-purple-100 text-purple-800', icon: Car, label: 'Demo' },
            in_transit: { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'In Transit' },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
        const IconComponent = config.icon;
        
        return (
            <Badge className={config.color}>
                <IconComponent className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getVehicleTypeBadge = (type: string) => {
        const colors = {
            new: 'bg-green-100 text-green-800',
            used: 'bg-blue-100 text-blue-800',
            demo: 'bg-purple-100 text-purple-800',
            certified: 'bg-yellow-100 text-yellow-800',
        };
        return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type.toUpperCase()}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-red-100 text-red-800',
        };
        return <Badge variant="outline" className={colors[priority as keyof typeof colors]}>{priority.toUpperCase()}</Badge>;
    };

    const getInterestStatusBadge = (status: string) => {
        const colors = {
            inquiry: 'bg-blue-100 text-blue-800',
            test_drive_scheduled: 'bg-green-100 text-green-800',
            follow_up: 'bg-yellow-100 text-yellow-800',
            not_interested: 'bg-red-100 text-red-800',
        };
        const labels = {
            inquiry: 'Inquiry',
            test_drive_scheduled: 'Test Drive Scheduled',
            follow_up: 'Follow Up',
            not_interested: 'Not Interested',
        };
        return <Badge className={colors[status as keyof typeof colors]}>{labels[status as keyof typeof labels]}</Badge>;
    };

    const calculateMargin = () => {
        return mockVehicle.current_price - mockVehicle.dealer_cost;
    };

    const calculateMarginPercentage = () => {
        return ((calculateMargin() / mockVehicle.current_price) * 100).toFixed(1);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${mockVehicle.year} ${mockVehicle.make} ${mockVehicle.model} ${mockVehicle.trim}`} />
            
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
                                <h1 className="text-2xl font-bold">{mockVehicle.year} {mockVehicle.make} {mockVehicle.model}</h1>
                                {mockVehicle.featured && (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        <Star className="h-3 w-3 mr-1" />
                                        Featured
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">{mockVehicle.trim} • {mockVehicle.body_type} • Stock: {mockVehicle.stock_number}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Link href={`/inventory/vehicles/${mockVehicle.id}/edit`}>
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
                                    <div className="mt-1">{getStatusBadge(mockVehicle.status)}</div>
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
                                    <div className="text-2xl font-bold">{mockVehicle.days_in_inventory}</div>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Current Price</div>
                                    <div className="text-2xl font-bold">₱{mockVehicle.current_price.toLocaleString()}</div>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Customer Interest</div>
                                    <div className="text-2xl font-bold">{mockInterest.length}</div>
                                </div>
                                <User className="h-8 w-8 text-purple-500" />
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
                                                    <span className="font-mono text-sm">{mockVehicle.vin}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Year:</span>
                                                    <span>{mockVehicle.year}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Make:</span>
                                                    <span>{mockVehicle.make}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Model:</span>
                                                    <span>{mockVehicle.model}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Trim:</span>
                                                    <span>{mockVehicle.trim}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Body Type:</span>
                                                    <span>{mockVehicle.body_type}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Type:</span>
                                                    <span>{getVehicleTypeBadge(mockVehicle.vehicle_type)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Specifications</div>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="flex items-center space-x-1">
                                                        <Fuel className="h-4 w-4" />
                                                        <span>Engine:</span>
                                                    </span>
                                                    <span>{mockVehicle.engine}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Transmission:</span>
                                                    <span>{mockVehicle.transmission}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Fuel Type:</span>
                                                    <span>{mockVehicle.fuel_type}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="flex items-center space-x-1">
                                                        <Gauge className="h-4 w-4" />
                                                        <span>Mileage:</span>
                                                    </span>
                                                    <span>{mockVehicle.mileage.toLocaleString()} km</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="flex items-center space-x-1">
                                                        <Palette className="h-4 w-4" />
                                                        <span>Exterior:</span>
                                                    </span>
                                                    <span>{mockVehicle.exterior_color}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Interior:</span>
                                                    <span>{mockVehicle.interior_color}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Features & Options */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Features & Options</CardTitle>
                                <CardDescription>Standard and optional equipment included with this vehicle</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {mockVehicle.features.map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Photos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Camera className="h-5 w-5" />
                                    <span>Vehicle Photos ({mockVehicle.photos.length})</span>
                                </CardTitle>
                                <CardDescription>High-quality images of the vehicle</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {mockVehicle.photos.map((photo, index) => (
                                        <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                            <Camera className="h-8 w-8 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="mt-4">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download All Photos
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Customer Interest */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Customer Interest ({mockInterest.length})</span>
                                </CardTitle>
                                <CardDescription>Customers who have shown interest in this vehicle</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockInterest.map((interest) => (
                                            <TableRow key={interest.id}>
                                                <TableCell className="font-medium">{interest.customer}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{interest.phone}</div>
                                                        <div className="text-muted-foreground">{interest.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{interest.interest_date}</TableCell>
                                                <TableCell>{getInterestStatusBadge(interest.status)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{interest.notes}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
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
                                        <span className="text-sm text-muted-foreground">MSRP:</span>
                                        <span className="font-medium">₱{mockVehicle.msrp.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Dealer Cost:</span>
                                        <span className="font-medium">₱{mockVehicle.dealer_cost.toLocaleString()}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="font-medium">Current Price:</span>
                                        <span className="font-bold text-lg">₱{mockVehicle.current_price.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-green-800">Profit Margin:</span>
                                            <div className="text-right">
                                                <div className="font-bold text-green-600">₱{calculateMargin().toLocaleString()}</div>
                                                <div className="text-xs text-green-600">{calculateMarginPercentage()}%</div>
                                            </div>
                                        </div>
                                    </div>
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
                                        <span className="text-sm text-muted-foreground">Location:</span>
                                        <Badge variant="outline">{mockVehicle.location}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Sales Rep:</span>
                                        <span className="font-medium">{mockVehicle.assigned_sales_rep}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Priority:</span>
                                        <span>{getPriorityBadge(mockVehicle.priority)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Date Received:</span>
                                        <span className="font-medium">{mockVehicle.date_received}</span>
                                    </div>
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Documents ({mockVehicle.documents.length})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {mockVehicle.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                                            <div className="flex items-center space-x-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="text-sm">{doc}</span>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <History className="h-5 w-5" />
                                    <span>Recent Activity</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockActivity.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-2">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${
                                                activity.type === 'price' ? 'bg-blue-500' :
                                                activity.type === 'test_drive' ? 'bg-green-500' :
                                                activity.type === 'photos' ? 'bg-purple-500' :
                                                activity.type === 'location' ? 'bg-orange-500' :
                                                'bg-gray-500'
                                            }`}></div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{activity.action}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-4">
                                    View Full History
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Internal Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Internal Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-50 p-3 rounded text-sm">
                                    {mockVehicle.notes}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
