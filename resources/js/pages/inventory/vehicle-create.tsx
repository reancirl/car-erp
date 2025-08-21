import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Car, Save, X, Upload, Plus, Minus, AlertCircle, CheckCircle, Camera, FileText, DollarSign, MapPin, Calendar, Fuel, Gauge, Palette, Settings } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

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
        title: 'Add New Vehicle',
        href: '/inventory/vehicles/create',
    },
];

export default function VehicleCreate() {
    const [features, setFeatures] = useState<string[]>(['']);
    const [photos, setPhotos] = useState<string[]>([]);
    const [documents, setDocuments] = useState<string[]>([]);

    const addFeature = () => {
        setFeatures([...features, '']);
    };

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const updateFeature = (index: number, value: string) => {
        const updated = [...features];
        updated[index] = value;
        setFeatures(updated);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Vehicle" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Car className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Add New Vehicle</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/inventory/vehicles">
                            <Button variant="outline" size="sm">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Save Vehicle
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Car className="h-5 w-5" />
                                    <span>Basic Information</span>
                                </CardTitle>
                                <CardDescription>Enter the basic vehicle details and identification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vin">VIN Number *</Label>
                                        <Input id="vin" placeholder="17-character VIN" maxLength={17} />
                                        <p className="text-xs text-muted-foreground">Vehicle Identification Number</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock_number">Stock Number *</Label>
                                        <Input id="stock_number" placeholder="e.g., NEW-2024-001" />
                                        <p className="text-xs text-muted-foreground">Internal inventory reference</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Year *</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2024">2024</SelectItem>
                                                <SelectItem value="2023">2023</SelectItem>
                                                <SelectItem value="2022">2022</SelectItem>
                                                <SelectItem value="2021">2021</SelectItem>
                                                <SelectItem value="2020">2020</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="make">Make *</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select make" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="honda">Honda</SelectItem>
                                                <SelectItem value="toyota">Toyota</SelectItem>
                                                <SelectItem value="volkswagen">Volkswagen</SelectItem>
                                                <SelectItem value="hyundai">Hyundai</SelectItem>
                                                <SelectItem value="subaru">Subaru</SelectItem>
                                                <SelectItem value="mazda">Mazda</SelectItem>
                                                <SelectItem value="nissan">Nissan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="model">Model *</Label>
                                        <Input id="model" placeholder="e.g., Civic, Camry" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="trim">Trim Level</Label>
                                        <Input id="trim" placeholder="e.g., Sport, Limited, SE" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="body_type">Body Type</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select body type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sedan">Sedan</SelectItem>
                                                <SelectItem value="suv">SUV</SelectItem>
                                                <SelectItem value="hatchback">Hatchback</SelectItem>
                                                <SelectItem value="coupe">Coupe</SelectItem>
                                                <SelectItem value="convertible">Convertible</SelectItem>
                                                <SelectItem value="pickup">Pickup Truck</SelectItem>
                                                <SelectItem value="wagon">Wagon</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vehicle type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="used">Used</SelectItem>
                                            <SelectItem value="demo">Demo</SelectItem>
                                            <SelectItem value="certified">Certified Pre-Owned</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Specifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Specifications</span>
                                </CardTitle>
                                <CardDescription>Technical specifications and features</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="engine" className="flex items-center space-x-1">
                                            <Fuel className="h-4 w-4" />
                                            <span>Engine</span>
                                        </Label>
                                        <Input id="engine" placeholder="e.g., 2.0L 4-Cylinder Turbo" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="transmission">Transmission</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select transmission" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual</SelectItem>
                                                <SelectItem value="automatic">Automatic</SelectItem>
                                                <SelectItem value="cvt">CVT</SelectItem>
                                                <SelectItem value="dual_clutch">Dual Clutch</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fuel_type">Fuel Type</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select fuel type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gasoline">Gasoline</SelectItem>
                                                <SelectItem value="diesel">Diesel</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                                <SelectItem value="electric">Electric</SelectItem>
                                                <SelectItem value="plug_in_hybrid">Plug-in Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mileage" className="flex items-center space-x-1">
                                            <Gauge className="h-4 w-4" />
                                            <span>Mileage (km)</span>
                                        </Label>
                                        <Input id="mileage" type="number" placeholder="0" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="exterior_color" className="flex items-center space-x-1">
                                            <Palette className="h-4 w-4" />
                                            <span>Exterior Color</span>
                                        </Label>
                                        <Input id="exterior_color" placeholder="e.g., Crystal Black Pearl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="interior_color">Interior Color</Label>
                                        <Input id="interior_color" placeholder="e.g., Black Cloth" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Features & Options */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Features & Options</CardTitle>
                                <CardDescription>Add vehicle features and optional equipment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Vehicle Features</Label>
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Input
                                                value={feature}
                                                onChange={(e) => updateFeature(index, e.target.value)}
                                                placeholder="e.g., Apple CarPlay, Sunroof, Heated Seats"
                                                className="flex-1"
                                            />
                                            {features.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeFeature(index)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addFeature}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Feature
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Photos & Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Camera className="h-5 w-5" />
                                    <span>Photos & Documents</span>
                                </CardTitle>
                                <CardDescription>Upload vehicle photos and documentation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Vehicle Photos</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <div className="text-sm text-gray-600 mb-2">
                                            Drag and drop photos here, or click to browse
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Photos
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Recommended: Front, rear, interior, engine bay
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Documents</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <div className="text-sm text-gray-600 mb-2">
                                            Upload vehicle documents
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Documents
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Title, registration, inspection reports, etc.
                                        </p>
                                    </div>
                                </div>
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
                                    <span>Pricing</span>
                                </CardTitle>
                                <CardDescription>Set vehicle pricing and costs</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="msrp">MSRP (₱)</Label>
                                    <Input id="msrp" type="number" placeholder="1,250,000" />
                                    <p className="text-xs text-muted-foreground">Manufacturer's suggested retail price</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dealer_cost">Dealer Cost (₱)</Label>
                                    <Input id="dealer_cost" type="number" placeholder="1,100,000" />
                                    <p className="text-xs text-muted-foreground">Your acquisition cost</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="current_price">Current Price (₱) *</Label>
                                    <Input id="current_price" type="number" placeholder="1,200,000" />
                                    <p className="text-xs text-muted-foreground">Current selling price</p>
                                </div>

                                <Separator />

                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="text-sm font-medium text-green-800">Estimated Margin</div>
                                    <div className="text-lg font-bold text-green-600">₱100,000</div>
                                    <div className="text-xs text-green-600">8.3% margin</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location & Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5" />
                                    <span>Location & Status</span>
                                </CardTitle>
                                <CardDescription>Set vehicle location and availability</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location *</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="showroom_a1">Showroom A-1</SelectItem>
                                            <SelectItem value="showroom_a2">Showroom A-2</SelectItem>
                                            <SelectItem value="showroom_a3">Showroom A-3</SelectItem>
                                            <SelectItem value="lot_b1">Lot B-1</SelectItem>
                                            <SelectItem value="lot_b2">Lot B-2</SelectItem>
                                            <SelectItem value="service_area">Service Area</SelectItem>
                                            <SelectItem value="demo_fleet">Demo Fleet</SelectItem>
                                            <SelectItem value="in_transit">In Transit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="reserved">Reserved</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                            <SelectItem value="demo">Demo</SelectItem>
                                            <SelectItem value="in_transit">In Transit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned_sales_rep">Assigned Sales Rep</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select sales rep" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="maria_santos">Maria Santos</SelectItem>
                                            <SelectItem value="carlos_rodriguez">Carlos Rodriguez</SelectItem>
                                            <SelectItem value="lisa_brown">Lisa Brown</SelectItem>
                                            <SelectItem value="pedro_martinez">Pedro Martinez</SelectItem>
                                            <SelectItem value="ana_garcia">Ana Garcia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority Level</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date_received" className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Date Received</span>
                                    </Label>
                                    <Input id="date_received" type="date" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Additional options and settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="featured">Featured Vehicle</Label>
                                        <p className="text-xs text-muted-foreground">Highlight on website</p>
                                    </div>
                                    <Switch id="featured" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="allow_test_drive">Allow Test Drives</Label>
                                        <p className="text-xs text-muted-foreground">Enable test drive booking</p>
                                    </div>
                                    <Switch id="allow_test_drive" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="online_listing">Online Listing</Label>
                                        <p className="text-xs text-muted-foreground">Show on website</p>
                                    </div>
                                    <Switch id="online_listing" defaultChecked />
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Internal Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        placeholder="Add any internal notes about this vehicle..."
                                        className="min-h-[80px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Actions */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <Button className="w-full">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Vehicle
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Save & Add Another
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    All required fields must be completed
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
