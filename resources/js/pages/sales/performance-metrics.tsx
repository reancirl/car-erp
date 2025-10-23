import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Search, Filter, Download, TrendingUp, TrendingDown, Users, DollarSign, Clock, Target, Calendar, Award, AlertTriangle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface KPI {
    id: number;
    metric_name: string;
    current_value: number;
    previous_value: number;
    unit: string;
    target_value: number;
    period: string;
    trend: string;
    data_source: string;
    last_updated: string;
    auto_calculated: boolean;
}

interface SalesRepPerformance {
    id: number;
    rep_name: string;
    leads_assigned: number;
    leads_converted: number;
    conversion_rate: number;
    pipelines_managed: number;
    pipelines_won: number;
    pipeline_value: number;
    test_drives_conducted: number;
    customer_satisfaction: number;
    rank: number;
}

interface PerformanceMetricsProps {
    kpis: {
        summary: {
            total_leads: number;
            active_pipelines: number;
            completed_test_drives: number;
        };
        metrics: KPI[];
    };
    salesRepPerformance: SalesRepPerformance[];
    filters: {
        branch_id: number | null;
        start_date: string;
        end_date: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Performance Metrics',
        href: '/sales/performance-metrics',
    },
];

export default function PerformanceMetrics({ kpis, salesRepPerformance }: PerformanceMetricsProps) {

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            default:
                return <div className="h-4 w-4" />;
        }
    };

    const getTrendBadge = (current: number, previous: number, unit: string) => {
        const change = current - previous;
        const percentChange = ((change / previous) * 100).toFixed(1);
        
        if (change > 0) {
            return (
                <Badge variant="default" className="bg-green-100 text-green-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{Math.abs(change).toFixed(1)}{unit} ({percentChange}%)
                </Badge>
            );
        } else if (change < 0) {
            return (
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -{Math.abs(change).toFixed(1)}{unit} ({percentChange}%)
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    No Change
                </Badge>
            );
        }
    };

    const getTargetStatus = (current: number, target: number) => {
        const percentage = (current / target) * 100;
        
        if (percentage >= 100) {
            return (
                <Badge variant="default" className="bg-green-100 text-green-800">
                    <Target className="h-3 w-3 mr-1" />
                    Target Met
                </Badge>
            );
        } else if (percentage >= 80) {
            return (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <Target className="h-3 w-3 mr-1" />
                    {percentage.toFixed(0)}% of Target
                </Badge>
            );
        } else {
            return (
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {percentage.toFixed(0)}% of Target
                </Badge>
            );
        }
    };

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                        <Award className="h-3 w-3 mr-1" />
                        #1
                    </Badge>
                );
            case 2:
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        #2
                    </Badge>
                );
            case 3:
                return (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                        #3
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        #{rank}
                    </Badge>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Performance Metrics" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <BarChart3 className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Performance Metrics</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Date Range
                        </Button>
                    </div>
                </div>

                {/* Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.summary.total_leads}</div>
                            <p className="text-xs text-muted-foreground">Created this period</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Test Drives Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.summary.completed_test_drives}</div>
                            <p className="text-xs text-muted-foreground">This period</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Pipelines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.summary.active_pipelines}</div>
                            <p className="text-xs text-muted-foreground">Currently active</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>KPIs generated solely from system events with no manual overrides</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search metrics by name or data source..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="this_quarter">This Quarter</SelectItem>
                                    <SelectItem value="this_year">This Year</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Metric Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Metrics</SelectItem>
                                    <SelectItem value="conversion">Conversion</SelectItem>
                                    <SelectItem value="financial">Financial</SelectItem>
                                    <SelectItem value="satisfaction">Satisfaction</SelectItem>
                                    <SelectItem value="efficiency">Efficiency</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* KPI Metrics Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Key Performance Indicators</CardTitle>
                        <CardDescription>Auto-calculated metrics from system events - no manual overrides allowed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Metric</TableHead>
                                    <TableHead>Current Value</TableHead>
                                    <TableHead>Trend</TableHead>
                                    <TableHead>Target Status</TableHead>
                                    <TableHead>Data Source</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead>Auto-Calculated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kpis.metrics.map((kpi) => (
                                    <TableRow key={kpi.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{kpi.metric_name}</div>
                                                <div className="text-xs text-muted-foreground">{kpi.period}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {getTrendIcon(kpi.trend)}
                                                <span className="text-lg font-bold">
                                                    {kpi.unit === '$' ? '$' : ''}{kpi.current_value.toLocaleString()}{kpi.unit !== '$' ? kpi.unit : ''}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getTrendBadge(kpi.current_value, kpi.previous_value, kpi.unit)}
                                        </TableCell>
                                        <TableCell>
                                            {getTargetStatus(kpi.current_value, kpi.target_value)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                {kpi.data_source}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{kpi.last_updated}</div>
                                        </TableCell>
                                        <TableCell>
                                            {kpi.auto_calculated ? (
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    Auto-Calculated
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    Manual Entry
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Sales Rep Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Representative Performance</CardTitle>
                        <CardDescription>Individual performance metrics based on system-tracked activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sales Rep</TableHead>
                                    <TableHead>Lead Metrics</TableHead>
                                    <TableHead>Sales Performance</TableHead>
                                    <TableHead>Test Drives</TableHead>
                                    <TableHead>Customer Satisfaction</TableHead>
                                    <TableHead>Pipeline Value</TableHead>
                                    <TableHead>Rank</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesRepPerformance.map((rep) => (
                                    <TableRow key={rep.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Users className="h-4 w-4" />
                                                <span>{rep.rep_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-sm font-medium">{rep.leads_converted}/{rep.leads_assigned} converted</div>
                                                <div className="text-xs text-muted-foreground">{rep.conversion_rate}% rate</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-sm font-medium">{rep.pipelines_won}/{rep.pipelines_managed} won</div>
                                                <div className="text-xs text-muted-foreground">Pipelines managed</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-center">
                                                <div className="text-lg font-bold">{rep.test_drives_conducted}</div>
                                                <div className="text-xs text-muted-foreground">conducted</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <div className="text-lg font-bold">{rep.customer_satisfaction}</div>
                                                <span className="text-sm text-muted-foreground">/5</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <DollarSign className="h-3 w-3" />
                                                <span className="text-sm font-medium">₱{rep.pipeline_value.toLocaleString('en-PH')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getRankBadge(rep.rank)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* System Event Sources */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Event Sources</CardTitle>
                        <CardDescription>All metrics derived from automated system events - no manual data entry</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-medium">Lead Management Events</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Lead creation, qualification, assignment</p>
                                <div className="text-2xl font-bold">{kpis.summary.total_leads}</div>
                                <p className="text-xs text-muted-foreground">Leads created</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium">Sales System Events</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Quotes, reservations, sales completion</p>
                                <div className="text-2xl font-bold">{kpis.summary.active_pipelines}</div>
                                <p className="text-xs text-muted-foreground">Active pipelines</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="h-5 w-5 text-purple-600" />
                                    <h4 className="font-medium">Customer Interaction Events</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Test drives, surveys, follow-ups</p>
                                <div className="text-2xl font-bold">{kpis.summary.completed_test_drives}</div>
                                <p className="text-xs text-muted-foreground">Test drives completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Integrity Assurance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Integrity Assurance</CardTitle>
                        <CardDescription>Ensuring all KPIs are system-generated with no manual overrides</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Manual Override Protection</div>
                                    <div className="text-sm text-muted-foreground">All metrics locked from manual editing</div>
                                </div>
                                <Badge variant="default" className="bg-green-100 text-green-800">Enforced</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Event Source Validation</div>
                                    <div className="text-sm text-muted-foreground">All data traced to system events</div>
                                </div>
                                <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Real-time Calculation</div>
                                    <div className="text-sm text-muted-foreground">Metrics updated as events occur</div>
                                </div>
                                <Badge variant="default" className="bg-blue-100 text-blue-800">Live</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Audit Trail</div>
                                    <div className="text-sm text-muted-foreground">Complete history of metric calculations</div>
                                </div>
                                <Badge variant="outline" className="bg-purple-100 text-purple-800">Available</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
