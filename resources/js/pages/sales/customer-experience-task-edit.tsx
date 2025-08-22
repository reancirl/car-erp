import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft, 
    Calendar,
    Save,
    User,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    AlertTriangle,
    Download,
    Copy,
    ExternalLink,
    Activity,
    FileText,
    MessageSquare,
    Target,
    Send,
    Settings,
    Bell,
    Users
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
        title: 'Edit Task',
        href: '/sales/customer-experience/task/1/edit',
    },
];

export default function CustomerExperienceTaskEdit() {
    const [formData, setFormData] = useState({
        customer_name: 'Maria Rodriguez',
        customer_email: 'maria.r@email.com',
        customer_phone: '+1-555-0124',
        task_type: 'survey_reminder',
        task_description: 'Send delivery survey reminder',
        due_date: '2025-01-15',
        due_time: '10:00',
        assigned_to: 'mike_sales_rep',
        priority: 'medium',
        status: 'pending',
        notes: 'Customer has not responded to initial delivery survey sent on 2025-01-12. Follow up required to ensure feedback collection.',
        vehicle: '2023 Toyota Camry',
        escalation_level: '1',
        auto_escalate: true,
        send_reminders: true,
        reminder_frequency: '24',
        completion_percentage: '0'
    });

    const mockSalesReps = [
        { id: 'mike_sales_rep', name: 'Mike Sales Rep' },
        { id: 'sarah_manager', name: 'Sarah Manager' },
        { id: 'john_advisor', name: 'John Advisor' },
        { id: 'lisa_specialist', name: 'Lisa Specialist' }
    ];

    const taskTypes = [
        { value: 'survey_reminder', label: 'Survey Reminder' },
        { value: 'manual_follow_up', label: 'Manual Follow-up' },
        { value: 'feedback_follow_up', label: 'Feedback Follow-up' },
        { value: 'service_reminder', label: 'Service Reminder' },
        { value: 'warranty_follow_up', label: 'Warranty Follow-up' }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    const statuses = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'overdue', label: 'Overdue' }
    ];

    const relatedSurvey = {
        id: 2,
        survey_type: 'delivery',
        dispatch_timestamp: '2025-01-12 15:35:00',
        status: 'pending',
        link_expires: '2025-01-19 15:35:00'
    };

    const getTaskStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'overdue':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Activity className="h-3 w-3 mr-1" />
                        In Progress
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <Badge variant="destructive" className="bg-red-100 text-red-800">Urgent</Badge>;
            case 'high':
                return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
            case 'medium':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        console.log('Saving task:', formData);
        // Handle save logic here
    };

    const getDaysUntilDue = () => {
        const dueDate = new Date(`${formData.due_date} ${formData.due_time}`);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilDue = getDaysUntilDue();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Task - ${formData.customer_name}`} />
            
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
                            <h1 className="text-2xl font-bold">Edit CRM Follow-up Task</h1>
                            <p className="text-muted-foreground">Customer: {formData.customer_name}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Details
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Task Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Task Details
                                    </div>
                                    <div className="flex space-x-2">
                                        {getPriorityBadge(formData.priority)}
                                        {getTaskStatusBadge(formData.status)}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="task_type">Task Type</Label>
                                            <Select value={formData.task_type} onValueChange={(value) => handleInputChange('task_type', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {taskTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="task_description">Task Description</Label>
                                            <Input
                                                id="task_description"
                                                value={formData.task_description}
                                                onChange={(e) => handleInputChange('task_description', e.target.value)}
                                                placeholder="Enter task description"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="vehicle">Vehicle</Label>
                                            <Input
                                                id="vehicle"
                                                value={formData.vehicle}
                                                onChange={(e) => handleInputChange('vehicle', e.target.value)}
                                                placeholder="Enter vehicle information"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="assigned_to">Assigned To</Label>
                                            <Select value={formData.assigned_to} onValueChange={(value) => handleInputChange('assigned_to', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mockSalesReps.map((rep) => (
                                                        <SelectItem key={rep.id} value={rep.id}>
                                                            {rep.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="priority">Priority Level</Label>
                                            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorities.map((priority) => (
                                                        <SelectItem key={priority.value} value={priority.value}>
                                                            {priority.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="status">Task Status</Label>
                                            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statuses.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            {status.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
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
                                    Customer contact details and vehicle information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="customer_name">Customer Name</Label>
                                            <Input
                                                id="customer_name"
                                                value={formData.customer_name}
                                                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                                                placeholder="Enter customer name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="customer_email">Email Address</Label>
                                            <Input
                                                id="customer_email"
                                                type="email"
                                                value={formData.customer_email}
                                                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="customer_phone">Phone Number</Label>
                                            <Input
                                                id="customer_phone"
                                                value={formData.customer_phone}
                                                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Due Date & Scheduling */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2" />
                                    Due Date & Scheduling
                                </CardTitle>
                                <CardDescription>
                                    Set task due date and scheduling preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="due_date">Due Date</Label>
                                            <Input
                                                id="due_date"
                                                type="date"
                                                value={formData.due_date}
                                                onChange={(e) => handleInputChange('due_date', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="due_time">Due Time</Label>
                                            <Input
                                                id="due_time"
                                                type="time"
                                                value={formData.due_time}
                                                onChange={(e) => handleInputChange('due_time', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="escalation_level">Escalation Level</Label>
                                            <Select value={formData.escalation_level} onValueChange={(value) => handleInputChange('escalation_level', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">Level 1</SelectItem>
                                                    <SelectItem value="2">Level 2</SelectItem>
                                                    <SelectItem value="3">Level 3</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="completion_percentage">Completion %</Label>
                                            <Input
                                                id="completion_percentage"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.completion_percentage}
                                                onChange={(e) => handleInputChange('completion_percentage', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Due Date Alert */}
                                <div className="mt-6">
                                    <div className={`p-4 border rounded-lg ${
                                        daysUntilDue < 0 ? 'bg-red-50 border-red-200' :
                                        daysUntilDue === 0 ? 'bg-orange-50 border-orange-200' :
                                        daysUntilDue <= 1 ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-blue-50 border-blue-200'
                                    }`}>
                                        <div className="flex items-start space-x-3">
                                            {daysUntilDue < 0 ? (
                                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                            ) : daysUntilDue <= 1 ? (
                                                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                                            ) : (
                                                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <p className={`font-medium ${
                                                    daysUntilDue < 0 ? 'text-red-800' :
                                                    daysUntilDue <= 1 ? 'text-orange-800' :
                                                    'text-blue-800'
                                                }`}>
                                                    Due: {formData.due_date} at {formData.due_time}
                                                </p>
                                                <p className={`text-sm mt-1 ${
                                                    daysUntilDue < 0 ? 'text-red-700' :
                                                    daysUntilDue <= 1 ? 'text-orange-700' :
                                                    'text-blue-700'
                                                }`}>
                                                    {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                                                     daysUntilDue === 0 ? 'Due today' :
                                                     daysUntilDue === 1 ? 'Due tomorrow' :
                                                     `${daysUntilDue} days remaining`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Task Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Task Notes
                                </CardTitle>
                                <CardDescription>
                                    Additional context and instructions for this task
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    placeholder="Enter task notes and additional context..."
                                    className="min-h-[100px]"
                                />
                            </CardContent>
                        </Card>

                        {/* Automation Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Settings className="h-5 w-5 mr-2" />
                                    Automation Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure automated reminders and escalation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="auto_escalate"
                                            checked={formData.auto_escalate}
                                            onCheckedChange={(checked) => handleInputChange('auto_escalate', checked as boolean)}
                                        />
                                        <Label htmlFor="auto_escalate" className="flex items-center">
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Auto-escalate when overdue
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="send_reminders"
                                            checked={formData.send_reminders}
                                            onCheckedChange={(checked) => handleInputChange('send_reminders', checked as boolean)}
                                        />
                                        <Label htmlFor="send_reminders" className="flex items-center">
                                            <Bell className="h-4 w-4 mr-2" />
                                            Send automated reminders
                                        </Label>
                                    </div>
                                    {formData.send_reminders && (
                                        <div className="ml-6">
                                            <Label htmlFor="reminder_frequency">Reminder Frequency (hours)</Label>
                                            <Select value={formData.reminder_frequency} onValueChange={(value) => handleInputChange('reminder_frequency', value)}>
                                                <SelectTrigger className="w-48">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="6">Every 6 hours</SelectItem>
                                                    <SelectItem value="12">Every 12 hours</SelectItem>
                                                    <SelectItem value="24">Daily</SelectItem>
                                                    <SelectItem value="48">Every 2 days</SelectItem>
                                                    <SelectItem value="72">Every 3 days</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
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
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Status</span>
                                    {getTaskStatusBadge(formData.status)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Priority</span>
                                    {getPriorityBadge(formData.priority)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Completion</span>
                                    <Badge variant="outline">{formData.completion_percentage}%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Days Until Due</span>
                                    <Badge variant={daysUntilDue < 0 ? "destructive" : daysUntilDue <= 1 ? "outline" : "secondary"}>
                                        {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : 
                                         daysUntilDue === 0 ? 'Due today' : 
                                         `${daysUntilDue}d`}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Automation Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Automation Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Auto-escalate</span>
                                    <Badge variant={formData.auto_escalate ? "default" : "outline"}>
                                        {formData.auto_escalate ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Reminders</span>
                                    <Badge variant={formData.send_reminders ? "default" : "outline"}>
                                        {formData.send_reminders ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                                {formData.send_reminders && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Frequency</span>
                                        <Badge variant="outline">{formData.reminder_frequency}h</Badge>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Escalation Level</span>
                                    <Badge variant="outline">Level {formData.escalation_level}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Related Survey */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Related Survey
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                            {relatedSurvey.survey_type.charAt(0).toUpperCase() + relatedSurvey.survey_type.slice(1)} Survey
                                        </Badge>
                                        {getTaskStatusBadge(relatedSurvey.status)}
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>Dispatched: {relatedSurvey.dispatch_timestamp}</p>
                                        <p>Expires: {relatedSurvey.link_expires}</p>
                                    </div>
                                    <Link href={`/sales/customer-experience/${relatedSurvey.id}`} className="mt-2 block">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Survey
                                        </Button>
                                    </Link>
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
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Reschedule Task
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Users className="h-4 w-4 mr-2" />
                                    Reassign Task
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Related Records */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Related Records</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    <User className="h-4 w-4 mr-2" />
                                    Customer Profile
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Related Survey
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    <Target className="h-4 w-4 mr-2" />
                                    Sales Pipeline
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    CRM Record
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
