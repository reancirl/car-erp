import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Search, Filter, Plus, Eye, Edit, Trash2, RotateCcw, CheckCircle, XCircle, Star, Zap } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState, FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/inventory',
    },
    {
        title: 'Vehicle Models',
        href: '/inventory/models',
    },
];

interface VehicleModel {
    id: number;
    make: string;
    model: string;
    model_code: string | null;
    year: number;
    body_type: string | null;
    transmission: string | null;
    fuel_type: string;
    engine_type: string | null;
    horsepower: number | null;
    base_price: number | null;
    srp: number | null;
    currency: string;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    deleted_at: string | null;
}

interface Stats {
    total: number;
    active: number;
    featured: number;
    electric: number;
}

interface Props {
    records: {
        data: VehicleModel[];
        links: any;
        meta: any;
    };
    stats: Stats;
    filters: {
        search?: string;
        year?: number;
        body_type?: string;
        fuel_type?: string;
        is_active?: boolean;
        include_deleted?: boolean;
    };
}

export default function VehicleModels({ records, stats, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [year, setYear] = useState(filters?.year?.toString() || 'all');
    const [bodyType, setBodyType] = useState(filters?.body_type || 'all');
    const [fuelType, setFuelType] = useState(filters?.fuel_type || 'all');
    const [isActive, setIsActive] = useState(filters?.is_active !== undefined ? filters.is_active.toString() : 'all');
    const [includeDeleted, setIncludeDeleted] = useState(filters?.include_deleted || false);

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get('/inventory/models', {
            search: search || undefined,
            year: year !== 'all' ? year : undefined,
            body_type: bodyType !== 'all' ? bodyType : undefined,
            fuel_type: fuelType !== 'all' ? fuelType : undefined,
            is_active: isActive !== 'all' ? isActive : undefined,
            include_deleted: includeDeleted || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatCurrency = (amount: number | null, currency: string) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: currency || 'PHP',
        }).format(amount);
    };

    const getBodyTypeBadge = (type: string | null) => {
        if (!type) return null;
        const colors: Record<string, string> = {
            sedan: 'bg-blue-100 text-blue-800',
            suv: 'bg-green-100 text-green-800',
            hatchback: 'bg-purple-100 text-purple-800',
            mpv: 'bg-orange-100 text-orange-800',
            van: 'bg-gray-100 text-gray-800',
            pickup: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type.toUpperCase()}</Badge>;
    };

    const getFuelTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            gasoline: 'bg-yellow-100 text-yellow-800',
            diesel: 'bg-gray-100 text-gray-800',
            electric: 'bg-green-100 text-green-800',
            hybrid: 'bg-blue-100 text-blue-800',
            plug_in_hybrid: 'bg-purple-100 text-purple-800',
        };
        return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type.replace('_', ' ').toUpperCase()}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Models" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Car className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Vehicle Models</h1>
                    </div>
                    <Link href="/inventory/models/create">
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Model
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
                            <Car className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Featured</CardTitle>
                            <Star className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.featured}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Electric</CardTitle>
                            <Zap className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.electric}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Filter className="h-5 w-5" />
                            <span>Filters</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Search models..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Select value={year} onValueChange={setYear}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Years</SelectItem>
                                            <SelectItem value="2025">2025</SelectItem>
                                            <SelectItem value="2024">2024</SelectItem>
                                            <SelectItem value="2023">2023</SelectItem>
                                            <SelectItem value="2022">2022</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Select value={bodyType} onValueChange={setBodyType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Body Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="sedan">Sedan</SelectItem>
                                            <SelectItem value="suv">SUV</SelectItem>
                                            <SelectItem value="hatchback">Hatchback</SelectItem>
                                            <SelectItem value="mpv">MPV</SelectItem>
                                            <SelectItem value="van">Van</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Select value={fuelType} onValueChange={setFuelType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Fuel Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Fuel Types</SelectItem>
                                            <SelectItem value="gasoline">Gasoline</SelectItem>
                                            <SelectItem value="diesel">Diesel</SelectItem>
                                            <SelectItem value="electric">Electric</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Select value={isActive} onValueChange={setIsActive}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="true">Active</SelectItem>
                                            <SelectItem value="false">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="include_deleted"
                                        checked={includeDeleted}
                                        onChange={(e) => setIncludeDeleted(e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="include_deleted" className="text-sm">
                                        Include deleted models
                                    </label>
                                </div>
                                <Button type="submit" size="sm">
                                    <Search className="h-4 w-4 mr-2" />
                                    Apply Filters
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Models</CardTitle>
                        <CardDescription>
                            Manage WULING vehicle models and specifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Body Type</TableHead>
                                    <TableHead>Engine</TableHead>
                                    <TableHead>Fuel Type</TableHead>
                                    <TableHead>Pricing</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!records?.data || records.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                            No vehicle models found. Try adjusting your filters or create a new model.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    records.data.map((model) => (
                                        <TableRow 
                                            key={model.id}
                                            className={model.deleted_at ? 'opacity-50' : ''}
                                        >
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-medium">{model.make} {model.model}</div>
                                                    {model.model_code && (
                                                        <div className="text-xs text-muted-foreground">Code: {model.model_code}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{model.year}</TableCell>
                                            <TableCell>{getBodyTypeBadge(model.body_type)}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {model.engine_type && (
                                                        <div className="text-sm">{model.engine_type}</div>
                                                    )}
                                                    {model.horsepower && (
                                                        <div className="text-xs text-muted-foreground">{model.horsepower} HP</div>
                                                    )}
                                                    {model.transmission && (
                                                        <div className="text-xs text-muted-foreground">{model.transmission}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getFuelTypeBadge(model.fuel_type)}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {model.base_price && (
                                                        <div className="text-sm">{formatCurrency(model.base_price, model.currency)}</div>
                                                    )}
                                                    {model.srp && (
                                                        <div className="text-xs text-muted-foreground">SRP: {formatCurrency(model.srp, model.currency)}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    {model.is_active ? (
                                                        <Badge className="bg-green-100 text-green-800 w-fit">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-100 text-gray-800 w-fit">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                    {model.is_featured && (
                                                        <Badge className="bg-yellow-100 text-yellow-800 w-fit">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Featured
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Link href={`/inventory/models/${model.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {model.deleted_at && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => router.post(`/inventory/models/${model.id}/restore`)}
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {records?.meta && records.meta.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {records.meta.from} to {records.meta.to} of {records.meta.total} models
                                </div>
                                <div className="flex space-x-2">
                                    {records.links.map((link: any, index: number) => (
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
