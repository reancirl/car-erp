import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Search, Filter, Download, Plus, Eye, Edit, ArrowRight, CheckCircle, Clock, DollarSign, User, Calendar, FileText, Trash2, AlertTriangle, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState, FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Pipeline Auto-Logging',
        href: '/sales/pipeline',
    },
];

interface Pipeline {
    id: number;
    pipeline_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    current_stage: string;
    previous_stage: string | null;
    stage_entry_timestamp: string | null;
    stage_duration_hours: number | null;
    sales_rep_id: number | null;
    vehicle_interest: string | null;
    quote_amount: number | null;
    probability: number;
    priority: string;
    next_action: string | null;
    next_action_due: string | null;
    auto_logged_events_count: number;
    manual_notes_count: number;
    attachments_count: number;
    created_at: string;
    branch: {
        id: number;
        name: string;
        code: string;
    };
    sales_rep: {
        id: number;
        name: string;
    } | null;
    lead: {
        id: number;
        lead_id: string;
        name: string;
    } | null;
}

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface SalesRep {
    id: number;
    name: string;
}

interface Stats {
    active_pipeline: number;
    auto_logged_events: number;
    avg_stage_duration: number;
    pipeline_value: number;
}

interface AutoLoggingStats {
    lead_events_today: number;
    quotes_generated: number;
    activities_tracked: number;
}

interface Props {
    pipelines: {
        data: Pipeline[];
        links: any;
        meta: any;
    };
    stats: Stats;
    autoLoggingStats: AutoLoggingStats;
    filters: {
        search?: string;
        current_stage?: string;
        priority?: string;
        sales_rep_id?: number;
        branch_id?: number;
        probability?: string;
    };
    branches: Branch[] | null;
    salesReps: SalesRep[];
}

export default function Pipeline({ pipelines, stats, autoLoggingStats, filters, branches, salesReps }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [currentStage, setCurrentStage] = useState(filters.current_stage || 'all');
    const [priority, setPriority] = useState(filters.priority || 'all');
    const [salesRepId, setSalesRepId] = useState<string>(filters.sales_rep_id?.toString() || 'all');
    const [branchId, setBranchId] = useState<string>(filters.branch_id?.toString() || 'all');
    const [probabilityFilter, setProbabilityFilter] = useState(filters.probability || 'all');
    const [isRulesExpanded, setIsRulesExpanded] = useState(false);

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get('/sales/pipeline', {
            search: search || undefined,
            current_stage: currentStage !== 'all' ? currentStage : undefined,
            priority: priority !== 'all' ? priority : undefined,
            sales_rep_id: salesRepId !== 'all' ? salesRepId : undefined,
            branch_id: branchId !== 'all' ? branchId : undefined,
            probability: probabilityFilter !== 'all' ? probabilityFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (pipeline: Pipeline) => {
        if (confirm(`Are you sure you want to delete pipeline ${pipeline.pipeline_id}?`)) {
            router.delete(`/sales/pipeline/${pipeline.id}`);
        }
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (currentStage !== 'all') params.append('current_stage', currentStage);
        if (priority !== 'all') params.append('priority', priority);
        if (salesRepId !== 'all') params.append('sales_rep_id', salesRepId);
        if (branchId !== 'all') params.append('branch_id', branchId);
        if (probabilityFilter !== 'all') params.append('probability', probabilityFilter);
        
        window.location.href = `/sales/pipeline-export?${params.toString()}`;
    };

    const handleAutoLossDetection = () => {
        if (confirm('This will mark all pipelines inactive for 7+ days as lost. Continue?')) {
            router.post('/sales/pipeline-auto-loss-detection');
        }
    };

    const getStageBadge = (stage: string) => {
        switch (stage) {
            case 'lead':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Lead
                    </Badge>
                );
            case 'qualified':
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                        Qualified
                    </Badge>
                );
            case 'quote_sent':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Quote Sent
                    </Badge>
                );
            case 'test_drive_scheduled':
                return (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        Test Drive Scheduled
                    </Badge>
                );
            case 'test_drive_completed':
                return (
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                        Test Drive Completed
                    </Badge>
                );
            case 'reservation_made':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Reservation Made
                    </Badge>
                );
            case 'lost':
                return (
                    <Badge variant="destructive">
                        Lost
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{stage}</Badge>;
        }
    };

    const getProbabilityBadge = (probability: number) => {
        if (probability >= 80) {
            return <Badge variant="default" className="bg-green-100 text-green-800">High ({probability}%)</Badge>;
        } else if (probability >= 50) {
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium ({probability}%)</Badge>;
        } else if (probability > 0) {
            return <Badge variant="outline" className="bg-red-100 text-red-800">Low ({probability}%)</Badge>;
        } else {
            return <Badge variant="outline" className="bg-gray-100 text-gray-800">Lost (0%)</Badge>;
        }
    };

    const getStageProgress = (stage: string) => {
        const stages = ['lead', 'qualified', 'quote_sent', 'test_drive_scheduled', 'test_drive_completed', 'reservation_made'];
        const currentIndex = stages.indexOf(stage);
        if (currentIndex === -1) return 0;
        return ((currentIndex + 1) / stages.length) * 100;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pipeline Auto-Logging" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <TrendingUp className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Pipeline Auto-Logging</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Pipeline
                        </Button>
                        <Link href="/sales/pipeline/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Manual Entry
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Pipeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_pipeline}</div>
                            <p className="text-xs text-muted-foreground">Active opportunities</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Auto-Logged Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.auto_logged_events}</div>
                            <p className="text-xs text-muted-foreground">Total events</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Stage Duration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avg_stage_duration}h</div>
                            <p className="text-xs text-muted-foreground">Per stage</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{stats.pipeline_value?.toLocaleString('en-PH') || 0}</div>
                            <p className="text-xs text-muted-foreground">Total potential</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stage Transition Rules */}
                <Card>
                    <CardHeader className="cursor-pointer" onClick={() => setIsRulesExpanded(!isRulesExpanded)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Stage Transition Rules</CardTitle>
                                <CardDescription>Automated rules for moving opportunities through the pipeline</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                                {isRulesExpanded ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    {isRulesExpanded && (
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                                <div className="flex-1">
                                    <div className="font-semibold">Lead → Qualified</div>
                                    <div className="text-sm text-muted-foreground">Auto-advance when lead score ≥ 70</div>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                                <div className="flex-1">
                                    <div className="font-semibold">Qualified → Quote Sent</div>
                                    <div className="text-sm text-muted-foreground">Auto-advance when quote is generated</div>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                                <div className="flex-1">
                                    <div className="font-semibold">Test Drive → Reservation</div>
                                    <div className="text-sm text-muted-foreground">Auto-advance when reservation is created</div>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                                <div className="flex-1">
                                    <div className="font-semibold flex items-center space-x-2">
                                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        <span>Auto-Loss Detection</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">Mark as lost after 7 days of inactivity</div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleAutoLossDetection}
                                    className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Run Now
                                </Button>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Auto-log every step from lead → quote → reservation → walk-in in CRM</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by customer name, pipeline ID, or vehicle..." 
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {branches && (
                                <Select value={branchId} onValueChange={setBranchId}>
                                    <SelectTrigger className="w-full md:w-[180px]">
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
                            )}
                            
                            <Select value={currentStage} onValueChange={setCurrentStage}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="All Stages" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stages</SelectItem>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                    <SelectItem value="quote_sent">Quote Sent</SelectItem>
                                    <SelectItem value="test_drive_scheduled">Test Drive Scheduled</SelectItem>
                                    <SelectItem value="test_drive_completed">Test Drive Completed</SelectItem>
                                    <SelectItem value="reservation_made">Reservation Made</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={salesRepId} onValueChange={setSalesRepId}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="All Sales Reps" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sales Reps</SelectItem>
                                    {salesReps.map((rep) => (
                                        <SelectItem key={rep.id} value={rep.id.toString()}>
                                            {rep.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            <Select value={probabilityFilter} onValueChange={setProbabilityFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="All Probabilities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Probabilities</SelectItem>
                                    <SelectItem value="high">High (80%+)</SelectItem>
                                    <SelectItem value="medium">Medium (50-79%)</SelectItem>
                                    <SelectItem value="low">Low (&lt;50%)</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Button type="submit">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Pipeline Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Pipeline</CardTitle>
                        <CardDescription>Automated stage progression tracking with system event logging</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer & Lead</TableHead>
                                    <TableHead>Current Stage</TableHead>
                                    <TableHead>Stage Progress</TableHead>
                                    <TableHead>Vehicle & Quote</TableHead>
                                    <TableHead>Probability</TableHead>
                                    <TableHead>Sales Rep</TableHead>
                                    <TableHead>Next Action</TableHead>
                                    <TableHead>Auto-Events</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pipelines.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12">
                                            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-medium mb-2">No pipeline opportunities yet</h3>
                                            <p className="text-muted-foreground mb-4">Get started by creating your first pipeline entry</p>
                                            <Link href="/sales/pipeline/create">
                                                <Button>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Manual Entry
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pipelines.data.map((pipeline) => (
                                        <TableRow key={pipeline.id}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-medium">{pipeline.customer_name}</div>
                                                    <div className="text-xs text-muted-foreground">{pipeline.pipeline_id}</div>
                                                    {pipeline.lead && (
                                                        <div className="text-xs text-muted-foreground">Lead: {pipeline.lead.lead_id}</div>
                                                    )}
                                                    <div className="text-xs text-muted-foreground">
                                                        In stage: {pipeline.stage_duration_hours || 0}h
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    {getStageBadge(pipeline.current_stage)}
                                                    {pipeline.previous_stage && (
                                                        <div className="flex items-center space-x-1 mt-1">
                                                            <span className="text-xs text-muted-foreground">From:</span>
                                                            {getStageBadge(pipeline.previous_stage)}
                                                        </div>
                                                    )}
                                                    {pipeline.stage_entry_timestamp && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {new Date(pipeline.stage_entry_timestamp).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-full">
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full" 
                                                            style={{ width: `${getStageProgress(pipeline.current_stage)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {Math.round(getStageProgress(pipeline.current_stage))}% complete
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{pipeline.vehicle_interest || 'Not specified'}</div>
                                                    {pipeline.quote_amount && pipeline.quote_amount > 0 && (
                                                        <div className="flex items-center space-x-1">
                                                            <DollarSign className="h-3 w-3" />
                                                            <span className="text-sm font-medium">₱{pipeline.quote_amount.toLocaleString('en-PH')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getProbabilityBadge(pipeline.probability)}</TableCell>
                                            <TableCell>
                                                {pipeline.sales_rep ? (
                                                    <div className="flex items-center space-x-1">
                                                        <User className="h-3 w-3" />
                                                        <span className="text-sm">{pipeline.sales_rep.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {pipeline.next_action ? (
                                                    <div>
                                                        <div className="text-sm font-medium">{pipeline.next_action}</div>
                                                        {pipeline.next_action_due && (
                                                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{new Date(pipeline.next_action_due).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">No Action</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                        {pipeline.auto_logged_events_count} Events
                                                    </Badge>
                                                    {pipeline.manual_notes_count > 0 && (
                                                        <div className="flex items-center space-x-1 mt-1">
                                                            <FileText className="h-3 w-3" />
                                                            <span className="text-xs">{pipeline.manual_notes_count} notes</span>
                                                        </div>
                                                    )}
                                                    {pipeline.attachments_count > 0 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {pipeline.attachments_count} attachments
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Link href={`/sales/pipeline/${pipeline.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/sales/pipeline/${pipeline.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(pipeline)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Auto-Logging Systems */}
                <Card>
                    <CardHeader>
                        <CardTitle>Auto-Logging Systems</CardTitle>
                        <CardDescription>Integrated systems automatically tracking pipeline progression</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-medium">Lead Management</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Auto-logs lead creation, qualification, and scoring</p>
                                <div className="text-2xl font-bold">{autoLoggingStats.lead_events_today}</div>
                                <p className="text-xs text-muted-foreground">Events logged today</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium">Quote System</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Tracks quote generation, updates, and acceptance</p>
                                <div className="text-2xl font-bold">{autoLoggingStats.quotes_generated}</div>
                                <p className="text-xs text-muted-foreground">Quotes generated</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-purple-600" />
                                    <h4 className="font-medium">Reservation System</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Auto-logs test drives, reservations, and walk-ins</p>
                                <div className="text-2xl font-bold">{autoLoggingStats.activities_tracked}</div>
                                <p className="text-xs text-muted-foreground">Activities tracked</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {pipelines.meta && pipelines.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {pipelines.meta.from} to {pipelines.meta.to} of {pipelines.meta.total} opportunities
                        </div>
                        <div className="flex space-x-2">
                            {pipelines.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
