import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Save,
    ClipboardList,
    CalendarRange,
    Users,
    AlarmClock,
    Plus,
    Trash2,
    AlertCircle,
    Bell,
    X,
    Eye
} from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { type Branch, type BreadcrumbItem, type ComplianceChecklist, type User } from '@/types';

const OPTIONAL_VALUE = 'none';

interface RoleOption {
    id: number;
    name: string;
}

interface TriggerForm {
    id?: number;
    trigger_type: 'advance' | 'due' | 'escalation';
    offset_hours: string;
    channels: string[];
    escalate_to_user_id: string;
    escalate_to_role: string;
    is_active: boolean;
}

interface ChecklistItemForm {
    id?: number;
    title: string;
    description: string;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
}

interface Option {
    value: string;
    label: string;
}

interface Props {
    checklist: ComplianceChecklist;
    branches: Branch[] | null;
    assignedUsers: Array<Pick<User, 'id' | 'name'>>;
    roles: RoleOption[];
    categoryOptions: Option[];
    frequencyOptions: Option[];
    channelOptions: Option[];
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
        title: 'Edit Checklist',
        href: `/compliance/checklists/${checklistId}/edit`,
    },
];

export default function ComplianceChecklistEdit({
    checklist,
    branches,
    assignedUsers,
    roles,
    categoryOptions,
    frequencyOptions,
    channelOptions,
}: Props) {
    const [reminderInput, setReminderInput] = useState('');
    const normalizeOptionalSelect = (value: string) => (value === OPTIONAL_VALUE ? '' : value);

    const initialItems: ChecklistItemForm[] = (checklist.items ?? []).map((item, index) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? '',
        is_required: item.is_required,
        is_active: item.is_active,
        sort_order: item.sort_order ?? index,
    }));

    if (initialItems.length === 0) {
        initialItems.push({
            title: '',
            description: '',
            is_required: true,
            is_active: true,
            sort_order: 0,
        });
    }

    const initialTriggers: TriggerForm[] = (checklist.triggers ?? []).map((trigger) => ({
        id: trigger.id,
        trigger_type: trigger.trigger_type,
        offset_hours: trigger.offset_hours?.toString() ?? '0',
        channels: trigger.channels ?? [],
        escalate_to_user_id: trigger.escalate_to_user_id ? trigger.escalate_to_user_id.toString() : '',
        escalate_to_role: trigger.escalate_to_role ?? '',
        is_active: trigger.is_active,
    }));

    const { data, setData, put, processing, errors } = useForm({
        branch_id: checklist.branch_id ? checklist.branch_id.toString() : '',
        title: checklist.title ?? '',
        code: checklist.code ?? '',
        description: checklist.description ?? '',
        category: checklist.category ?? categoryOptions?.[0]?.value ?? '',
        status: checklist.status ?? 'active',
        frequency_type: checklist.frequency_type ?? 'monthly',
        frequency_interval: checklist.frequency_interval?.toString() ?? '1',
        custom_frequency_unit: checklist.custom_frequency_unit ?? 'days',
        custom_frequency_value: checklist.custom_frequency_value?.toString() ?? '1',
        start_date: checklist.start_date ?? '',
        due_time: checklist.due_time ?? '',
        is_recurring: checklist.is_recurring ?? true,
        assigned_user_id: checklist.assigned_user_id ? checklist.assigned_user_id.toString() : '',
        assigned_role: checklist.assigned_role ?? '',
        escalate_to_user_id: checklist.escalate_to_user_id ? checklist.escalate_to_user_id.toString() : '',
        escalation_offset_hours: checklist.escalation_offset_hours?.toString() ?? '',
        advance_reminder_offsets: (checklist.advance_reminder_offsets ?? []).map((offset) => offset.toString()),
        items: initialItems,
        triggers: initialTriggers,
        requires_acknowledgement: checklist.requires_acknowledgement ?? false,
        allow_partial_completion: checklist.allow_partial_completion ?? true,
    });

    const branchOptions = useMemo(() => {
        if (!branches) {
            return [];
        }

        return branches.map((branch) => ({
            value: branch.id.toString(),
            label: `${branch.name} (${branch.code})`,
        }));
    }, [branches]);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        put(`/compliance/checklists/${checklist.id}`, {
            preserveScroll: true,
        });
    };

    const updateItem = (index: number, field: keyof ChecklistItemForm, value: string | boolean) => {
        const updated = data.items.map((item, idx) => {
            if (idx !== index) {
                return item;
            }

            return {
                ...item,
                [field]: value,
            };
        }).map((item, idx) => ({
            ...item,
            sort_order: idx,
        }));

        setData('items', updated);
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                title: '',
                description: '',
                is_required: true,
                is_active: true,
                sort_order: data.items.length,
            },
        ]);
    };

    const removeItem = (index: number) => {
        if (data.items.length === 1) {
            return;
        }

        const updated = data.items
            .filter((_, idx) => idx !== index)
            .map((item, idx) => ({
                ...item,
                sort_order: idx,
            }));

        setData('items', updated);
    };

    const addReminderOffset = () => {
        if (!reminderInput) {
            return;
        }

        if (data.advance_reminder_offsets.includes(reminderInput)) {
            setReminderInput('');
            return;
        }

        setData('advance_reminder_offsets', [...data.advance_reminder_offsets, reminderInput]);
        setReminderInput('');
    };

    const removeReminderOffset = (offset: string) => {
        setData(
            'advance_reminder_offsets',
            data.advance_reminder_offsets.filter((value) => value !== offset)
        );
    };

    const addTrigger = () => {
        setData('triggers', [
            ...data.triggers,
            {
                trigger_type: 'advance',
                offset_hours: '24',
                channels: ['in_app'],
                escalate_to_user_id: '',
                escalate_to_role: '',
                is_active: true,
            },
        ]);
    };

    const updateTrigger = <K extends keyof TriggerForm>(
        index: number,
        field: K,
        value: TriggerForm[K]
    ) => {
        const updated = data.triggers.map((trigger, idx) => {
            if (idx !== index) {
                return trigger;
            }

            return {
                ...trigger,
                [field]: value,
            };
        });

        setData('triggers', updated);
    };

    const toggleTriggerChannel = (index: number, channel: string) => {
        const trigger = data.triggers[index];
        if (!trigger) return;

        const hasChannel = trigger.channels.includes(channel);
        const channels = hasChannel
            ? trigger.channels.filter((item) => item !== channel)
            : [...trigger.channels, channel];

        updateTrigger(index, 'channels', channels);
    };

    const removeTrigger = (index: number) => {
        setData('triggers', data.triggers.filter((_, idx) => idx !== index));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(checklist.id)}>
            <Head title={`Edit ${checklist.title}`} />

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-red-900">Please review the form</h3>
                                    <ul className="mt-2 list-disc list-inside text-sm text-red-700 space-y-1">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field}>
                                                <strong className="capitalize">{field.replace(/_/g, ' ')}</strong>: {message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/compliance/checklists">
                            <Button variant="outline" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Checklists
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Checklist</h1>
                            <p className="text-sm text-muted-foreground">
                                Update cadence, ownership, and automation for <span className="font-semibold">{checklist.title}</span>.
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/compliance/checklists/${checklist.id}`}>
                            <Button variant="outline" type="button">
                                <Eye className="h-4 w-4 mr-2" />
                                View Checklist
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                    <CardTitle>Checklist Details</CardTitle>
                                </div>
                                <CardDescription>Update the descriptive details for this compliance checklist.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Title<span className="text-red-500">*</span></label>
                                        <Input
                                            value={data.title}
                                            onChange={(event) => setData('title', event.target.value)}
                                            placeholder="Checklist title"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Reference Code</label>
                                        <Input
                                            value={data.code}
                                            onChange={(event) => setData('code', event.target.value.toUpperCase())}
                                            placeholder="Optional code"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                        value={data.description}
                                        onChange={(event) => setData('description', event.target.value)}
                                        rows={4}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Category</label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value) => setData('category', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoryOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-6 md:mt-0">
                                        <Switch
                                            id="requires_acknowledgement"
                                            checked={data.requires_acknowledgement}
                                            onCheckedChange={(checked) => setData('requires_acknowledgement', Boolean(checked))}
                                        />
                                        <label htmlFor="requires_acknowledgement" className="text-sm">
                                            Require acknowledgement
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                                    <CardTitle>Schedule & Frequency</CardTitle>
                                </div>
                                <CardDescription>Adjust when this checklist is generated and due.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Frequency</label>
                                        <Select
                                            value={data.frequency_type}
                                            onValueChange={(value) => setData('frequency_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {frequencyOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Interval</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={data.frequency_interval}
                                            onChange={(event) => setData('frequency_interval', event.target.value)}
                                        />
                                    </div>
                                </div>
                                {data.frequency_type === 'custom' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Custom Unit</label>
                                            <Select
                                                value={data.custom_frequency_unit}
                                                onValueChange={(value) => setData('custom_frequency_unit', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hours">Hours</SelectItem>
                                                    <SelectItem value="days">Days</SelectItem>
                                                    <SelectItem value="weeks">Weeks</SelectItem>
                                                    <SelectItem value="months">Months</SelectItem>
                                                    <SelectItem value="years">Years</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Custom Value</label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={data.custom_frequency_value}
                                                onChange={(event) => setData('custom_frequency_value', event.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Start Date</label>
                                        <Input
                                            type="date"
                                            value={data.start_date ?? ''}
                                            onChange={(event) => setData('start_date', event.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Due Time</label>
                                        <Input
                                            type="time"
                                            value={data.due_time ?? ''}
                                            onChange={(event) => setData('due_time', event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_recurring"
                                            checked={data.is_recurring}
                                            onCheckedChange={(checked) => setData('is_recurring', Boolean(checked))}
                                        />
                                        <label htmlFor="is_recurring" className="text-sm">
                                            Recurring checklist
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="allow_partial_completion"
                                            checked={data.allow_partial_completion}
                                            onCheckedChange={(checked) => setData('allow_partial_completion', Boolean(checked))}
                                        />
                                        <label htmlFor="allow_partial_completion" className="text-sm">
                                            Allow partial completion
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                    <CardTitle>Checklist Items</CardTitle>
                                </div>
                                <CardDescription>Modify the tasks that must be completed for compliance.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    {data.items.map((item, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold">
                                                    Item {index + 1}
                                                    {item.id && (
                                                        <Badge variant="outline" className="ml-2 text-xs">
                                                            #
                                                            {item.id}
                                                        </Badge>
                                                    )}
                                                </span>
                                                {data.items.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                <Input
                                                    value={item.title}
                                                    onChange={(event) => updateItem(index, 'title', event.target.value)}
                                                    required
                                                />
                                                <Textarea
                                                    value={item.description}
                                                    onChange={(event) => updateItem(index, 'description', event.target.value)}
                                                    rows={3}
                                                />
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`item_required_${index}`}
                                                            checked={item.is_required}
                                                            onCheckedChange={(checked) => updateItem(index, 'is_required', Boolean(checked))}
                                                        />
                                                        <label htmlFor={`item_required_${index}`} className="text-sm">
                                                            Required item
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`item_active_${index}`}
                                                            checked={item.is_active}
                                                            onCheckedChange={(checked) => updateItem(index, 'is_active', Boolean(checked))}
                                                        />
                                                        <label htmlFor={`item_active_${index}`} className="text-sm">
                                                            Active
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" onClick={addItem}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Checklist Item
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {branches && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle>Branch Assignment</CardTitle>
                                    </div>
                                    <CardDescription>Update which branch owns this checklist.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Select
                                        value={data.branch_id}
                                        onValueChange={(value) => setData('branch_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branchOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <CardTitle>Assignment & Escalation</CardTitle>
                                </div>
                                <CardDescription>Adjust ownership and escalation contacts.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Assigned User</label>
                                    <Select
                                        value={data.assigned_user_id || OPTIONAL_VALUE}
                                        onValueChange={(value) => setData('assigned_user_id', normalizeOptionalSelect(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={OPTIONAL_VALUE}>Unassigned</SelectItem>
                                            {assignedUsers.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Assigned Role</label>
                                    <Select
                                        value={data.assigned_role || OPTIONAL_VALUE}
                                        onValueChange={(value) => setData('assigned_role', normalizeOptionalSelect(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={OPTIONAL_VALUE}>No role assignment</SelectItem>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.name}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="border-t pt-4 space-y-3">
                                    <label className="text-sm font-medium flex items-center space-x-2">
                                        <AlarmClock className="h-4 w-4 text-muted-foreground" />
                                        <span>Escalation</span>
                                    </label>
                                    <Select
                                        value={data.escalate_to_user_id || OPTIONAL_VALUE}
                                        onValueChange={(value) => setData('escalate_to_user_id', normalizeOptionalSelect(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Escalate to user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={OPTIONAL_VALUE}>No escalation user</SelectItem>
                                            {assignedUsers.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Hours after due before escalation"
                                        value={data.escalation_offset_hours}
                                        onChange={(event) => setData('escalation_offset_hours', event.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                    <CardTitle>Reminder Settings</CardTitle>
                                </div>
                                <CardDescription>Maintain your early notifications and escalations.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Advance reminders (hours before due)</label>
                                    <div className="flex space-x-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            value={reminderInput}
                                            onChange={(event) => setReminderInput(event.target.value)}
                                            placeholder="e.g., 24"
                                        />
                                        <Button type="button" variant="secondary" onClick={addReminderOffset}>
                                            Add
                                        </Button>
                                    </div>
                                    {data.advance_reminder_offsets.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.advance_reminder_offsets.map((offset) => (
                                                <Badge key={offset} variant="outline" className="flex items-center space-x-1">
                                                    <span>{offset}h</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeReminderOffset(offset)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Automation Triggers</span>
                                        <Button type="button" variant="outline" size="sm" onClick={addTrigger}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Trigger
                                        </Button>
                                    </div>

                                    {data.triggers.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">
                                            No triggers configured yet. Add one to send reminders or escalation notices.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {data.triggers.map((trigger, index) => (
                                                <div key={index} className="border rounded-lg p-3 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold">
                                                            Trigger {index + 1}
                                                            {trigger.id && (
                                                                <Badge variant="outline" className="ml-2 text-xs">
                                                                    #{trigger.id}
                                                                </Badge>
                                                            )}
                                                        </span>
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                checked={trigger.is_active}
                                                                onCheckedChange={(checked) => updateTrigger(index, 'is_active', Boolean(checked))}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeTrigger(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <Select
                                                            value={trigger.trigger_type}
                                                            onValueChange={(value: TriggerForm['trigger_type']) => updateTrigger(index, 'trigger_type', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Trigger type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="advance">Advance Reminder</SelectItem>
                                                                <SelectItem value="due">At Due Time</SelectItem>
                                                                <SelectItem value="escalation">Escalation</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Input
                                                            type="number"
                                                            value={trigger.offset_hours}
                                                            onChange={(event) => updateTrigger(index, 'offset_hours', event.target.value)}
                                                            placeholder="Offset (hours)"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-medium text-muted-foreground uppercase">
                                                            Channels
                                                        </span>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {channelOptions.map((option) => (
                                                                <Button
                                                                    key={option.value}
                                                                    type="button"
                                                                    variant={trigger.channels.includes(option.value) ? 'default' : 'outline'}
                                                                    size="sm"
                                                                    onClick={() => toggleTriggerChannel(index, option.value)}
                                                                >
                                                                    {option.label}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <Select
                                                            value={trigger.escalate_to_user_id || OPTIONAL_VALUE}
                                                            onValueChange={(value) => updateTrigger(index, 'escalate_to_user_id', normalizeOptionalSelect(value))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Escalate to user" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value={OPTIONAL_VALUE}>None</SelectItem>
                                                                {assignedUsers.map((user) => (
                                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                                        {user.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Select
                                                            value={trigger.escalate_to_role || OPTIONAL_VALUE}
                                                            onValueChange={(value) => updateTrigger(index, 'escalate_to_role', normalizeOptionalSelect(value))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Escalate to role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value={OPTIONAL_VALUE}>None</SelectItem>
                                                                {roles.map((role) => (
                                                                    <SelectItem key={role.id} value={role.name}>
                                                                        {role.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
