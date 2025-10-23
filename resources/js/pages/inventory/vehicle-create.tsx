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

interface Props {
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

export default function VehicleCreate({ branches, salesReps, vehicleModels, auth }: Props) {
    const [features, setFeatures] = useState<Feature[]>([{ title: '', value: '' }]);
    const [photos, setPhotos] = useState<string[]>([]);
    const [documents, setDocuments] = useState<string[]>([]);
    
    const isAdmin = auth?.roles?.includes('admin') || auth?.roles?.includes('auditor');

    const { data, setData, post, processing, errors } = useForm({
        vehicle_model_id: '',
        branch_id: auth?.user?.branch_id || '',
        assigned_user_id: '',
        vin: '',
        stock_number: '',
        trim: '',
        vehicle_type: '',
        color_exterior: '',
        color_interior: '',
        odometer: '',
        purchase_price: '',
        sale_price: '',
        currency: 'PHP',
        status: 'in_stock',
        acquisition_date: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting form data:', data);
        console.log('Errors:', errors);
        post('/inventory/units', {
            onError: (errors) => {
                console.log('Submission errors:', errors);
            },
            onSuccess: () => {
                console.log('Submission successful!');
            }
        });
    };

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
                        <Button size="sm" onClick={handleSubmit} disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Vehicle
                        </Button>
                    </div>
                </div>

                {/* Validation Errors */}
                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-900">Please fix the following errors:</h3>
                                    <ul className="list-disc list-inside text-sm text-red-700 mt-2">
                                        {Object.entries(errors).map(([key, error]) => (
                                            <li key={key}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                        <Input 
                                            id="vin" 
                                            placeholder="17-character VIN" 
                                            maxLength={17}
                                            value={data.vin}
                                            onChange={(e) => setData('vin', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Vehicle Identification Number</p>
                                        {errors.vin && <p className="text-sm text-red-600">{errors.vin}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock_number">Stock Number *</Label>
                                        <Input 
                                            id="stock_number" 
                                            placeholder="e.g., NEW-2024-001"
                                            value={data.stock_number}
                                            onChange={(e) => setData('stock_number', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Internal inventory reference</p>
                                        {errors.stock_number && <p className="text-sm text-red-600">{errors.stock_number}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_model_id">Vehicle Model *</Label>
                                    <Select 
                                        value={data.vehicle_model_id} 
                                        onValueChange={(value) => {
                                            console.log('Selected vehicle model:', value);
                                            setData('vehicle_model_id', value);
                                        }}
                                    >
                                        <SelectTrigger className={errors.vehicle_model_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select vehicle model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicleModels && vehicleModels.length > 0 ? (
                                                vehicleModels.map((model) => (
                                                    <SelectItem key={model.id} value={model.id.toString()}>
                                                        {model.year} {model.make} {model.model}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-muted-foreground">
                                                    No vehicle models available. <Link href="/inventory/models/create" className="text-blue-600">Create one</Link>
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Select from pre-configured WULING models. <Link href="/inventory/models" className="text-blue-600 hover:underline">Manage models</Link>
                                    </p>
                                    {errors.vehicle_model_id && <p className="text-sm text-red-600">{errors.vehicle_model_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="trim">Trim/Variant</Label>
                                    <Input 
                                        id="trim" 
                                        placeholder="e.g., Elite, Comfort, Standard"
                                        value={data.trim}
                                        onChange={(e) => setData('trim', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Specific trim or variant of this unit
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                                    <Select value={data.vehicle_type} onValueChange={(value) => setData('vehicle_type', value)}>
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
                                    {errors.vehicle_type && <p className="text-sm text-red-600">{errors.vehicle_type}</p>}
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
                                        <Label htmlFor="odometer" className="flex items-center space-x-1">
                                            <Gauge className="h-4 w-4" />
                                            <span>Odometer (km)</span>
                                        </Label>
                                        <Input 
                                            id="odometer" 
                                            type="number" 
                                            placeholder="0"
                                            value={data.odometer}
                                            onChange={(e) => setData('odometer', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Current mileage reading</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="color_exterior" className="flex items-center space-x-1">
                                            <Palette className="h-4 w-4" />
                                            <span>Exterior Color *</span>
                                        </Label>
                                        <Input 
                                            id="color_exterior" 
                                            placeholder="e.g., Crystal White, Midnight Black"
                                            value={data.color_exterior}
                                            onChange={(e) => setData('color_exterior', e.target.value)}
                                        />
                                        {errors.color_exterior && <p className="text-sm text-red-600">{errors.color_exterior}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="color_interior">Interior Color</Label>
                                    <Input 
                                        id="color_interior" 
                                        placeholder="e.g., Black Cloth, Beige Leather"
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
                                <CardDescription>Add vehicle features and optional equipment</CardDescription>
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
                                    <Label htmlFor="purchase_price">Purchase Price (₱) *</Label>
                                    <Input 
                                        id="purchase_price" 
                                        type="number" 
                                        placeholder="1,100,000"
                                        value={data.purchase_price}
                                        onChange={(e) => setData('purchase_price', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Your acquisition/dealer cost</p>
                                    {errors.purchase_price && <p className="text-sm text-red-600">{errors.purchase_price}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sale_price">Selling Price (₱)</Label>
                                    <Input 
                                        id="sale_price" 
                                        type="number" 
                                        placeholder="1,200,000"
                                        value={data.sale_price}
                                        onChange={(e) => setData('sale_price', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Target/current selling price</p>
                                    {errors.sale_price && <p className="text-sm text-red-600">{errors.sale_price}</p>}
                                </div>

                                <Separator />

                                {(() => {
                                    const purchasePrice = parseFloat(data.purchase_price) || 0;
                                    const salePrice = parseFloat(data.sale_price) || 0;
                                    const margin = salePrice - purchasePrice;
                                    const marginPercent = purchasePrice > 0 ? (margin / purchasePrice * 100) : 0;
                                    const isPositive = margin >= 0;

                                    return (
                                        <div className={`${isPositive ? 'bg-green-50' : 'bg-red-50'} p-3 rounded-lg`}>
                                            <div className={`text-sm font-medium ${isPositive ? 'text-green-800' : 'text-red-800'}`}>
                                                {isPositive ? 'Estimated Profit' : 'Loss'}
                                            </div>
                                            <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {margin > 0 ? '₱' : margin < 0 ? '-₱' : '₱'}{Math.abs(margin).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {marginPercent.toFixed(2)}% margin
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
                                <CardDescription>Set vehicle branch and availability</CardDescription>
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
                                    {!isAdmin && <p className="text-xs text-muted-foreground">Locked to your branch</p>}
                                    {errors.branch_id && <p className="text-sm text-red-600">{errors.branch_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        value={data.status} 
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
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
                                            <SelectItem value="">Unassigned</SelectItem>
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
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Actions */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <Button className="w-full" onClick={handleSubmit} disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Vehicle
                                    </Button>
                                    <Link href="/inventory/vehicles" className="block">
                                        <Button variant="outline" className="w-full">
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </Link>
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
