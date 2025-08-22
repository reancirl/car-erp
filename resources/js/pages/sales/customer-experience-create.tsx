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
    MessageSquare,
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    Star,
    FileText,
    CheckCircle,
    AlertTriangle,
    Activity,
    Link as LinkIcon,
    Send,
    Settings,
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
        title: 'Customer Experience',
        href: '/sales/customer-experience',
    },
    {
        title: 'Create Survey',
        href: '/sales/customer-experience/create',
    },
];

export default function CustomerExperienceCreate() {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        survey_type: '',
        trigger_event: '',
        dispatch_method: 'email',
        survey_link: '',
        link_expires_days: 7,
        sales_rep: '',
        vehicle: '',
        follow_up_required: false,
        follow_up_due: '',
        priority: 'medium',
        assigned_to: 'Customer Service',
        auto_resend: true,
        reminder_frequency: 'daily',
        auto_dispatch: true,
        dispatch_delay: 5
    });

    const [surveyPreview, setSurveyPreview] = useState({
        estimated_response_rate: 0,
        auto_link_generated: false,
        dispatch_ready: false
    });

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Update preview when relevant fields change
        setTimeout(updateSurveyPreview, 100);
    };

    const updateSurveyPreview = () => {
        let responseRate = 30; // Base rate
        
        // Adjust based on survey type
        if (formData.survey_type === 'test_drive') responseRate += 20;
        else if (formData.survey_type === 'delivery') responseRate += 15;
        else if (formData.survey_type === 'sales_process') responseRate += 10;
        
        // Adjust based on dispatch method
        if (formData.dispatch_method === 'sms') responseRate += 15;
        else if (formData.dispatch_method === 'both') responseRate += 25;
        
        // Auto-link generation
        const autoLink = formData.survey_type && formData.customer_email;
        
        // Dispatch readiness
        const dispatchReady = formData.customer_name && formData.survey_type && 
                            (formData.customer_email || formData.customer_phone);
        
        setSurveyPreview({
            estimated_response_rate: Math.min(responseRate, 85),
            auto_link_generated: !!autoLink,
            dispatch_ready: !!dispatchReady
        });
    };

    const getSurveyTypeBadge = (type: string) => {
        switch (type) {
            case 'test_drive':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800">Test Drive</Badge>;
            case 'delivery':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Delivery</Badge>;
            case 'service_completion':
                return <Badge variant="outline" className="bg-orange-100 text-orange-800">Service</Badge>;
            case 'sales_process':
                return <Badge variant="outline" className="bg-green-100 text-green-800">Sales</Badge>;
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const getResponseRateBadge = (rate: number) => {
        if (rate >= 70) {
            return <Badge variant="default" className="bg-green-100 text-green-800">High ({rate}%)</Badge>;
        } else if (rate >= 50) {
            return <Badge variant="outline" className="bg-blue-100 text-blue-800">Good ({rate}%)</Badge>;
        } else if (rate >= 30) {
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Fair ({rate}%)</Badge>;
        } else {
            return <Badge variant="outline" className="bg-red-100 text-red-800">Low ({rate}%)</Badge>;
        }
    };

    const mockSalesReps = [
        'Lisa Sales Rep',
        'Mike Sales Rep',
        'Sarah Sales Rep',
        'Tom Sales Rep',
        'Jennifer Sales Rep'
    ];

    const mockVehicles = [
        '2024 BMW X3',
        '2024 Honda Civic',
        '2023 Toyota Camry',
        '2024 Ford F-150',
        '2024 Nissan Altima'
    ];

    const surveyTemplates = [
        {
            type: 'test_drive',
            name: 'Test Drive Experience',
            questions: 8,
            avg_completion: '3-5 min'
        },
        {
            type: 'delivery',
            name: 'Vehicle Delivery',
            questions: 10,
            avg_completion: '4-6 min'
        },
        {
            type: 'service_completion',
            name: 'Service Experience',
            questions: 12,
            avg_completion: '5-7 min'
        },
        {
            type: 'sales_process',
            name: 'Sales Process',
            questions: 15,
            avg_completion: '6-8 min'
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer Experience Survey" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/customer-experience">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Customer Experience
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Create Customer Survey</h1>
                            <p className="text-muted-foreground">Set up automated survey dispatch and follow-up</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Survey
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
                                    Customer contact details for survey dispatch
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
                                        <Label htmlFor="customer_phone">Phone Number</Label>
                                        <Input
                                            id="customer_phone"
                                            value={formData.customer_phone}
                                            onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                                            placeholder="+1-555-0123"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_email">Email Address *</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) => handleInputChange('customer_email', e.target.value)}
                                        placeholder="customer@email.com"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Survey Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Survey Configuration
                                </CardTitle>
                                <CardDescription>
                                    Survey type, trigger event, and template selection
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="survey_type">Survey Type *</Label>
                                        <Select value={formData.survey_type} onValueChange={(value) => handleInputChange('survey_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select survey type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="test_drive">Test Drive Experience</SelectItem>
                                                <SelectItem value="delivery">Vehicle Delivery</SelectItem>
                                                <SelectItem value="service_completion">Service Completion</SelectItem>
                                                <SelectItem value="sales_process">Sales Process</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="trigger_event">Trigger Event</Label>
                                        <Input
                                            id="trigger_event"
                                            value={formData.trigger_event}
                                            onChange={(e) => handleInputChange('trigger_event', e.target.value)}
                                            placeholder="e.g., Test Drive Completed"
                                        />
                                    </div>
                                </div>
                                
                                {formData.survey_type && (
                                    <div className="p-4 border rounded-lg bg-blue-50">
                                        <h4 className="font-medium mb-2">Survey Template Preview</h4>
                                        {surveyTemplates
                                            .filter(template => template.type === formData.survey_type)
                                            .map((template, index) => (
                                                <div key={index} className="text-sm text-blue-800">
                                                    <p><strong>{template.name}</strong></p>
                                                    <p>{template.questions} questions • {template.avg_completion} completion time</p>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sales_rep">Sales Representative</Label>
                                        <Select value={formData.sales_rep} onValueChange={(value) => handleInputChange('sales_rep', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sales rep" />
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
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle">Vehicle</Label>
                                        <Select value={formData.vehicle} onValueChange={(value) => handleInputChange('vehicle', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vehicle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mockVehicles.map((vehicle, index) => (
                                                    <SelectItem key={index} value={vehicle}>
                                                        {vehicle}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dispatch Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Send className="h-5 w-5 mr-2" />
                                    Dispatch Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure how and when the survey is sent
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dispatch_method">Dispatch Method</Label>
                                        <Select value={formData.dispatch_method} onValueChange={(value) => handleInputChange('dispatch_method', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="email">Email Only</SelectItem>
                                                <SelectItem value="sms">SMS Only</SelectItem>
                                                <SelectItem value="both">Both Email & SMS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dispatch_delay">Dispatch Delay (minutes)</Label>
                                        <Input
                                            id="dispatch_delay"
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={formData.dispatch_delay}
                                            onChange={(e) => handleInputChange('dispatch_delay', parseInt(e.target.value) || 5)}
                                            placeholder="5"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="link_expires_days">Link Expiration (days)</Label>
                                    <Input
                                        id="link_expires_days"
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={formData.link_expires_days}
                                        onChange={(e) => handleInputChange('link_expires_days', parseInt(e.target.value) || 7)}
                                        placeholder="7"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="auto_dispatch"
                                            checked={formData.auto_dispatch}
                                            onCheckedChange={(checked) => handleInputChange('auto_dispatch', checked === true)}
                                        />
                                        <Label htmlFor="auto_dispatch" className="text-sm">
                                            Enable automatic dispatch
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="auto_resend"
                                            checked={formData.auto_resend}
                                            onCheckedChange={(checked) => handleInputChange('auto_resend', checked === true)}
                                        />
                                        <Label htmlFor="auto_resend" className="text-sm">
                                            Auto-resend if no response within 24 hours
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Follow-up Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Follow-up Configuration
                                </CardTitle>
                                <CardDescription>
                                    Set up automated follow-up tasks and reminders
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="follow_up_required"
                                        checked={formData.follow_up_required}
                                        onCheckedChange={(checked) => handleInputChange('follow_up_required', checked === true)}
                                    />
                                    <Label htmlFor="follow_up_required" className="text-sm">
                                        Enable follow-up tasks
                                    </Label>
                                </div>
                                {formData.follow_up_required && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="follow_up_due">Default Follow-up Due (hours)</Label>
                                            <Input
                                                id="follow_up_due"
                                                type="number"
                                                min="1"
                                                max="168"
                                                value={formData.follow_up_due}
                                                onChange={(e) => handleInputChange('follow_up_due', e.target.value)}
                                                placeholder="48"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="assigned_to">Default Assignee</Label>
                                            <Select value={formData.assigned_to} onValueChange={(value) => handleInputChange('assigned_to', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Assign to" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                                                    <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                                                    <SelectItem value="Service Manager">Service Manager</SelectItem>
                                                    <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Default Priority</Label>
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
                                    <div className="space-y-2">
                                        <Label htmlFor="reminder_frequency">Reminder Frequency</Label>
                                        <Select value={formData.reminder_frequency} onValueChange={(value) => handleInputChange('reminder_frequency', value)}>
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Survey Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <Activity className="h-4 w-4 mr-2" />
                                    Survey Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-center">
                                    {formData.survey_type && getSurveyTypeBadge(formData.survey_type)}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Response Rate:</span>
                                        {getResponseRateBadge(surveyPreview.estimated_response_rate)}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Auto-Link:</span>
                                        <span className={surveyPreview.auto_link_generated ? 'text-green-600' : 'text-gray-400'}>
                                            {surveyPreview.auto_link_generated ? 'Generated' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Dispatch Ready:</span>
                                        <span className={surveyPreview.dispatch_ready ? 'text-green-600' : 'text-orange-600'}>
                                            {surveyPreview.dispatch_ready ? 'Ready' : 'Incomplete'}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                        style={{ width: `${surveyPreview.estimated_response_rate}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Estimated {surveyPreview.estimated_response_rate}% response rate
                                </p>
                            </CardContent>
                        </Card>

                        {/* Automation Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <Zap className="h-4 w-4 mr-2" />
                                    Automation Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">Auto-Dispatch</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formData.auto_dispatch ? 
                                            `Survey sent ${formData.dispatch_delay} min after trigger` : 
                                            'Manual dispatch required'}
                                    </p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">Auto-Resend</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formData.auto_resend ? 'Resend after 24h if no response' : 'Disabled'}
                                    </p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm font-medium">Follow-up Tasks</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formData.follow_up_required ? 
                                            `Auto-create tasks for ${formData.assigned_to}` : 
                                            'No automatic follow-up'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Survey Templates */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Available Templates</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {surveyTemplates.map((template, index) => (
                                    <div 
                                        key={index} 
                                        className={`p-2 border rounded text-xs cursor-pointer transition-colors ${
                                            formData.survey_type === template.type ? 
                                            'border-blue-500 bg-blue-50' : 
                                            'hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleInputChange('survey_type', template.type)}
                                    >
                                        <div className="font-medium">{template.name}</div>
                                        <div className="text-muted-foreground">
                                            {template.questions} questions • {template.avg_completion}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Integration Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Integration Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-2 border rounded text-xs">
                                    <div className="font-medium flex items-center">
                                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                        CRM Integration
                                    </div>
                                    <div className="text-muted-foreground">Customer data auto-populated</div>
                                </div>
                                <div className="p-2 border rounded text-xs">
                                    <div className="font-medium flex items-center">
                                        <Activity className="h-3 w-3 mr-1 text-blue-600" />
                                        Event Triggers
                                    </div>
                                    <div className="text-muted-foreground">Connected to system events</div>
                                </div>
                                <div className="p-2 border rounded text-xs">
                                    <div className="font-medium flex items-center">
                                        <Mail className="h-3 w-3 mr-1 text-purple-600" />
                                        Email/SMS Service
                                    </div>
                                    <div className="text-muted-foreground">Ready for dispatch</div>
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
                                    <User className="h-4 w-4 mr-2" />
                                    Import from CRM
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Preview Template
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Test Dispatch
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    Generate Link
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
