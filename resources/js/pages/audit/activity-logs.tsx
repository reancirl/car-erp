import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Activity, Search, Filter, Download, Eye, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface ActivityLog {
    id: number;
    action: string;
    user: string;
    module: string;
    timestamp: string;
    ip_address: string;
    details: string;
    status: string;
    properties?: Record<string, any>;
    subject_type?: string;
    subject_id?: number;
    subject_deleted?: boolean;
}

interface Stats {
    total_events_today: number;
    events_change: number;
    active_users: number;
    failed_actions: number;
    flagged_events: number;
}

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface Props {
    logs: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    stats: Stats;
    filters?: {
        module?: string;
        status?: string;
        search?: string;
        branch_id?: number;
    };
    branches?: Branch[] | null;
}

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

export default function ActivityLogs({ logs, stats, filters = {}, branches }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedModule, setSelectedModule] = useState(filters.module || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedBranch, setSelectedBranch] = useState(filters.branch_id?.toString() || 'all');
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewLog = (log: ActivityLog) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLog(null);
    };

    const handleRestore = (log: ActivityLog) => {
        if (!log.subject_id || !log.module) return;

        let restoreRoute = '';
        
        // Determine restore route based on module
        switch (log.module) {
            case 'Branch':
                restoreRoute = route('admin.branch-management.restore', log.subject_id);
                break;
            case 'Users':
                restoreRoute = route('admin.user-management.restore', log.subject_id);
                break;
            case 'Sales':
                restoreRoute = route('sales.lead-management.restore', log.subject_id);
                break;
            case 'Customer':
                restoreRoute = route('sales.customer-experience.restore', log.subject_id);
                break;
            case 'Inventory':
                restoreRoute = route('inventory.units.restore', log.subject_id);
                break;
            case 'Parts Inventory':
                restoreRoute = route('parts-inventory.restore', log.subject_id);
                break;
            default:
                return;
        }

        if (confirm('Are you sure you want to restore this record?')) {
            router.post(restoreRoute, {}, {
                onSuccess: () => {
                    handleCloseModal();
                    router.reload();
                },
            });
        }
    };

    const handleFilter = () => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedModule && selectedModule !== 'all') params.module = selectedModule;
        if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
        if (selectedBranch && selectedBranch !== 'all') params.branch_id = selectedBranch;

        router.get(route('audit.activity-logs'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        const params: Record<string, string> = {};
        if (selectedModule && selectedModule !== 'all') params.module = selectedModule;
        if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
        if (selectedBranch && selectedBranch !== 'all') params.branch_id = selectedBranch;
        window.location.href = route('audit.activity-logs.export', params);
    };

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
        const colors: Record<string, string> = {
            'PMS': 'bg-blue-100 text-blue-800',
            'Inventory': 'bg-purple-100 text-purple-800',
            'Warranty': 'bg-orange-100 text-orange-800',
            'Sales': 'bg-green-100 text-green-800',
            'Branch': 'bg-indigo-100 text-indigo-800',
            'Users': 'bg-pink-100 text-pink-800',
            'System': 'bg-gray-100 text-gray-800'
        };
        return <Badge variant="outline" className={colors[module] || 'bg-gray-100 text-gray-800'}>{module}</Badge>;
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
                    <Button variant="outline" size="sm" onClick={handleExport}>
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
                            <div className="text-2xl font-bold">{stats.total_events_today.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.events_change >= 0 ? '+' : ''}{stats.events_change}% from yesterday
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_users}</div>
                            <p className="text-xs text-muted-foreground">Performed actions today</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.failed_actions}</div>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Flagged Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.flagged_events}</div>
                            <p className="text-xs text-muted-foreground">Last 7 days</p>
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
                                    <Input 
                                        placeholder="Search logs..." 
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    />
                                </div>
                            </div>
                            {branches && (
                                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                {branch.name} ({branch.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <Select value={selectedModule} onValueChange={setSelectedModule}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Module" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Modules</SelectItem>
                                    <SelectItem value="Sales">Sales</SelectItem>
                                    <SelectItem value="Branch">Branch</SelectItem>
                                    <SelectItem value="Users">Users</SelectItem>
                                    <SelectItem value="PMS">PMS</SelectItem>
                                    <SelectItem value="Inventory">Inventory</SelectItem>
                                    <SelectItem value="Warranty">Warranty</SelectItem>
                                    <SelectItem value="System">System</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                            <Button variant="outline" onClick={handleFilter}>
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
                                {logs.data.length > 0 ? (
                                    logs.data.map((log) => (
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
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleViewLog(log)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No activity logs found. Start using the system to generate activity logs.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        
                        {/* Pagination */}
                        {logs.data.length > 0 && logs.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((logs.current_page - 1) * logs.per_page) + 1} to{' '}
                                    {Math.min(logs.current_page * logs.per_page, logs.total)} of{' '}
                                    {logs.total} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {logs.links.map((link, index) => {
                                        if (link.label === '&laquo; Previous') {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        if (link.label === 'Next &raquo;') {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                            >
                                                {link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View Log Details Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Activity Log Details</DialogTitle>
                        <DialogDescription>
                            Complete information about this activity log entry
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Log ID</label>
                                    <p className="text-sm font-mono">#{selectedLog.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                                    <p className="text-sm font-mono">{selectedLog.timestamp}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">User</label>
                                    <p className="text-sm font-medium">{selectedLog.user}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                                    <p className="text-sm font-mono">{selectedLog.ip_address}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Module</label>
                                    <div className="mt-1">{getModuleBadge(selectedLog.module)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Action</label>
                                <p className="text-sm">
                                    <code className="bg-muted px-2 py-1 rounded text-sm">{selectedLog.action}</code>
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <p className="text-sm mt-1">{selectedLog.details}</p>
                            </div>

                            {selectedLog.properties && Object.keys(selectedLog.properties).length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Additional Properties</label>
                                    <div className="mt-2 bg-muted p-4 rounded-lg">
                                        <pre className="text-xs overflow-x-auto">
                                            {JSON.stringify(selectedLog.properties, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center gap-2 pt-4 border-t">
                                <div>
                                    {selectedLog.subject_deleted && (
                                        <Button 
                                            variant="default" 
                                            onClick={() => handleRestore(selectedLog)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Restore Record
                                        </Button>
                                    )}
                                </div>
                                <Button variant="outline" onClick={handleCloseModal}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
