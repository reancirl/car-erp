import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type PageProps } from '@/types';
import { useState, type FormEvent } from 'react';
import { BarChart3, CalendarRange, Clock, Repeat, Shield } from 'lucide-react';

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface PmsCompliance {
    total_due: number;
    completed_on_time: number;
    completed_late: number;
    pending: number;
    compliance_rate: number;
}

interface RepeatRepairItem {
    vehicle_unit_id?: number | null;
    stock_number?: string | null;
    vin?: string | null;
    branch?: string | null;
    count: number;
    last_service_date?: string | null;
    last_issue?: string | null;
    service_types?: string[];
}

interface Props extends PageProps {
    filters: {
        start_date: string;
        end_date: string;
        branch_id?: number | null;
    };
    pmsCompliance: PmsCompliance;
    repeatRepairs: RepeatRepairItem[];
    branches?: Branch[] | null;
}

export default function AftersalesReports({ filters, pmsCompliance, repeatRepairs, branches }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [branchId, setBranchId] = useState(filters.branch_id?.toString() ?? 'all');

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            '/service/aftersales-reports',
            {
                start_date: startDate,
                end_date: endDate,
                branch_id: branchId !== 'all' ? branchId : undefined,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const metricCard = (title: string, value: string | number, description: string, icon: React.ComponentType<any>) => {
        const Icon = icon;
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Operations', href: '/service/pms-work-orders' },
                { title: 'Aftersales Reports', href: '/service/aftersales-reports' },
            ]}
        >
            <Head title="Aftersales Reports" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-6 w-6" />
                            Aftersales Reports
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            PMS compliance and repeat repair insights for quality monitoring.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Adjust date range and branch scope</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <CalendarRange className="h-4 w-4" />
                                    Start Date
                                </label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <CalendarRange className="h-4 w-4" />
                                    End Date
                                </label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            {branches && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Branch</label>
                                    <Select value={branchId} onValueChange={setBranchId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All branches" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All branches</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name} ({branch.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="flex items-end">
                                <Button type="submit" className="w-full md:w-auto">
                                    Apply
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {metricCard('PMS Compliance', `${pmsCompliance.compliance_rate}%`, 'On-time completions / total due', Shield)}
                    {metricCard('Due PMS', pmsCompliance.total_due, 'Total PMS work orders in range', Clock)}
                    {metricCard('On-Time', pmsCompliance.completed_on_time, 'Completed before/at due date', BarChart3)}
                    {metricCard('Late/Overdue', pmsCompliance.completed_late + pmsCompliance.pending, 'Late or still pending', Repeat)}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Repeat Repair Cases</CardTitle>
                        <CardDescription>Units with more than one repair/warranty job in the window</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Count</TableHead>
                                    <TableHead>Last Service</TableHead>
                                    <TableHead>Issue</TableHead>
                                    <TableHead>Service Types</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {repeatRepairs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                            No repeat repair cases found for this period.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {repeatRepairs.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <div className="font-semibold">{item.stock_number ?? '—'}</div>
                                            <div className="text-xs text-muted-foreground">{item.vin ?? '—'}</div>
                                        </TableCell>
                                        <TableCell>{item.branch ?? '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{item.count}</Badge>
                                        </TableCell>
                                        <TableCell>{item.last_service_date ?? '—'}</TableCell>
                                        <TableCell className="max-w-xs">
                                            <span className="line-clamp-2 text-sm">{item.last_issue ?? '—'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {item.service_types?.map((name) => (
                                                    <Badge key={name} variant="outline" className="text-xs">
                                                        {name}
                                                    </Badge>
                                                ))}
                                                {(!item.service_types || item.service_types.length === 0) && (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
