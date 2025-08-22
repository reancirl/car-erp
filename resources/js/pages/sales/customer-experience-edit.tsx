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
    Settings
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
        title: 'Edit Survey',
        href: '/sales/customer-experience/1/edit',
    },
];

export default function CustomerExperienceEdit() {
    const [formData, setFormData] = useState({
        customer_name: 'John Smith',
        customer_email: 'john.smith@email.com',
        customer_phone: '+1-555-0123',
        survey_type: 'test_drive',
        trigger_event: 'Test Drive Completed',
        dispatch_method: 'sms',
        survey_link: 'https://survey.dealership.com/td/abc123',
        link_expires: '2025-01-20T17:40',
        status: 'completed',
        rating: 5,
        feedback: 'Excellent service, very professional staff. The test drive was smooth and the sales representative was very knowledgeable about the vehicle features.',
        sales_rep: 'Lisa Sales Rep',
        vehicle: '2024 BMW X3',
        follow_up_required: false,
        follow_up_due: '',
        priority: 'medium',
        assigned_to: 'Customer Service',
        auto_resend: true,
        reminder_frequency: 'daily'
    });

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expired
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getRatingStars = (rating: number) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={`h-4 w-4 cursor-pointer ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        onClick={() => handleInputChange('rating', star)}
                    />
                ))}
                <span className="text-sm ml-2">({rating}/5)</span>
            </div>
        );
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Customer Experience Survey" />
            
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
                            <h1 className="text-2xl font-bold">Edit Customer Survey</h1>
                            <p className="text-muted-foreground">Update survey details and follow-up settings</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Update Survey
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
                                    Basic customer contact details
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
                            </CardContent>
                        </Card>

                        {/* Survey Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Survey Details
                                </CardTitle>
                                <CardDescription>
                                    Survey type, trigger event, and dispatch information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="survey_type">Survey Type</Label>
                                        <Select value={formData.survey_type} onValueChange={(value) => handleInputChange('survey_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select survey type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="test_drive">Test Drive</SelectItem>
                                                <SelectItem value="delivery">Delivery</SelectItem>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dispatch_method">Dispatch Method</Label>
                                        <Select value={formData.dispatch_method} onValueChange={(value) => handleInputChange('dispatch_method', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="sms">SMS</SelectItem>
                                                <SelectItem value="both">Both Email & SMS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Survey Status</Label>
                                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
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

                        {/* Survey Link Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <LinkIcon className="h-5 w-5 mr-2" />
                                    Survey Link Settings
                                </CardTitle>
                                <CardDescription>
                                    Survey link URL and expiration settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="survey_link">Survey Link URL</Label>
                                    <Input
                                        id="survey_link"
                                        value={formData.survey_link}
                                        onChange={(e) => handleInputChange('survey_link', e.target.value)}
                                        placeholder="https://survey.dealership.com/..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="link_expires">Link Expiration</Label>
                                    <Input
                                        id="link_expires"
                                        type="datetime-local"
                                        value={formData.link_expires}
                                        onChange={(e) => handleInputChange('link_expires', e.target.value)}
                                    />
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
                            </CardContent>
                        </Card>

                        {/* Customer Response */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Star className="h-5 w-5 mr-2" />
                                    Customer Response
                                </CardTitle>
                                <CardDescription>
                                    Customer rating and feedback details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Overall Rating</Label>
                                    {getRatingStars(formData.rating)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="feedback">Customer Feedback</Label>
                                    <Textarea
                                        id="feedback"
                                        value={formData.feedback}
                                        onChange={(e) => handleInputChange('feedback', e.target.value)}
                                        placeholder="Customer feedback and comments..."
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Follow-up Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Follow-up Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure follow-up tasks and reminders
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
                                        Follow-up required
                                    </Label>
                                </div>
                                {formData.follow_up_required && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="follow_up_due">Follow-up Due Date</Label>
                                            <Input
                                                id="follow_up_due"
                                                type="datetime-local"
                                                value={formData.follow_up_due}
                                                onChange={(e) => handleInputChange('follow_up_due', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="assigned_to">Assigned To</Label>
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
                        {/* Current Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <Activity className="h-4 w-4 mr-2" />
                                    Current Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-center">
                                    {getStatusBadge(formData.status)}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Survey Type:</span>
                                        {getSurveyTypeBadge(formData.survey_type)}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Rating:</span>
                                        <span className="font-medium">{formData.rating}/5</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Follow-up:</span>
                                        <span className={formData.follow_up_required ? 'text-orange-600' : 'text-green-600'}>
                                            {formData.follow_up_required ? 'Required' : 'Complete'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Survey Automation */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Automation Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">Auto-Dispatch</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Survey sent automatically after trigger event</p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">Auto-Resend</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formData.auto_resend ? 'Enabled - resend after 24h' : 'Disabled'}
                                    </p>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        <span className="text-sm font-medium">Link Expiration</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">7 days from dispatch</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* CRM Integration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">CRM Integration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-2 border rounded text-xs">
                                    <div className="font-medium flex items-center">
                                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                        Customer Profile
                                    </div>
                                    <div className="text-muted-foreground">Auto-linked to CRM record</div>
                                </div>
                                <div className="p-2 border rounded text-xs">
                                    <div className="font-medium flex items-center">
                                        <Activity className="h-3 w-3 mr-1 text-blue-600" />
                                        Activity Tracking
                                    </div>
                                    <div className="text-muted-foreground">All interactions logged</div>
                                </div>
                                <div className="p-2 border rounded text-xs">
                                    <div className="font-medium flex items-center">
                                        <Calendar className="h-3 w-3 mr-1 text-purple-600" />
                                        Task Creation
                                    </div>
                                    <div className="text-muted-foreground">Follow-up tasks auto-created</div>
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
                                    <Send className="h-4 w-4 mr-2" />
                                    Resend Survey
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Report
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
