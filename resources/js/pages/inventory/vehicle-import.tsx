import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Eye, FileSpreadsheet, Info, LayoutGrid, Plus, RefreshCw, Search, Upload, X, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';

type RowResult = 'new' | 'updated' | 'warning' | 'skipped';

interface PreviewRow {
    row: string;
    result: RowResult;
    vin: string | null;
    model: string | null;
    details: string;
}

interface Props {
    preview: {
        file_name: string;
        created: number;
        updated: number;
        unchanged: number;
        skipped: number;
        new_models: string[];
        rows: PreviewRow[];
    } | null;
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
        title: 'Import Vehicles',
        href: '/inventory/vehicle-import',
    },
];

const resultConfig = {
    new: { color: 'bg-green-100 text-green-800', icon: Plus, label: 'New' },
    updated: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'Updated' },
    warning: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Warning' },
    skipped: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Skipped' },
};

const getResultBadge = (result: RowResult) => {
    const config = resultConfig[result];
    const IconComponent = config.icon;

    return (
        <Badge className={config.color}>
            <IconComponent className="mr-1 h-3 w-3" />
            {config.label}
        </Badge>
    );
};

export default function VehicleImport({ preview }: Props) {
    const { data, setData, post, processing, errors } = useForm<{ file: File | null }>({ file: null });
    const [search, setSearch] = useState('');
    const [result, setResult] = useState<RowResult | 'all'>('all');
    const [confirming, setConfirming] = useState(false);

    const rows =
        preview?.rows.filter(
            (row) =>
                (result === 'all' || row.result === result) &&
                [row.row, row.vin, row.model, row.details].join(' ').toLowerCase().includes(search.toLowerCase()),
        ) ?? [];
    const pending = preview ? preview.created + preview.updated : 0;

    const handlePreview = (e: FormEvent) => {
        e.preventDefault();
        post('/inventory/vehicle-import/preview');
    };

    const handleConfirm = () => {
        router.post('/inventory/vehicle-import', {}, { onStart: () => setConfirming(true), onFinish: () => setConfirming(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Vehicles" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Upload className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Import Vehicles</h1>
                    </div>
                    <div className="flex space-x-2">
                        {preview ? (
                            <>
                                <Button variant="outline" size="sm" onClick={() => router.delete('/inventory/vehicle-import')} disabled={confirming}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleConfirm} disabled={confirming || pending === 0}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {confirming ? 'Importing Vehicles...' : `Confirm Import (${pending})`}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/inventory/vehicles">
                                    <Button variant="outline" size="sm">
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                </Link>
                                <Button size="sm" onClick={handlePreview} disabled={processing || !data.file}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {processing ? 'Preparing Preview...' : 'Preview Import'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {!preview ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <FileSpreadsheet className="h-5 w-5" />
                                        <span>Inventory Workbook</span>
                                    </CardTitle>
                                    <CardDescription>Upload the .xlsx file. You will review every change before anything is saved.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePreview} className="space-y-2">
                                        <Label htmlFor="file">Workbook File *</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            accept=".xlsx"
                                            onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                            className={errors.file ? 'border-red-500' : ''}
                                        />
                                        {errors.file && <p className="text-sm text-red-600">{errors.file}</p>}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Info className="h-5 w-5" />
                                        <span>How It Works</span>
                                    </CardTitle>
                                    <CardDescription>Existing vehicles are updated, not duplicated</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                                        <li>Vehicles are matched by VIN, or by CS number when the VIN is blank.</li>
                                        <li>Existing vehicles are only filled with cells that have values. Blank cells never erase data.</li>
                                        <li>New VINs are added to your branch.</li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <LayoutGrid className="h-5 w-5" />
                                        <span>Expected Columns</span>
                                    </CardTitle>
                                    <CardDescription>One sheet per model, headers in the first row</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        VEHICLE MODEL, COLOR, CS NUMBER, VIN NUMBER, MOTOR NUMBER, LOCATION, STATUS, DEALERSHIP, CUSTOMER, CODE,
                                        INVOICE NO, INVOICE DATE, SOLD, RESERVED, AVAILABLE
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">New</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{preview.created}</div>
                                    <p className="text-xs text-muted-foreground">Will be added</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Updated</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">{preview.updated}</div>
                                    <p className="text-xs text-muted-foreground">Will be filled in</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Unchanged</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{preview.unchanged}</div>
                                    <p className="text-xs text-muted-foreground">Already up to date</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Skipped</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">{preview.skipped}</div>
                                    <p className="text-xs text-muted-foreground">Will not be imported</p>
                                </CardContent>
                            </Card>
                        </div>

                        {preview.new_models.length > 0 && (
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>{preview.new_models.length} new vehicle model(s) will be created</AlertTitle>
                                <AlertDescription>{preview.new_models.join(', ')}</AlertDescription>
                            </Alert>
                        )}

                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Filter & Search</CardTitle>
                                <CardDescription>Previewing {preview.file_name}. Nothing has been saved yet.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4 md:flex-row">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by VIN, model, sheet or details..."
                                                className="pl-10"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Select value={result} onValueChange={(value) => setResult(value as RowResult | 'all')}>
                                        <SelectTrigger className="w-full md:w-[200px]">
                                            <SelectValue placeholder="Result" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Results</SelectItem>
                                            {(Object.keys(resultConfig) as RowResult[]).map((key) => (
                                                <SelectItem key={key} value={key}>
                                                    {resultConfig[key].label} ({preview.rows.filter((row) => row.result === key).length})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preview Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Import Preview</CardTitle>
                                <CardDescription>
                                    Showing {rows.length} of {preview.rows.length} rows. Unchanged vehicles are not listed.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Sheet / Row</TableHead>
                                            <TableHead>Result</TableHead>
                                            <TableHead>VIN</TableHead>
                                            <TableHead>Model</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                    No rows found. Try adjusting your filters.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            rows.map((row) => (
                                                <TableRow key={row.row}>
                                                    <TableCell className="whitespace-nowrap">{row.row}</TableCell>
                                                    <TableCell>{getResultBadge(row.result)}</TableCell>
                                                    <TableCell className="font-mono text-xs">{row.vin ?? '—'}</TableCell>
                                                    <TableCell>{row.model ?? '—'}</TableCell>
                                                    <TableCell className="whitespace-normal">{row.details}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
