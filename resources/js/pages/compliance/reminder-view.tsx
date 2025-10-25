import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Bell, Calendar, CheckCircle, Edit, Mail, MessageSquare, RotateCcw, Trash2 } from 'lucide-react';
import { type BreadcrumbItem, type ComplianceReminder } from '@/types';

interface Props {
    reminder: ComplianceReminder;
    statusOptions: Array<{ value: string; label: string }>;
    priorityOptions: Array<{ value: string; label: string }>;
    typeOptions: Array<{ value: string; label: string }>;
    channelOptions: Array<{ value: string; label: string }>;
    can: {
        edit: boolean;
        delete: boolean;
        restore: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Compliance', href: '/compliance' },
    { title: 'Reminders', href: '/compliance/reminders' },
    { title: 'Reminder Details', href: '#' },
];

const formatDateTime = (value?: string | null): string => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getChannelIcon = (channel: string) => {
    switch (channel) {
        case 'sms':
            return <MessageSquare className="h-4 w-4" />;
        case 'push':
        case 'in_app':
            return <Bell className="h-4 w-4" />;
        default:
            return <Mail className="h-4 w-4" />;
    }
};

const ReminderView = ({ reminder, statusOptions, priorityOptions, typeOptions, channelOptions, can }: Props) => {
    const statusLabel = statusOptions.find((option) => option.value === reminder.status)?.label ?? reminder.status;
    const priorityLabel = priorityOptions.find((option) => option.value === reminder.priority)?.label ?? reminder.priority;
    const typeLabel = typeOptions.find((option) => option.value === reminder.reminder_type)?.label ?? reminder.reminder_type;
    const channelLabel = channelOptions.find((option) => option.value === reminder.delivery_channel)?.label ?? reminder.delivery_channel;

    const handleDelete = () => {
        if (!confirm('Archive this reminder?')) {
            return;
        }
        router.delete(`/compliance/reminders/${reminder.id}`);
    };

    const handleRestore = () => {
        if (!confirm('Restore this reminder?')) {
            return;
        }
        router.post(`/compliance/reminders/${reminder.id}/restore`);
    };

    const statusBadge = () => {
        if (reminder.deleted_at) {
            return <Badge variant="outline">Archived</Badge>;
        }

        switch (reminder.status) {
            case 'sent':
            case 'triggered':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" /> Sent
                    </Badge>
                );
            case 'escalated':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Escalated
                    </Badge>
                );
            default:
                return <Badge variant="outline">{statusLabel}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={reminder.title} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link href="/compliance/reminders" className="text-sm text-muted-foreground inline-flex items-center">
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to list
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold">{reminder.title}</h1>
                        <p className="text-muted-foreground">{reminder.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex gap-2">
                        {reminder.deleted_at ? (
                            can.restore && (
                                <Button variant="outline" onClick={handleRestore}>
                                    <RotateCcw className="mr-2 h-4 w-4" /> Restore
                                </Button>
                            )
                        ) : (
                            <>
                                {can.edit && (
                                    <Link href={`/compliance/reminders/${reminder.id}/edit`}>
                                        <Button variant="outline">
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </Button>
                                    </Link>
                                )}
                                {can.delete && (
                                    <Button variant="destructive" onClick={handleDelete}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Archive
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                            <CardDescription>Live state in the delivery pipeline.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                {statusBadge()}
                                <Badge variant="outline" className="capitalize">{typeLabel}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Priority: <span className="font-medium capitalize">{priorityLabel}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Auto Escalate: <span className="font-medium">{reminder.auto_escalate ? 'Enabled' : 'Disabled'}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule</CardTitle>
                            <CardDescription>Trigger and due timestamps.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Remind At</p>
                                    <p className="font-medium">{formatDateTime(reminder.remind_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Due At</p>
                                    <p className="font-medium">{formatDateTime(reminder.due_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {getChannelIcon(reminder.delivery_channel)}
                                <div>
                                    <p className="text-muted-foreground text-xs">Primary Channel</p>
                                    <p className="font-medium uppercase">{channelLabel}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment</CardTitle>
                            <CardDescription>Who receives and escalates this reminder.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs">Assigned User</p>
                                <p className="font-medium">{reminder.assigned_user?.name || 'Unassigned'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Assigned Role</p>
                                <p className="font-medium">{reminder.assigned_role || '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Branch</p>
                                <p className="font-medium">{reminder.branch?.name || '—'}</p>
                            </div>
                            {reminder.auto_escalate && (
                                <div>
                                    <p className="text-muted-foreground text-xs">Escalates To</p>
                                    <p className="font-medium">
                                        {reminder.escalate_to_user?.name || reminder.escalate_to_role || 'Configured'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Timeline</CardTitle>
                        <CardDescription>Delivery and escalation history.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(!reminder.events || reminder.events.length === 0) && (
                            <p className="text-sm text-muted-foreground">No events recorded yet.</p>
                        )}
                        <div className="space-y-4">
                            {reminder.events?.map((event) => (
                                <div key={event.id} className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <Badge variant="outline" className="capitalize">
                                            {event.event_type}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {event.status} via {event.channel?.toUpperCase() || 'SYSTEM'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{formatDateTime(event.processed_at)}</p>
                                        {event.message && <p className="text-sm">{event.message}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Metadata</CardTitle>
                        <CardDescription>Technical attributes for auditing.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs">Created</p>
                            <p className="font-medium">{formatDateTime(reminder.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Updated</p>
                            <p className="font-medium">{formatDateTime(reminder.updated_at)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Sent Count</p>
                            <p className="font-medium">{reminder.sent_count ?? 0}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Last Triggered</p>
                            <p className="font-medium">{formatDateTime(reminder.last_triggered_at)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Last Sent</p>
                            <p className="font-medium">{formatDateTime(reminder.last_sent_at)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Last Escalated</p>
                            <p className="font-medium">{formatDateTime(reminder.last_escalated_at)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ReminderView;
