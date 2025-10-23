import { Head, Link, useForm } from '@inertiajs/react';
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
import { Car, Save, X, Upload, Plus, Minus, AlertCircle, CheckCircle, Camera, FileText, DollarSign, MapPin, Calendar, Fuel, Gauge, Palette, Settings, History, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface Feature {
    title: string;
    value: string;
}

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface VehicleModel {
    id: number;
    make: string;
    model: string;
    year: number;
    body_type: string;
    transmission: string;
    fuel_type: string;
}

interface VehicleUnit {
    id: number;
    vin: string;
    stock_number: string;
    vehicle_model_id: number;
    branch_id: number;
    assigned_user_id?: number;
    trim?: string;
    vehicle_type: string;
    color_exterior: string;
    color_interior: string;
    odometer: number;
    purchase_price: number;
    sale_price?: number;
    currency: string;
    status: string;
    acquisition_date?: string;
    notes?: string;
}

interface Props {
    unit: VehicleUnit;
    branches: Branch[];
    salesReps: User[];
    vehicleModels: VehicleModel[];
    auth: {
        user: {
            branch_id?: number;
        };
        roles?: string[];
    };
}

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
    {
        title: 'Edit',
        href: '/inventory/vehicles/1/edit',
    },
];

export default function VehicleEdit({ unit, branches, salesReps, vehicleModels, auth }: Props) {
    const isAdmin = auth?.roles?.includes('admin') || auth?.roles?.includes('auditor');
    
    const { data, setData, put, processing, errors } = useForm({
        vehicle_model_id: unit.vehicle_model_id?.toString() || '',
        branch_id: unit.branch_id?.toString() || '',
        assigned_user_id: unit.assigned_user_id?.toString() || '',
        vin: unit.vin || '',
        stock_number: unit.stock_number || '',
        trim: unit.trim || '',
        vehicle_type: unit.vehicle_type || '',
        color_exterior: unit.color_exterior || '',
        color_interior: unit.color_interior || '',
        odometer: unit.odometer?.toString() || '',
        purchase_price: unit.purchase_price?.toString() || '',
        sale_price: unit.sale_price?.toString() || '',
        currency: unit.currency || 'PHP',
        status: unit.status || 'in_stock',
        acquisition_date: unit.acquisition_date || '',
        notes: unit.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Updating vehicle:', data);
        put(`/inventory/units/${unit.id}`, {
            onError: (errors) => {
                console.log('Update errors:', errors);
            },
            onSuccess: () => {
                console.log('Update successful!');
            }
        });
    };

    const [features, setFeatures] = useState<Feature[]>([]);

    const addFeature = () => {
        setFeatures([...features, { title: '', value: '' }]);
    };

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const updateFeature = (index: number, field: 'title' | 'value', value: string) => {
        const updated = [...features];
        updated[index][field] = value;
        setFeatures(updated);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Vehicle - 2024 Honda Civic Sport" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Car className="h-6 w-6" />
                        <div>
                            <h1 className="text-2xl font-bold">Edit Vehicle</h1>
                            <p className="text-muted-foreground">Stock: {unit.stock_number}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/inventory/vehicles/${unit.id}`}>
                            <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </Button>
                        </Link>
                        <Link href="/inventory/vehicles">
                            <Button variant="outline" size="sm">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button size="sm" onClick={handleSubmit} disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            Update Vehicle
                        </Button>
                    </div>
                </div>

                {/* Status Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <div>
                            <div className="font-medium text-blue-900">Vehicle Status: Available</div>
                            <div className="text-sm text-blue-700">This vehicle is currently available for sale and visible online.</div>
                        </div>
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
                                <CardDescription>Update the basic vehicle details and identification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vin">VIN Number *</Label>
                                        <Input 
                                            id="vin" 
                                            value={data.vin}
                                            onChange={(e) => setData('vin', e.target.value)}
                                            maxLength={17} 
                                        />
                                        {errors.vin && <p className="text-sm text-red-600">{errors.vin}</p>}
                                        <p className="text-xs text-muted-foreground">Vehicle Identification Number</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock_number">Stock Number *</Label>
                                        <Input 
                                            id="stock_number" 
                                            value={data.stock_number}
                                            onChange={(e) => setData('stock_number', e.target.value)}
                                        />
                                        {errors.stock_number && <p className="text-sm text-red-600">{errors.stock_number}</p>}
                                        <p className="text-xs text-muted-foreground">Internal inventory reference</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_model_id">Vehicle Model *</Label>
                                    <Select 
                                        value={data.vehicle_model_id} 
                                        onValueChange={(value) => setData('vehicle_model_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vehicle model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicleModels?.map((model) => (
                                                <SelectItem key={model.id} value={model.id.toString()}>
                                                    {model.year} {model.make} {model.model}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Select from pre-configured WULING models. <Link href="/inventory/models" className="text-blue-600 hover:underline">Manage models</Link>
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="trim">Trim/Variant</Label>
                                    <Input 
                                        id="trim" 
                                        value={data.trim}
                                        onChange={(e) => setData('trim', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Specific trim or variant of this unit
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                                    <Select 
                                        value={data.vehicle_type} 
                                        onValueChange={(value) => setData('vehicle_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
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

                        {/* Unit-Specific Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Unit-Specific Details</CardTitle>
                                <CardDescription>Details specific to this vehicle unit</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mileage" className="flex items-center space-x-1">
                                            <Gauge className="h-4 w-4" />
                                            <span>Odometer (km)</span>
                                        </Label>
                                        <Input 
                                            id="odometer" 
                                            type="number"
                                            value={data.odometer}
                                            onChange={(e) => setData('odometer', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Current mileage reading</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="exterior_color" className="flex items-center space-x-1">
                                            <Palette className="h-4 w-4" />
                                            <span>Exterior Color *</span>
                                        </Label>
                                        <Input 
                                            id="color_exterior" 
                                            value={data.color_exterior}
                                            onChange={(e) => setData('color_exterior', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="interior_color">Interior Color</Label>
                                    <Input 
                                        id="color_interior" 
                                        value={data.color_interior}
                                        onChange={(e) => setData('color_interior', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Features & Options */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Features & Options</CardTitle>
                                <CardDescription>Update vehicle features and optional equipment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <Label>Vehicle Features</Label>
                                    <p className="text-sm text-muted-foreground">e.g., Apple CarPlay, Sunroof, Heated Seats</p>
                                    {features.map((feature, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-start">
                                            <div className="col-span-5">
                                                <Input
                                                    value={feature.title}
                                                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                                    placeholder="Feature name"
                                                />
                                            </div>
                                            <div className="col-span-6">
                                                <Input
                                                    value={feature.value}
                                                    onChange={(e) => updateFeature(index, 'value', e.target.value)}
                                                    placeholder="Value (e.g., Standard, Optional)"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                {features.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFeature(index)}
                                                        className="h-10 w-10 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
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
                                <CardDescription>Update vehicle pricing and costs</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purchase_price">Purchase Price (₱)</Label>
                                    <Input 
                                        id="purchase_price" 
                                        type="number"
                                        value={data.purchase_price}
                                        onChange={(e) => setData('purchase_price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-muted-foreground">Your acquisition cost</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sale_price">Sale Price (₱)</Label>
                                    <Input 
                                        id="sale_price" 
                                        type="number"
                                        value={data.sale_price}
                                        onChange={(e) => setData('sale_price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-muted-foreground">Selling price</p>
                                </div>

                                <Separator />

                                {/* Dynamic Profit Calculation */}
                                {(() => {
                                    const purchasePrice = parseFloat(data.purchase_price) || 0;
                                    const salePrice = parseFloat(data.sale_price) || 0;
                                    const margin = salePrice - purchasePrice;
                                    const marginPercent = salePrice > 0 ? ((margin / salePrice) * 100).toFixed(1) : '0.0';
                                    const isProfit = margin >= 0;

                                    return (
                                        <div className={`p-3 rounded-lg ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                                            <div className={`text-sm font-medium ${isProfit ? 'text-green-800' : 'text-red-800'}`}>
                                                Estimated {isProfit ? 'Profit' : 'Loss'}
                                            </div>
                                            <div className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                                ₱{Math.abs(margin).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            <div className={`text-xs ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                                {marginPercent}% margin
                                            </div>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        {/* Location & Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5" />
                                    <span>Location & Status</span>
                                </CardTitle>
                                <CardDescription>Update vehicle branch and availability</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="branch_id">Branch *</Label>
                                    <Select 
                                        value={data.branch_id?.toString()} 
                                        onValueChange={(value) => setData('branch_id', value)}
                                        disabled={!isAdmin}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches?.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name} ({branch.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!isAdmin && <p className="text-xs text-muted-foreground">Branch cannot be changed</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        value={data.status} 
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="in_stock">In Stock</SelectItem>
                                            <SelectItem value="reserved">Reserved</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                            <SelectItem value="in_transit">In Transit</SelectItem>
                                            <SelectItem value="transferred">Transferred</SelectItem>
                                            <SelectItem value="disposed">Disposed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned_user_id">Assigned Sales Rep</Label>
                                    <Select 
                                        value={data.assigned_user_id} 
                                        onValueChange={(value) => setData('assigned_user_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select sales rep" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {salesReps?.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="acquisition_date" className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Acquisition Date</span>
                                    </Label>
                                    <Input 
                                        id="acquisition_date" 
                                        type="date"
                                        value={data.acquisition_date}
                                        onChange={(e) => setData('acquisition_date', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings & Options</CardTitle>
                                <CardDescription>Update additional options and settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Internal Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="min-h-[80px]"
                                        placeholder="Add any internal notes about this vehicle..."
                                    />
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
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <div>
                                            <div className="text-sm font-medium">Price updated</div>
                                            <div className="text-xs text-muted-foreground">Maria Santos • 2 hours ago</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <div>
                                            <div className="text-sm font-medium">Photos uploaded</div>
                                            <div className="text-xs text-muted-foreground">System • 1 day ago</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                                        <div>
                                            <div className="text-sm font-medium">Vehicle added</div>
                                            <div className="text-xs text-muted-foreground">Admin • 15 days ago</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Actions */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <Button className="w-full" onClick={handleSubmit} disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Vehicle
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Update & Continue Editing
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Changes will be saved immediately
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
