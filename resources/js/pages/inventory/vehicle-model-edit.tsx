import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Car, Save, X, AlertCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

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
        title: 'Edit Model',
        href: '#',
    },
];

interface VehicleModel {
    id: number;
    make: string;
    model: string;
    model_code: string | null;
    year: number;
    generation: string | null;
    body_type: string | null;
    doors: number | null;
    seating_capacity: number | null;
    engine_type: string | null;
    engine_displacement: number | null;
    horsepower: number | null;
    torque: number | null;
    transmission: string | null;
    drivetrain: string | null;
    fuel_type: string;
    fuel_tank_capacity: number | null;
    fuel_consumption_city: number | null;
    fuel_consumption_highway: number | null;
    battery_capacity_kwh: number | null;
    electric_range_km: number | null;
    charging_type: string | null;
    charging_time_fast: number | null;
    charging_time_slow: number | null;
    motor_power_kw: number | null;
    base_price: number | null;
    srp: number | null;
    currency: string;
    description: string | null;
    is_active: boolean;
    is_featured: boolean;
    launch_date: string | null;
    notes: string | null;
}

interface Props {
    model: VehicleModel;
}

export default function VehicleModelEdit({ model }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        make: model.make || 'WULING',
        model: model.model || '',
        model_code: model.model_code || '',
        year: model.year || new Date().getFullYear(),
        generation: model.generation || '',
        body_type: model.body_type || '',
        doors: model.doors?.toString() || '',
        seating_capacity: model.seating_capacity?.toString() || '',
        engine_type: model.engine_type || '',
        engine_displacement: model.engine_displacement?.toString() || '',
        horsepower: model.horsepower?.toString() || '',
        torque: model.torque?.toString() || '',
        transmission: model.transmission || '',
        drivetrain: model.drivetrain || '',
        fuel_type: model.fuel_type || 'gasoline',
        fuel_tank_capacity: model.fuel_tank_capacity?.toString() || '',
        fuel_consumption_city: model.fuel_consumption_city?.toString() || '',
        fuel_consumption_highway: model.fuel_consumption_highway?.toString() || '',
        battery_capacity_kwh: model.battery_capacity_kwh?.toString() || '',
        electric_range_km: model.electric_range_km?.toString() || '',
        charging_type: model.charging_type || '',
        charging_time_fast: model.charging_time_fast?.toString() || '',
        charging_time_slow: model.charging_time_slow?.toString() || '',
        motor_power_kw: model.motor_power_kw?.toString() || '',
        base_price: model.base_price?.toString() || '',
        srp: model.srp?.toString() || '',
        currency: model.currency || 'PHP',
        description: model.description || '',
        is_active: model.is_active,
        is_featured: model.is_featured,
        launch_date: model.launch_date || '',
        notes: model.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/inventory/models/${model.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${model.model}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Car className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Edit Vehicle Model</h1>
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
                            Update Model
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
                                <CardDescription>Update the basic model details</CardDescription>
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
                                            className={errors.make ? 'border-red-500' : ''}
                                        />
                                        {errors.make && <p className="text-sm text-red-600">{errors.make}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="model">Model Name *</Label>
                                        <Input 
                                            id="model" 
                                            placeholder="e.g., Alvez, Binguo"
                                            value={data.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                            required
                                            className={errors.model ? 'border-red-500' : ''}
                                        />
                                        {errors.model && <p className="text-sm text-red-600">{errors.model}</p>}
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
                                            className={errors.model_code ? 'border-red-500' : ''}
                                        />
                                        {errors.model_code && <p className="text-sm text-red-600">{errors.model_code}</p>}
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
                                            className={errors.year ? 'border-red-500' : ''}
                                        />
                                        {errors.year && <p className="text-sm text-red-600">{errors.year}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="generation">Generation</Label>
                                        <Input 
                                            id="generation" 
                                            placeholder="e.g., Gen 1"
                                            value={data.generation}
                                            onChange={(e) => setData('generation', e.target.value)}
                                            className={errors.generation ? 'border-red-500' : ''}
                                        />
                                        {errors.generation && <p className="text-sm text-red-600">{errors.generation}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="body_type">Body Type</Label>
                                        <Select value={data.body_type} onValueChange={(value) => setData('body_type', value)}>
                                            <SelectTrigger className={errors.body_type ? 'border-red-500' : ''}>
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
                                        {errors.body_type && <p className="text-sm text-red-600">{errors.body_type}</p>}
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
                                            className={errors.doors ? 'border-red-500' : ''}
                                        />
                                        {errors.doors && <p className="text-sm text-red-600">{errors.doors}</p>}
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
                                            className={errors.seating_capacity ? 'border-red-500' : ''}
                                        />
                                        {errors.seating_capacity && <p className="text-sm text-red-600">{errors.seating_capacity}</p>}
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
                                <CardDescription>Update pricing information</CardDescription>
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
                                        Update Model
                                    </Button>
                                    <Link href="/inventory/models" className="block">
                                        <Button variant="outline" className="w-full">
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
