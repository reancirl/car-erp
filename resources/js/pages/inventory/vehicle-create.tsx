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
import { Car, Save, X, Upload, Plus, Minus, AlertCircle, CheckCircle, Camera, FileText, DollarSign, MapPin, Calendar, Fuel, Gauge, Palette, Settings, Lock } from 'lucide-react';
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

interface Customer {
    id: number;
    name: string;
    email: string;
}

interface Props {
    branches: Branch[];
    salesReps: User[];
    vehicleModels: VehicleModel[];
    customers?: Customer[];
    auth: {
        user: {
            branch_id?: number;
        };
        roles?: string[];
    };
}

export default function VehicleCreate({ branches, salesReps, vehicleModels, customers = [], auth }: Props) {
    const [features, setFeatures] = useState<Feature[]>([{ title: '', value: '' }]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
    const [isDraggingDoc, setIsDraggingDoc] = useState(false);
    
    const isAdmin = auth?.roles?.includes('admin') || auth?.roles?.includes('auditor');

    const { data, setData, post, processing, errors } = useForm({
        vehicle_model_id: '',
        variant: '',
        variant_spec: '',
        branch_id: auth?.user?.branch_id || '',
        assigned_user_id: '',
        owner_id: '',
        vin: '',
        stock_number: '',
        conduction_no: '',
        drive_motor_no: '',
        plate_no: '',
        color_exterior: '',
        color_interior: '',
        color_code: '',
        odometer: '',
        purchase_price: '',
        sale_price: '',
        msrp_price: '',
        currency: 'PHP',
        status: 'in_stock',
        location: 'branch',
        sub_status: '',
        is_locked: false,
        acquisition_date: '',
        lto_transaction_no: '',
        cr_no: '',
        or_cr_release_date: '',
        emission_reference: '',
        battery_capacity: '',
        battery_range_km: '',
        notes: '',
        photos: [] as File[],
        documents: [] as File[],
        release_date: '',
        payment_method: '',
        proof_of_payment_refs: '' as string,
        dealer: '',
        sales_agent_id: '',
        assigned_driver_id: '',
        gps_details: '',
        insurance_details: '',
        promo_freebies: '',
        srp_amount: '',
        discount_amount: '',
        net_selling_price: '',
        dp_amount: '',
        dp_date: '',
        balance_financed: '',
        financing_institution: '',
        financing_terms_months: '',
        financing_interest_rate: '',
        financing_monthly_amortization: '',
        chattel_mortgage_details: '',
        sales_invoice_no: '',
        dr_no: '',
        or_numbers: '',
        release_checklist_status: '',
        release_approval_user_id: '',
        freebies_list: '',
        freebies_total_cost: '',
        freebies_payer: '',
        warranty_start_date: '',
        warranty_end_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use Inertia's form submission with file support
        post('/inventory/units', {
            forceFormData: true,
            onSuccess: () => {
                console.log('Vehicle created successfully!');
            },
            onError: (errors) => {
                console.log('Submission errors:', errors);
            },
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

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Validate file count
        if (files.length + data.photos.length > 10) {
            alert('You can only upload up to 10 photos');
            return;
        }

        // Validate file sizes (5MB max)
        const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert('Some photos exceed the 5MB size limit');
            return;
        }

        // Create preview URLs for new files
        const newPreviews = files.map(file => URL.createObjectURL(file));
        
        setData('photos', [...data.photos, ...files]);
        setPhotoPreviews([...photoPreviews, ...newPreviews]);
    };

    const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Validate file count
        if (files.length + data.documents.length > 10) {
            alert('You can only upload up to 10 documents');
            return;
        }

        // Validate file sizes (10MB max)
        const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert('Some documents exceed the 10MB size limit');
            return;
        }

        setData('documents', [...data.documents, ...files]);
    };

    const removePhoto = (index: number) => {
        // Revoke the preview URL to free up memory
        URL.revokeObjectURL(photoPreviews[index]);
        
        setData('photos', data.photos.filter((_, i) => i !== index));
        setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
    };

    const removeDocument = (index: number) => {
        setData('documents', data.documents.filter((_, i) => i !== index));
    };

    const handlePhotoDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingPhoto(true);
    };

    const handlePhotoDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingPhoto(false);
    };

    const handlePhotoDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingPhoto(false);
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/')
        );
        
        if (files.length + data.photos.length > 10) {
            alert('You can only upload up to 10 photos');
            return;
        }

        const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert('Some photos exceed the 5MB size limit');
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setData('photos', [...data.photos, ...files]);
        setPhotoPreviews([...photoPreviews, ...newPreviews]);
    };

    const handleDocDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingDoc(true);
    };

    const handleDocDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingDoc(false);
    };

    const handleDocDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingDoc(false);
        
        const files = Array.from(e.dataTransfer.files);
        
        if (files.length + data.documents.length > 10) {
            alert('You can only upload up to 10 documents');
            return;
        }

        const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert('Some documents exceed the 10MB size limit');
            return;
        }

        setData('documents', [...data.documents, ...files]);
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
                            {processing ? 'Saving Vehicle...' : 'Save Vehicle'}
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
                                                vehicleModels
                                                    .filter((model) => model.id && model.id.toString().trim() !== '' && !isNaN(Number(model.id)))
                                                    .map((model) => (
                                                        <SelectItem key={model.id} value={model.id.toString()}>
                                                            {`${model.year} ${model.make} ${model.model}`}
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="variant">Variant</Label>
                                        <Input 
                                            id="variant" 
                                            placeholder="e.g., Premium, Luxury"
                                            value={data.variant}
                                            onChange={(e) => setData('variant', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="variant_spec">Variant Spec</Label>
                                        <Input 
                                            id="variant_spec" 
                                            placeholder="Spec notes (AWD, Tech Pack, etc.)"
                                            value={data.variant_spec}
                                            onChange={(e) => setData('variant_spec', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Ownership & Registration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Ownership & Registration</span>
                                </CardTitle>
                                <CardDescription>Conduction, plate, and registration details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="conduction_no">Conduction No.</Label>
                                        <Input 
                                            id="conduction_no" 
                                            placeholder="Conduction number"
                                            value={data.conduction_no}
                                            onChange={(e) => setData('conduction_no', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="drive_motor_no">Drive Motor No.</Label>
                                        <Input 
                                            id="drive_motor_no" 
                                            placeholder="Drive motor number"
                                            value={data.drive_motor_no}
                                            onChange={(e) => setData('drive_motor_no', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="plate_no">Plate No.</Label>
                                        <Input 
                                            id="plate_no" 
                                            placeholder="e.g., ABC 1234"
                                            value={data.plate_no}
                                            onChange={(e) => setData('plate_no', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="owner_id">Owner</Label>
                                        <Select 
                                            value={data.owner_id || 'unassigned'} 
                                            onValueChange={(value) => setData('owner_id', value === 'unassigned' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select owner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {customers?.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                                        {customer.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lto_transaction_no">LTO Transaction No.</Label>
                                        <Input 
                                            id="lto_transaction_no" 
                                            placeholder="LTO reference"
                                            value={data.lto_transaction_no}
                                            onChange={(e) => setData('lto_transaction_no', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cr_no">CR No.</Label>
                                        <Input 
                                            id="cr_no" 
                                            placeholder="Certificate of Registration"
                                            value={data.cr_no}
                                            onChange={(e) => setData('cr_no', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="or_cr_release_date">OR/CR Release Date</Label>
                                        <Input 
                                            id="or_cr_release_date" 
                                            type="date"
                                            value={data.or_cr_release_date}
                                            onChange={(e) => setData('or_cr_release_date', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="emission_reference">Emission / Inspection Ref</Label>
                                    <Input 
                                        id="emission_reference" 
                                        placeholder="Reference number"
                                        value={data.emission_reference}
                                        onChange={(e) => setData('emission_reference', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* EV & Range */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Battery & Range</CardTitle>
                                <CardDescription>Capture EV-specific details</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="battery_capacity">Battery Capacity (kWh)</Label>
                                    <Input 
                                        id="battery_capacity" 
                                        type="number"
                                        placeholder="0.00"
                                        value={data.battery_capacity}
                                        onChange={(e) => setData('battery_capacity', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="battery_range_km">Range (km)</Label>
                                    <Input 
                                        id="battery_range_km" 
                                        type="number"
                                        placeholder="0"
                                        value={data.battery_range_km}
                                        onChange={(e) => setData('battery_range_km', e.target.value)}
                                    />
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="color_interior">Interior Color</Label>
                                        <Input 
                                            id="color_interior" 
                                            placeholder="e.g., Black Cloth, Beige Leather"
                                            value={data.color_interior}
                                            onChange={(e) => setData('color_interior', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="color_code">Color Code</Label>
                                        <Input 
                                            id="color_code" 
                                            placeholder="e.g., WA8555"
                                            value={data.color_code}
                                            onChange={(e) => setData('color_code', e.target.value)}
                                        />
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
                                <CardDescription>Select files to upload with the vehicle</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Photos */}
                                <div className="space-y-2">
                                    <Label>Vehicle Photos</Label>
                                    <div 
                                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                            isDraggingPhoto 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onDragOver={handlePhotoDragOver}
                                        onDragLeave={handlePhotoDragLeave}
                                        onDrop={handlePhotoDrop}
                                    >
                                        <Camera className={`h-12 w-12 mx-auto mb-4 ${isDraggingPhoto ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <div className="text-sm text-gray-600 mb-2">
                                            {isDraggingPhoto ? 'Drop photos here' : 'Drag and drop photos here, or click to browse'}
                                        </div>
                                        <label htmlFor="photo-upload">
                                            <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('photo-upload')?.click()}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Select Photos
                                            </Button>
                                        </label>
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={handlePhotoSelect}
                                            className="hidden"
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Max 10 photos, 5MB each (JPEG, PNG, JPG, WEBP)
                                        </p>
                                    </div>
                                    
                                    {data.photos.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-3">Selected photos ({data.photos.length}):</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {data.photos.map((photo: File, index: number) => (
                                                    <div key={index} className="relative group">
                                                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                                            <img 
                                                                src={photoPreviews[index]} 
                                                                alt={photo.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            type="button"
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                                            onClick={() => removePhoto(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                        <div className="mt-1 text-xs text-gray-600 truncate" title={photo.name}>
                                                            {photo.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {(photo.size / 1024 / 1024).toFixed(2)} MB
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Documents */}
                                <div className="space-y-2">
                                    <Label>Documents</Label>
                                    <div 
                                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                            isDraggingDoc 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onDragOver={handleDocDragOver}
                                        onDragLeave={handleDocDragLeave}
                                        onDrop={handleDocDrop}
                                    >
                                        <FileText className={`h-12 w-12 mx-auto mb-4 ${isDraggingDoc ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <div className="text-sm text-gray-600 mb-2">
                                            {isDraggingDoc ? 'Drop documents here' : 'Drag and drop documents here, or click to browse'}
                                        </div>
                                        <label htmlFor="document-upload">
                                            <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('document-upload')?.click()}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Select Documents
                                            </Button>
                                        </label>
                                        <input
                                            id="document-upload"
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                            onChange={handleDocumentSelect}
                                            className="hidden"
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Max 10 documents, 10MB each (PDF, DOC, DOCX, XLS, XLSX)
                                        </p>
                                    </div>
                                    
                                    {data.documents.length > 0 && (
                                        <div className="space-y-2 mt-3">
                                            <p className="text-sm font-medium">Selected documents ({data.documents.length}):</p>
                                            {data.documents.map((doc: File, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="h-4 w-4" />
                                                        <span className="text-sm">{doc.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        type="button"
                                                        onClick={() => removeDocument(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                        {(data.photos.length > 0 || data.documents.length > 0) && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                    <p className="text-xs text-blue-700">
                                        Files will be uploaded automatically after the vehicle is created
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sale & Release */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5" />
                            <span>Sale & Release</span>
                        </CardTitle>
                        <CardDescription>Sales/financing breakdown and release checklist</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="release_date">Release Date</Label>
                                <Input
                                    id="release_date"
                                    type="date"
                                    value={data.release_date}
                                    onChange={(e) => setData('release_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment_method">Payment Method</Label>
                                <Select
                                    value={data.payment_method || 'not_set'}
                                    onValueChange={(value) => setData('payment_method', value === 'not_set' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_set">Not set</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_financing">Bank Financing</SelectItem>
                                        <SelectItem value="in_house">In-house</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dealer">Dealer</Label>
                                <Input
                                    id="dealer"
                                    value={data.dealer}
                                    onChange={(e) => setData('dealer', e.target.value)}
                                    placeholder="Dealer name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sales_agent_id">Sales Agent</Label>
                                <Select
                                    value={data.sales_agent_id || 'unassigned'}
                                    onValueChange={(value) => setData('sales_agent_id', value === 'unassigned' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sales agent" />
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
                                <Label htmlFor="assigned_driver_id">Assigned Driver</Label>
                                <Select
                                    value={data.assigned_driver_id || 'unassigned'}
                                    onValueChange={(value) => setData('assigned_driver_id', value === 'unassigned' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select driver" />
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
                                <Label htmlFor="release_approval_user_id">Release Approved By</Label>
                                <Select
                                    value={data.release_approval_user_id || 'unassigned'}
                                    onValueChange={(value) => setData('release_approval_user_id', value === 'unassigned' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select approver" />
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="srp_amount">SRP</Label>
                                <Input
                                    id="srp_amount"
                                    type="number"
                                    value={data.srp_amount}
                                    onChange={(e) => setData('srp_amount', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discount_amount">Discount</Label>
                                <Input
                                    id="discount_amount"
                                    type="number"
                                    value={data.discount_amount}
                                    onChange={(e) => setData('discount_amount', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="net_selling_price">Net Selling Price</Label>
                                <Input
                                    id="net_selling_price"
                                    type="number"
                                    value={data.net_selling_price}
                                    onChange={(e) => setData('net_selling_price', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dp_amount">DP Amount</Label>
                                <Input
                                    id="dp_amount"
                                    type="number"
                                    value={data.dp_amount}
                                    onChange={(e) => setData('dp_amount', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dp_date">DP Date</Label>
                                <Input
                                    id="dp_date"
                                    type="date"
                                    value={data.dp_date}
                                    onChange={(e) => setData('dp_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="balance_financed">Balance Financed</Label>
                                <Input
                                    id="balance_financed"
                                    type="number"
                                    value={data.balance_financed}
                                    onChange={(e) => setData('balance_financed', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="financing_institution">Financing Institution</Label>
                                <Input
                                    id="financing_institution"
                                    value={data.financing_institution}
                                    onChange={(e) => setData('financing_institution', e.target.value)}
                                    placeholder="Bank / Lender"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="financing_terms_months">Term (months)</Label>
                                <Input
                                    id="financing_terms_months"
                                    type="number"
                                    value={data.financing_terms_months}
                                    onChange={(e) => setData('financing_terms_months', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="financing_interest_rate">Interest Rate (%)</Label>
                                <Input
                                    id="financing_interest_rate"
                                    type="number"
                                    value={data.financing_interest_rate}
                                    onChange={(e) => setData('financing_interest_rate', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="financing_monthly_amortization">Monthly Amortization</Label>
                                <Input
                                    id="financing_monthly_amortization"
                                    type="number"
                                    value={data.financing_monthly_amortization}
                                    onChange={(e) => setData('financing_monthly_amortization', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="chattel_mortgage_details">Chattel Mortgage Details</Label>
                                <Textarea
                                    id="chattel_mortgage_details"
                                    value={data.chattel_mortgage_details}
                                    onChange={(e) => setData('chattel_mortgage_details', e.target.value)}
                                    rows={3}
                                    placeholder="Notes on chattel mortgage / in-house terms"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sales_invoice_no">Sales Invoice No</Label>
                                <Input
                                    id="sales_invoice_no"
                                    value={data.sales_invoice_no}
                                    onChange={(e) => setData('sales_invoice_no', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dr_no">DR No</Label>
                                <Input
                                    id="dr_no"
                                    value={data.dr_no}
                                    onChange={(e) => setData('dr_no', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="or_numbers">OR Numbers</Label>
                                <Textarea
                                    id="or_numbers"
                                    value={data.or_numbers}
                                    onChange={(e) => setData('or_numbers', e.target.value)}
                                    rows={2}
                                    placeholder="Comma-separated OR numbers"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="proof_of_payment_refs">Proof of Payment (URLs/refs)</Label>
                                <Textarea
                                    id="proof_of_payment_refs"
                                    value={data.proof_of_payment_refs}
                                    onChange={(e) => setData('proof_of_payment_refs', e.target.value)}
                                    rows={3}
                                    placeholder="Links or references to payment proofs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="release_checklist_status">Release Checklist Status</Label>
                                <Textarea
                                    id="release_checklist_status"
                                    value={data.release_checklist_status}
                                    onChange={(e) => setData('release_checklist_status', e.target.value)}
                                    rows={3}
                                    placeholder="PDI done, accessories installed, insurance active, OR/CR ready..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gps_details">GPS Details</Label>
                                <Textarea
                                    id="gps_details"
                                    value={data.gps_details}
                                    onChange={(e) => setData('gps_details', e.target.value)}
                                    rows={3}
                                    placeholder="GPS device info / serial / activation"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="insurance_details">Insurance Details</Label>
                                <Textarea
                                    id="insurance_details"
                                    value={data.insurance_details}
                                    onChange={(e) => setData('insurance_details', e.target.value)}
                                    rows={3}
                                    placeholder="Policy number, provider, coverage"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="freebies_list">Promo / Freebies Given</Label>
                                <Textarea
                                    id="freebies_list"
                                    value={data.freebies_list}
                                    onChange={(e) => setData('freebies_list', e.target.value)}
                                    rows={3}
                                    placeholder="Tint, matting, wall charger, insurance subsidy, chattel subsidy..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="freebies_total_cost">Freebies Cost</Label>
                                <Input
                                    id="freebies_total_cost"
                                    type="number"
                                    value={data.freebies_total_cost}
                                    onChange={(e) => setData('freebies_total_cost', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="freebies_payer">Who Shoulders</Label>
                                <Select
                                    value={data.freebies_payer || 'not_set'}
                                    onValueChange={(value) => setData('freebies_payer', value === 'not_set' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_set">Not set</SelectItem>
                                        <SelectItem value="hq">HQ</SelectItem>
                                        <SelectItem value="cebu">Cebu</SelectItem>
                                        <SelectItem value="other">Other dealer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="warranty_start_date">Warranty Start</Label>
                                <Input
                                    id="warranty_start_date"
                                    type="date"
                                    value={data.warranty_start_date}
                                    onChange={(e) => setData('warranty_start_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="warranty_end_date">Warranty End</Label>
                                <Input
                                    id="warranty_end_date"
                                    type="date"
                                    value={data.warranty_end_date}
                                    onChange={(e) => setData('warranty_end_date', e.target.value)}
                                />
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
                                    <Label htmlFor="msrp_price">MSRP (₱)</Label>
                                    <Input 
                                        id="msrp_price" 
                                        type="number" 
                                        placeholder="1,250,000"
                                        value={data.msrp_price}
                                        onChange={(e) => setData('msrp_price', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Suggested retail price</p>
                                    {errors.msrp_price && <p className="text-sm text-red-600">{errors.msrp_price}</p>}
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
                                    <Label htmlFor="location">Location</Label>
                                    <Select 
                                        value={data.location} 
                                        onValueChange={(value) => setData('location', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="branch">Branch</SelectItem>
                                            <SelectItem value="warehouse">Warehouse</SelectItem>
                                            <SelectItem value="gbf">GBF</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sub_status">Sub-status</Label>
                                    <Select 
                                        value={data.sub_status || 'none'} 
                                        onValueChange={(value) => setData('sub_status', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select sub-status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="reserved_with_dp">Reserved – with DP</SelectItem>
                                            <SelectItem value="reserved_no_dp">Reserved – no DP</SelectItem>
                                            <SelectItem value="for_lto">For LTO</SelectItem>
                                            <SelectItem value="for_release">For Release</SelectItem>
                                            <SelectItem value="for_body_repair">For Body Repair</SelectItem>
                                            <SelectItem value="inspection">For Inspection</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned_user_id">Assigned Sales Rep</Label>
                                    <Select 
                                        value={data.assigned_user_id || 'unassigned'} 
                                        onValueChange={(value) => setData('assigned_user_id', value === 'unassigned' ? '' : value)}
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

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <Label className="flex items-center space-x-2">
                                            <Lock className="h-4 w-4" />
                                            <span>Lock Unit</span>
                                        </Label>
                                        <p className="text-xs text-muted-foreground">Prevents status changes while reserved/paid</p>
                                    </div>
                                    <Switch 
                                        id="is_locked" 
                                        checked={data.is_locked}
                                        onCheckedChange={(checked) => setData('is_locked', checked)}
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
                                        {processing ? 'Saving Vehicle...' : 'Save Vehicle'}
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
