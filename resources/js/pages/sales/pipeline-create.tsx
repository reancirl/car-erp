import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft, 
    Plus, 
    TrendingUp,
    User,
    Car,
    DollarSign,
    Target,
    Calendar,
    FileText,
    AlertTriangle,
    CheckCircle,
    Activity,
    Clock,
    Zap
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
        title: 'Create Opportunity',
        href: '/sales/pipeline/create',
    },
];

export default function PipelineCreate() {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        lead_source: '',
        sales_rep: '',
        vehicle_interest: '',
        vehicle_year: '',
        vehicle_make: '',
        vehicle_model: '',
        quote_amount: '',
        probability: 50,
        current_stage: 'lead',
        next_action: '',
        next_action_due: '',
        notes: '',
        priority: 'medium',
        auto_progression: true,
        auto_loss_rule: true,
        follow_up_frequency: 'weekly'
    });

    const [leadScore, setLeadScore] = useState(0);

    const calculateLeadScore = () => {
        let score = 0;
        
        // Basic contact info
        if (formData.customer_name) score += 10;
        if (formData.customer_phone) score += 15;
        if (formData.customer_email) score += 15;
        
        // Lead quality indicators
        if (formData.lead_source === 'referral') score += 20;
        else if (formData.lead_source === 'website') score += 15;
        else if (formData.lead_source === 'walk_in') score += 10;
        
        // Vehicle interest specificity
        if (formData.vehicle_make && formData.vehicle_model) score += 15;
        if (formData.quote_amount && parseInt(formData.quote_amount) > 0) score += 20;
        
        // Priority and engagement
        if (formData.priority === 'high') score += 10;
        if (formData.next_action) score += 5;
        
        setLeadScore(Math.min(score, 100));
        return Math.min(score, 100);
    };

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Recalculate lead score when relevant fields change
        setTimeout(calculateLeadScore, 100);
    };

    const getScoreBadge = (score: number) => {
        if (score >= 80) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Excellent ({score}/100)</Badge>;
        } else if (score >= 60) {
            return <Badge variant="outline" className="bg-blue-100 text-blue-800">Good ({score}/100)</Badge>;
        } else if (score >= 40) {
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Fair ({score}/100)</Badge>;
        } else {
            return <Badge variant="outline" className="bg-red-100 text-red-800">Poor ({score}/100)</Badge>;
        }
    };

    const getStageBadge = (stage: string) => {
        switch (stage) {
            case 'lead':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Lead</Badge>;
            case 'qualified':
                return <Badge variant="outline" className="bg-green-100 text-green-800">Qualified</Badge>;
            case 'quote_sent':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Quote Sent</Badge>;
            default:
                return <Badge variant="secondary">{stage}</Badge>;
        }
    };

    const mockSalesReps = [
        'Sarah Sales Rep',
        'Mike Johnson',
        'Jennifer Davis',
        'Robert Wilson',
        'Lisa Anderson'
    ];

    const mockVehicles = [
        { year: '2024', make: 'Honda', model: 'Civic', price: 28500 },
        { year: '2024', make: 'Honda', model: 'Accord', price: 32500 },
        { year: '2024', make: 'Toyota', model: 'Camry', price: 30000 },
        { year: '2024', make: 'Toyota', model: 'Corolla', price: 25000 },
        { year: '2023', make: 'Ford', model: 'F-150', price: 45000 },
        { year: '2024', make: 'Nissan', model: 'Altima', price: 29000 }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Pipeline Opportunity" />
            
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
                            <h1 className="text-2xl font-bold">Create New Pipeline Opportunity</h1>
                            <p className="text-muted-foreground">Add a new opportunity to the sales pipeline</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Opportunity
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Customer Information
                                </CardTitle>
                                <CardDescription>
                                    Basic contact details and lead source information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_name">Customer Name *</Label>
                                        <Input
                                            id="customer_name"
                                            value={formData.customer_name}
                                            onChange={(e) => handleInputChange('customer_name', e.target.value)}
                                            placeholder="Enter customer name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_phone">Phone Number *</Label>
                                        <Input
                                            id="customer_phone"
                                            value={formData.customer_phone}
                                            onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                                            placeholder="+1-555-0123"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_email">Email Address</Label>
                                        <Input
                                            id="customer_email"
                                            type="email"
                                            value={formData.customer_email}
                                            onChange={(e) => handleInputChange('customer_email', e.target.value)}
                                            placeholder="customer@email.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lead_source">Lead Source</Label>
                                        <Select value={formData.lead_source} onValueChange={(value) => handleInputChange('lead_source', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select lead source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="website">Website</SelectItem>
                                                <SelectItem value="referral">Referral</SelectItem>
                                                <SelectItem value="walk_in">Walk-in</SelectItem>
                                                <SelectItem value="phone_call">Phone Call</SelectItem>
                                                <SelectItem value="social_media">Social Media</SelectItem>
                                                <SelectItem value="advertising">Advertising</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Interest */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Car className="h-5 w-5 mr-2" />
                                    Vehicle Interest
                                </CardTitle>
                                <CardDescription>
                                    Specific vehicle the customer is interested in
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle_year">Year</Label>
                                        <Select value={formData.vehicle_year} onValueChange={(value) => handleInputChange('vehicle_year', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2024">2024</SelectItem>
                                                <SelectItem value="2023">2023</SelectItem>
                                                <SelectItem value="2022">2022</SelectItem>
                                                <SelectItem value="2021">2021</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle_make">Make</Label>
                                        <Select value={formData.vehicle_make} onValueChange={(value) => handleInputChange('vehicle_make', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Make" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Honda">Honda</SelectItem>
                                                <SelectItem value="Toyota">Toyota</SelectItem>
                                                <SelectItem value="Ford">Ford</SelectItem>
                                                <SelectItem value="Nissan">Nissan</SelectItem>
                                                <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle_model">Model</Label>
                                        <Select value={formData.vehicle_model} onValueChange={(value) => handleInputChange('vehicle_model', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Model" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mockVehicles
                                                    .filter(v => !formData.vehicle_make || v.make === formData.vehicle_make)
                                                    .map((vehicle, index) => (
                                                        <SelectItem key={index} value={vehicle.model}>
                                                            {vehicle.model}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_interest">Full Vehicle Description</Label>
                                    <Input
                                        id="vehicle_interest"
                                        value={formData.vehicle_interest}
                                        onChange={(e) => handleInputChange('vehicle_interest', e.target.value)}
                                        placeholder="e.g., 2024 Honda Civic LX"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Opportunity Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2" />
                                    Opportunity Details
                                </CardTitle>
                                <CardDescription>
                                    Sales pipeline stage and probability information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_stage">Initial Stage</Label>
                                        <Select value={formData.current_stage} onValueChange={(value) => handleInputChange('current_stage', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select stage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lead">Lead</SelectItem>
                                                <SelectItem value="qualified">Qualified</SelectItem>
                                                <SelectItem value="quote_sent">Quote Sent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sales_rep">Sales Representative</Label>
                                        <Select value={formData.sales_rep} onValueChange={(value) => handleInputChange('sales_rep', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Assign sales rep" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mockSalesReps.map((rep, index) => (
                                                    <SelectItem key={index} value={rep}>
                                                        {rep}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="quote_amount">Quote Amount ($)</Label>
                                        <Input
                                            id="quote_amount"
                                            type="number"
                                            value={formData.quote_amount}
                                            onChange={(e) => handleInputChange('quote_amount', e.target.value)}
                                            placeholder="28500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="probability">Probability (%)</Label>
                                        <Input
                                            id="probability"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.probability}
                                            onChange={(e) => handleInputChange('probability', parseInt(e.target.value) || 0)}
                                            placeholder="50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority Level</Label>
                                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="high">High Priority</SelectItem>
                                            <SelectItem value="medium">Medium Priority</SelectItem>
                                            <SelectItem value="low">Low Priority</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    Schedule follow-up actions and deadlines
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="next_action">Next Action</Label>
                                        <Input
                                            id="next_action"
                                            value={formData.next_action}
                                            onChange={(e) => handleInputChange('next_action', e.target.value)}
                                            placeholder="e.g., Follow up on quote"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="next_action_due">Due Date</Label>
                                        <Input
                                            id="next_action_due"
                                            type="datetime-local"
                                            value={formData.next_action_due}
                                            onChange={(e) => handleInputChange('next_action_due', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="follow_up_frequency">Follow-up Frequency</Label>
                                    <Select value={formData.follow_up_frequency} onValueChange={(value) => handleInputChange('follow_up_frequency', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Notes & Comments
                                </CardTitle>
                                <CardDescription>
                                    Additional information about this opportunity
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Add any relevant notes or comments about this opportunity..."
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Lead Score Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <Target className="h-4 w-4 mr-2" />
                                    Lead Score Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-center">
                                    <div className="text-3xl font-bold mb-2">{leadScore}</div>
                                    {getScoreBadge(leadScore)}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                        style={{ width: `${leadScore}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div className="flex justify-between">
                                        <span>Contact Info</span>
                                        <span>{(formData.customer_name ? 10 : 0) + (formData.customer_phone ? 15 : 0) + (formData.customer_email ? 15 : 0)}/40</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Lead Quality</span>
                                        <span>{formData.lead_source === 'referral' ? 20 : formData.lead_source === 'website' ? 15 : formData.lead_source === 'walk_in' ? 10 : 0}/20</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Vehicle Interest</span>
                                        <span>{(formData.vehicle_make && formData.vehicle_model ? 15 : 0) + (formData.quote_amount && parseInt(formData.quote_amount) > 0 ? 20 : 0)}/35</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Auto-Assignment Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Auto-Assignment Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">Stage Assignment</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getStageBadge(formData.current_stage)}
                                        <span className="text-xs text-muted-foreground">
                                            {formData.current_stage === 'lead' ? 'Initial entry point' :
                                             formData.current_stage === 'qualified' ? 'Auto-qualified based on score' :
                                             'Quote stage ready'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <User className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">Sales Rep</span>
                                    </div>
                                    <p className="text-sm">{formData.sales_rep || 'Auto-assign based on availability'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Automation Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <Zap className="h-4 w-4 mr-2" />
                                    Automation Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="auto_progression"
                                        checked={formData.auto_progression}
                                        onCheckedChange={(checked) => handleInputChange('auto_progression', checked === true)}
                                    />
                                    <Label htmlFor="auto_progression" className="text-sm">
                                        Enable auto-progression
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="auto_loss_rule"
                                        checked={formData.auto_loss_rule}
                                        onCheckedChange={(checked) => handleInputChange('auto_loss_rule', checked === true)}
                                    />
                                    <Label htmlFor="auto_loss_rule" className="text-sm">
                                        Apply auto-loss rules
                                    </Label>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>• Auto-progression: Moves to next stage based on triggers</p>
                                    <p>• Auto-loss: Marks lost after 7 days inactivity</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pipeline Rules */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Pipeline Rules</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-2 border rounded text-xs">
                                    <div className="font-medium flex items-center">
                                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                        Auto-Qualification
                                    </div>
                                    <div className="text-muted-foreground">Score ≥70 auto-qualifies lead</div>
                                </div>
                                <div className="p-2 border rounded text-xs">
                                    <div className="font-medium flex items-center">
                                        <Clock className="h-3 w-3 mr-1 text-blue-600" />
                                        Follow-up Reminders
                                    </div>
                                    <div className="text-muted-foreground">Based on selected frequency</div>
                                </div>
                                <div className="p-2 border rounded text-xs">
                                    <div className="font-medium flex items-center">
                                        <AlertTriangle className="h-3 w-3 mr-1 text-orange-600" />
                                        Inactivity Alert
                                    </div>
                                    <div className="text-muted-foreground">Alert after 3 days no activity</div>
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
                                    <FileText className="h-4 w-4 mr-2" />
                                    Import from Lead
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <User className="h-4 w-4 mr-2" />
                                    Check Existing Customer
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Car className="h-4 w-4 mr-2" />
                                    Vehicle Availability
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Generate Quote
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
