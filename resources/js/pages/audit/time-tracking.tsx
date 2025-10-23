import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Search, Filter, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Session {
    id: number;
    user: string;
    user_email: string;
    role: string;
    login_time: string;
    logout_time: string | null;
    session_duration: string;
    idle_time: string;
    ip_address: string;
    status: string;
    activities: number;
    logout_reason?: string;
}

interface TimeTrackingProps {
    sessions: {
        data: Session[];
        pagination: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    stats: {
        active_sessions: number;
        avg_session_time: string;
        idle_timeouts: number;
        total_activities: number;
        forced_logouts: number;
        total_sessions: number;
    };
    settings: {
        idle_warning_minutes: number;
        auto_logout_minutes: number;
        grace_period_minutes: number;
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
        start_date: string;
        end_date: string;
    };
}

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

export default function TimeTracking({ sessions, stats, settings, filters }: TimeTrackingProps) {
    const { data, setData, post, processing, errors } = useForm({
        idle_warning_minutes: settings.idle_warning_minutes,
        auto_logout_minutes: settings.auto_logout_minutes,
        grace_period_minutes: settings.grace_period_minutes,
    });

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('audit.time-tracking.save-settings'));
    };

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
                            <div className="text-2xl font-bold">{stats.active_sessions}</div>
                            <p className="text-xs text-muted-foreground">Currently logged in</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avg_session_time}</div>
                            <p className="text-xs text-muted-foreground">Average duration</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Idle Timeouts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.idle_timeouts}</div>
                            <p className="text-xs text-muted-foreground">In selected period</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_activities}</div>
                            <p className="text-xs text-muted-foreground">Actions logged</p>
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
                                {sessions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                                            No sessions found for the selected period
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sessions.data.map((session) => (
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
                                    ))
                                )}
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
                        <form onSubmit={handleSaveSettings}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Idle Warning (minutes)</label>
                                    <Input 
                                        type="number" 
                                        value={data.idle_warning_minutes}
                                        onChange={(e) => setData('idle_warning_minutes', parseInt(e.target.value))}
                                        min="1"
                                        max="120"
                                        required
                                    />
                                    {errors.idle_warning_minutes && (
                                        <p className="text-xs text-red-600">{errors.idle_warning_minutes}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">Show warning after inactivity</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Auto Logout (minutes)</label>
                                    <Input 
                                        type="number" 
                                        value={data.auto_logout_minutes}
                                        onChange={(e) => setData('auto_logout_minutes', parseInt(e.target.value))}
                                        min="5"
                                        max="240"
                                        required
                                    />
                                    {errors.auto_logout_minutes && (
                                        <p className="text-xs text-red-600">{errors.auto_logout_minutes}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">Force logout after inactivity</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Grace Period (minutes)</label>
                                    <Input 
                                        type="number" 
                                        value={data.grace_period_minutes}
                                        onChange={(e) => setData('grace_period_minutes', parseInt(e.target.value))}
                                        min="1"
                                        max="60"
                                        required
                                    />
                                    {errors.grace_period_minutes && (
                                        <p className="text-xs text-red-600">{errors.grace_period_minutes}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">Allow re-authentication</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
