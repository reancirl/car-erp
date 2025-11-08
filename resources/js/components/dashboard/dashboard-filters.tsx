import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Filter, RefreshCw, TestTube } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Branch {
    id: number;
    name: string;
    code?: string | null;
}

interface DashboardFiltersProps {
    filters: {
        date_range: string;
        branch_id: number | null;
        start_date: string | null;
        end_date: string | null;
        current_start: string;
        current_end: string;
        use_test_data: boolean;
    };
    branches: Branch[];
    canSelectBranch?: boolean;
    lockedBranchId?: number | null;
    lockedBranchName?: string | null;
}

export function DashboardFilters({
    filters,
    branches,
    canSelectBranch = true,
    lockedBranchId = null,
    lockedBranchName,
}: DashboardFiltersProps) {
    const lockedBranchValue = lockedBranchId !== null ? lockedBranchId.toString() : 'all';
    const [dateRange, setDateRange] = useState(filters.date_range);
    const [branchId, setBranchId] = useState<string>(
        canSelectBranch ? filters.branch_id?.toString() || 'all' : lockedBranchValue
    );
    const [startDate, setStartDate] = useState<Date | undefined>(
        filters.start_date ? new Date(filters.start_date) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        filters.end_date ? new Date(filters.end_date) : undefined
    );
    const [useTestData, setUseTestData] = useState(filters.use_test_data || false);

    useEffect(() => {
        setBranchId(canSelectBranch ? filters.branch_id?.toString() || 'all' : lockedBranchValue);
    }, [filters.branch_id, canSelectBranch, lockedBranchValue]);

    const resolveBranchValue = () => (canSelectBranch ? branchId : lockedBranchValue);
    const resolveBranchParam = () => {
        const value = resolveBranchValue();
        return value === 'all' ? null : Number(value);
    };

    const handleApplyFilters = () => {
        const branchValue = resolveBranchParam();
        router.get(
            '/dashboard',
            {
                date_range: dateRange,
                branch_id: branchValue,
                start_date: dateRange === 'custom' && startDate ? format(startDate, 'yyyy-MM-dd') : null,
                end_date: dateRange === 'custom' && endDate ? format(endDate, 'yyyy-MM-dd') : null,
                use_test_data: useTestData,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setDateRange('30_days');
        setBranchId(canSelectBranch ? 'all' : lockedBranchValue);
        setStartDate(undefined);
        setEndDate(undefined);
        setUseTestData(false);

        const branchValue = canSelectBranch ? null : resolveBranchParam();
        router.get(
            '/dashboard',
            branchValue !== null ? { branch_id: branchValue } : {},
            { preserveState: false }
        );
    };

    const handleTestDataToggle = (checked: boolean) => {
        setUseTestData(checked);
        const branchValue = resolveBranchParam();
        router.get(
            '/dashboard',
            {
                date_range: dateRange,
                branch_id: branchValue,
                start_date: dateRange === 'custom' && startDate ? format(startDate, 'yyyy-MM-dd') : null,
                end_date: dateRange === 'custom' && endDate ? format(endDate, 'yyyy-MM-dd') : null,
                use_test_data: checked,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Filters</h3>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex-1 min-w-[200px]">
                        <Label htmlFor="date-range" className="text-sm font-medium">
                            Time Period
                        </Label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger id="date-range" className="bg-white">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="7_days">Last 7 Days</SelectItem>
                                <SelectItem value="30_days">Last 30 Days</SelectItem>
                                <SelectItem value="90_days">Last 90 Days</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Date Range */}
                    {dateRange === 'custom' && (
                        <>
                            <div className="flex-1 min-w-[180px]">
                                <Label className="text-sm font-medium">Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal bg-white',
                                                !startDate && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <Label className="text-sm font-medium">End Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal bg-white',
                                                !endDate && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </>
                    )}

                    {/* Branch Selector */}
                    {canSelectBranch ? (
                        <div className="flex-1 min-w-[200px]">
                            <Label htmlFor="branch" className="text-sm font-medium">
                                Branch
                            </Label>
                            <Select value={branchId} onValueChange={setBranchId}>
                                <SelectTrigger id="branch" className="bg-white">
                                    <SelectValue placeholder="All Branches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Branches</SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id.toString()}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="flex-1 min-w-[200px]">
                            <Label className="text-sm font-medium">Branch</Label>
                            <div className="mt-2 rounded-lg border bg-muted/40 px-3 py-2">
                                <p className="text-sm font-semibold">
                                    {lockedBranchName ?? 'Assigned Branch'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Access limited to your branch.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Test Data Toggle */}
                    <div className="flex items-center gap-3 min-w-[180px] px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <TestTube className="h-5 w-5 text-amber-600" />
                        <div className="flex-1">
                            <Label htmlFor="test-data-toggle" className="text-sm font-medium cursor-pointer">
                                Test Data Mode
                            </Label>
                        </div>
                        <Switch
                            id="test-data-toggle"
                            checked={useTestData}
                            onCheckedChange={handleTestDataToggle}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700">
                            <Filter className="mr-2 h-4 w-4" />
                            Apply
                        </Button>
                        <Button onClick={handleReset} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Current Filter Display */}
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Showing data:</span>
                    <span>
                        {format(new Date(filters.current_start), 'MMM d, yyyy')} -{' '}
                        {format(new Date(filters.current_end), 'MMM d, yyyy')}
                    </span>
                    {filters.branch_id && (
                        <>
                            <span>•</span>
                            <span>
                                Branch:{' '}
                                {branches.find((b) => b.id === filters.branch_id)?.name || 'Unknown'}
                            </span>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
