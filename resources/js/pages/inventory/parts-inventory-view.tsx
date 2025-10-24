import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Edit, Trash2, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { type BreadcrumbItem, type PartInventory } from '@/types';

interface Props {
    part: PartInventory;
    can_edit: boolean;
    can_delete: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory Management', href: '/inventory' },
    { title: 'Parts Inventory', href: '/inventory/parts-inventory' },
    { title: 'View Part', href: '#' },
];

export default function PartsInventoryView({ part, can_edit, can_delete }: Props) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this part?')) {
            router.delete(route('parts-inventory.destroy', part.id));
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { icon: any; className: string }> = {
            active: { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
            inactive: { icon: XCircle, className: 'bg-gray-100 text-gray-800' },
            discontinued: { icon: AlertTriangle, className: 'bg-red-100 text-red-800' },
            out_of_stock: { icon: AlertTriangle, className: 'bg-red-100 text-red-800' },
            on_order: { icon: CheckCircle, className: 'bg-blue-100 text-blue-800' },
        };
        const badge = badges[status] || badges.active;
        const Icon = badge.icon;
        return (
            <Badge className={badge.className}>
                <Icon className="h-3 w-3 mr-1" />
                {status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
        );
    };

    const getStockBadge = () => {
        if (part.quantity_on_hand <= 0) {
            return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Out of Stock</Badge>;
        } else if (part.quantity_on_hand <= part.minimum_stock_level) {
            return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Low Stock</Badge>;
        }
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />In Stock</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Part: ${part.part_number}`} />
            
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Package className="h-6 w-6" />
                        <div>
                            <h1 className="text-2xl font-bold">{part.part_name}</h1>
                            <p className="text-sm text-muted-foreground font-mono">{part.part_number}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={route('parts-inventory.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        {can_edit && (
                            <Link href={route('parts-inventory.edit', part.id)}>
                                <Button>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {can_delete && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Part Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Part Number</p>
                                        <p className="font-mono">{part.part_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                                        <p className="capitalize">{part.category}</p>
                                    </div>
                                    {part.subcategory && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Subcategory</p>
                                            <p>{part.subcategory}</p>
                                        </div>
                                    )}
                                    {part.manufacturer && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                                            <p>{part.manufacturer}</p>
                                        </div>
                                    )}
                                    {part.manufacturer_part_number && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Manufacturer Part #</p>
                                            <p>{part.manufacturer_part_number}</p>
                                        </div>
                                    )}
                                    {part.oem_part_number && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">OEM Part #</p>
                                            <p>{part.oem_part_number}</p>
                                        </div>
                                    )}
                                </div>
                                {part.description && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                                        <p className="text-sm">{part.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">On Hand</p>
                                        <p className="text-2xl font-bold">{part.quantity_on_hand}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Reserved</p>
                                        <p className="text-2xl font-bold">{part.quantity_reserved}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Available</p>
                                        <p className="text-2xl font-bold text-green-600">{part.quantity_on_hand - part.quantity_reserved}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Min Level</p>
                                        <p>{part.minimum_stock_level}</p>
                                    </div>
                                    {part.maximum_stock_level && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Max Level</p>
                                            <p>{part.maximum_stock_level}</p>
                                        </div>
                                    )}
                                    {part.reorder_quantity && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Reorder Qty</p>
                                            <p>{part.reorder_quantity}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Unit Cost</p>
                                        <p className="text-lg font-semibold">{part.currency} {Number(part.unit_cost).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Selling Price</p>
                                        <p className="text-lg font-semibold text-green-600">{part.currency} {Number(part.selling_price).toFixed(2)}</p>
                                    </div>
                                    {part.wholesale_price && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Wholesale Price</p>
                                            <p className="text-lg font-semibold">{part.currency} {Number(part.wholesale_price).toFixed(2)}</p>
                                        </div>
                                    )}
                                    {part.markup_percentage && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Markup</p>
                                            <p className="text-lg font-semibold text-blue-600">+{Number(part.markup_percentage).toFixed(1)}%</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {part.primary_supplier && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Supplier</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Supplier Name</p>
                                            <p>{part.primary_supplier}</p>
                                        </div>
                                        {part.supplier_contact && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                                                <p>{part.supplier_contact}</p>
                                            </div>
                                        )}
                                        {part.supplier_email && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                                <p>{part.supplier_email}</p>
                                            </div>
                                        )}
                                        {part.supplier_phone && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                                <p>{part.supplier_phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Part Status</p>
                                    {getStatusBadge(part.status)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Stock Status</p>
                                    {getStockBadge()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Condition</p>
                                    <Badge variant="outline" className="capitalize">{part.condition}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {part.warehouse_location && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Location</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
                                        <p>{part.warehouse_location}</p>
                                    </div>
                                    {part.aisle && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Aisle</p>
                                            <p>{part.aisle}</p>
                                        </div>
                                    )}
                                    {part.rack && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Rack</p>
                                            <p>{part.rack}</p>
                                        </div>
                                    )}
                                    {part.bin && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Bin</p>
                                            <p>{part.bin}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Flags</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {part.is_genuine && <Badge variant="outline">Genuine/OEM</Badge>}
                                {part.is_serialized && <Badge variant="outline">Serialized</Badge>}
                                {part.is_hazardous && <Badge variant="destructive">Hazardous</Badge>}
                                {part.is_fast_moving && <Badge className="bg-blue-100 text-blue-800">Fast Moving</Badge>}
                            </CardContent>
                        </Card>

                        {(part.barcode || part.sku) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Identifiers</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {part.barcode && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Barcode</p>
                                            <p className="font-mono">{part.barcode}</p>
                                        </div>
                                    )}
                                    {part.sku && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">SKU</p>
                                            <p className="font-mono">{part.sku}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {part.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{part.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
