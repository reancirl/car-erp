import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Search, Filter, Download, Clock, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity & Audit',
        href: '/audit',
    },
    {
        title: 'Supervisor Approvals',
        href: '/audit/supervisor-approvals',
    },
];

export default function SupervisorApprovals() {
    // Mock data for demonstration
    const mockApprovals = [
        {
            id: 1,
            request_type: 'Post-submission Edit',
            original_action: 'pms.edit',
            user: 'John Technician',
            supervisor: 'Sarah Service Manager',
            module: 'PMS',
            record_id: 'WO-2025-001',
            requested_at: '2025-01-13 10:30:15',
            reason: 'Need to update mileage reading - customer provided incorrect information',
            status: 'pending',
            priority: 'medium',
            changes_requested: 'Update odometer reading from 45,000 to 47,500 km'
        },
        {
            id: 2,
            request_type: 'Inventory Override',
            original_action: 'inventory.issue',
            user: 'Mike Parts Clerk',
            supervisor: 'Sarah Parts Head',
            module: 'Inventory',
            record_id: 'INV-2025-089',
            requested_at: '2025-01-13 09:45:22',
            reason: 'Emergency part needed for breakdown service',
            status: 'approved',
            priority: 'high',
            changes_requested: 'Issue brake pads without standard approval workflow',
            approved_at: '2025-01-13 09:50:15',
            approved_by: 'Sarah Parts Head'
        },
        {
            id: 3,
            request_type: 'Warranty Exception',
            original_action: 'warranty.approve',
            user: 'Lisa Sales Rep',
            supervisor: 'Mike Auditor',
            module: 'Warranty',
            record_id: 'WC-2025-045',
            requested_at: '2025-01-13 08:20:33',
            reason: 'Customer goodwill - extend warranty coverage by 1 month',
            status: 'rejected',
            priority: 'low',
            changes_requested: 'Approve warranty claim outside normal coverage period',
            rejected_at: '2025-01-13 08:45:18',
            rejected_by: 'Mike Auditor',
            rejection_reason: 'Insufficient justification for warranty extension'
        },
        {
            id: 4,
            request_type: 'Financial Override',
            original_action: 'sales.discount',
            user: 'Tom Sales Rep',
            supervisor: 'Lisa Sales Manager',
            module: 'Sales',
            record_id: 'SALE-2025-123',
            requested_at: '2025-01-13 11:15:45',
            reason: 'Fleet customer requesting additional 5% discount',
            status: 'pending',
            priority: 'high',
            changes_requested: 'Apply 15% total discount instead of standard 10%'
        },
        {
            id: 5,
            request_type: 'System Override',
            original_action: 'system.backup_restore',
            user: 'Admin User',
            supervisor: 'Senior Admin',
            module: 'System',
            record_id: 'SYS-2025-007',
            requested_at: '2025-01-13 07:30:00',
            reason: 'Restore accidentally deleted customer records',
            status: 'approved',
            priority: 'critical',
            changes_requested: 'Restore customer database from backup dated 2025-01-12',
            approved_at: '2025-01-13 07:35:22',
            approved_by: 'Senior Admin'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'critical':
                return <Badge variant="destructive">Critical</Badge>;
            case 'high':
                return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
            case 'medium':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const getModuleBadge = (module: string) => {
        const colors = {
            'PMS': 'bg-blue-100 text-blue-800',
            'Inventory': 'bg-purple-100 text-purple-800',
            'Warranty': 'bg-orange-100 text-orange-800',
            'Sales': 'bg-green-100 text-green-800',
            'System': 'bg-red-100 text-red-800'
        };
        return <Badge variant="outline" className={colors[module as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{module}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supervisor Approvals" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <UserCheck className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Supervisor Approvals</h1>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2</div>
                            <p className="text-xs text-muted-foreground">Awaiting supervisor review</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2</div>
                            <p className="text-xs text-muted-foreground">Processed successfully</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">15m</div>
                            <p className="text-xs text-muted-foreground">Average approval time</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage supervisor approval requests for post-submission edits and system overrides</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by user, record ID, or reason..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
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
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Approvals Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Approval Requests</CardTitle>
                        <CardDescription>Post-submission edit requests and system overrides requiring supervisor approval</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request Type</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Module</TableHead>
                                    <TableHead>Record ID</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Requested</TableHead>
                                    <TableHead>Supervisor</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockApprovals.map((approval) => (
                                    <TableRow key={approval.id}>
                                        <TableCell className="font-medium">{approval.request_type}</TableCell>
                                        <TableCell>{approval.user}</TableCell>
                                        <TableCell>{getModuleBadge(approval.module)}</TableCell>
                                        <TableCell>
                                            <code className="bg-muted px-2 py-1 rounded text-sm">{approval.record_id}</code>
                                        </TableCell>
                                        <TableCell>{getPriorityBadge(approval.priority)}</TableCell>
                                        <TableCell>{getStatusBadge(approval.status)}</TableCell>
                                        <TableCell className="font-mono text-sm">{approval.requested_at}</TableCell>
                                        <TableCell>{approval.supervisor}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {approval.status === 'pending' && (
                                                    <>
                                                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Approval Details Modal would go here */}
                {/* For now, showing a placeholder card for the approval workflow */}
                <Card>
                    <CardHeader>
                        <CardTitle>Approval Workflow Settings</CardTitle>
                        <CardDescription>Configure automatic approval rules and escalation policies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-medium">Auto-Approval Rules</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Minor edits (&lt; 24 hours)</span>
                                        <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Low-value inventory (&lt; $100)</span>
                                        <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Standard warranty extensions</span>
                                        <Badge variant="outline">Disabled</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-medium">Escalation Settings</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Critical requests (immediate)</span>
                                        <Badge variant="destructive">5 minutes</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">High priority requests</span>
                                        <Badge variant="default" className="bg-orange-100 text-orange-800">30 minutes</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Standard requests</span>
                                        <Badge variant="outline">2 hours</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Button>Update Settings</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
