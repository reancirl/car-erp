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

export default function PerformanceMetrics() {
    // Mock data for demonstration
    const mockKPIs = [
        {
            id: 1,
            metric_name: 'Lead Conversion Rate',
            current_value: 23.5,
            previous_value: 21.2,
            unit: '%',
            target_value: 25.0,
            period: 'This Month',
            trend: 'up',
            data_source: 'Lead Management System',
            last_updated: '2025-01-13 18:00:00',
            auto_calculated: true,
            manual_override: false
        },
        {
            id: 2,
            metric_name: 'Average Deal Size',
            current_value: 28750,
            previous_value: 27200,
            unit: '$',
            target_value: 30000,
            period: 'This Month',
            trend: 'up',
            data_source: 'Sales System',
            last_updated: '2025-01-13 17:45:00',
            auto_calculated: true,
            manual_override: false
        },
        {
            id: 3,
            metric_name: 'Test Drive to Sale Rate',
            current_value: 42.8,
            previous_value: 45.1,
            unit: '%',
            target_value: 50.0,
            period: 'This Month',
            trend: 'down',
            data_source: 'Test Drive System',
            last_updated: '2025-01-13 16:30:00',
            auto_calculated: true,
            manual_override: false
        },
        {
            id: 4,
            metric_name: 'Customer Satisfaction',
            current_value: 4.5,
            previous_value: 4.3,
            unit: '/5',
            target_value: 4.7,
            period: 'This Month',
            trend: 'up',
            data_source: 'Survey System',
            last_updated: '2025-01-13 19:15:00',
            auto_calculated: true,
            manual_override: false
        },
        {
            id: 5,
            metric_name: 'Sales Cycle Length',
            current_value: 12.3,
            previous_value: 14.1,
            unit: 'days',
            target_value: 10.0,
            period: 'This Month',
            trend: 'up',
            data_source: 'Pipeline System',
            last_updated: '2025-01-13 18:30:00',
            auto_calculated: true,
            manual_override: false
        },
        {
            id: 6,
            metric_name: 'Follow-up Response Rate',
            current_value: 67.2,
            previous_value: 71.8,
            unit: '%',
            target_value: 75.0,
            period: 'This Month',
            trend: 'down',
            data_source: 'CRM System',
            last_updated: '2025-01-13 17:00:00',
            auto_calculated: true,
            manual_override: false
        }
    ];

    const mockSalesRepPerformance = [
        {
            id: 1,
            rep_name: 'Sarah Sales Rep',
            leads_assigned: 15,
            leads_converted: 4,
            conversion_rate: 26.7,
            total_sales_value: 115000,
            avg_deal_size: 28750,
            test_drives_conducted: 8,
            customer_satisfaction: 4.8,
            pipeline_value: 87500,
            rank: 1
        },
        {
            id: 2,
            rep_name: 'Mike Sales Rep',
            leads_assigned: 12,
            leads_converted: 3,
            conversion_rate: 25.0,
            total_sales_value: 82500,
            avg_deal_size: 27500,
            test_drives_conducted: 6,
            customer_satisfaction: 4.4,
            pipeline_value: 65000,
            rank: 2
        },
        {
            id: 3,
            rep_name: 'Tom Sales Rep',
            leads_assigned: 18,
            leads_converted: 3,
            conversion_rate: 16.7,
            total_sales_value: 63600,
            avg_deal_size: 21200,
            test_drives_conducted: 9,
            customer_satisfaction: 4.2,
            pipeline_value: 95000,
            rank: 3
        },
        {
            id: 4,
            rep_name: 'Lisa Sales Rep',
            leads_assigned: 8,
            leads_converted: 1,
            conversion_rate: 12.5,
            total_sales_value: 45000,
            avg_deal_size: 45000,
            test_drives_conducted: 3,
            customer_satisfaction: 4.6,
            pipeline_value: 32000,
            rank: 4
        }
    ];

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
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
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
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$306,100</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">11</div>
                            <p className="text-xs text-muted-foreground">Vehicles delivered</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Pipeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$279,500</div>
                            <p className="text-xs text-muted-foreground">Potential revenue</p>
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
                                {mockKPIs.map((kpi) => (
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
                                {mockSalesRepPerformance.map((rep) => (
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
                                                <div className="flex items-center space-x-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    <span className="text-sm font-medium">${rep.total_sales_value.toLocaleString()}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">Avg: ${rep.avg_deal_size.toLocaleString()}</div>
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
                                                <span className="text-sm font-medium">${rep.pipeline_value.toLocaleString()}</span>
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
                                <div className="text-2xl font-bold">127</div>
                                <p className="text-xs text-muted-foreground">Events this month</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium">Sales System Events</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Quotes, reservations, sales completion</p>
                                <div className="text-2xl font-bold">89</div>
                                <p className="text-xs text-muted-foreground">Events this month</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="h-5 w-5 text-purple-600" />
                                    <h4 className="font-medium">Customer Interaction Events</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Test drives, surveys, follow-ups</p>
                                <div className="text-2xl font-bold">156</div>
                                <p className="text-xs text-muted-foreground">Events this month</p>
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
