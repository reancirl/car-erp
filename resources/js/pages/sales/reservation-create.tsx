import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { type PageProps } from '@/types';
import { Calendar, Car, FileText, Layers, User } from 'lucide-react';
import { type FormEvent } from 'react';

interface SimpleBranch {
    id: number;
    name: string;
    code: string;
}

interface SimpleCustomer {
    id: number;
    first_name?: string;
    last_name?: string;
    company_name?: string | null;
    email?: string | null;
    display_name?: string;
    customer_type?: string | null;
}

interface SimpleVehicle {
    id: number;
    vehicle_model?: {
        make: string;
        model: string;
        year: number;
    } | null;
    stock_number: string;
    vin: string;
    branch?: SimpleBranch | null;
}

interface Props extends PageProps {
    customers: SimpleCustomer[];
    vehicles: SimpleVehicle[];
    branches?: SimpleBranch[] | null;
    paymentTypes: string[];
    defaultBranchId?: number | null;
}

export default function ReservationCreate({ customers, vehicles, branches, paymentTypes, defaultBranchId }: Props) {
    const today = new Date().toISOString().slice(0, 10);
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        vehicle_unit_id: '',
        branch_id: defaultBranchId?.toString() ?? '',
        handled_by_branch_id: 'none',
        reservation_date: today,
        payment_type: 'cash',
        target_release_date: '',
        remarks: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/sales/reservations', { preserveScroll: true });
    };

    const selectedVehicle = vehicles.find((v) => v.id.toString() === data.vehicle_unit_id);
    const selectedCustomer = customers.find((c) => c.id.toString() === data.customer_id);

    const renderCustomerName = (customer?: SimpleCustomer) => {
        if (!customer) return '';
        if (customer.display_name) return customer.display_name;
        return `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim();
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Sales & Customer', href: '/sales' }, { title: 'Reservations', href: '/sales/reservations' }, { title: 'Create', href: '#' }]}>
            <Head title="Create Reservation" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Layers className="h-6 w-6" />
                            Create Reservation
                        </h1>
                        <p className="text-sm text-muted-foreground">Link a customer to an inventory unit with allocation details.</p>
                    </div>
                    <Link href="/sales/reservations">
                        <Button variant="outline">Back to Reservations</Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reservation Details</CardTitle>
                                <CardDescription>Capture allocation specifics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Customer
                                        </Label>
                                        <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                                        {renderCustomerName(customer)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.customer_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Car className="h-4 w-4" />
                                            Unit
                                        </Label>
                                        <Select value={data.vehicle_unit_id} onValueChange={(value) => setData('vehicle_unit_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vehicles.map((vehicle) => (
                                                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                                        {vehicle.vehicle_model
                                                            ? `${vehicle.vehicle_model.year} ${vehicle.vehicle_model.make} ${vehicle.vehicle_model.model}`
                                                            : 'Unit'}{' '}
                                                        · {vehicle.stock_number}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.vehicle_unit_id} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Reservation Date
                                        </Label>
                                        <Input
                                            type="date"
                                            value={data.reservation_date}
                                            onChange={(e) => setData('reservation_date', e.target.value)}
                                        />
                                        <InputError message={errors.reservation_date} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Target Release Date</Label>
                                        <Input
                                            type="date"
                                            value={data.target_release_date}
                                            onChange={(e) => setData('target_release_date', e.target.value)}
                                        />
                                        <InputError message={errors.target_release_date} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Payment Type</Label>
                                        <Select value={data.payment_type} onValueChange={(value) => setData('payment_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paymentTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type.replace('_', ' ').toUpperCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.payment_type} />
                                    </div>

                                    {branches && (
                                        <div className="space-y-2">
                                            <Label>Handling Branch / Dealer</Label>
                                            <Select
                                                value={data.handled_by_branch_id || 'none'}
                                                onValueChange={(value) =>
                                                    setData('handled_by_branch_id', value === 'none' ? '' : value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select handling branch" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Not specified</SelectItem>
                                                    {branches.map((branch) => (
                                                        <SelectItem key={branch.id} value={branch.id.toString()}>
                                                            {branch.name} ({branch.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.handled_by_branch_id} />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Remarks
                                    </Label>
                                    <Textarea
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        placeholder='E.g. "waiting bank approval"'
                                        className="min-h-[120px]"
                                    />
                                    <InputError message={errors.remarks} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment</CardTitle>
                                <CardDescription>Branch linkage for reservation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {branches ? (
                                    <div className="space-y-2">
                                        <Label>Reservation Branch</Label>
                                        <Select value={data.branch_id} onValueChange={(value) => setData('branch_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches.map((branch) => (
                                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                                        {branch.name} ({branch.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.branch_id} />
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        Reservation will use your assigned branch.
                                    </div>
                                )}

                                <div className="space-y-3 rounded-md border p-3 bg-muted/30">
                                    <div className="text-sm font-semibold">Quick Preview</div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Customer:</span>{' '}
                                        {renderCustomerName(selectedCustomer) || '—'}
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Unit:</span>{' '}
                                        {selectedVehicle
                                            ? `${selectedVehicle.vehicle_model?.year ?? ''} ${selectedVehicle.vehicle_model?.make ?? ''} ${selectedVehicle.vehicle_model?.model ?? ''} • ${selectedVehicle.stock_number}`
                                            : '—'}
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Reservation Date:</span> {data.reservation_date}
                                    </div>
                                    {selectedVehicle?.branch && (
                                        <div className="text-sm text-muted-foreground">
                                            Unit Branch: {selectedVehicle.branch.name}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-3">
                            <Button type="submit" className="flex-1" disabled={processing}>
                                Save Reservation
                            </Button>
                            <Link href="/sales/reservations" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
