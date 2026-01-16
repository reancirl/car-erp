import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ClipboardCheck,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    RotateCcw,
    CheckCircle,
    AlertTriangle,
    Clock,
    Bell,
    Users,
    Building2
} from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import {
    type Branch,
    type BreadcrumbItem,
    type ComplianceChecklist,
    type PaginatedResponse,
    type User
} from '@/types';

interface Option {
    value: string;
    label: string;
}

interface ChecklistStats {
    total: number;
    due_this_week: number;
    overdue: number;
    inactive: number;
}

interface ChecklistFilters {
    search?: string;
    status?: string;
    frequency_type?: string;
    assigned_user_id?: string;
    branch_id?: string;
    due_from?: string;
    due_to?: string;
    include_deleted?: boolean;
}

interface CapabilityMap {
    create: boolean;
    edit: boolean;
    delete: boolean;
    restore: boolean;
}

interface Props {
    checklists: PaginatedResponse<ComplianceChecklist>;
    stats: ChecklistStats;
    filters: ChecklistFilters;
    frequencyOptions: Option[];
    statusOptions: Option[];
    assignedUsers: Array<Pick<User, 'id' | 'name'> & { branch_id?: number | null }>;
    branches?: Branch[] | null;
    can: CapabilityMap;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Compliance',
        href: '/compliance',
    },
    {
        title: 'Checklists',
        href: '/compliance/checklists',
    },
];

const categoryBadges: Record<string, { label: string; className: string }> = {
    safety: { label: 'Safety & Facilities', className: 'bg-red-100 text-red-800' },
    inventory: { label: 'Inventory & Warehouse', className: 'bg-purple-100 text-purple-800' },
    environmental: { label: 'Environmental', className: 'bg-green-100 text-green-800' },
    data_protection: { label: 'Data Protection', className: 'bg-blue-100 text-blue-800' },
    quality: { label: 'Quality Assurance', className: 'bg-orange-100 text-orange-800' },
    custom: { label: 'Custom', className: 'bg-slate-100 text-slate-800' },
};

const formatDateTime = (value?: string | null): string => {
    if (!value) {
        return 'No schedule';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'No schedule';
    }

    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getStatusBadge = (status: ComplianceChecklist['status']) => {
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
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Inactive
                </Badge>
            );
        case 'archived':
            return (
                <Badge variant="outline" className="bg-slate-100 text-slate-800">
                    Archived
                </Badge>
            );
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

const getFrequencyBadge = (frequency: ComplianceChecklist['frequency_type']) => {
    const labels: Record<ComplianceChecklist['frequency_type'], string> = {
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        yearly: 'Yearly',
        custom: 'Custom',
    };

    return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {labels[frequency] ?? frequency}
        </Badge>
    );
};

const getCategoryBadge = (category?: string | null) => {
    if (!category) {
        return <Badge variant="outline">Uncategorized</Badge>;
    }

    const badge = categoryBadges[category];
    if (!badge) {
        return (
            <Badge variant="outline" className="bg-slate-100 text-slate-800">
                {category}
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className={badge.className}>
            {badge.label}
        </Badge>
    );
};

const getDueBadge = (checklist: ComplianceChecklist) => {
    const { next_due_at: nextDueAt, deleted_at: deletedAt } = checklist;

    if (deletedAt) {
        return (
            <Badge variant="outline" className="bg-slate-100 text-slate-700">
                Archived
            </Badge>
        );
    }

    if (!nextDueAt) {
        return (
            <Badge variant="secondary">
                Not Scheduled
            </Badge>
        );
    }

    const now = new Date();
    const dueDate = new Date(nextDueAt);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0) {
        return (
            <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue
            </Badge>
        );
    }

    if (diffHours <= 24) {
        return (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
                <Clock className="h-3 w-3 mr-1" />
                Due Soon
            </Badge>
        );
    }

    if (diffHours <= 72) {
        return (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Upcoming
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Scheduled
        </Badge>
    );
};

const formatDueDiff = (nextDueAt?: string | null): string => {
    if (!nextDueAt) {
        return 'Not scheduled';
    }

    const now = new Date();
    const due = new Date(nextDueAt);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (Number.isNaN(diffHours)) {
        return 'Not scheduled';
    }

    if (diffHours < 0) {
        const overdueHours = Math.abs(diffHours);
        if (overdueHours < 24) {
            return `${Math.round(overdueHours)}h overdue`;
        }
        return `${Math.round(overdueHours / 24)}d overdue`;
    }

    if (diffHours < 24) {
        return `Due in ${Math.round(diffHours)}h`;
    }

    return `Due in ${Math.round(diffHours / 24)}d`;
};

export default function ComplianceChecklists({
    checklists,
    stats,
    filters,
    frequencyOptions,
    statusOptions,
    assignedUsers,
    branches,
    can,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [frequencyType, setFrequencyType] = useState(filters.frequency_type ?? 'all');
    const [assignedUserId, setAssignedUserId] = useState(filters.assigned_user_id ?? 'all');
    const [branchId, setBranchId] = useState(filters.branch_id ?? 'all');
    const [dueFrom, setDueFrom] = useState(filters.due_from ?? '');
    const [dueTo, setDueTo] = useState(filters.due_to ?? '');
    const [includeDeleted, setIncludeDeleted] = useState<boolean>(Boolean(filters.include_deleted));
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [restoringId, setRestoringId] = useState<number | null>(null);

    const branchOptions = useMemo(() => {
        if (!branches) {
            return [];
        }

        return branches.map((branch) => ({
            value: branch.id.toString(),
            label: `${branch.name} (${branch.code})`,
        }));
    }, [branches]);

    const handleFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get('/compliance/checklists', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            frequency_type: frequencyType !== 'all' ? frequencyType : undefined,
            assigned_user_id: assignedUserId !== 'all' ? assignedUserId : undefined,
            branch_id: branchId !== 'all' ? branchId : undefined,
            due_from: dueFrom || undefined,
            due_to: dueTo || undefined,
            include_deleted: includeDeleted || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (checklist: ComplianceChecklist) => {
        if (!confirm(`Archive checklist "${checklist.title}"?`)) {
            return;
        }

        setDeletingId(checklist.id);
        router.delete(`/compliance/checklists/${checklist.id}`, {
            onFinish: () => setDeletingId(null),
        });
    };

    const handleRestore = (checklist: ComplianceChecklist) => {
        if (!confirm(`Restore checklist "${checklist.title}"?`)) {
            return;
        }

        setRestoringId(checklist.id);
        router.post(`/compliance/checklists/${checklist.id}/restore`, {}, {
            onFinish: () => setRestoringId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compliance Checklists" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ClipboardCheck className="h-6 w-6" />
                        <div>
                            <h1 className="text-2xl font-bold">Compliance Checklists</h1>
                            <p className="text-sm text-muted-foreground">
                                Monitor regulatory tasks, schedules, and assignments across branches.
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        {can.create && (
                            <Link href="/compliance/checklists/create">
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Checklist
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Checklists</CardTitle>
                            <CardDescription>Across all branches</CardDescription>
                        </CardHeader>
                        <CardContent className="text-3xl font-bold">{stats.total}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
                            <CardDescription>Upcoming assignments</CardDescription>
                        </CardHeader>
                        <CardContent className="text-3xl font-bold">{stats.due_this_week}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <CardDescription>Requires escalation</CardDescription>
                        </CardHeader>
                        <CardContent className="text-3xl font-bold text-red-600">{stats.overdue}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                            <CardDescription>On hold or archived</CardDescription>
                        </CardHeader>
                        <CardContent className="text-3xl font-bold text-muted-foreground">{stats.inactive}</CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-base">Filters</CardTitle>
                            </div>
                        </div>
                        <CardDescription>
                            Refine the checklist list by status, frequency, assignment, or schedule.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search by title, code, or category"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Select value={frequencyType} onValueChange={setFrequencyType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Frequencies</SelectItem>
                                        {frequencyOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Assigned To" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Assignees</SelectItem>
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
                                    <Select value={branchId} onValueChange={setBranchId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Branches</SelectItem>
                                            {branchOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <Input
                                    type="date"
                                    value={dueFrom}
                                    onChange={(event) => setDueFrom(event.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Due from</p>
                            </div>
                            <div>
                                <Input
                                    type="date"
                                    value={dueTo}
                                    onChange={(event) => setDueTo(event.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Due to</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="include_deleted"
                                    checked={includeDeleted}
                                    onCheckedChange={(checked) => setIncludeDeleted(Boolean(checked))}
                                />
                                <label htmlFor="include_deleted" className="text-sm text-muted-foreground">
                                    Include archived
                                </label>
                            </div>
                            <div className="md:col-span-5 flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        setStatus('all');
                                        setFrequencyType('all');
                                        setAssignedUserId('all');
                                        setBranchId('all');
                                        setDueFrom('');
                                        setDueTo('');
                                        setIncludeDeleted(false);

                                        router.get('/compliance/checklists', {}, {
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button type="submit">
                                    Apply Filters
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Checklist Library</CardTitle>
                        <CardDescription>
                            Track compliance schedule, due dates, and ownership for each checklist.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Checklist</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Next Due</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[120px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {checklists.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">
                                            No checklists found. Try adjusting the filters or create a new checklist.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    checklists.data.map((checklist) => (
                                        <TableRow
                                            key={checklist.id}
                                            className={checklist.deleted_at ? 'opacity-60' : ''}
                                        >
                                            <TableCell className="align-top">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-semibold">{checklist.title}</span>
                                                        {checklist.code && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {checklist.code}
                                                            </Badge>
                                                        )}
                                                        {checklist.deleted_at && (
                                                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                                                Archived
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                        {checklist.branch && (
                                                            <span className="inline-flex items-center space-x-1">
                                                                <Building2 className="h-3 w-3" />
                                                                <span>{checklist.branch.name}</span>
                                                            </span>
                                                        )}
                                                        {checklist.advance_reminder_offsets && checklist.advance_reminder_offsets.length > 0 && (
                                                            <span className="inline-flex items-center space-x-1">
                                                                <Bell className="h-3 w-3" />
                                                                <span>
                                                                    Reminders: {checklist.advance_reminder_offsets.map((offset) => `${offset}h`).join(', ')}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    {checklist.description && (
                                                        <p className="text-xs text-muted-foreground max-w-xl line-clamp-2">
                                                            {checklist.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                {getCategoryBadge(checklist.category)}
                                            </TableCell>
                                            <TableCell className="align-top space-y-2">
                                                {getFrequencyBadge(checklist.frequency_type)}
                                                <div className="text-xs text-muted-foreground">
                                                    Interval: every {checklist.frequency_interval} {checklist.frequency_type === 'custom'
                                                        ? checklist.custom_frequency_unit ?? 'unit(s)'
                                                        : 'cycle(s)'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="space-y-1">
                                                    <div className="font-medium">{formatDateTime(checklist.next_due_at)}</div>
                                                    <div className="text-xs text-muted-foreground">{formatDueDiff(checklist.next_due_at)}</div>
                                                    <div>{getDueBadge(checklist)}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="space-y-1 text-sm">
                                                    {checklist.assigned_user ? (
                                                        <div className="flex items-center space-x-1">
                                                            <Users className="h-3 w-3 text-muted-foreground" />
                                                            <span>{checklist.assigned_user.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Unassigned</span>
                                                    )}
                                                    {checklist.assigned_role && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Role: {checklist.assigned_role}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="text-sm font-medium">{checklist.items_count ?? (checklist.items?.length ?? 0)}</div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="space-y-1">
                                                    {getStatusBadge(checklist.status)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="flex space-x-1">
                                                    <Link href={`/compliance/checklists/${checklist.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {can.edit && !checklist.deleted_at && (
                                                        <Link href={`/compliance/checklists/${checklist.id}/edit`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {checklist.deleted_at ? (
                                                        can.restore && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRestore(checklist)}
                                                                disabled={restoringId === checklist.id}
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
                                                                onClick={() => handleDelete(checklist)}
                                                                disabled={deletingId === checklist.id}
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

                        {/* Pagination */}
                        {checklists.last_page > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {checklists.from} to {checklists.to} of {checklists.total} results
                                </div>
                                <div className="flex gap-2">
                                    {checklists.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url, {}, { preserveScroll: true });
                                                }
                                            }}
                                            disabled={!link.url}
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
}
