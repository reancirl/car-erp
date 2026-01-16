import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Package, Save, X, AlertCircle, Info, PhilippinePeso, MapPin, Truck, Wrench } from 'lucide-react';
import { type BreadcrumbItem, type Branch } from '@/types';
import { PART_CATEGORIES, PART_CONDITIONS, PART_STATUSES, type PartCategory, type PartCondition, type PartStatus } from '@/constants/parts';
import { FormEvent } from 'react';

interface Props {
    branches?: Branch[] | null;
    auth: {
        user: {
            roles?: { name: string }[];
            branch_id?: number;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory Management', href: '/inventory' },
    { title: 'Parts Inventory', href: '/inventory/parts-inventory' },
    { title: 'Add Part', href: '/inventory/parts-inventory/create' },
];

export default function PartsInventoryCreate({ branches, auth }: Props) {
    const isAdmin = auth.user.roles?.some(role => role.name === 'admin');
    
    const { data, setData, post, processing, errors } = useForm({
        branch_id: !isAdmin && auth.user.branch_id ? auth.user.branch_id.toString() : '',
        part_name: '',
        description: '',
        category: '' as PartCategory | '',
        subcategory: '',
        manufacturer: '',
        manufacturer_part_number: '',
        oem_part_number: '',
        quantity_on_hand: 0,
        quantity_reserved: 0,
        minimum_stock_level: 0,
        maximum_stock_level: null as number | null,
        reorder_quantity: null as number | null,
        warehouse_location: '',
        aisle: '',
        rack: '',
        bin: '',
        unit_cost: 0,
        selling_price: 0,
        wholesale_price: null as number | null,
        currency: 'PHP',
        weight: null as number | null,
        length: null as number | null,
        width: null as number | null,
        height: null as number | null,
        primary_supplier: '',
        supplier_contact: '',
        supplier_email: '',
        supplier_phone: '',
        lead_time_days: null as number | null,
        condition: 'new' as PartCondition,
        quality_grade: '',
        is_genuine: true as boolean,
        warranty_months: null as number | null,
        warranty_terms: '',
        status: 'active' as PartStatus,
        is_serialized: false as boolean,
        is_hazardous: false as boolean,
        requires_special_handling: false as boolean,
        is_fast_moving: false as boolean,
        notes: '',
        barcode: '',
        sku: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('parts-inventory.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Part" />
            
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {/* Validation Error Banner */}
                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-900">Validation Error</h3>
                                    <p className="text-sm text-red-800 mt-1">
                                        Please correct the following errors before submitting:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field}>
                                                <strong className="capitalize">{field.replace(/_/g, ' ')}</strong>: {message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Add New Part</h1>
                        <p className="text-muted-foreground">Add a new part to inventory</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={route('parts-inventory.index')}>
                            <Button variant="outline" type="button">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Part'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Branch Selection (Admin Only) */}
                        {isAdmin && branches && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Branch Assignment</CardTitle>
                                    <CardDescription>Select which branch this part belongs to (Required)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="branch_id">Branch *</Label>
                                        <Select value={data.branch_id} onValueChange={(value) => setData('branch_id', value)} required>
                                            <SelectTrigger className={errors.branch_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select branch (Required)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches.map((branch) => (
                                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                                        {branch.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.branch_id && <p className="text-sm text-red-600">{errors.branch_id}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Info className="h-5 w-5 mr-2" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>Enter the part details and identification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="part_name">Part Name *</Label>
                                        <Input
                                            id="part_name"
                                            placeholder="Enter part name"
                                            value={data.part_name}
                                            onChange={(e) => setData('part_name', e.target.value)}
                                            className={errors.part_name ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.part_name && <p className="text-sm text-red-600">{errors.part_name}</p>}
                                    </div>
                                    
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Detailed description of the part"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className={errors.description ? 'border-red-500' : ''}
                                            rows={3}
                                        />
                                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select value={data.category} onValueChange={(value) => setData('category', value as PartCategory | '')} required>
                                            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PART_CATEGORIES.map((category) => (
                                                    <SelectItem key={category.value} value={category.value}>
                                                        {category.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="subcategory">Subcategory</Label>
                                        <Input
                                            id="subcategory"
                                            placeholder="e.g., Oil Filter, Spark Plug"
                                            value={data.subcategory}
                                            onChange={(e) => setData('subcategory', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="manufacturer">Manufacturer</Label>
                                        <Input
                                            id="manufacturer"
                                            placeholder="e.g., Toyota, Bosch, Denso"
                                            value={data.manufacturer}
                                            onChange={(e) => setData('manufacturer', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="manufacturer_part_number">Manufacturer Part #</Label>
                                        <Input
                                            id="manufacturer_part_number"
                                            placeholder="Manufacturer's part number"
                                            value={data.manufacturer_part_number}
                                            onChange={(e) => setData('manufacturer_part_number', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inventory Tracking */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Inventory Tracking
                                </CardTitle>
                                <CardDescription>Stock levels and reorder points</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity_on_hand">Quantity on Hand *</Label>
                                        <Input
                                            id="quantity_on_hand"
                                            type="number"
                                            min="0"
                                            value={data.quantity_on_hand}
                                            onChange={(e) => setData('quantity_on_hand', parseInt(e.target.value) || 0)}
                                            className={errors.quantity_on_hand ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.quantity_on_hand && <p className="text-sm text-red-600">{errors.quantity_on_hand}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity_reserved">Quantity Reserved</Label>
                                        <Input
                                            id="quantity_reserved"
                                            type="number"
                                            min="0"
                                            value={data.quantity_reserved}
                                            onChange={(e) => setData('quantity_reserved', parseInt(e.target.value) || 0)}
                                            className={errors.quantity_reserved ? 'border-red-500' : ''}
                                        />
                                        {errors.quantity_reserved && <p className="text-sm text-red-600">{errors.quantity_reserved}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="minimum_stock_level">Minimum Stock Level *</Label>
                                        <Input
                                            id="minimum_stock_level"
                                            type="number"
                                            min="0"
                                            placeholder="10"
                                            value={data.minimum_stock_level}
                                            onChange={(e) => setData('minimum_stock_level', parseInt(e.target.value) || 0)}
                                            className={errors.minimum_stock_level ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.minimum_stock_level && <p className="text-sm text-red-600">{errors.minimum_stock_level}</p>}
                                        <p className="text-xs text-muted-foreground">Alert when stock falls below this level</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="maximum_stock_level">Maximum Stock Level</Label>
                                        <Input
                                            id="maximum_stock_level"
                                            type="number"
                                            min="0"
                                            placeholder="100"
                                            value={data.maximum_stock_level || ''}
                                            onChange={(e) => setData('maximum_stock_level', e.target.value ? parseInt(e.target.value) : null)}
                                            className={errors.maximum_stock_level ? 'border-red-500' : ''}
                                        />
                                        {errors.maximum_stock_level && <p className="text-sm text-red-600">{errors.maximum_stock_level}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
                                        <Input
                                            id="reorder_quantity"
                                            type="number"
                                            min="1"
                                            placeholder="20"
                                            value={data.reorder_quantity || ''}
                                            onChange={(e) => setData('reorder_quantity', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                        <p className="text-xs text-muted-foreground">Suggested reorder quantity</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Warehouse Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Warehouse Location
                                </CardTitle>
                                <CardDescription>Physical storage location</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="warehouse_location">Warehouse</Label>
                                        <Input
                                            id="warehouse_location"
                                            placeholder="e.g., Main, A1"
                                            value={data.warehouse_location}
                                            onChange={(e) => setData('warehouse_location', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="aisle">Aisle</Label>
                                        <Input
                                            id="aisle"
                                            placeholder="e.g., A, B, C"
                                            value={data.aisle}
                                            onChange={(e) => setData('aisle', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="rack">Rack</Label>
                                        <Input
                                            id="rack"
                                            placeholder="e.g., R1, R2"
                                            value={data.rack}
                                            onChange={(e) => setData('rack', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="bin">Bin</Label>
                                        <Input
                                            id="bin"
                                            placeholder="e.g., B1, B2"
                                            value={data.bin}
                                            onChange={(e) => setData('bin', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PhilippinePeso className="h-5 w-5 mr-2" />
                                    Pricing
                                </CardTitle>
                                <CardDescription>Cost and selling prices</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="unit_cost">Unit Cost (PHP) *</Label>
                                        <Input
                                            id="unit_cost"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={data.unit_cost}
                                            onChange={(e) => setData('unit_cost', parseFloat(e.target.value) || 0)}
                                            className={errors.unit_cost ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.unit_cost && <p className="text-sm text-red-600">{errors.unit_cost}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="selling_price">Selling Price (PHP) *</Label>
                                        <Input
                                            id="selling_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={data.selling_price}
                                            onChange={(e) => setData('selling_price', parseFloat(e.target.value) || 0)}
                                            className={errors.selling_price ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.selling_price && <p className="text-sm text-red-600">{errors.selling_price}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="wholesale_price">Wholesale Price (PHP)</Label>
                                        <Input
                                            id="wholesale_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={data.wholesale_price || ''}
                                            onChange={(e) => setData('wholesale_price', e.target.value ? parseFloat(e.target.value) : null)}
                                        />
                                    </div>
                                </div>
                                {data.unit_cost > 0 && data.selling_price > 0 && (
                                    <div className="p-3 bg-blue-50 rounded-md">
                                        <p className="text-sm text-blue-900">
                                            <strong>Markup:</strong> {(((Number(data.selling_price) - Number(data.unit_cost)) / Number(data.unit_cost)) * 100).toFixed(2)}%
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Supplier Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Truck className="h-5 w-5 mr-2" />
                                    Supplier Information
                                </CardTitle>
                                <CardDescription>Primary supplier details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="primary_supplier">Primary Supplier</Label>
                                        <Input
                                            id="primary_supplier"
                                            placeholder="Supplier name"
                                            value={data.primary_supplier}
                                            onChange={(e) => setData('primary_supplier', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="supplier_contact">Contact Person</Label>
                                        <Input
                                            id="supplier_contact"
                                            placeholder="Contact name"
                                            value={data.supplier_contact}
                                            onChange={(e) => setData('supplier_contact', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="supplier_email">Email</Label>
                                        <Input
                                            id="supplier_email"
                                            type="email"
                                            placeholder="supplier@example.com"
                                            value={data.supplier_email}
                                            onChange={(e) => setData('supplier_email', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="supplier_phone">Phone</Label>
                                        <Input
                                            id="supplier_phone"
                                            placeholder="+63 912 345 6789"
                                            value={data.supplier_phone}
                                            onChange={(e) => setData('supplier_phone', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="lead_time_days">Lead Time (days)</Label>
                                        <Input
                                            id="lead_time_days"
                                            type="number"
                                            min="0"
                                            placeholder="7"
                                            value={data.lead_time_days || ''}
                                            onChange={(e) => setData('lead_time_days', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status & Condition */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Status & Condition</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value as PartStatus)} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PART_STATUSES.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="condition">Condition *</Label>
                                    <Select value={data.condition} onValueChange={(value) => setData('condition', value as PartCondition)} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PART_CONDITIONS.map((condition) => (
                                                <SelectItem key={condition.value} value={condition.value}>
                                                    {condition.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="quality_grade">Quality Grade</Label>
                                    <Input
                                        id="quality_grade"
                                        placeholder="e.g., A, B, C"
                                        value={data.quality_grade}
                                        onChange={(e) => setData('quality_grade', e.target.value)}
                                        className={errors.quality_grade ? 'border-red-500' : ''}
                                    />
                                    {errors.quality_grade && <p className="text-sm text-red-600">{errors.quality_grade}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Part Flags */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Part Flags</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_genuine"
                                        checked={data.is_genuine}
                                        onCheckedChange={(checked) => setData('is_genuine', !!checked)}
                                    />
                                    <Label htmlFor="is_genuine" className="text-sm cursor-pointer">Genuine/OEM Part</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_serialized"
                                        checked={data.is_serialized}
                                        onCheckedChange={(checked) => setData('is_serialized', !!checked)}
                                    />
                                    <Label htmlFor="is_serialized" className="text-sm cursor-pointer">Track by Serial Number</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_hazardous"
                                        checked={data.is_hazardous}
                                        onCheckedChange={(checked) => setData('is_hazardous', !!checked)}
                                    />
                                    <Label htmlFor="is_hazardous" className="text-sm cursor-pointer">Hazardous Material</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_fast_moving"
                                        checked={data.is_fast_moving}
                                        onCheckedChange={(checked) => setData('is_fast_moving', !!checked)}
                                    />
                                    <Label htmlFor="is_fast_moving" className="text-sm cursor-pointer">Fast Moving Item</Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Identifiers */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Identifiers</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="barcode">Barcode</Label>
                                    <Input
                                        id="barcode"
                                        placeholder="Scan or enter barcode"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        placeholder="Stock keeping unit"
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional notes or special instructions..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                />
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Part Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <Badge>{data.status || 'active'}</Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Condition</p>
                                    <Badge variant="outline">{data.condition || 'new'}</Badge>
                                </div>
                                {data.category && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Category</p>
                                        <Badge variant="secondary" className="capitalize">{data.category}</Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
