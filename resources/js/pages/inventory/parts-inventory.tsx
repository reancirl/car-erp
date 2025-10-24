import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Package, Search, Plus, Eye, Edit, Trash2, RotateCcw, AlertTriangle, CheckCircle, XCircle, TrendingDown, DollarSign } from 'lucide-react';
import { type BreadcrumbItem, type PartInventory, type Branch, type PaginatedResponse } from '@/types';
import { PART_CATEGORIES } from '@/constants/parts';

interface Props {
    parts: PaginatedResponse<PartInventory>;
    stats: {
        total_parts: number;
        in_stock: number;
        low_stock: number;
        out_of_stock: number;
        total_inventory_value: number;
    };
    filters: {
        search?: string;
        category?: string;
        status?: string;
        condition?: string;
        stock_status?: string;
        branch_id?: number;
        include_deleted?: boolean;
    };
    branches?: Branch[] | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory Management', href: '/inventory' },
    { title: 'Parts Inventory', href: '/inventory/parts-inventory' },
];

export default function PartsInventory({ parts, stats, filters, branches }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            '/inventory/parts-inventory',
            { ...filters, search: value },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (key: string, value: string | boolean) => {
        // Convert 'all' to empty string for backend
        const filterValue = value === 'all' ? '' : value;
        router.get(
            '/inventory/parts-inventory',
            { ...filters, [key]: filterValue },
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id: number) => {
        router.delete(route('parts-inventory.destroy', id), {
            onSuccess: () => setDeleteId(null),
        });
    };

    const handleRestore = (id: number) => {
        router.post(route('parts-inventory.restore', id));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                    </Badge>
                );
            case 'discontinued':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Discontinued
                    </Badge>
                );
            case 'out_of_stock':
                return (
                    <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Out of Stock
                    </Badge>
                );
            case 'on_order':
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        On Order
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getStockStatusBadge = (part: PartInventory) => {
        if (part.quantity_on_hand <= 0) {
            return (
                <Badge className="bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Out of Stock
                </Badge>
            );
        } else if (part.quantity_on_hand <= part.minimum_stock_level) {
            return (
                <Badge className="bg-yellow-100 text-yellow-800">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Low Stock
                </Badge>
            );
        } else {
            return (
                <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    In Stock
                </Badge>
            );
        }
    };

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            engine: 'bg-blue-100 text-blue-800',
            transmission: 'bg-purple-100 text-purple-800',
            electrical: 'bg-yellow-100 text-yellow-800',
            body: 'bg-gray-100 text-gray-800',
            suspension: 'bg-orange-100 text-orange-800',
            brakes: 'bg-red-100 text-red-800',
            interior: 'bg-pink-100 text-pink-800',
            exterior: 'bg-indigo-100 text-indigo-800',
            accessories: 'bg-green-100 text-green-800',
            fluids: 'bg-cyan-100 text-cyan-800',
            filters: 'bg-teal-100 text-teal-800',
        };
        return (
            <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parts Inventory" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Package className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Parts Inventory</h1>
                    </div>
                    <Link href={route('parts-inventory.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Part
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_parts}</div>
                            <p className="text-xs text-muted-foreground">Active inventory items</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.in_stock}</div>
                            <p className="text-xs text-muted-foreground">Available parts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.low_stock}</div>
                            <p className="text-xs text-muted-foreground">Below minimum levels</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.out_of_stock}</div>
                            <p className="text-xs text-muted-foreground">Immediate reorder required</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Search and filter parts inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search by part name, number, manufacturer..." 
                                            className="pl-10"
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value)}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {PART_CATEGORIES.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="discontinued">Discontinued</SelectItem>
                                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                        <SelectItem value="on_order">On Order</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.stock_status || 'all'} onValueChange={(value) => handleFilterChange('stock_status', value)}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Stock Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        <SelectItem value="in_stock">In Stock</SelectItem>
                                        <SelectItem value="low_stock">Low Stock</SelectItem>
                                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                                {branches && (
                                    <Select value={filters.branch_id?.toString() || 'all'} onValueChange={(value) => handleFilterChange('branch_id', value)}>
                                        <SelectTrigger className="w-full md:w-[180px]">
                                            <SelectValue placeholder="Branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Branches</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="include_deleted" 
                                    checked={filters.include_deleted || false}
                                    onCheckedChange={(checked) => handleFilterChange('include_deleted', checked as boolean)}
                                />
                                <Label htmlFor="include_deleted" className="text-sm font-normal">
                                    Include deleted parts
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Parts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Parts Inventory</CardTitle>
                        <CardDescription>
                            Showing {parts.from || 0} to {parts.to || 0} of {parts.total} parts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {parts.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No parts found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Get started by adding your first part to inventory.
                                </p>
                                <Link href={route('parts-inventory.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Part
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Part Details</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Stock Level</TableHead>
                                            <TableHead>Pricing</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parts.data.map((part) => (
                                            <TableRow key={part.id} className={part.deleted_at ? 'bg-gray-50' : ''}>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <div className="font-medium">{part.part_name}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{part.part_number}</div>
                                                        {part.manufacturer && (
                                                            <div className="text-xs text-muted-foreground">{part.manufacturer}</div>
                                                        )}
                                                        {part.deleted_at && (
                                                            <Badge variant="destructive" className="text-xs mt-1">Deleted</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getCategoryBadge(part.category)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className="font-medium">{part.quantity_on_hand}</span>
                                                            {getStockStatusBadge(part)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Min: {part.minimum_stock_level}
                                                            {part.maximum_stock_level && ` | Max: ${part.maximum_stock_level}`}
                                                        </div>
                                                        {part.quantity_reserved > 0 && (
                                                            <div className="text-xs text-orange-600">
                                                                Reserved: {part.quantity_reserved}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="text-sm">Cost: {part.currency} {Number(part.unit_cost).toFixed(2)}</div>
                                                        <div className="text-sm font-medium">Sell: {part.currency} {Number(part.selling_price).toFixed(2)}</div>
                                                        {part.markup_percentage && (
                                                            <div className="text-xs text-green-600">+{Number(part.markup_percentage).toFixed(1)}%</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {part.warehouse_location ? (
                                                        <Badge variant="outline" className="font-mono">{part.warehouse_location}</Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Not set</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(part.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-1">
                                                        {part.deleted_at ? (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => handleRestore(part.id)}
                                                                title="Restore"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                <Link href={route('parts-inventory.show', part.id)}>
                                                                    <Button variant="ghost" size="sm" title="View">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Link href={route('parts-inventory.edit', part.id)}>
                                                                    <Button variant="ghost" size="sm" title="Edit">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => setDeleteId(part.id)}
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {parts.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Page {parts.current_page} of {parts.last_page}
                                        </div>
                                        <div className="flex space-x-2">
                                            {parts.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                {deleteId && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Confirm Deletion</CardTitle>
                                <CardDescription>
                                    Are you sure you want to delete this part? This action can be undone by restoring the part later.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setDeleteId(null)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDelete(deleteId)}>
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
