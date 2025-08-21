import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Search, Filter, Download, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock, MapPin, DollarSign, Calendar, User, Fuel, Gauge } from 'lucide-react';
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
];

export default function VehicleInventory() {
    // Mock vehicle inventory data
    const mockVehicles = [
        {
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
            features: ['Apple CarPlay', 'Honda Sensing', 'Sunroof', 'Alloy Wheels'],
            vehicle_type: 'new',
            priority: 'high'
        },
        {
            id: 2,
            vin: 'WVWZZZ1JZ3W123789',
            stock_number: 'USED-2022-045',
            year: 2022,
            make: 'Volkswagen',
            model: 'Jetta',
            trim: 'SE',
            body_type: 'Sedan',
            exterior_color: 'Pure White',
            interior_color: 'Titan Black Leatherette',
            engine: '1.4L Turbo',
            transmission: '8-Speed Automatic',
            fuel_type: 'Gasoline',
            mileage: 35000,
            msrp: 980000,
            dealer_cost: 850000,
            current_price: 920000,
            status: 'sold',
            location: 'Lot B-12',
            date_received: '2023-12-15',
            days_in_inventory: 42,
            assigned_sales_rep: 'Carlos Rodriguez',
            features: ['Digital Cockpit', 'Heated Seats', 'Backup Camera'],
            vehicle_type: 'used',
            priority: 'medium',
            sold_date: '2024-01-20',
            buyer: 'Juan Dela Cruz'
        },
        {
            id: 3,
            vin: 'KMHD84LF5EU456123',
            stock_number: 'NEW-2024-002',
            year: 2024,
            make: 'Hyundai',
            model: 'Elantra',
            trim: 'Limited',
            body_type: 'Sedan',
            exterior_color: 'Intense Blue',
            interior_color: 'Gray Leather',
            engine: '2.0L 4-Cylinder',
            transmission: 'CVT',
            fuel_type: 'Gasoline',
            mileage: 8,
            msrp: 1180000,
            dealer_cost: 1050000,
            current_price: 1150000,
            status: 'reserved',
            location: 'Showroom A-3',
            date_received: '2024-01-18',
            days_in_inventory: 7,
            assigned_sales_rep: 'Lisa Brown',
            features: ['Wireless Charging', 'Bose Audio', 'Smart Cruise Control'],
            vehicle_type: 'new',
            priority: 'high',
            reserved_by: 'Maria Garcia',
            reservation_date: '2024-01-22'
        },
        {
            id: 4,
            vin: 'JF1VA1C60M9876543',
            stock_number: 'DEMO-2023-008',
            year: 2023,
            make: 'Subaru',
            model: 'Outback',
            trim: 'Premium',
            body_type: 'SUV',
            exterior_color: 'Magnetite Gray Metallic',
            interior_color: 'Black Cloth',
            engine: '2.5L Boxer',
            transmission: 'CVT',
            fuel_type: 'Gasoline',
            mileage: 5200,
            msrp: 1650000,
            dealer_cost: 1450000,
            current_price: 1580000,
            status: 'demo',
            location: 'Demo Fleet',
            date_received: '2023-11-20',
            days_in_inventory: 67,
            assigned_sales_rep: 'Pedro Martinez',
            features: ['EyeSight Safety', 'All-Wheel Drive', 'Roof Rails'],
            vehicle_type: 'demo',
            priority: 'medium'
        }
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

    const totalInventoryValue = mockVehicles.reduce((sum, vehicle) => sum + vehicle.current_price, 0);
    const availableVehicles = mockVehicles.filter(v => v.status === 'available').length;
    const soldVehicles = mockVehicles.filter(v => v.status === 'sold').length;
    const averageDaysInInventory = Math.round(mockVehicles.reduce((sum, v) => sum + v.days_in_inventory, 0) / mockVehicles.length);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Inventory" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Car className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Vehicle Inventory</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Link href="/inventory/vehicles/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Vehicle
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mockVehicles.length}</div>
                            <p className="text-xs text-muted-foreground">In inventory</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Available</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{availableVehicles}</div>
                            <p className="text-xs text-muted-foreground">Ready for sale</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Sold This Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{soldVehicles}</div>
                            <p className="text-xs text-muted-foreground">Units moved</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{(totalInventoryValue / 1000000).toFixed(1)}M</div>
                            <p className="text-xs text-muted-foreground">Total value</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Search and filter vehicle inventory by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by VIN, stock number, make, model..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Make" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Makes</SelectItem>
                                    <SelectItem value="honda">Honda</SelectItem>
                                    <SelectItem value="volkswagen">Volkswagen</SelectItem>
                                    <SelectItem value="hyundai">Hyundai</SelectItem>
                                    <SelectItem value="subaru">Subaru</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="sold">Sold</SelectItem>
                                    <SelectItem value="reserved">Reserved</SelectItem>
                                    <SelectItem value="demo">Demo</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="used">Used</SelectItem>
                                    <SelectItem value="demo">Demo</SelectItem>
                                    <SelectItem value="certified">Certified</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Inventory Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Inventory</CardTitle>
                        <CardDescription>Complete vehicle inventory with pricing, location, and sales information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle Details</TableHead>
                                    <TableHead>Specifications</TableHead>
                                    <TableHead>Pricing</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Sales Info</TableHead>
                                    <TableHead>Days in Inventory</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockVehicles.map((vehicle) => (
                                    <TableRow key={vehicle.id} className={vehicle.status === 'sold' ? 'bg-blue-50' : vehicle.status === 'reserved' ? 'bg-yellow-50' : ''}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                                                <div className="text-sm text-muted-foreground">{vehicle.trim} • {vehicle.body_type}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{vehicle.vin}</div>
                                                <div className="text-xs text-muted-foreground">Stock: {vehicle.stock_number}</div>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    {getVehicleTypeBadge(vehicle.vehicle_type)}
                                                    {getPriorityBadge(vehicle.priority)}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-1">
                                                    <Fuel className="h-3 w-3" />
                                                    <span className="text-sm">{vehicle.engine}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">{vehicle.transmission}</div>
                                                <div className="flex items-center space-x-1">
                                                    <Gauge className="h-3 w-3" />
                                                    <span className="text-sm">{vehicle.mileage.toLocaleString()} km</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">{vehicle.exterior_color}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-sm font-medium">₱{vehicle.current_price.toLocaleString()}</div>
                                                <div className="text-xs text-muted-foreground">MSRP: ₱{vehicle.msrp.toLocaleString()}</div>
                                                <div className="text-xs text-muted-foreground">Cost: ₱{vehicle.dealer_cost.toLocaleString()}</div>
                                                <div className="text-xs text-green-600">
                                                    Margin: ₱{(vehicle.current_price - vehicle.dealer_cost).toLocaleString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="h-3 w-3" />
                                                <span className="text-sm">{vehicle.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="flex items-center space-x-1">
                                                    <User className="h-3 w-3" />
                                                    <span className="text-sm">{vehicle.assigned_sales_rep}</span>
                                                </div>
                                                {vehicle.status === 'sold' && vehicle.buyer && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Sold to: {vehicle.buyer}
                                                    </div>
                                                )}
                                                {vehicle.status === 'reserved' && vehicle.reserved_by && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Reserved by: {vehicle.reserved_by}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-center">
                                                <div className="text-lg font-medium">{vehicle.days_in_inventory}</div>
                                                <div className="text-xs text-muted-foreground">days</div>
                                                {vehicle.days_in_inventory > 60 && (
                                                    <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs mt-1">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Aging
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Link href={`/inventory/vehicles/${vehicle.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/inventory/vehicles/${vehicle.id}/edit`}>
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

                {/* Inventory Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Performance</CardTitle>
                            <CardDescription>Key metrics and performance indicators</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Average Days in Inventory</div>
                                        <div className="text-sm text-muted-foreground">Time to sell</div>
                                    </div>
                                    <div className="text-2xl font-bold">{averageDaysInInventory}</div>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Turn Rate</div>
                                        <div className="text-sm text-muted-foreground">Monthly turnover</div>
                                    </div>
                                    <div className="text-2xl font-bold text-green-600">12.5%</div>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Aging Inventory</div>
                                        <div className="text-sm text-muted-foreground">Over 60 days</div>
                                    </div>
                                    <div className="text-2xl font-bold text-orange-600">1</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Distribution</CardTitle>
                            <CardDescription>Vehicle types and status breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">New Vehicles</div>
                                        <div className="text-sm text-muted-foreground">Fresh inventory</div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">
                                        {mockVehicles.filter(v => v.vehicle_type === 'new').length} units
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Used Vehicles</div>
                                        <div className="text-sm text-muted-foreground">Pre-owned inventory</div>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {mockVehicles.filter(v => v.vehicle_type === 'used').length} units
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Demo Vehicles</div>
                                        <div className="text-sm text-muted-foreground">Test drive fleet</div>
                                    </div>
                                    <Badge className="bg-purple-100 text-purple-800">
                                        {mockVehicles.filter(v => v.vehicle_type === 'demo').length} units
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
