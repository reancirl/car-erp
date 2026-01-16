import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Car, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Branch {
    id: number;
    name: string;
    code?: string | null;
}

interface CalendarEvent {
    type: string;
    title: string;
    date: string;
    time?: string | null;
    status?: string | null;
    branch?: { id: number; name: string; code?: string | null } | null;
    meta?: Record<string, string | number | null>;
}

interface Props {
    events: CalendarEvent[];
    branches: Branch[];
    filters: {
        branch_id?: number | null;
        start_date: string;
        end_date: string;
    };
}

export default function DashboardCalendar({ events, branches, filters }: Props) {
    const [branchId, setBranchId] = useState(filters.branch_id?.toString() ?? 'all');
    const [currentMonth, setCurrentMonth] = useState(() => {
        const start = filters.start_date ? new Date(filters.start_date) : new Date();
        return new Date(start.getFullYear(), start.getMonth(), 1);
    });

    const groupedEvents = useMemo(() => {
        return events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
            if (!event.date) return acc;
            acc[event.date] = acc[event.date] || [];
            acc[event.date].push(event);
            return acc;
        }, {});
    }, [events]);

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const daysInMonthGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: (Date | null)[] = [];
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }
        return days;
    };

    const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const handleMonthChange = (direction: 'prev' | 'next') => {
        const next = new Date(currentMonth);
        next.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentMonth(next);
        const start = new Date(next.getFullYear(), next.getMonth(), 1);
        const end = new Date(next.getFullYear(), next.getMonth() + 1, 0);
        router.get('/dashboard/calendar', {
            branch_id: branchId !== 'all' ? branchId : undefined,
            start_date: formatDate(start),
            end_date: formatDate(end),
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleBranchChange = (value: string) => {
        setBranchId(value);
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        router.get('/dashboard/calendar', {
            branch_id: value !== 'all' ? value : undefined,
            start_date: formatDate(start),
            end_date: formatDate(end),
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const renderTypeBadge = (type: string) => {
        switch (type) {
            case 'test_drive':
                return (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        Test Drive
                    </Badge>
                );
            case 'pms':
                return (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        PMS
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-xs capitalize">{type}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Branch Calendar', href: '#' }]}>
            <Head title="Branch Calendar" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6" />
                            Branch Calendar
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Consolidated schedule of test drives and PMS work orders by branch.
                        </p>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm">Back to Dashboard</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <CardTitle className="ml-2">{monthLabel}</CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={branchId} onValueChange={handleBranchChange}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All branches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All branches</SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id.toString()}>
                                            {branch.name} {branch.code ? `(${branch.code})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => {
                                const today = new Date();
                                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                                router.get('/dashboard/calendar', { branch_id: branchId !== 'all' ? branchId : undefined }, { preserveScroll: true, preserveState: true, replace: true });
                            }}>
                                Today
                            </Button>
                        </div>
                        <CardDescription className="md:text-right">Click days to see scheduled items.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {daysInMonthGrid().map((day, idx) => {
                                const dateStr = day ? formatDate(day) : '';
                                const dayEvents = day ? groupedEvents[dateStr] || [] : [];
                                return (
                                    <div
                                        key={idx}
                                        className={`min-h-[110px] rounded-md border p-2 ${day ? 'bg-white' : 'bg-muted/30 border-dashed'}`}
                                    >
                                        {day && (
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span>{day.getDate()}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {dayEvents.length} event{dayEvents.length === 1 ? '' : 's'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="mt-2 space-y-1">
                                            {dayEvents.slice(0, 3).map((event, i) => (
                                                <div key={i} className="rounded border px-2 py-1 text-[11px] leading-tight">
                                                    <div className="flex items-center gap-1">
                                                        {renderTypeBadge(event.type)}
                                                        {event.branch?.code && (
                                                            <Badge variant="outline" className="text-[10px]">
                                                                {event.branch.code}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="font-semibold truncate">{event.title}</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {event.time ? event.time : 'All day'}
                                                    </div>
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-[11px] text-muted-foreground">
                                                    +{dayEvents.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
