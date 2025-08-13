import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Search, Filter, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity & Audit',
        href: '/audit',
    },
    {
        title: 'Time Tracking',
        href: '/audit/time-tracking',
    },
];

export default function TimeTracking() {
    // Mock data for demonstration
    const mockSessions = [
        {
            id: 1,
            user: 'John Technician',
            role: 'technician',
            login_time: '2025-01-13 08:00:15',
            logout_time: '2025-01-13 17:30:42',
            session_duration: '9h 30m',
            idle_time: '45m',
            ip_address: '192.168.1.100',
            status: 'completed',
            activities: 12
        },
        {
            id: 2,
            user: 'Sarah Parts Head',
            role: 'parts_head',
            login_time: '2025-01-13 07:45:22',
            logout_time: null,
            session_duration: '3h 45m',
            idle_time: '12m',
            ip_address: '192.168.1.101',
            status: 'active',
            activities: 8
        },
        {
            id: 3,
            user: 'Mike Auditor',
            role: 'auditor',
            login_time: '2025-01-13 09:15:33',
            logout_time: '2025-01-13 11:20:18',
            session_duration: '2h 5m',
            idle_time: '1h 15m',
            ip_address: '192.168.1.102',
            status: 'idle_timeout',
            activities: 3
        },
        {
            id: 4,
            user: 'Lisa Sales Rep',
            role: 'sales_rep',
            login_time: '2025-01-13 08:30:45',
            logout_time: null,
            session_duration: '2h 55m',
            idle_time: '5m',
            ip_address: '192.168.1.103',
            status: 'active',
            activities: 15
        },
        {
            id: 5,
            user: 'Admin User',
            role: 'admin',
            login_time: '2025-01-13 06:00:00',
            logout_time: null,
            session_duration: '5h 30m',
            idle_time: '2m',
            ip_address: '192.168.1.1',
            status: 'active',
            activities: 25
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'idle_timeout':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Idle Timeout
                    </Badge>
                );
            case 'forced_logout':
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Forced Logout
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            'admin': 'bg-red-100 text-red-800',
            'service_manager': 'bg-blue-100 text-blue-800',
            'parts_head': 'bg-purple-100 text-purple-800',
            'sales_rep': 'bg-green-100 text-green-800',
            'technician': 'bg-orange-100 text-orange-800',
            'auditor': 'bg-gray-100 text-gray-800'
        };
        return <Badge variant="outline" className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{role.replace('_', ' ')}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Time Tracking" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Time Tracking</h1>
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
                            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">Currently logged in</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4h 42m</div>
                            <p className="text-xs text-muted-foreground">Today's average</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Idle Timeouts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">Today</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">63</div>
                            <p className="text-xs text-muted-foreground">Actions logged today</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Track login/logout times, session duration, and idle time detection</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by user..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="service_manager">Service Manager</SelectItem>
                                    <SelectItem value="parts_head">Parts Head</SelectItem>
                                    <SelectItem value="sales_rep">Sales Rep</SelectItem>
                                    <SelectItem value="technician">Technician</SelectItem>
                                    <SelectItem value="auditor">Auditor</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="idle_timeout">Idle Timeout</SelectItem>
                                    <SelectItem value="forced_logout">Forced Logout</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Time Tracking Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Session Tracking</CardTitle>
                        <CardDescription>Login/logout tracking with idle-time detection and activity monitoring</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Login Time</TableHead>
                                    <TableHead>Logout Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Idle Time</TableHead>
                                    <TableHead>Activities</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>IP Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockSessions.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell className="font-medium">{session.user}</TableCell>
                                        <TableCell>{getRoleBadge(session.role)}</TableCell>
                                        <TableCell className="font-mono text-sm">{session.login_time}</TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {session.logout_time || <span className="text-muted-foreground">Still active</span>}
                                        </TableCell>
                                        <TableCell className="font-medium">{session.session_duration}</TableCell>
                                        <TableCell className={session.idle_time.includes('1h') ? 'text-orange-600 font-medium' : ''}>
                                            {session.idle_time}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{session.activities}</Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                                        <TableCell className="font-mono text-sm">{session.ip_address}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Idle Time Detection Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Idle Time Detection Settings</CardTitle>
                        <CardDescription>Configure automatic idle detection and timeout policies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Idle Warning (minutes)</label>
                                <Input type="number" defaultValue="15" />
                                <p className="text-xs text-muted-foreground">Show warning after inactivity</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Auto Logout (minutes)</label>
                                <Input type="number" defaultValue="30" />
                                <p className="text-xs text-muted-foreground">Force logout after inactivity</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Grace Period (minutes)</label>
                                <Input type="number" defaultValue="5" />
                                <p className="text-xs text-muted-foreground">Allow re-authentication</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button>Save Settings</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
