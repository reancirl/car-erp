import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Search, Filter, Download, Plus, Eye, Edit, Mail, Phone, Clock, CheckCircle, AlertTriangle, FileText, Link as LinkIcon, Calendar, Star } from 'lucide-react';
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
];

export default function CustomerExperience() {
    // Mock data for demonstration
    const mockSurveys = [
        {
            id: 1,
            customer_name: 'John Smith',
            customer_email: 'john.smith@email.com',
            customer_phone: '+1-555-0123',
            survey_type: 'test_drive',
            trigger_event: 'Test Drive Completed',
            trigger_timestamp: '2025-01-13 17:35:00',
            dispatch_timestamp: '2025-01-13 17:40:00',
            dispatch_method: 'sms',
            survey_link: 'https://survey.dealership.com/td/abc123',
            link_expires: '2025-01-20 17:40:00',
            status: 'completed',
            response_timestamp: '2025-01-13 19:15:00',
            rating: 5,
            feedback: 'Excellent service, very professional staff',
            sales_rep: 'Lisa Sales Rep',
            vehicle: '2024 BMW X3',
            follow_up_required: false,
            follow_up_due: null
        },
        {
            id: 2,
            customer_name: 'Maria Rodriguez',
            customer_email: 'maria.r@email.com',
            customer_phone: '+1-555-0124',
            survey_type: 'delivery',
            trigger_event: 'Vehicle Delivered',
            trigger_timestamp: '2025-01-12 15:30:00',
            dispatch_timestamp: '2025-01-12 15:35:00',
            dispatch_method: 'email',
            survey_link: 'https://survey.dealership.com/del/def456',
            link_expires: '2025-01-19 15:35:00',
            status: 'pending',
            response_timestamp: null,
            rating: null,
            feedback: null,
            sales_rep: 'Mike Sales Rep',
            vehicle: '2023 Toyota Camry',
            follow_up_required: true,
            follow_up_due: '2025-01-15 10:00:00'
        },
        {
            id: 3,
            customer_name: 'Robert Johnson',
            customer_email: 'robert.j@email.com',
            customer_phone: '+1-555-0125',
            survey_type: 'service_completion',
            trigger_event: 'Service Work Completed',
            trigger_timestamp: '2025-01-11 14:20:00',
            dispatch_timestamp: '2025-01-11 14:25:00',
            dispatch_method: 'sms',
            survey_link: 'https://survey.dealership.com/svc/ghi789',
            link_expires: '2025-01-18 14:25:00',
            status: 'expired',
            response_timestamp: null,
            rating: null,
            feedback: null,
            sales_rep: null,
            vehicle: '2022 Honda Civic',
            follow_up_required: true,
            follow_up_due: '2025-01-14 09:00:00'
        },
        {
            id: 4,
            customer_name: 'Emily Davis',
            customer_email: 'emily.davis@company.com',
            customer_phone: '+1-555-0126',
            survey_type: 'sales_process',
            trigger_event: 'Purchase Completed',
            trigger_timestamp: '2025-01-13 16:45:00',
            dispatch_timestamp: '2025-01-13 16:50:00',
            dispatch_method: 'email',
            survey_link: 'https://survey.dealership.com/sale/jkl012',
            link_expires: '2025-01-20 16:50:00',
            status: 'completed',
            response_timestamp: '2025-01-13 20:30:00',
            rating: 4,
            feedback: 'Good experience overall, financing process was a bit slow',
            sales_rep: 'Tom Sales Rep',
            vehicle: '2024 Hyundai Elantra',
            follow_up_required: true,
            follow_up_due: '2025-01-16 11:00:00'
        }
    ];

    const mockFollowUps = [
        {
            id: 1,
            customer_name: 'Maria Rodriguez',
            task_type: 'survey_reminder',
            task_description: 'Send delivery survey reminder',
            due_date: '2025-01-15 10:00:00',
            assigned_to: 'Mike Sales Rep',
            priority: 'medium',
            status: 'pending',
            created_at: '2025-01-12 15:35:00'
        },
        {
            id: 2,
            customer_name: 'Robert Johnson',
            task_type: 'manual_follow_up',
            task_description: 'Call customer about expired service survey',
            due_date: '2025-01-14 09:00:00',
            assigned_to: 'Service Manager',
            priority: 'high',
            status: 'overdue',
            created_at: '2025-01-11 14:25:00'
        },
        {
            id: 3,
            customer_name: 'Emily Davis',
            task_type: 'feedback_follow_up',
            task_description: 'Address financing process feedback',
            due_date: '2025-01-16 11:00:00',
            assigned_to: 'Finance Manager',
            priority: 'medium',
            status: 'pending',
            created_at: '2025-01-13 20:30:00'
        }
    ];

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

    const getDispatchMethodBadge = (method: string) => {
        switch (method) {
            case 'email':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                    </Badge>
                );
            case 'sms':
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                        <Phone className="h-3 w-3 mr-1" />
                        SMS
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{method}</Badge>;
        }
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

    const getRatingStars = (rating: number | null) => {
        if (!rating) return <span className="text-muted-foreground">No rating</span>;
        
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={`h-3 w-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                ))}
                <span className="text-sm ml-1">({rating}/5)</span>
            </div>
        );
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Experience" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Customer Experience</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Feedback
                        </Button>
                        <Link href="/sales/customer-experience/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Manual Survey
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Surveys Sent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">This week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">50%</div>
                            <p className="text-xs text-muted-foreground">2 of 4 responded</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4.5</div>
                            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">3</div>
                            <p className="text-xs text-muted-foreground">Require attention</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Automated survey dispatch with SMS/email links and CRM task reminders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by customer name, email, or survey type..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Survey Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="test_drive">Test Drive</SelectItem>
                                    <SelectItem value="delivery">Delivery</SelectItem>
                                    <SelectItem value="service_completion">Service</SelectItem>
                                    <SelectItem value="sales_process">Sales Process</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="sms">SMS</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Surveys Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Surveys</CardTitle>
                        <CardDescription>Automated dispatch based on system events with expiring survey links</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Survey Details</TableHead>
                                    <TableHead>Trigger Event</TableHead>
                                    <TableHead>Dispatch Info</TableHead>
                                    <TableHead>Response</TableHead>
                                    <TableHead>Rating & Feedback</TableHead>
                                    <TableHead>Follow-up</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockSurveys.map((survey) => (
                                    <TableRow key={survey.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{survey.customer_name}</div>
                                                <div className="text-xs text-muted-foreground">{survey.customer_email}</div>
                                                <div className="text-xs text-muted-foreground">{survey.customer_phone}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {getSurveyTypeBadge(survey.survey_type)}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {survey.vehicle}
                                                </div>
                                                {survey.sales_rep && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Rep: {survey.sales_rep}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{survey.trigger_event}</div>
                                                <div className="text-xs text-muted-foreground">{survey.trigger_timestamp}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {getDispatchMethodBadge(survey.dispatch_method)}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Sent: {survey.dispatch_timestamp}
                                                </div>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <LinkIcon className="h-3 w-3" />
                                                    <span className="text-xs">Expires: {survey.link_expires}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {getStatusBadge(survey.status)}
                                                {survey.response_timestamp && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {survey.response_timestamp}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {getRatingStars(survey.rating)}
                                                {survey.feedback && (
                                                    <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate" title={survey.feedback}>
                                                        "{survey.feedback}"
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {survey.follow_up_required ? (
                                                <div>
                                                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        Required
                                                    </Badge>
                                                    {survey.follow_up_due && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Due: {survey.follow_up_due}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                                    Complete
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Link href={`/sales/customer-experience/${survey.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/sales/customer-experience/${survey.id}/edit`}>
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

                {/* CRM Follow-up Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle>CRM Follow-up Tasks</CardTitle>
                        <CardDescription>Automated task creation for survey reminders and feedback follow-ups</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Task Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockFollowUps.map((task) => (
                                    <TableRow key={task.id} className={task.status === 'overdue' ? 'bg-red-50' : ''}>
                                        <TableCell className="font-medium">{task.customer_name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                {task.task_type.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{task.task_description}</TableCell>
                                        <TableCell>{task.assigned_to}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{task.due_date}</div>
                                        </TableCell>
                                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                                        <TableCell>{getTaskStatusBadge(task.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Link href={`/sales/customer-experience/task/${task.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/sales/customer-experience/task/${task.id}/edit`}>
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

                {/* Survey Automation & Integration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Survey Automation</CardTitle>
                            <CardDescription>Trigger-based survey dispatch system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Test Drive Completion</div>
                                        <div className="text-sm text-muted-foreground">Auto-send within 5 minutes</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Vehicle Delivery</div>
                                        <div className="text-sm text-muted-foreground">Auto-send within 5 minutes</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Service Completion</div>
                                        <div className="text-sm text-muted-foreground">Auto-send within 5 minutes</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Integration Systems</CardTitle>
                            <CardDescription>Call recording and document management</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Call Recording</div>
                                        <div className="text-sm text-muted-foreground">Auto-link recordings to customer profiles</div>
                                    </div>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">Configured</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Document Upload</div>
                                        <div className="text-sm text-muted-foreground">Link contracts, forms, and photos</div>
                                    </div>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">Available</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">CRM Integration</div>
                                        <div className="text-sm text-muted-foreground">Sync with customer interaction history</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
