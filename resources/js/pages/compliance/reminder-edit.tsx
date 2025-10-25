import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Save, Trash2 } from 'lucide-react';
import { type FormEvent, useMemo } from 'react';
import { type Branch, type BreadcrumbItem, type ComplianceReminder } from '@/types';

interface Option {
    value: string;
    label: string;
}

interface ChecklistOption {
    id: number;
    title: string;
}

interface Props {
    reminder: ComplianceReminder;
    branches: Branch[] | null;
    checklists: ChecklistOption[];
    assignedUsers: Array<{ id: number; name: string }>;
    statusOptions: Option[];
    priorityOptions: Option[];
    typeOptions: Option[];
    channelOptions: Option[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Compliance', href: '/compliance' },
    { title: 'Reminders', href: '/compliance/reminders' },
    { title: 'Edit Reminder', href: '#' },
];

const toDateTimeLocal = (value?: string | null): string => {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
};

const ReminderEdit = ({
    reminder,
    branches,
    checklists,
    assignedUsers,
    statusOptions,
    priorityOptions,
    typeOptions,
    channelOptions,
}: Props) => {
    const filteredStatusOptions = useMemo(() => statusOptions.filter((option) => option.value !== 'all'), [statusOptions]);
    const filteredPriorityOptions = useMemo(() => priorityOptions.filter((option) => option.value !== 'all'), [priorityOptions]);
    const filteredTypeOptions = useMemo(() => typeOptions.filter((option) => option.value !== 'all'), [typeOptions]);

    const { data, setData, put, processing, errors } = useForm({
        branch_id: reminder.branch_id ? reminder.branch_id.toString() : '',
        compliance_checklist_id: reminder.compliance_checklist_id ? reminder.compliance_checklist_id.toString() : '',
        compliance_checklist_assignment_id: reminder.compliance_checklist_assignment_id
            ? reminder.compliance_checklist_assignment_id.toString()
            : '',
        assigned_user_id: reminder.assigned_user_id ? reminder.assigned_user_id.toString() : '',
        assigned_role: reminder.assigned_role ?? '',
        title: reminder.title,
        description: reminder.description ?? '',
        reminder_type: reminder.reminder_type,
        priority: reminder.priority,
        delivery_channel: reminder.delivery_channel,
        delivery_channels: reminder.delivery_channels ?? [],
        remind_at: toDateTimeLocal(reminder.remind_at),
        due_at: toDateTimeLocal(reminder.due_at),
        escalate_at: toDateTimeLocal(reminder.escalate_at),
        status: reminder.status,
        auto_escalate: reminder.auto_escalate,
        escalate_to_user_id: reminder.escalate_to_user_id ? reminder.escalate_to_user_id.toString() : '',
        escalate_to_role: reminder.escalate_to_role ?? '',
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        put(`/compliance/reminders/${reminder.id}`, { preserveScroll: true });
    };

    const toggleChannel = (value: string) => {
        setData('delivery_channels', (data.delivery_channels ?? []).includes(value)
            ? data.delivery_channels.filter((channel) => channel !== value)
            : [...data.delivery_channels, value]);
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${reminder.title}`} />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Reminder</h1>
                        <p className="text-muted-foreground">Update scheduling, routing, and escalation rules.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/compliance/reminders" className="inline-flex items-center text-sm text-muted-foreground">
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to list
                        </Link>
                        <Link href={`/compliance/reminders/${reminder.id}`} className="text-sm text-primary">
                            View details
                        </Link>
                    </div>
                </div>

                {hasErrors && (
                    <Alert variant="destructive" className="space-y-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Validation issues</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reminder Details</CardTitle>
                                <CardDescription>Adjust message metadata, schedule, and delivery preference.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {branches && (
                                    <div>
                                        <Label>Branch *</Label>
                                        <Select value={data.branch_id} onValueChange={(value) => setData('branch_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select branch" />
                                            </SelectTrigger>
                                            <SelectContent>
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
                                    <Label htmlFor="title">Title *</Label>
                                    <Input id="title" value={data.title} onChange={(event) => setData('title', event.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(event) => setData('description', event.target.value)}
                                        rows={4}
                                    />
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <Label>Type *</Label>
                                        <Select value={data.reminder_type} onValueChange={(value) => setData('reminder_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Priority *</Label>
                                        <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredPriorityOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Status *</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredStatusOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="remind_at">Remind At *</Label>
                                        <Input
                                            id="remind_at"
                                            type="datetime-local"
                                            value={data.remind_at}
                                            onChange={(event) => setData('remind_at', event.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="due_at">Due At</Label>
                                        <Input
                                            id="due_at"
                                            type="datetime-local"
                                            value={data.due_at}
                                            onChange={(event) => setData('due_at', event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Primary Channel *</Label>
                                    <Select value={data.delivery_channel} onValueChange={(value) => setData('delivery_channel', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select channel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {channelOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Additional Channels</Label>
                                    <div className="grid gap-2 md:grid-cols-2">
                                        {channelOptions.map((option) => (
                                            <label key={option.value} className="flex items-center gap-2 text-sm">
                                                <Checkbox
                                                    checked={data.delivery_channels.includes(option.value)}
                                                    onCheckedChange={() => toggleChannel(option.value)}
                                                />
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment & Escalation</CardTitle>
                                <CardDescription>Update the assignment and automatic escalation rules.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Checklist</Label>
                                    <Select
                                        value={data.compliance_checklist_id || 'none'}
                                        onValueChange={(value) => setData('compliance_checklist_id', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Link to checklist" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No checklist link</SelectItem>
                                            {checklists.map((checklist) => (
                                                <SelectItem key={checklist.id} value={checklist.id.toString()}>
                                                    {checklist.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Assigned User</Label>
                                        <Select
                                            value={data.assigned_user_id || 'none'}
                                            onValueChange={(value) => setData('assigned_user_id', value === 'none' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Unassigned</SelectItem>
                                                {assignedUsers.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="assigned_role">Assigned Role</Label>
                                        <Input
                                            id="assigned_role"
                                            value={data.assigned_role}
                                            onChange={(event) => setData('assigned_role', event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <Label>Auto Escalate</Label>
                                        <p className="text-xs text-muted-foreground">Escalate when reminder remains unresolved.</p>
                                    </div>
                                    <Switch
                                        checked={data.auto_escalate}
                                        onCheckedChange={(checked) => setData('auto_escalate', Boolean(checked))}
                                    />
                                </div>
                                {data.auto_escalate && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label>Escalate To User</Label>
                                            <Select
                                                value={data.escalate_to_user_id || 'none'}
                                                onValueChange={(value) => setData('escalate_to_user_id', value === 'none' ? '' : value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select user" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No user</SelectItem>
                                                    {assignedUsers.map((user) => (
                                                        <SelectItem key={user.id} value={user.id.toString()}>
                                                            {user.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="escalate_to_role">Escalate To Role</Label>
                                            <Input
                                                id="escalate_to_role"
                                                value={data.escalate_to_role}
                                                onChange={(event) => setData('escalate_to_role', event.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="escalate_at">Escalate After</Label>
                                            <Input
                                                id="escalate_at"
                                                type="datetime-local"
                                                value={data.escalate_at}
                                                onChange={(event) => setData('escalate_at', event.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                                <CardDescription>Save updates or archive the reminder.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Link href="/compliance/reminders">
                                    <Button type="button" variant="outline" className="w-full">
                                        Cancel
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Danger Zone</CardTitle>
                                <CardDescription>Archive the reminder if it is no longer needed.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/compliance/reminders/${reminder.id}`}>
                                    <Button type="button" variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" /> Manage Deletion
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default ReminderEdit;
