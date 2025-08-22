import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    TrendingUp, 
    Save, 
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    DollarSign,
    Target,
    FileText,
    X,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    TrendingDown
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Pipeline',
        href: '/sales/pipeline',
    },
    {
        title: 'Edit Opportunity',
        href: '/sales/pipeline/1/edit',
    },
];

export default function PipelineEdit() {
    const mockPipelineEntry = {
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
        attachments: 1,
        customer_phone: '+1-555-0123',
        customer_email: 'john.smith@email.com',
        created_at: '2025-01-13 09:15:00'
    };

    const [selectedStage, setSelectedStage] = useState(mockPipelineEntry.current_stage);
    const [selectedProbability, setSelectedProbability] = useState(mockPipelineEntry.probability);
    const [selectedSalesRep, setSelectedSalesRep] = useState('1');

    const stages = [
        { value: 'lead', label: 'Lead', description: 'Initial lead capture', progress: 16 },
        { value: 'qualified', label: 'Qualified', description: 'Lead meets criteria', progress: 33 },
        { value: 'quote_sent', label: 'Quote Sent', description: 'Pricing provided', progress: 50 },
        { value: 'test_drive_scheduled', label: 'Test Drive Scheduled', description: 'Appointment booked', progress: 66 },
        { value: 'test_drive_completed', label: 'Test Drive Completed', description: 'Vehicle tested', progress: 83 },
        { value: 'reservation_made', label: 'Reservation Made', description: 'Purchase commitment', progress: 100 },
        { value: 'lost', label: 'Lost', description: 'Opportunity closed', progress: 0 },
    ];

    const salesReps = [
        { id: '1', name: 'Sarah Sales Rep', specialties: ['Honda', 'Toyota'], performance: 'High' },
        { id: '2', name: 'Mike Sales Rep', specialties: ['BMW', 'Mercedes'], performance: 'Medium' },
        { id: '3', name: 'Lisa Sales Rep', specialties: ['Hyundai', 'Kia'], performance: 'High' },
        { id: '4', name: 'Tom Sales Rep', specialties: ['Ford', 'Chevrolet'], performance: 'Medium' },
    ];

    const getStageBadge = (stage: string) => {
        const colors = {
            lead: 'bg-blue-100 text-blue-800',
            qualified: 'bg-green-100 text-green-800',
            quote_sent: 'bg-yellow-100 text-yellow-800',
            test_drive_scheduled: 'bg-purple-100 text-purple-800',
            test_drive_completed: 'bg-indigo-100 text-indigo-800',
            reservation_made: 'bg-green-100 text-green-800',
            lost: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{stage.replace('_', ' ')}</Badge>;
    };

    const getProbabilityBadge = (probability: number) => {
        if (probability >= 80) {
            return <Badge className="bg-green-100 text-green-800">High ({probability}%)</Badge>;
        } else if (probability >= 50) {
            return <Badge className="bg-yellow-100 text-yellow-800">Medium ({probability}%)</Badge>;
        } else if (probability > 0) {
            return <Badge className="bg-red-100 text-red-800">Low ({probability}%)</Badge>;
        } else {
            return <Badge className="bg-gray-100 text-gray-800">Lost (0%)</Badge>;
        }
    };

    const getStageProgress = (stage: string) => {
        const stageData = stages.find(s => s.value === stage);
        return stageData ? stageData.progress : 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Pipeline - ${mockPipelineEntry.lead_id}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/pipeline">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Pipeline
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Pipeline Opportunity</h1>
                            <p className="text-muted-foreground">Lead ID: {mockPipelineEntry.lead_id}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Opportunity Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2" />
                                    Opportunity Details
                                </CardTitle>
                                <CardDescription>
                                    Basic opportunity information and identification
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lead-id">Lead ID</Label>
                                        <Input 
                                            id="lead-id" 
                                            value={mockPipelineEntry.lead_id}
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="created-date">Created Date</Label>
                                        <Input 
                                            id="created-date" 
                                            value={mockPipelineEntry.created_at.split(' ')[0]}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-stage">Current Stage</Label>
                                        <Select value={selectedStage} onValueChange={setSelectedStage}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select stage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stages.map((stage) => (
                                                    <SelectItem key={stage.value} value={stage.value}>
                                                        <div>
                                                            <div className="font-medium">{stage.label}</div>
                                                            <div className="text-xs text-muted-foreground">{stage.description}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="probability">Win Probability (%)</Label>
                                        <Input 
                                            id="probability" 
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={selectedProbability}
                                            onChange={(e) => setSelectedProbability(parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Customer Information
                                </CardTitle>
                                <CardDescription>
                                    Customer contact and identification details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer-name">Customer Name</Label>
                                    <Input 
                                        id="customer-name" 
                                        defaultValue={mockPipelineEntry.customer_name}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer-phone">Phone Number</Label>
                                        <Input 
                                            id="customer-phone" 
                                            defaultValue={mockPipelineEntry.customer_phone}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer-email">Email Address</Label>
                                        <Input 
                                            id="customer-email" 
                                            type="email"
                                            defaultValue={mockPipelineEntry.customer_email}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle & Quote Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Target className="h-5 w-5 mr-2" />
                                    Vehicle & Quote Information
                                </CardTitle>
                                <CardDescription>
                                    Vehicle interest and pricing details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle-interest">Vehicle of Interest</Label>
                                    <Input 
                                        id="vehicle-interest" 
                                        defaultValue={mockPipelineEntry.vehicle_interest}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="quote-amount">Quote Amount ($)</Label>
                                        <Input 
                                            id="quote-amount" 
                                            type="number"
                                            defaultValue={mockPipelineEntry.quote_amount}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sales-rep">Assigned Sales Rep</Label>
                                        <Select value={selectedSalesRep} onValueChange={setSelectedSalesRep}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sales rep" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {salesReps.map((rep) => (
                                                    <SelectItem key={rep.id} value={rep.id}>
                                                        <div>
                                                            <div className="font-medium">{rep.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {rep.specialties.join(', ')} • {rep.performance} Performance
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Next Actions
                                </CardTitle>
                                <CardDescription>
                                    Planned follow-up actions and scheduling
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="next-action">Next Action</Label>
                                    <Input 
                                        id="next-action" 
                                        defaultValue={mockPipelineEntry.next_action}
                                        placeholder="Describe the next action to take"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="action-due-date">Due Date</Label>
                                        <Input 
                                            id="action-due-date" 
                                            type="date"
                                            defaultValue={mockPipelineEntry.next_action_due?.split(' ')[0]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="action-due-time">Due Time</Label>
                                        <Input 
                                            id="action-due-time" 
                                            type="time"
                                            defaultValue={mockPipelineEntry.next_action_due?.split(' ')[1]}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes & Comments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Notes & Comments
                                </CardTitle>
                                <CardDescription>
                                    Additional information and manual notes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Manual Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        placeholder="Add any additional notes, observations, or important details about this opportunity"
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Current Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Current Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Stage</p>
                                    {getStageBadge(selectedStage)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Win Probability</p>
                                    {getProbabilityBadge(selectedProbability)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Stage Progress</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ width: `${getStageProgress(selectedStage)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{getStageProgress(selectedStage)}% complete</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Time in Current Stage</p>
                                    <p className="text-sm font-medium">{mockPipelineEntry.stage_duration_hours}h</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Auto-Logged Events */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Auto-Logged Events</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Events</p>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {mockPipelineEntry.auto_logged_events.length} Events
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    {mockPipelineEntry.auto_logged_events.map((event, index) => (
                                        <div key={index} className="p-2 border rounded text-xs">
                                            <div className="font-medium">{event.event}</div>
                                            <div className="text-muted-foreground">{event.system}</div>
                                            <div className="text-muted-foreground">{event.timestamp}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stage Transition */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Stage Transition</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Previous Stage</p>
                                    {getStageBadge(mockPipelineEntry.previous_stage)}
                                </div>
                                <div className="flex items-center justify-center py-2">
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Current Stage</p>
                                    {getStageBadge(selectedStage)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Stage Entry</p>
                                    <p className="text-sm">{mockPipelineEntry.stage_entry_timestamp}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Customer
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Follow-up
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Generate Quote
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Manual Notes</span>
                                    <Badge variant="outline">{mockPipelineEntry.manual_notes}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Attachments</span>
                                    <Badge variant="outline">{mockPipelineEntry.attachments}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Auto Events</span>
                                    <Badge variant="outline">{mockPipelineEntry.auto_logged_events.length}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
