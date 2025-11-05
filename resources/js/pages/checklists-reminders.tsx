import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { type BreadcrumbItem, type PageProps } from '@/types';
import axios from 'axios';
import { AlertTriangle, Bell, Calendar, ClipboardCheck, Mail, MessageSquare, Radio } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface AssignedChecklistItem {
    id: number;
    label: string;
    assignment_item_id: number | null;
    is_completed: boolean;
}

interface AssignedChecklist {
    id: number;
    assignment_id: number | null;
    title: string;
    frequency: string;
    due_at: string | null;
    branch: string | null;
    status: string;
    progress_percentage: number;
    items: AssignedChecklistItem[];
}

interface AssignedReminder {
    id: number;
    title: string;
    reminder_type: string;
    priority: string;
    remind_at?: string | null;
    due_at?: string | null;
    status: string;
    delivery_channel: string;
    branch?: string | null;
    checklist?: { id: number; title: string } | null;
}

interface Props extends PageProps {
    assignedChecklists: AssignedChecklist[];
    assignedReminders: AssignedReminder[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Checklist & Reminders', href: '/checklists-reminders' },
];

const formatDateTime = (value?: string | null): string => {
    if (!value) return 'No schedule';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No schedule';
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const ChecklistReminderCenter = ({ assignedChecklists, assignedReminders, auth }: Props) => {
    const [activeChecklistId, setActiveChecklistId] = useState<number | null>(assignedChecklists[0]?.id ?? null);
    const userPermissions = auth?.permissions ?? [];
    const canManageChecklists = userPermissions.includes('compliance.manage_checklists');
    const canManageReminders = userPermissions.includes('compliance.manage_reminders');
    const [checklistProgress, setChecklistProgress] = useState<Record<number, Record<number, boolean>>>(() => {
        const initial: Record<number, Record<number, boolean>> = {};
        assignedChecklists.forEach((checklist) => {
            initial[checklist.id] = checklist.items.reduce<Record<number, boolean>>((acc, item) => {
                acc[item.id] = Boolean(item.is_completed);
                return acc;
            }, {});
        });
        return initial;
    });
    const [assignmentMeta, setAssignmentMeta] = useState<Record<number, { progress_percentage: number; status: string }>>(() => {
        const meta: Record<number, { progress_percentage: number; status: string }> = {};
        assignedChecklists.forEach((checklist) => {
            if (checklist.assignment_id) {
                meta[checklist.assignment_id] = {
                    progress_percentage: checklist.progress_percentage,
                    status: checklist.status,
                };
            }
        });
        return meta;
    });
    const [savingItems, setSavingItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setChecklistProgress(() => {
            const updated: Record<number, Record<number, boolean>> = {};
            assignedChecklists.forEach((checklist) => {
                updated[checklist.id] = checklist.items.reduce<Record<number, boolean>>((acc, item) => {
                    acc[item.id] = Boolean(item.is_completed);
                    return acc;
                }, {});
            });
            return updated;
        });

        setAssignmentMeta(() => {
            const meta: Record<number, { progress_percentage: number; status: string }> = {};
            assignedChecklists.forEach((checklist) => {
                if (checklist.assignment_id) {
                    meta[checklist.assignment_id] = {
                        progress_percentage: checklist.progress_percentage,
                        status: checklist.status,
                    };
                }
            });
            return meta;
        });

        setActiveChecklistId((current) => {
            if (current && assignedChecklists.some((list) => list.id === current)) {
                return current;
            }
            return assignedChecklists[0]?.id ?? null;
        });
    }, [assignedChecklists]);

    const activeChecklist = useMemo(
        () => assignedChecklists.find((checklist) => checklist.id === activeChecklistId) ?? assignedChecklists[0] ?? null,
        [activeChecklistId, assignedChecklists]
    );

    const getChecklistCompletion = (checklist: AssignedChecklist) => {
        const state = checklistProgress[checklist.id];
        const total = checklist.items.length || 1;

        if (!state) {
            return {
                completed: Math.round(((checklist.progress_percentage ?? 0) / 100) * checklist.items.length),
                total: checklist.items.length,
                percentage: checklist.progress_percentage ?? 0,
            };
        }

        const completed = checklist.items.filter((item) => state[item.id]).length;
        return {
            completed,
            total: checklist.items.length,
            percentage: Math.round((completed / total) * 100) || 0,
        };
    };

    const handleToggleItem = async (checklist: AssignedChecklist, item: AssignedChecklistItem) => {
        if (!checklist.assignment_id || !item.assignment_item_id) {
            return;
        }

        const checklistId = checklist.id;
        const itemId = item.id;
        const key = `${checklist.assignment_id}:${item.assignment_item_id}`;
        const previousValue = Boolean(checklistProgress[checklistId]?.[itemId]);
        const nextValue = !previousValue;

        setChecklistProgress((prev) => ({
            ...prev,
            [checklistId]: {
                ...(prev[checklistId] ?? {}),
                [itemId]: nextValue,
            },
        }));
        setSavingItems((prev) => ({ ...prev, [key]: true }));

        try {
            const response = await axios.post(
                route('dashboard.checklists.items.toggle', {
                    assignment: checklist.assignment_id,
                    assignmentItem: item.assignment_item_id,
                }),
                {
                    is_completed: nextValue,
                }
            );

            const payload = response.data as {
                assignment_id: number;
                assignment_item_id: number;
                is_completed: boolean;
                progress_percentage: number;
                status: string;
            };

            setChecklistProgress((prev) => ({
                ...prev,
                [checklistId]: {
                    ...(prev[checklistId] ?? {}),
                    [itemId]: payload.is_completed,
                },
            }));

            setAssignmentMeta((prev) => ({
                ...prev,
                [payload.assignment_id]: {
                    progress_percentage: payload.progress_percentage,
                    status: payload.status,
                },
            }));
        } catch (error) {
            console.error(error);
            setChecklistProgress((prev) => ({
                ...prev,
                [checklistId]: {
                    ...(prev[checklistId] ?? {}),
                    [itemId]: previousValue,
                },
            }));
        } finally {
            setSavingItems((prev) => {
                const { [key]: _omit, ...rest } = prev;
                return rest;
            });
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'in_progress':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
            case 'pending':
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    const resolveStatus = (checklist: AssignedChecklist) => {
        if (checklist.assignment_id && assignmentMeta[checklist.assignment_id]) {
            return assignmentMeta[checklist.assignment_id].status;
        }
        return checklist.status;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checklist & Reminders" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Your Assignments</h1>
                        <p className="text-muted-foreground">Complete outstanding checklist items and stay ahead of reminders.</p>
                    </div>
                    <div className="flex gap-2">
                        {canManageChecklists && (
                            <Link href="/compliance/checklists">
                                <Button variant="outline">
                                    <ClipboardCheck className="mr-2 h-4 w-4" /> Manage Checklists
                                </Button>
                            </Link>
                        )}
                        {canManageReminders && (
                            <Link href="/compliance/reminders">
                                <Button>
                                    <Radio className="mr-2 h-4 w-4" /> Reminder Queue
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5" /> Checklists
                            </CardTitle>
                            <CardDescription>Assignments generated from compliance checklists.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-6 lg:flex-row">
                            <div className="flex-1 space-y-3">
                                {assignedChecklists.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No checklists assigned to you yet.</p>
                                )}
                                {assignedChecklists.map((checklist) => {
                                    const completion = getChecklistCompletion(checklist);
                                    return (
                                        <button
                                            key={checklist.id}
                                            type="button"
                                            onClick={() => setActiveChecklistId(checklist.id)}
                                            className={`w-full rounded-lg border p-3 text-left transition hover:border-primary ${
                                                checklist.id === activeChecklistId ? 'border-primary bg-primary/5' : 'border-border'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">{checklist.title}</p>
                                                    <p className="text-xs text-muted-foreground">{checklist.frequency}</p>
                                                </div>
                                                {statusBadge(resolveStatus(checklist))}
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <Progress value={completion.percentage} className="h-2" />
                                                <p className="text-xs text-muted-foreground">
                                                    {completion.completed}/{completion.total} items complete
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {activeChecklist ? (
                                <div className="flex-1 rounded-xl border p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">{activeChecklist.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Due {formatDateTime(activeChecklist.due_at)}
                                            </p>
                                        </div>
                                        {statusBadge(resolveStatus(activeChecklist))}
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {activeChecklist.items.map((item) => {
                                            const checked = Boolean(checklistProgress[activeChecklist.id]?.[item.id]);
                                            const savingKey = `${activeChecklist.assignment_id}:${item.assignment_item_id}`;
                                            return (
                                                <label key={item.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                                                    <Checkbox
                                                        checked={checked}
                                                        disabled={savingItems[savingKey]}
                                                        onCheckedChange={() => handleToggleItem(activeChecklist, item)}
                                                    />
                                                    <span className={checked ? 'text-muted-foreground line-through' : ''}>{item.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 rounded-xl border p-6 text-sm text-muted-foreground">
                                    Select a checklist to view details.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" /> Upcoming Reminders
                            </CardTitle>
                            <CardDescription>Alerts targeted to your role or assignments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {assignedReminders.length === 0 && (
                                <p className="text-sm text-muted-foreground">No reminders scheduled for you.</p>
                            )}
                            {assignedReminders.map((reminder) => (
                                <div key={reminder.id} className="rounded-lg border p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold">{reminder.title}</p>
                                            <p className="text-xs text-muted-foreground">{reminder.checklist?.title || reminder.branch || 'General'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="capitalize">
                                                {reminder.reminder_type.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant="secondary" className="capitalize">
                                                {reminder.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {formatDateTime(reminder.remind_at)}
                                        </span>
                                        {reminder.due_at && (
                                            <span className="flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" /> Due {formatDateTime(reminder.due_at)}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            {reminder.delivery_channel === 'sms' ? (
                                                <MessageSquare className="h-3 w-3" />
                                            ) : reminder.delivery_channel === 'email' ? (
                                                <Mail className="h-3 w-3" />
                                            ) : (
                                                <Bell className="h-3 w-3" />
                                            )}
                                            {reminder.delivery_channel.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <Badge variant="outline" className="capitalize">
                                            {reminder.status}
                                        </Badge>
                                        <Link href={`/compliance/reminders/${reminder.id}`} className="text-sm text-primary">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default ChecklistReminderCenter;
