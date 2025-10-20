import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon,
    List,
    Plus,
    Clock,
    User,
    Car,
    CheckCircle,
    FileSignature,
    AlertTriangle,
    MapPin,
    Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';

interface TestDrive {
    id: number;
    reservation_id: string;
    customer_name: string;
    customer_phone: string;
    vehicle_vin: string;
    vehicle_details: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    status: string;
    reservation_type: string;
    esignature_status: string;
    branch?: {
        id: number;
        name: string;
        code: string;
    };
    assigned_user?: {
        id: number;
        name: string;
    };
}

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface Props {
    testDrives: TestDrive[];
    currentDate?: string;
    view?: 'month' | 'week' | 'day';
    branches?: Branch[] | null;
    filters?: {
        branch_id?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Test Drives',
        href: '/sales/test-drives',
    },
    {
        title: 'Calendar View',
        href: '/sales/test-drives/calendar',
    },
];

export default function TestDriveCalendar({ testDrives, currentDate, view = 'month', branches, filters }: Props) {
    const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>(view);
    const [selectedDate, setSelectedDate] = useState(currentDate ? new Date(currentDate) : new Date());
    const [branchFilter, setBranchFilter] = useState(filters?.branch_id || '');

    // Helper functions
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getMonthName = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const getWeekDays = () => {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getTestDrivesForDate = (date: Date | null) => {
        if (!date) return [];
        const dateStr = formatDate(date);
        return testDrives.filter(td => {
            // Extract just the date part from the scheduled_date (handles both "2025-10-25" and "2025-10-25T00:00:00.000000Z")
            const tdDate = td.scheduled_date.split('T')[0];
            return tdDate === dateStr;
        });
    };

    const getTestDrivesForWeek = () => {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            weekDays.push({
                date: day,
                testDrives: getTestDrivesForDate(day)
            });
        }
        return weekDays;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        if (direction === 'prev') {
            newDate.setMonth(selectedDate.getMonth() - 1);
        } else {
            newDate.setMonth(selectedDate.getMonth() + 1);
        }
        setSelectedDate(newDate);
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        if (direction === 'prev') {
            newDate.setDate(selectedDate.getDate() - 7);
        } else {
            newDate.setDate(selectedDate.getDate() + 7);
        }
        setSelectedDate(newDate);
    };

    const navigateDay = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        if (direction === 'prev') {
            newDate.setDate(selectedDate.getDate() - 1);
        } else {
            newDate.setDate(selectedDate.getDate() + 1);
        }
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const handleBranchFilter = (value: string) => {
        setBranchFilter(value);
        router.get('/sales/test-drives/calendar', {
            branch_id: value || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending_signature':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'no_show':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="h-3 w-3" />;
            case 'pending_signature':
                return <FileSignature className="h-3 w-3" />;
            case 'in_progress':
                return <Car className="h-3 w-3" />;
            case 'completed':
                return <CheckCircle className="h-3 w-3" />;
            case 'cancelled':
            case 'no_show':
                return <AlertTriangle className="h-3 w-3" />;
            default:
                return <Clock className="h-3 w-3" />;
        }
    };

    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return formatDate(date) === formatDate(today);
    };

    const isSelectedDate = (date: Date | null) => {
        if (!date) return false;
        return formatDate(date) === formatDate(selectedDate);
    };

    // Render Month View
    const renderMonthView = () => {
        const days = getDaysInMonth(selectedDate);
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return (
            <div className="bg-white rounded-lg border">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 border-b">
                    {getWeekDays().map(day => (
                        <div key={day} className="p-3 text-center font-semibold text-sm border-r last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Body */}
                <div>
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
                            {week.map((day, dayIndex) => {
                                const dayTestDrives = getTestDrivesForDate(day);
                                const today = isToday(day);
                                const selected = isSelectedDate(day);

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`min-h-[120px] p-2 border-r last:border-r-0 ${
                                            !day ? 'bg-gray-50' : ''
                                        } ${today ? 'bg-blue-50' : ''} ${selected ? 'ring-2 ring-blue-500' : ''}`}
                                        onClick={() => day && setSelectedDate(day)}
                                    >
                                        {day && (
                                            <>
                                                <div className={`text-sm font-semibold mb-1 ${today ? 'text-blue-600' : ''}`}>
                                                    {day.getDate()}
                                                </div>
                                                <div className="space-y-1">
                                                    {dayTestDrives.slice(0, 3).map(td => (
                                                        <Link
                                                            key={td.id}
                                                            href={`/sales/test-drives/${td.id}`}
                                                            className={`block text-xs p-1 rounded border cursor-pointer hover:shadow-sm ${getStatusColor(td.status)}`}
                                                        >
                                                            <div className="flex items-center space-x-1 mb-0.5">
                                                                {getStatusIcon(td.status)}
                                                                <span className="font-medium truncate">{td.scheduled_time}</span>
                                                            </div>
                                                            <div className="truncate">{td.customer_name}</div>
                                                        </Link>
                                                    ))}
                                                    {dayTestDrives.length > 3 && (
                                                        <div className="text-xs text-muted-foreground text-center">
                                                            +{dayTestDrives.length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render Week View
    const renderWeekView = () => {
        const weekData = getTestDrivesForWeek();
        const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

        return (
            <div className="bg-white rounded-lg border overflow-x-auto">
                <div className="grid grid-cols-8 min-w-[800px]">
                    {/* Time column */}
                    <div className="border-r">
                        <div className="h-12 border-b"></div>
                        {timeSlots.map(hour => (
                            <div key={hour} className="h-20 border-b p-2 text-xs text-muted-foreground">
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {weekData.map(({ date, testDrives: dayTestDrives }, index) => {
                        const today = isToday(date);
                        return (
                            <div key={index} className={`border-r last:border-r-0 ${today ? 'bg-blue-50' : ''}`}>
                                <div className="h-12 border-b p-2 text-center">
                                    <div className="text-xs text-muted-foreground">
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </div>
                                    <div className={`text-sm font-semibold ${today ? 'text-blue-600' : ''}`}>
                                        {date.getDate()}
                                    </div>
                                </div>
                                {timeSlots.map(hour => (
                                    <div key={hour} className="h-20 border-b p-1 relative">
                                        {dayTestDrives
                                            .filter(td => {
                                                const tdHour = parseInt(td.scheduled_time.split(':')[0]);
                                                return tdHour === hour;
                                            })
                                            .map(td => (
                                                <Link
                                                    key={td.id}
                                                    href={`/sales/test-drives/${td.id}`}
                                                    className={`block text-xs p-1 rounded border mb-1 ${getStatusColor(td.status)}`}
                                                >
                                                    <div className="font-medium truncate">{td.scheduled_time}</div>
                                                    <div className="truncate">{td.customer_name}</div>
                                                </Link>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render Day View
    const renderDayView = () => {
        const dayTestDrives = getTestDrivesForDate(selectedDate);
        const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {timeSlots.map(hour => {
                                    const hourTestDrives = dayTestDrives.filter(td => {
                                        const tdHour = parseInt(td.scheduled_time.split(':')[0]);
                                        return tdHour === hour;
                                    });

                                    return (
                                        <div key={hour} className="flex border-b pb-2">
                                            <div className="w-20 text-sm text-muted-foreground pt-2">
                                                {hour}:00
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                {hourTestDrives.length > 0 ? (
                                                    hourTestDrives.map(td => (
                                                        <Link
                                                            key={td.id}
                                                            href={`/sales/test-drives/${td.id}`}
                                                            className={`block p-3 rounded-lg border ${getStatusColor(td.status)}`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center space-x-2">
                                                                    {getStatusIcon(td.status)}
                                                                    <span className="font-semibold">{td.scheduled_time}</span>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {td.duration_minutes} min
                                                                    </Badge>
                                                                </div>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {td.reservation_id}
                                                                </Badge>
                                                            </div>
                                                            <div className="space-y-1 text-sm">
                                                                <div className="flex items-center space-x-2">
                                                                    <User className="h-4 w-4" />
                                                                    <span className="font-medium">{td.customer_name}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Car className="h-4 w-4" />
                                                                    <span>{td.vehicle_details}</span>
                                                                </div>
                                                                {td.assigned_user && (
                                                                    <div className="flex items-center space-x-2 text-muted-foreground">
                                                                        <User className="h-3 w-3" />
                                                                        <span className="text-xs">{td.assigned_user.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <div className="text-sm text-muted-foreground italic py-2">
                                                        No reservations
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

                {/* Day Summary Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Day Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Reservations</p>
                                <p className="text-2xl font-bold">{dayTestDrives.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Confirmed</p>
                                <p className="text-lg font-semibold text-green-600">
                                    {dayTestDrives.filter(td => td.status === 'confirmed').length}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Pending Signature</p>
                                <p className="text-lg font-semibold text-yellow-600">
                                    {dayTestDrives.filter(td => td.status === 'pending_signature').length}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">In Progress</p>
                                <p className="text-lg font-semibold text-blue-600">
                                    {dayTestDrives.filter(td => td.status === 'in_progress').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/sales/test-drives/create">
                                <Button size="sm" className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Reservation
                                </Button>
                            </Link>
                            <Link href="/sales/test-drives">
                                <Button variant="outline" size="sm" className="w-full">
                                    <List className="h-4 w-4 mr-2" />
                                    List View
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Drive Calendar" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/test-drives">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Test Drive Calendar</h1>
                            <p className="text-muted-foreground">
                                {currentView === 'month' && getMonthName(selectedDate)}
                                {currentView === 'week' && `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                {currentView === 'day' && selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/sales/test-drives/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Reservation
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Calendar Controls */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (currentView === 'month') navigateMonth('prev');
                                        else if (currentView === 'week') navigateWeek('prev');
                                        else navigateDay('prev');
                                    }}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={goToToday}>
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (currentView === 'month') navigateMonth('next');
                                        else if (currentView === 'week') navigateWeek('next');
                                        else navigateDay('next');
                                    }}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Branch Filter (Admin Only) */}
                                {branches && branches.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <Select value={branchFilter} onValueChange={handleBranchFilter}>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="All Branches" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Branches</SelectItem>
                                                {branches.map((branch) => (
                                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                                        {branch.name} ({branch.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* View Mode Buttons */}
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant={currentView === 'month' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentView('month')}
                                    >
                                        Month
                                    </Button>
                                    <Button
                                        variant={currentView === 'week' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentView('week')}
                                    >
                                        Week
                                    </Button>
                                    <Button
                                        variant={currentView === 'day' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentView('day')}
                                    >
                                        Day
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar View */}
                {currentView === 'month' && renderMonthView()}
                {currentView === 'week' && renderWeekView()}
                {currentView === 'day' && renderDayView()}
            </div>
        </AppLayout>
    );
}
