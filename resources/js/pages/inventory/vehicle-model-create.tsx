import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Car, Save, X, Plus, Minus, AlertCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/inventory',
    },
    {
        title: 'Vehicle Models',
        href: '/inventory/models',
    },
    {
        title: 'Add Model',
        href: '/inventory/models/create',
    },
];

interface Feature {
    title: string;
    value: string;
}

export default function VehicleModelCreate() {
    const [standardFeatures, setStandardFeatures] = useState<Feature[]>([{ title: '', value: '' }]);
    const [optionalFeatures, setOptionalFeatures] = useState<Feature[]>([{ title: '', value: '' }]);
    const [safetyFeatures, setSafetyFeatures] = useState<string[]>(['']);
    const [colors, setColors] = useState<string[]>(['']);

    const { data, setData, post, processing, errors } = useForm({
        make: 'WULING',
        model: '',
        model_code: '',
        year: new Date().getFullYear(),
        generation: '',
        body_type: '',
        doors: '',
        seating_capacity: '',
        engine_type: '',
        engine_displacement: '',
        horsepower: '',
        torque: '',
        transmission: '',
        drivetrain: '',
        fuel_type: 'gasoline',
        fuel_tank_capacity: '',
        fuel_consumption_city: '',
        fuel_consumption_highway: '',
        battery_capacity_kwh: '',
        electric_range_km: '',
        charging_type: '',
        charging_time_fast: '',
        charging_time_slow: '',
        motor_power_kw: '',
        length_mm: '',
        width_mm: '',
        height_mm: '',
        wheelbase_mm: '',
        ground_clearance_mm: '',
        cargo_capacity_liters: '',
        curb_weight_kg: '',
        gross_weight_kg: '',
        base_price: '',
        srp: '',
        currency: 'PHP',
        standard_features: [],
        optional_features: [],
        safety_features: [],
        technology_features: [],
        available_colors: [],
        available_trims: [],
        description: '',
        is_active: true as boolean,
        is_featured: false as boolean,
        launch_date: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Format features
        const formattedData = {
            ...data,
            standard_features: standardFeatures.filter(f => f.title || f.value),
            optional_features: optionalFeatures.filter(f => f.title || f.value),
            safety_features: safetyFeatures.filter(f => f.trim()),
            available_colors: colors.filter(c => c.trim()),
        };

        post('/inventory/models');
    };

    const addFeature = (type: 'standard' | 'optional') => {
        if (type === 'standard') {
            setStandardFeatures([...standardFeatures, { title: '', value: '' }]);
        } else {
            setOptionalFeatures([...optionalFeatures, { title: '', value: '' }]);
        }
    };

    const removeFeature = (type: 'standard' | 'optional', index: number) => {
        if (type === 'standard') {
            setStandardFeatures(standardFeatures.filter((_, i) => i !== index));
        } else {
            setOptionalFeatures(optionalFeatures.filter((_, i) => i !== index));
        }
    };

    const updateFeature = (type: 'standard' | 'optional', index: number, field: 'title' | 'value', value: string) => {
        if (type === 'standard') {
            const updated = [...standardFeatures];
            updated[index][field] = value;
            setStandardFeatures(updated);
        } else {
            const updated = [...optionalFeatures];
            updated[index][field] = value;
            setOptionalFeatures(updated);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Vehicle Model" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Car className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Add Vehicle Model</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/inventory/models">
                            <Button variant="outline" size="sm">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button size="sm" onClick={handleSubmit} disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Model
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
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Enter the basic model details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="make">Make *</Label>
                                        <Input 
                                            id="make" 
                                            value={data.make}
                                            onChange={(e) => setData('make', e.target.value)}
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="model">Model Name *</Label>
                                        <Input 
                                            id="model" 
                                            placeholder="e.g., Alvez, Binguo"
                                            value={data.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="model_code">Model Code</Label>
                                        <Input 
                                            id="model_code" 
                                            placeholder="e.g., ALV-2024"
                                            value={data.model_code}
                                            onChange={(e) => setData('model_code', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Year *</Label>
                                        <Input 
                                            id="year" 
                                            type="number"
                                            min="2020"
                                            max="2050"
                                            value={data.year}
                                            onChange={(e) => setData('year', parseInt(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="generation">Generation</Label>
                                        <Input 
                                            id="generation" 
                                            placeholder="e.g., Gen 1"
                                            value={data.generation}
                                            onChange={(e) => setData('generation', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="body_type">Body Type</Label>
                                        <Select value={data.body_type} onValueChange={(value) => setData('body_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sedan">Sedan</SelectItem>
                                                <SelectItem value="suv">SUV</SelectItem>
                                                <SelectItem value="hatchback">Hatchback</SelectItem>
                                                <SelectItem value="mpv">MPV</SelectItem>
                                                <SelectItem value="van">Van</SelectItem>
                                                <SelectItem value="pickup">Pickup</SelectItem>
                                                <SelectItem value="coupe">Coupe</SelectItem>
                                                <SelectItem value="wagon">Wagon</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="doors">Doors</Label>
                                        <Input 
                                            id="doors" 
                                            type="number"
                                            min="2"
                                            max="6"
                                            placeholder="4"
                                            value={data.doors}
                                            onChange={(e) => setData('doors', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="seating_capacity">Seating</Label>
                                        <Input 
                                            id="seating_capacity" 
                                            type="number"
                                            min="1"
                                            max="20"
                                            placeholder="5"
                                            value={data.seating_capacity}
                                            onChange={(e) => setData('seating_capacity', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Engine & Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Engine & Performance</CardTitle>
                                <CardDescription>Technical specifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="engine_type">Engine Type</Label>
                                        <Input 
                                            id="engine_type" 
                                            placeholder="e.g., 1.5L Turbo"
                                            value={data.engine_type}
                                            onChange={(e) => setData('engine_type', e.target.value)}
                                            className={errors.engine_type ? 'border-red-500' : ''}
                                        />
                                        {errors.engine_type && <p className="text-sm text-red-600">{errors.engine_type}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="engine_displacement">Displacement (L)</Label>
                                        <Input 
                                            id="engine_displacement" 
                                            type="number"
                                            step="0.1"
                                            placeholder="1.5"
                                            value={data.engine_displacement}
                                            onChange={(e) => setData('engine_displacement', e.target.value)}
                                            className={errors.engine_displacement ? 'border-red-500' : ''}
                                        />
                                        {errors.engine_displacement && <p className="text-sm text-red-600">{errors.engine_displacement}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="horsepower">Horsepower (HP)</Label>
                                        <Input 
                                            id="horsepower" 
                                            type="number"
                                            placeholder="150"
                                            value={data.horsepower}
                                            onChange={(e) => setData('horsepower', e.target.value)}
                                            className={errors.horsepower ? 'border-red-500' : ''}
                                        />
                                        {errors.horsepower && <p className="text-sm text-red-600">{errors.horsepower}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="torque">Torque (Nm)</Label>
                                        <Input 
                                            id="torque" 
                                            type="number"
                                            placeholder="250"
                                            value={data.torque}
                                            onChange={(e) => setData('torque', e.target.value)}
                                            className={errors.torque ? 'border-red-500' : ''}
                                        />
                                        {errors.torque && <p className="text-sm text-red-600">{errors.torque}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="transmission">Transmission</Label>
                                        <Select value={data.transmission} onValueChange={(value) => setData('transmission', value)}>
                                            <SelectTrigger className={errors.transmission ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select transmission" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual</SelectItem>
                                                <SelectItem value="automatic">Automatic</SelectItem>
                                                <SelectItem value="cvt">CVT</SelectItem>
                                                <SelectItem value="dct">DCT</SelectItem>
                                                <SelectItem value="amt">AMT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.transmission && <p className="text-sm text-red-600">{errors.transmission}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="drivetrain">Drivetrain</Label>
                                        <Select value={data.drivetrain} onValueChange={(value) => setData('drivetrain', value)}>
                                            <SelectTrigger className={errors.drivetrain ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select drivetrain" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fwd">FWD</SelectItem>
                                                <SelectItem value="rwd">RWD</SelectItem>
                                                <SelectItem value="awd">AWD</SelectItem>
                                                <SelectItem value="4wd">4WD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.drivetrain && <p className="text-sm text-red-600">{errors.drivetrain}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fuel_type">Fuel Type</Label>
                                        <Select value={data.fuel_type} onValueChange={(value) => setData('fuel_type', value)}>
                                            <SelectTrigger className={errors.fuel_type ? 'border-red-500' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gasoline">Gasoline</SelectItem>
                                                <SelectItem value="diesel">Diesel</SelectItem>
                                                <SelectItem value="electric">Electric</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                                <SelectItem value="plug_in_hybrid">Plug-in Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.fuel_type && <p className="text-sm text-red-600">{errors.fuel_type}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fuel_tank_capacity">Fuel Tank (L)</Label>
                                        <Input 
                                            id="fuel_tank_capacity" 
                                            type="number"
                                            step="0.1"
                                            placeholder="50"
                                            value={data.fuel_tank_capacity}
                                            onChange={(e) => setData('fuel_tank_capacity', e.target.value)}
                                            className={errors.fuel_tank_capacity ? 'border-red-500' : ''}
                                        />
                                        {errors.fuel_tank_capacity && <p className="text-sm text-red-600">{errors.fuel_tank_capacity}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                                <CardDescription>Set pricing information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="base_price">Base Price (₱)</Label>
                                        <Input 
                                            id="base_price" 
                                            type="number"
                                            step="0.01"
                                            placeholder="1000000"
                                            value={data.base_price}
                                            onChange={(e) => setData('base_price', e.target.value)}
                                            className={errors.base_price ? 'border-red-500' : ''}
                                        />
                                        {errors.base_price && <p className="text-sm text-red-600">{errors.base_price}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="srp">SRP (₱)</Label>
                                        <Input 
                                            id="srp" 
                                            type="number"
                                            step="0.01"
                                            placeholder="1200000"
                                            value={data.srp}
                                            onChange={(e) => setData('srp', e.target.value)}
                                            className={errors.srp ? 'border-red-500' : ''}
                                        />
                                        {errors.srp && <p className="text-sm text-red-600">{errors.srp}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea 
                                    placeholder="Enter model description..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={5}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="is_active">Active</Label>
                                        <p className="text-xs text-muted-foreground">Available for selection</p>
                                    </div>
                                    <Switch 
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="is_featured">Featured</Label>
                                        <p className="text-xs text-muted-foreground">Highlight this model</p>
                                    </div>
                                    <Switch 
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) => setData('is_featured', checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="launch_date">Launch Date</Label>
                                    <Input 
                                        id="launch_date" 
                                        type="date"
                                        value={data.launch_date}
                                        onChange={(e) => setData('launch_date', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Internal Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea 
                                    placeholder="Add internal notes..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                />
                            </CardContent>
                        </Card>

                        {/* Save Actions */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <Button 
                                        className="w-full" 
                                        onClick={handleSubmit}
                                        disabled={processing}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Model
                                    </Button>
                                    <Link href="/inventory/models" className="block">
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
                </form>
            </div>
        </AppLayout>
    );
}
