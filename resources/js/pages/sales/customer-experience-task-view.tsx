import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Calendar,
    Edit,
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
    Send
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

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
        title: 'Task Details',
        href: '/sales/customer-experience/task/1',
    },
];

export default function CustomerExperienceTaskView() {
    const mockTask = {
        id: 1,
        customer_name: 'Maria Rodriguez',
        customer_email: 'maria.r@email.com',
        customer_phone: '+1-555-0124',
        task_type: 'survey_reminder',
        task_description: 'Send delivery survey reminder',
        due_date: '2025-01-15 10:00:00',
        assigned_to: 'Mike Sales Rep',
        priority: 'medium',
        status: 'pending',
        created_at: '2025-01-12 15:35:00',
        notes: 'Customer has not responded to initial delivery survey sent on 2025-01-12. Follow up required to ensure feedback collection.',
        related_survey_id: 2,
        related_survey_type: 'delivery',
        vehicle: '2023 Toyota Camry',
        escalation_level: 1,
        auto_created: true,
        completion_percentage: 0
    };

    const taskHistory = [
        {
            timestamp: '2025-01-12 15:35:00',
            event: 'Task Created',
            system: 'Customer Experience',
            details: 'Auto-created follow-up task for delivery survey',
            user: 'System'
        },
        {
            timestamp: '2025-01-13 09:00:00',
            event: 'Task Assigned',
            system: 'CRM',
            details: 'Assigned to Mike Sales Rep based on customer relationship',
            user: 'Auto-Assignment'
        },
        {
            timestamp: '2025-01-14 14:30:00',
            event: 'Reminder Sent',
            system: 'Notification Service',
            details: 'Email reminder sent to assigned user',
            user: 'System'
        }
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
            case 'high':
                return <Badge variant="destructive" className="bg-red-100 text-red-800">High</Badge>;
            case 'medium':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const getTaskTypeBadge = (type: string) => {
        switch (type) {
            case 'survey_reminder':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Survey Reminder</Badge>;
            case 'manual_follow_up':
                return <Badge variant="outline" className="bg-purple-100 text-purple-800">Manual Follow-up</Badge>;
            case 'feedback_follow_up':
                return <Badge variant="outline" className="bg-green-100 text-green-800">Feedback Follow-up</Badge>;
            default:
                return <Badge variant="secondary">{type.replace('_', ' ')}</Badge>;
        }
    };

    const getEventIcon = (system: string) => {
        switch (system) {
            case 'Customer Experience':
                return <MessageSquare className="h-4 w-4 text-blue-600" />;
            case 'CRM':
                return <User className="h-4 w-4 text-green-600" />;
            case 'Notification Service':
                return <Send className="h-4 w-4 text-purple-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    const getDaysUntilDue = () => {
        const dueDate = new Date(mockTask.due_date);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilDue = getDaysUntilDue();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Task Details - ${mockTask.customer_name}`} />
            
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
                            <h1 className="text-2xl font-bold">CRM Follow-up Task</h1>
                            <p className="text-muted-foreground">Customer: {mockTask.customer_name}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Details
                        </Button>
                        <Link href={`/sales/customer-experience/task/${mockTask.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Task
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Task Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Task Overview
                                    </div>
                                    <div className="flex space-x-2">
                                        {getTaskTypeBadge(mockTask.task_type)}
                                        {getTaskStatusBadge(mockTask.status)}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Task Description</p>
                                            <p className="text-lg font-semibold">{mockTask.task_description}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                            <p className="text-sm">{mockTask.customer_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                                            <p className="text-sm font-semibold">{mockTask.vehicle}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                                            <p className="text-sm">{mockTask.assigned_to}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Priority Level</p>
                                            {getPriorityBadge(mockTask.priority)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Created</p>
                                            <p className="text-sm">{mockTask.created_at}</p>
                                            {mockTask.auto_created && (
                                                <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-1">
                                                    Auto-Created
                                                </Badge>
                                            )}
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
                                                    Due: {mockTask.due_date}
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
                                <div className="p-4 bg-gray-50 border rounded-lg">
                                    <p className="text-sm">{mockTask.notes}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Related Survey */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Related Survey
                                </CardTitle>
                                <CardDescription>
                                    Survey that triggered this follow-up task
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                {relatedSurvey.survey_type.charAt(0).toUpperCase() + relatedSurvey.survey_type.slice(1)} Survey
                                            </Badge>
                                            {getTaskStatusBadge(relatedSurvey.status)}
                                        </div>
                                        <Link href={`/sales/customer-experience/${relatedSurvey.id}`}>
                                            <Button variant="outline" size="sm">
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View Survey
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Dispatched:</p>
                                            <p>{relatedSurvey.dispatch_timestamp}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Link Expires:</p>
                                            <p>{relatedSurvey.link_expires}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Task History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="h-5 w-5 mr-2" />
                                    Task History
                                </CardTitle>
                                <CardDescription>
                                    Timeline of task events and system actions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {taskHistory.map((event, index) => (
                                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                                            <div className="flex-shrink-0 mt-1">
                                                {getEventIcon(event.system)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium">{event.event}</p>
                                                    <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                        {event.system}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">by {event.user}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    Customer Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm">{mockTask.customer_phone}</p>
                                        <Button variant="ghost" size="sm">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm">{mockTask.customer_email}</p>
                                        <Button variant="ghost" size="sm">
                                            <Mail className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Task Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Task Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Priority</span>
                                    {getPriorityBadge(mockTask.priority)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Escalation Level</span>
                                    <Badge variant="outline">{mockTask.escalation_level}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Completion</span>
                                    <Badge variant="outline">{mockTask.completion_percentage}%</Badge>
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

                        {/* Task Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Task Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="font-medium text-green-800">Mark Complete</span>
                                    </div>
                                    <p className="text-sm text-green-700 mb-3">Complete this task and update status</p>
                                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                        Complete Task
                                    </Button>
                                </div>
                                <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Activity className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium text-blue-800">Mark In Progress</span>
                                    </div>
                                    <p className="text-sm text-blue-700 mb-3">Update status to in progress</p>
                                    <Button size="sm" variant="outline" className="w-full">
                                        Start Working
                                    </Button>
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
