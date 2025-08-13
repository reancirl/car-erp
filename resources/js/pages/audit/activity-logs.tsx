import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Search, Filter, Download, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity & Audit',
        href: '/audit',
    },
    {
        title: 'Activity Logs',
        href: '/audit/activity-logs',
    },
];

export default function ActivityLogs() {
    // Mock data for demonstration
    const mockLogs = [
        {
            id: 1,
            action: 'pms.create',
            user: 'John Technician',
            module: 'PMS',
            timestamp: '2025-01-13 10:30:15',
            ip_address: '192.168.1.100',
            details: 'Created work order #WO-2025-001 for Vehicle VIN: ABC123',
            status: 'success'
        },
        {
            id: 2,
            action: 'inventory.approve',
            user: 'Sarah Parts Head',
            module: 'Inventory',
            timestamp: '2025-01-13 10:25:42',
            ip_address: '192.168.1.101',
            details: 'Approved parts withdrawal for brake pads (Qty: 4)',
            status: 'success'
        },
        {
            id: 3,
            action: 'warranty.audit',
            user: 'Mike Auditor',
            module: 'Warranty',
            timestamp: '2025-01-13 10:20:18',
            ip_address: '192.168.1.102',
            details: 'Flagged warranty claim #WC-2025-015 for high value review',
            status: 'flagged'
        },
        {
            id: 4,
            action: 'sales.test_drive',
            user: 'Lisa Sales Rep',
            module: 'Sales',
            timestamp: '2025-01-13 10:15:33',
            ip_address: '192.168.1.103',
            details: 'Test drive completed for Customer ID: C-2025-089',
            status: 'success'
        },
        {
            id: 5,
            action: 'system.backup',
            user: 'Admin User',
            module: 'System',
            timestamp: '2025-01-13 09:00:00',
            ip_address: '192.168.1.1',
            details: 'Automated daily backup completed successfully',
            status: 'success'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
            case 'flagged':
                return <Badge variant="destructive">Flagged</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getModuleBadge = (module: string) => {
        const colors = {
            'PMS': 'bg-blue-100 text-blue-800',
            'Inventory': 'bg-purple-100 text-purple-800',
            'Warranty': 'bg-orange-100 text-orange-800',
            'Sales': 'bg-green-100 text-green-800',
            'System': 'bg-gray-100 text-gray-800'
        };
        return <Badge variant="outline" className={colors[module as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{module}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Activity Logs</h1>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Logs
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Events Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,247</div>
                            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">23</div>
                            <p className="text-xs text-muted-foreground">Currently logged in</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Flagged Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">7</div>
                            <p className="text-xs text-muted-foreground">Pending review</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Search through activity logs and filter by module, user, or action</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search logs..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Module" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Modules</SelectItem>
                                    <SelectItem value="pms">PMS</SelectItem>
                                    <SelectItem value="inventory">Inventory</SelectItem>
                                    <SelectItem value="warranty">Warranty</SelectItem>
                                    <SelectItem value="sales">Sales</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="flagged">Flagged</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Immutable event store showing all system actions with user, timestamp, and module information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Module</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                                        <TableCell className="font-medium">{log.user}</TableCell>
                                        <TableCell>
                                            <code className="bg-muted px-2 py-1 rounded text-sm">{log.action}</code>
                                        </TableCell>
                                        <TableCell>{getModuleBadge(log.module)}</TableCell>
                                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                                        <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                                        <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
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
