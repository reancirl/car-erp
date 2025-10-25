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
import { AlertCircle, ArrowLeft, CalendarClock, Save } from 'lucide-react';
import { type FormEvent, useMemo } from 'react';
import { type Branch, type BreadcrumbItem } from '@/types';

interface Option {
    value: string;
    label: string;
}

interface ChecklistOption {
    id: number;
    title: string;
}

interface Props {
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
    { title: 'Create Reminder', href: '/compliance/reminders/create' },
];

const ReminderCreate = ({
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

    const defaultChannel = channelOptions[0]?.value ?? 'email';

    const { data, setData, post, processing, errors } = useForm({
        branch_id: branches && branches.length === 1 ? branches[0].id.toString() : '',
        compliance_checklist_id: '',
        compliance_checklist_assignment_id: '',
        assigned_user_id: '',
        assigned_role: '',
        title: '',
        description: '',
        reminder_type: filteredTypeOptions[0]?.value ?? 'manual',
        priority: filteredPriorityOptions[0]?.value ?? 'medium',
        delivery_channel: defaultChannel,
        delivery_channels: [] as string[],
        remind_at: '',
        due_at: '',
        escalate_at: '',
        status: filteredStatusOptions[0]?.value ?? 'scheduled',
        auto_escalate: false,
        escalate_to_user_id: '',
        escalate_to_role: '',
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        post('/compliance/reminders', { preserveScroll: true });
    };

    const toggleChannel = (value: string) => {
        setData('delivery_channels', (data.delivery_channels ?? []).includes(value)
            ? data.delivery_channels.filter((channel) => channel !== value)
            : [...data.delivery_channels, value]);
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Reminder" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">New Compliance Reminder</h1>
                        <p className="text-muted-foreground">Schedule automated alerts tied to checklists or manual follow-ups.</p>
                    </div>
                    <Link href="/compliance/reminders" className="inline-flex items-center text-sm text-muted-foreground">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Reminders
                    </Link>
                </div>

                {hasErrors && (
                    <Alert variant="destructive" className="space-y-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>We found {Object.keys(errors).length} issue(s) with your submission</AlertTitle>
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
                                <CardDescription>Main metadata used to describe and route the alert.</CardDescription>
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
                                <CardTitle>Assignment & Routing</CardTitle>
                                <CardDescription>Decide which checklist or teammate will receive the reminder.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Checklist (optional)</Label>
                                    <Select
                                        value={data.compliance_checklist_id || 'none'}
                                        onValueChange={(value) => setData('compliance_checklist_id', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Link to a checklist" />
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
                                                <SelectValue placeholder="Select teammate" />
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
                                            placeholder="E.g. service_manager"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <Label className="flex items-center gap-2">
                                            <CalendarClock className="h-4 w-4" /> Auto Escalate
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Escalate automatically when due date passes.
                                        </p>
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
                                                placeholder="E.g. auditor"
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
                                <CardTitle>Schedule Summary</CardTitle>
                                <CardDescription>Quick view of how the reminder will behave.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Primary Channel</span>
                                    <span className="font-medium uppercase">{data.delivery_channel || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Additional Channels</span>
                                    <span className="font-medium">{data.delivery_channels.length || 'None'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Reminder Type</span>
                                    <span className="font-medium capitalize">{data.reminder_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Priority</span>
                                    <span className="font-medium capitalize">{data.priority}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Auto Escalate</span>
                                    <span className="font-medium">{data.auto_escalate ? 'Enabled' : 'Disabled'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                                <CardDescription>Save or discard your changes.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Reminder'}
                                </Button>
                                <Link href="/compliance/reminders">
                                    <Button type="button" variant="outline" className="w-full">
                                        Cancel
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

export default ReminderCreate;
