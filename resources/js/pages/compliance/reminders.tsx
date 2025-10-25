import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    AlertTriangle,
    Bell,
    Calendar,
    CheckCircle,
    Edit,
    Eye,
    Filter,
    Mail,
    MessageSquare,
    Plus,
    RefreshCcw,
    RotateCcw,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { type Branch, type BreadcrumbItem, type ComplianceReminder, type PaginatedResponse, type User } from '@/types';

interface ReminderStats {
    total: number;
    due_today: number;
    triggered: number;
    escalated: number;
    overdue: number;
}

interface ReminderFilters {
    search?: string;
    status?: string;
    priority?: string;
    reminder_type?: string;
    delivery_channel?: string;
    assigned_user_id?: string;
    branch_id?: string;
    remind_from?: string;
    remind_to?: string;
    include_deleted?: boolean;
}

interface CapabilityMap {
    create: boolean;
    edit: boolean;
    delete: boolean;
    restore: boolean;
}

interface Option {
    value: string;
    label: string;
}

interface Props {
    reminders: PaginatedResponse<ComplianceReminder>;
    stats: ReminderStats;
    filters: ReminderFilters;
    statusOptions: Option[];
    priorityOptions: Option[];
    typeOptions: Option[];
    channelFilterOptions: Option[];
    assignedUsers: Array<Pick<User, 'id' | 'name'>>;
    branches?: Branch[] | null;
    can: CapabilityMap;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Compliance', href: '/compliance' },
    { title: 'Reminders', href: '/compliance/reminders' },
];

const reminderTypeLabels: Record<string, string> = {
    manual: 'Manual',
    checklist_due: 'Checklist Due',
    checklist_overdue: 'Checklist Overdue',
    follow_up: 'Follow-up',
    escalation: 'Escalation',
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

const priorityBadgeClasses: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-emerald-100 text-emerald-800',
};

const ReminderIndex = ({
    reminders,
    stats,
    filters,
    statusOptions,
    priorityOptions,
    typeOptions,
    channelFilterOptions,
    assignedUsers,
    branches,
    can,
}: Props) => {
    const [filterState, setFilterState] = useState<ReminderFilters>({
        search: filters.search ?? '',
        status: filters.status ?? 'all',
        priority: filters.priority ?? 'all',
        reminder_type: filters.reminder_type ?? 'all',
        delivery_channel: filters.delivery_channel ?? 'all',
        assigned_user_id: filters.assigned_user_id ?? 'all',
        branch_id: filters.branch_id ?? 'all',
        remind_from: filters.remind_from ?? '',
        remind_to: filters.remind_to ?? '',
        include_deleted: Boolean(filters.include_deleted),
    });
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [restoringId, setRestoringId] = useState<number | null>(null);

    useEffect(() => {
        setFilterState({
            search: filters.search ?? '',
            status: filters.status ?? 'all',
            priority: filters.priority ?? 'all',
            reminder_type: filters.reminder_type ?? 'all',
            delivery_channel: filters.delivery_channel ?? 'all',
            assigned_user_id: filters.assigned_user_id ?? 'all',
            branch_id: filters.branch_id ?? 'all',
            remind_from: filters.remind_from ?? '',
            remind_to: filters.remind_to ?? '',
            include_deleted: Boolean(filters.include_deleted),
        });
    }, [filters]);

    const handleFilterChange = (key: keyof ReminderFilters, value: string | boolean) => {
        setFilterState((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const applyFilters = () => {
        router.get('/compliance/reminders', filterState, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (event: FormEvent) => {
        event.preventDefault();
        applyFilters();
    };

    const resetFilters = () => {
        router.get('/compliance/reminders', {}, { replace: true });
    };

    const handleDelete = (reminder: ComplianceReminder) => {
        if (!confirm(`Archive reminder "${reminder.title}"?`)) {
            return;
        }
        setDeletingId(reminder.id);
        router.delete(`/compliance/reminders/${reminder.id}`, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const handleRestore = (reminder: ComplianceReminder) => {
        if (!confirm(`Restore reminder "${reminder.title}"?`)) {
            return;
        }
        setRestoringId(reminder.id);
        router.post(`/compliance/reminders/${reminder.id}/restore`, {}, {
            preserveScroll: true,
            onFinish: () => setRestoringId(null),
        });
    };

    const getStatusBadge = (reminder: ComplianceReminder) => {
        if (reminder.deleted_at) {
            return (
                <Badge variant="outline" className="bg-slate-100 text-slate-600">
                    Archived
                </Badge>
            );
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
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'cancelled':
                return (
                    <Badge variant="secondary" className="bg-slate-200 text-slate-800">
                        Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Scheduled
                    </Badge>
                );
        }
    };

    const statsCards = [
        { label: 'Total Reminders', value: stats.total, accent: 'border-primary/40' },
        { label: 'Due Today', value: stats.due_today, accent: 'border-orange-300' },
        { label: 'Triggered', value: stats.triggered, accent: 'border-emerald-300' },
        { label: 'Escalated', value: stats.escalated, accent: 'border-red-300' },
        { label: 'Overdue', value: stats.overdue, accent: 'border-yellow-300' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compliance Reminders" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Compliance Reminders</h1>
                        <p className="text-muted-foreground">Track automated alerts tied to compliance checklists.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.reload({ only: ['reminders', 'stats'] })}>
                            <RefreshCcw className="h-4 w-4 mr-1" />
                            Refresh
                        </Button>
                        {can.create && (
                            <Link href="/compliance/reminders/create">
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-1" />
                                    New Reminder
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {statsCards.map((card) => (
                        <Card key={card.label} className={`border ${card.accent}`}>
                            <CardHeader className="pb-2">
                                <CardDescription>{card.label}</CardDescription>
                                <CardTitle className="text-3xl">{card.value}</CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <CardTitle>Filters</CardTitle>
                        </div>
                        <CardDescription>Combine filters to zero in on specific reminders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4 md:grid-cols-4" onSubmit={handleSearchSubmit}>
                            <div className="md:col-span-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        value={filterState.search}
                                        onChange={(event) => handleFilterChange('search', event.target.value)}
                                        placeholder="Title, description, assignment"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select value={filterState.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Priority</Label>
                                <Select value={filterState.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All priorities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Reminder Type</Label>
                                <Select value={filterState.reminder_type} onValueChange={(value) => handleFilterChange('reminder_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Channel</Label>
                                <Select value={filterState.delivery_channel} onValueChange={(value) => handleFilterChange('delivery_channel', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All channels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {channelFilterOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Assigned User</Label>
                                <Select value={filterState.assigned_user_id} onValueChange={(value) => handleFilterChange('assigned_user_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All users" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All users</SelectItem>
                                        {assignedUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {branches && (
                                <div>
                                    <Label>Branch</Label>
                                    <Select value={filterState.branch_id} onValueChange={(value) => handleFilterChange('branch_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All branches" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All branches</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <Label>Remind From</Label>
                                <Input
                                    type="date"
                                    value={filterState.remind_from}
                                    onChange={(event) => handleFilterChange('remind_from', event.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Remind To</Label>
                                <Input
                                    type="date"
                                    value={filterState.remind_to}
                                    onChange={(event) => handleFilterChange('remind_to', event.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="include_deleted"
                                    checked={Boolean(filterState.include_deleted)}
                                    onCheckedChange={(checked) => handleFilterChange('include_deleted', Boolean(checked))}
                                />
                                <Label htmlFor="include_deleted">Include archived</Label>
                            </div>
                            <div className="flex items-end gap-2 md:col-span-4">
                                <Button type="submit" className="w-full md:w-auto">
                                    Apply Filters
                                </Button>
                                <Button type="button" variant="outline" onClick={resetFilters}>
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Reminder Queue</CardTitle>
                        <CardDescription>Upcoming and recently triggered reminders.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reminder</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Assignment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reminders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No reminders match the current filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reminders.data.map((reminder) => (
                                        <TableRow key={reminder.id} className={reminder.deleted_at ? 'opacity-70' : ''}>
                                            <TableCell>
                                                <div className="font-medium flex items-center gap-2">
                                                    {reminder.title}
                                                    {reminder.auto_escalate && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Auto Escalate
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <Badge variant="secondary" className="capitalize">
                                                        {reminderTypeLabels[reminder.reminder_type] ?? reminder.reminder_type}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={priorityBadgeClasses[reminder.priority] ?? 'bg-slate-100 text-slate-800'}
                                                    >
                                                        Priority: {reminder.priority}
                                                    </Badge>
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        {getChannelIcon(reminder.delivery_channel)}
                                                        {reminder.delivery_channel.toUpperCase()}
                                                    </span>
                                                </div>
                                                {reminder.description && (
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {reminder.description}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{formatDateTime(reminder.remind_at)}</div>
                                                {reminder.due_at && (
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> Due {formatDateTime(reminder.due_at)}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">
                                                    {reminder.assigned_user?.name || reminder.assigned_role || 'Unassigned'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {reminder.branch?.name || 'No branch'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {getStatusBadge(reminder)}
                                                    {reminder.last_sent_at && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Sent {formatDateTime(reminder.last_sent_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Link href={`/compliance/reminders/${reminder.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {can.edit && !reminder.deleted_at && (
                                                        <Link href={`/compliance/reminders/${reminder.id}/edit`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {reminder.deleted_at ? (
                                                        can.restore && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRestore(reminder)}
                                                                disabled={restoringId === reminder.id}
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        )
                                                    ) : (
                                                        can.delete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                                onClick={() => handleDelete(reminder)}
                                                                disabled={deletingId === reminder.id}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {reminders.last_page > 1 && (
                            <div className="flex flex-col gap-2 pt-4 md:flex-row md:items-center md:justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {reminders.from} to {reminders.to} of {reminders.total} results
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {reminders.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url, {}, { preserveScroll: true });
                                                }
                                            }}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ReminderIndex;
