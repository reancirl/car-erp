import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Wrench, Car, Users, PieChart as PieChartIcon, BarChart3, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface ChartData {
    pipeline_stages: Array<{ stage: string; count: number; value: number }>;
    revenue_trend: Array<{ month: string; revenue: number; units: number }>;
    service_trend: Array<{ month: string; revenue: number; count: number }>;
    top_sales_reps: Array<{ name: string; units_sold: number; revenue: number }>;
    lead_sources: Array<{ source: string; count: number }>;
}

interface DashboardChartsProps {
    charts: ChartData;
}

const formatCurrency = (value: number) => {
    if (value >= 1000000) {
        return `₱${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `₱${(value / 1000).toFixed(0)}K`;
    }
    return `₱${value.toFixed(0)}`;
};

export function DashboardCharts({ charts }: DashboardChartsProps) {
    // Prepare combined revenue data
    const combinedRevenueData = charts.revenue_trend.map((item, index) => ({
        month: item.month,
        salesRevenue: item.revenue,
        serviceRevenue: charts.service_trend[index]?.revenue || 0,
    }));

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Combined Revenue Trend - Area Chart */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Revenue Trends - Sales vs Service
                    </CardTitle>
                    <CardDescription>Monthly revenue comparison (Last 10 months)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={combinedRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="salesRevenue"
                                stackId="1"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.6}
                                name="Sales Revenue"
                            />
                            <Area
                                type="monotone"
                                dataKey="serviceRevenue"
                                stackId="1"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.6}
                                name="Service Revenue"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Sales Units Trend - Line Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Sales Units Trend
                    </CardTitle>
                    <CardDescription>Monthly vehicle sales volume</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={charts.revenue_trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="units"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                name="Units Sold"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Service Work Orders - Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Service Work Orders
                    </CardTitle>
                    <CardDescription>Monthly work order volume</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={charts.service_trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#10b981" name="Work Orders" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top Sales Reps - Horizontal Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Top Sales Representatives
                    </CardTitle>
                    <CardDescription>By units sold</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={charts.top_sales_reps} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="units_sold" fill="#3b82f6" name="Units Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Lead Sources - Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5" />
                        Lead Sources Distribution
                    </CardTitle>
                    <CardDescription>Where leads come from</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={charts.lead_sources}
                                dataKey="count"
                                nameKey="source"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {charts.lead_sources.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Pipeline Funnel */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Sales Pipeline
                    </CardTitle>
                    <CardDescription>Current pipeline stages</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {charts.pipeline_stages.map((stage, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{stage.stage}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{stage.count}</Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatCurrency(stage.value)}
                                        </span>
                                    </div>
                                </div>
                                <Progress
                                    value={(stage.count / charts.pipeline_stages[0]?.count) * 100 || 0}
                                    className="h-2"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <Link
                            href="/sales/pipeline"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            View detailed pipeline
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
