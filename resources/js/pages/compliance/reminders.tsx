import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Search, Filter, Download, Plus, Bell, AlertTriangle, CheckCircle, Calendar, Mail, MessageSquare } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Compliance',
        href: '/compliance',
    },
    {
        title: 'Reminders',
        href: '/compliance/reminders',
    },
];

export default function ComplianceReminders() {
    // Mock data for demonstration
    const mockReminders = [
        {
            id: 1,
            title: 'Daily Service Bay Inspection Due',
            type: 'checklist_due',
            checklist_id: 1,
            assigned_to: 'Sarah Service Manager',
            due_date: '2025-01-13 09:00:00',
            reminder_time: '2025-01-13 08:30:00',
            status: 'sent',
            priority: 'high',
            method: 'email',
            description: 'Daily safety inspection checklist is due in 30 minutes',
            auto_escalate: true
        },
        {
            id: 2,
            title: 'Weekly Parts Inventory Audit Reminder',
            type: 'checklist_reminder',
            checklist_id: 2,
            assigned_to: 'Mike Parts Head',
            due_date: '2025-01-15 17:00:00',
            reminder_time: '2025-01-14 09:00:00',
            status: 'scheduled',
            priority: 'medium',
            method: 'email',
            description: 'Weekly inventory audit due tomorrow at 5 PM',
            auto_escalate: false
        },
        {
            id: 3,
            title: 'Fire Safety Check OVERDUE',
            type: 'overdue_alert',
            checklist_id: 3,
            assigned_to: 'Admin User',
            due_date: '2025-01-10 12:00:00',
            reminder_time: '2025-01-13 09:00:00',
            status: 'escalated',
            priority: 'critical',
            method: 'sms',
            description: 'Monthly fire safety check is 3 days overdue - immediate action required',
            auto_escalate: true,
            escalated_to: 'Senior Manager'
        },
        {
            id: 4,
            title: 'Customer Data Privacy Audit Due Soon',
            type: 'advance_warning',
            checklist_id: 4,
            assigned_to: 'Mike Auditor',
            due_date: '2025-01-31 16:00:00',
            reminder_time: '2025-01-24 09:00:00',
            status: 'scheduled',
            priority: 'high',
            method: 'email',
            description: 'Quarterly data privacy audit due in 1 week',
            auto_escalate: true
        },
        {
            id: 5,
            title: 'Environmental Compliance Check Reminder',
            type: 'checklist_reminder',
            checklist_id: 5,
            assigned_to: 'Sarah Service Manager',
            due_date: '2025-01-25 14:00:00',
            reminder_time: '2025-01-22 09:00:00',
            status: 'scheduled',
            priority: 'medium',
            method: 'email',
            description: 'Monthly environmental compliance check due in 3 days',
            auto_escalate: false
        }
    ];

    const mockReminderSettings = [
        { type: 'Daily Checklists', advance_hours: [1, 4], escalation_hours: 2, enabled: true },
        { type: 'Weekly Checklists', advance_hours: [24, 72], escalation_hours: 12, enabled: true },
        { type: 'Monthly Checklists', advance_hours: [168, 336], escalation_hours: 24, enabled: true },
        { type: 'Quarterly Checklists', advance_hours: [336, 672], escalation_hours: 48, enabled: true }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sent
                    </Badge>
                );
            case 'scheduled':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Calendar className="h-3 w-3 mr-1" />
                        Scheduled
                    </Badge>
                );
            case 'escalated':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Escalated
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="destructive">
                        Failed
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

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'email':
                return <Mail className="h-4 w-4" />;
            case 'sms':
                return <MessageSquare className="h-4 w-4" />;
            case 'push':
                return <Bell className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            'checklist_due': 'Due Soon',
            'checklist_reminder': 'Reminder',
            'overdue_alert': 'Overdue Alert',
            'advance_warning': 'Advance Warning'
        };
        return labels[type as keyof typeof labels] || type;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compliance Reminders" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Compliance Reminders</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Reminder
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5</div>
                            <p className="text-xs text-muted-foreground">Scheduled and sent</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">Successfully delivered</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground text-red-600">Requires attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">98%</div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage automated reminders and soft deadlines for compliance checklists</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search reminders..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="checklist_due">Due Soon</SelectItem>
                                    <SelectItem value="checklist_reminder">Reminder</SelectItem>
                                    <SelectItem value="overdue_alert">Overdue Alert</SelectItem>
                                    <SelectItem value="advance_warning">Advance Warning</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="escalated">Escalated</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
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
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Reminders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Reminders</CardTitle>
                        <CardDescription>Automated reminders with soft deadlines and escalation policies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Reminder Time</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockReminders.map((reminder) => (
                                    <TableRow key={reminder.id}>
                                        <TableCell className="font-medium max-w-xs">
                                            <div>
                                                <div className="font-medium">{reminder.title}</div>
                                                <div className="text-sm text-muted-foreground">{reminder.description}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{getTypeLabel(reminder.type)}</Badge>
                                        </TableCell>
                                        <TableCell>{reminder.assigned_to}</TableCell>
                                        <TableCell className={reminder.status === 'escalated' ? 'text-red-600 font-medium' : ''}>
                                            {new Date(reminder.due_date).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {new Date(reminder.reminder_time).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                {getMethodIcon(reminder.method)}
                                                <span className="text-sm capitalize">{reminder.method}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getPriorityBadge(reminder.priority)}</TableCell>
                                        <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Button variant="ghost" size="sm">
                                                    <Bell className="h-4 w-4" />
                                                </Button>
                                                {reminder.status === 'scheduled' && (
                                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                                        Send Now
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Reminder Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reminder Settings</CardTitle>
                        <CardDescription>Configure automated reminder schedules and escalation policies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Checklist Type</TableHead>
                                    <TableHead>Advance Reminders</TableHead>
                                    <TableHead>Escalation After</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockReminderSettings.map((setting, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{setting.type}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                {setting.advance_hours.map((hours, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {hours < 24 ? `${hours}h` : `${Math.floor(hours/24)}d`}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                                {setting.escalation_hours < 24 ? `${setting.escalation_hours}h` : `${Math.floor(setting.escalation_hours/24)}d`}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={setting.enabled ? "default" : "secondary"} 
                                                   className={setting.enabled ? "bg-green-100 text-green-800" : ""}>
                                                {setting.enabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-4">
                            <Button>Save Settings</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Methods</CardTitle>
                        <CardDescription>Configure how reminders are delivered to users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Mail className="h-5 w-5" />
                                    <h4 className="font-medium">Email Notifications</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">Send reminders via email with detailed information</p>
                                <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <MessageSquare className="h-5 w-5" />
                                    <h4 className="font-medium">SMS Notifications</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">Send urgent reminders via SMS for critical items</p>
                                <Badge variant="outline">Disabled</Badge>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Bell className="h-5 w-5" />
                                    <h4 className="font-medium">Push Notifications</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">Real-time notifications within the application</p>
                                <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
