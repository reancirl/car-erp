import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Search, Filter, Download, Plus, Eye, Edit, ArrowRight, CheckCircle, Clock, DollarSign, User, Calendar, FileText } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

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

export default function Pipeline() {
    // Mock data for demonstration
    const mockPipelineEntries = [
        {
            id: 1,
            customer_name: 'John Smith',
            lead_id: 'LD-2025-001',
            current_stage: 'quote_sent',
            previous_stage: 'qualified',
            stage_entry_timestamp: '2025-01-13 14:30:00',
            stage_duration_hours: 5.5,
            sales_rep: 'Sarah Sales Rep',
            vehicle_interest: '2024 Honda Civic',
            quote_amount: 28500,
            probability: 78,
            next_action: 'Follow up on quote',
            next_action_due: '2025-01-14 10:00:00',
            auto_logged_events: [
                { event: 'Lead Created', timestamp: '2025-01-13 09:15:00', system: 'Lead Management' },
                { event: 'Lead Qualified', timestamp: '2025-01-13 09:45:00', system: 'CRM Auto-Scoring' },
                { event: 'Quote Generated', timestamp: '2025-01-13 14:30:00', system: 'Pricing Engine' }
            ],
            manual_notes: 2,
            attachments: 1
        },
        {
            id: 2,
            customer_name: 'Maria Rodriguez',
            lead_id: 'LD-2025-002',
            current_stage: 'test_drive_scheduled',
            previous_stage: 'quote_sent',
            stage_entry_timestamp: '2025-01-13 16:20:00',
            stage_duration_hours: 1.8,
            sales_rep: 'Mike Sales Rep',
            vehicle_interest: '2023 Toyota Camry',
            quote_amount: 23750,
            probability: 65,
            next_action: 'Conduct test drive',
            next_action_due: '2025-01-14 14:00:00',
            auto_logged_events: [
                { event: 'Lead Created', timestamp: '2025-01-12 16:45:00', system: 'Phone System' },
                { event: 'Quote Sent', timestamp: '2025-01-13 11:20:00', system: 'CRM' },
                { event: 'Test Drive Booked', timestamp: '2025-01-13 16:20:00', system: 'Reservation System' }
            ],
            manual_notes: 3,
            attachments: 0
        },
        {
            id: 3,
            customer_name: 'Robert Johnson',
            lead_id: 'LD-2025-003',
            current_stage: 'lost',
            previous_stage: 'contacted',
            stage_entry_timestamp: '2025-01-11 17:00:00',
            stage_duration_hours: 48.5,
            sales_rep: 'Lisa Sales Rep',
            vehicle_interest: '2024 BMW X3',
            quote_amount: 0,
            probability: 0,
            next_action: null,
            next_action_due: null,
            auto_logged_events: [
                { event: 'Lead Created', timestamp: '2025-01-11 13:30:00', system: 'Walk-in System' },
                { event: 'Initial Contact', timestamp: '2025-01-11 13:30:00', system: 'CRM' },
                { event: 'Lead Marked Lost', timestamp: '2025-01-11 17:00:00', system: 'CRM Auto-Rules' }
            ],
            manual_notes: 1,
            attachments: 0
        },
        {
            id: 4,
            customer_name: 'Emily Davis',
            lead_id: 'LD-2025-004',
            current_stage: 'reservation_made',
            previous_stage: 'test_drive_completed',
            stage_entry_timestamp: '2025-01-13 17:30:00',
            stage_duration_hours: 0.5,
            sales_rep: 'Tom Sales Rep',
            vehicle_interest: '2024 Hyundai Elantra',
            quote_amount: 21200,
            probability: 89,
            next_action: 'Prepare delivery paperwork',
            next_action_due: '2025-01-15 09:00:00',
            auto_logged_events: [
                { event: 'Lead Created', timestamp: '2025-01-13 11:00:00', system: 'Web Form' },
                { event: 'Test Drive Completed', timestamp: '2025-01-13 16:45:00', system: 'GPS Tracking' },
                { event: 'Reservation Created', timestamp: '2025-01-13 17:30:00', system: 'Sales System' }
            ],
            manual_notes: 4,
            attachments: 2
        }
    ];

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
                        <Button variant="outline" size="sm">
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
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">Active opportunities</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Auto-Logged Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">This week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Stage Duration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">14h</div>
                            <p className="text-xs text-muted-foreground">Per stage</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$73,450</div>
                            <p className="text-xs text-muted-foreground">Total potential</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Auto-log every step from lead → quote → reservation → walk-in in CRM</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by customer name, lead ID, or vehicle..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Stage" />
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
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Sales Rep" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Reps</SelectItem>
                                    <SelectItem value="sarah">Sarah Sales Rep</SelectItem>
                                    <SelectItem value="mike">Mike Sales Rep</SelectItem>
                                    <SelectItem value="lisa">Lisa Sales Rep</SelectItem>
                                    <SelectItem value="tom">Tom Sales Rep</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Probability" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Probabilities</SelectItem>
                                    <SelectItem value="high">High (80%+)</SelectItem>
                                    <SelectItem value="medium">Medium (50-79%)</SelectItem>
                                    <SelectItem value="low">Low (&lt;50%)</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
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
                                {mockPipelineEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{entry.customer_name}</div>
                                                <div className="text-xs text-muted-foreground">{entry.lead_id}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    In stage: {entry.stage_duration_hours}h
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {getStageBadge(entry.current_stage)}
                                                {entry.previous_stage && (
                                                    <div className="flex items-center space-x-1 mt-1">
                                                        <span className="text-xs text-muted-foreground">From:</span>
                                                        {getStageBadge(entry.previous_stage)}
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {entry.stage_entry_timestamp}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-full">
                                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full" 
                                                        style={{ width: `${getStageProgress(entry.current_stage)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {Math.round(getStageProgress(entry.current_stage))}% complete
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{entry.vehicle_interest}</div>
                                                {entry.quote_amount > 0 && (
                                                    <div className="flex items-center space-x-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        <span className="text-sm font-medium">${entry.quote_amount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getProbabilityBadge(entry.probability)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <User className="h-3 w-3" />
                                                <span className="text-sm">{entry.sales_rep}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {entry.next_action ? (
                                                <div>
                                                    <div className="text-sm font-medium">{entry.next_action}</div>
                                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{entry.next_action_due}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-100 text-gray-800">No Action</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                    {entry.auto_logged_events.length} Events
                                                </Badge>
                                                {entry.manual_notes > 0 && (
                                                    <div className="flex items-center space-x-1 mt-1">
                                                        <FileText className="h-3 w-3" />
                                                        <span className="text-xs">{entry.manual_notes} notes</span>
                                                    </div>
                                                )}
                                                {entry.attachments > 0 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {entry.attachments} attachments
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Link href={`/sales/pipeline/${entry.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/sales/pipeline/${entry.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
                                <div className="text-2xl font-bold">4</div>
                                <p className="text-xs text-muted-foreground">Events logged today</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium">Quote System</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Tracks quote generation, updates, and acceptance</p>
                                <div className="text-2xl font-bold">3</div>
                                <p className="text-xs text-muted-foreground">Quotes generated</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-purple-600" />
                                    <h4 className="font-medium">Reservation System</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Auto-logs test drives, reservations, and walk-ins</p>
                                <div className="text-2xl font-bold">5</div>
                                <p className="text-xs text-muted-foreground">Activities tracked</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stage Transition Rules */}
                <Card>
                    <CardHeader>
                        <CardTitle>Stage Transition Rules</CardTitle>
                        <CardDescription>Automated rules for moving opportunities through the pipeline</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Lead → Qualified</div>
                                    <div className="text-sm text-muted-foreground">Auto-advance when lead score ≥ 70</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Qualified → Quote Sent</div>
                                    <div className="text-sm text-muted-foreground">Auto-advance when quote is generated</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Test Drive → Reservation</div>
                                    <div className="text-sm text-muted-foreground">Auto-advance when reservation is created</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Auto-Loss Detection</div>
                                    <div className="text-sm text-muted-foreground">Mark as lost after 7 days of inactivity</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="bg-orange-100 text-orange-800">Monitoring</Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
