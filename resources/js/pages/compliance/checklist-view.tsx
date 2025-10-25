import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    ClipboardCheck,
    CalendarRange,
    Users,
    Bell,
    AlarmClock,
    CheckCircle,
    AlertTriangle,
    Clock,
    Edit
} from 'lucide-react';
import { type BreadcrumbItem, type ComplianceChecklist } from '@/types';

interface Props {
    checklist: ComplianceChecklist;
    can: {
        edit: boolean;
        delete: boolean;
    };
}

const breadcrumbs = (checklistId: number): BreadcrumbItem[] => [
    {
        title: 'Compliance',
        href: '/compliance',
    },
    {
        title: 'Checklists',
        href: '/compliance/checklists',
    },
    {
        title: 'Checklist Details',
        href: `/compliance/checklists/${checklistId}`,
    },
];

const frequencyLabels: Record<ComplianceChecklist['frequency_type'], string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
    custom: 'Custom',
};

const statusBadge = (status: ComplianceChecklist['status']) => {
    switch (status) {
        case 'active':
            return (
                <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                </Badge>
            );
        case 'inactive':
            return (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Inactive
                </Badge>
            );
        case 'archived':
            return (
                <Badge variant="outline">
                    Archived
                </Badge>
            );
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

const formatDateTime = (value?: string | null): string => {
    if (!value) {
        return 'Not scheduled';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Not scheduled';
    }

    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatDate = (value?: string | null): string => {
    if (!value) {
        return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const dueBadge = (checklist: ComplianceChecklist) => {
    if (!checklist.next_due_at) {
        return (
            <Badge variant="secondary">
                Not scheduled
            </Badge>
        );
    }

    const dueDate = new Date(checklist.next_due_at);
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();

    if (diff < 0) {
        return (
            <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue
            </Badge>
        );
    }

    if (diff <= 24 * 60 * 60 * 1000) {
        return (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
                <Clock className="h-3 w-3 mr-1" />
                Due Soon
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Scheduled
        </Badge>
    );
};

export default function ComplianceChecklistView({ checklist, can }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs(checklist.id)}>
            <Head title={checklist.title} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/compliance/checklists">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Checklists
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <ClipboardCheck className="h-6 w-6" />
                                <h1 className="text-2xl font-bold">{checklist.title}</h1>
                                {statusBadge(checklist.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Reference Code: {checklist.code ?? '—'}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {can.edit && (
                            <Link href={`/compliance/checklists/${checklist.id}/edit`}>
                                <Button>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Checklist
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                            <CardDescription>
                                Key information about cadence, assignments, and scope.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center space-x-1">
                                        <Users className="h-3 w-3" />
                                        <span>Assigned To</span>
                                    </span>
                                    <p className="mt-1 text-sm">
                                        {checklist.assigned_user?.name ?? 'Unassigned'}
                                    </p>
                                    {checklist.assigned_role && (
                                        <p className="text-xs text-muted-foreground">
                                            Role: {checklist.assigned_role}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Branch</span>
                                    <p className="mt-1 text-sm">
                                        {checklist.branch ? `${checklist.branch.name} (${checklist.branch.code})` : '—'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                                        Frequency
                                    </span>
                                    <p className="mt-1 text-sm">
                                        {frequencyLabels[checklist.frequency_type]} &middot; Every {checklist.frequency_interval}{' '}
                                        {checklist.frequency_type === 'custom'
                                            ? checklist.custom_frequency_unit ?? 'unit(s)'
                                            : 'cycle(s)'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center space-x-1">
                                        <CalendarRange className="h-3 w-3" />
                                        <span>Next Due</span>
                                    </span>
                                    <p className="mt-1 text-sm">
                                        {formatDateTime(checklist.next_due_at)}
                                    </p>
                                    <div className="mt-1">
                                        {dueBadge(checklist)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Start Date</span>
                                    <p className="mt-1 text-sm">{formatDate(checklist.start_date)}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center space-x-1">
                                        <AlarmClock className="h-3 w-3" />
                                        <span>Escalation</span>
                                    </span>
                                    <p className="mt-1 text-sm">
                                        {checklist.escalate_to_user
                                            ? checklist.escalate_to_user.name
                                            : 'No escalation user'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        After {checklist.escalation_offset_hours ?? 0} hour(s)
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                                        Recurrence
                                    </span>
                                    <p className="mt-1 text-sm">
                                        {checklist.is_recurring ? 'Recurring' : 'One-time'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Description</span>
                                <p className="mt-1 text-sm leading-relaxed">
                                    {checklist.description || 'No description provided.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reminders & Triggers</CardTitle>
                            <CardDescription>Automation defined for this checklist.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center space-x-1">
                                    <Bell className="h-3 w-3" />
                                    <span>Advance Reminders</span>
                                </span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {checklist.advance_reminder_offsets && checklist.advance_reminder_offsets.length > 0 ? (
                                        checklist.advance_reminder_offsets.map((offset) => (
                                            <Badge key={offset} variant="outline">
                                                {offset} hour(s) before due
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No advance reminders configured.</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Triggers</span>
                                {checklist.triggers && checklist.triggers.length > 0 ? (
                                    <div className="mt-2">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Offset</TableHead>
                                                    <TableHead>Channels</TableHead>
                                                    <TableHead>Escalation</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {checklist.triggers.map((trigger) => (
                                                    <TableRow key={trigger.id ?? `${trigger.trigger_type}-${trigger.offset_hours}`}>
                                                        <TableCell className="capitalize">{trigger.trigger_type}</TableCell>
                                                        <TableCell>{trigger.offset_hours} hour(s)</TableCell>
                                                        <TableCell>
                                                            {trigger.channels && trigger.channels.length > 0
                                                                ? trigger.channels.join(', ')
                                                                : 'Default'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {trigger.escalate_to_user_id
                                                                ? `User #${trigger.escalate_to_user_id}`
                                                                : trigger.escalate_to_role
                                                                    ? `Role: ${trigger.escalate_to_role}`
                                                                    : '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground mt-2">No automation triggers configured.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Checklist Items</CardTitle>
                        <CardDescription>Steps and validations required for completion.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {checklist.items && checklist.items.length > 0 ? (
                            <div className="space-y-4">
                                {checklist.items.map((item, index) => (
                                    <div key={item.id ?? index} className="border rounded-lg p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-semibold">Item {index + 1}:</span>{' '}
                                                <span>{item.title}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline" className={item.is_required ? 'text-red-600 border-red-200' : ''}>
                                                    {item.is_required ? 'Required' : 'Optional'}
                                                </Badge>
                                                <Badge variant="outline" className={item.is_active ? 'text-green-700 border-green-200' : 'text-muted-foreground'}>
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>
                                        {item.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No checklist items defined.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
