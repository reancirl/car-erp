import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    MessageSquare,
    Edit,
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    Star,
    FileText,
    CheckCircle,
    AlertTriangle,
    Download,
    Copy,
    ExternalLink,
    Activity,
    Link as LinkIcon,
    Send,
    Eye
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
        title: 'Survey Details',
        href: '/sales/customer-experience/1',
    },
];

export default function CustomerExperienceView() {
    const mockSurvey = {
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
        feedback: 'Excellent service, very professional staff. The test drive was smooth and the sales representative was very knowledgeable about the vehicle features. I particularly appreciated the thorough explanation of the safety features and the financing options available.',
        sales_rep: 'Lisa Sales Rep',
        vehicle: '2024 BMW X3',
        follow_up_required: false,
        follow_up_due: null,
        created_at: '2025-01-13 17:35:00'
    };

    const surveyResponses = [
        {
            question: 'How would you rate your overall test drive experience?',
            answer: '5 - Excellent',
            type: 'rating'
        },
        {
            question: 'How knowledgeable was your sales representative?',
            answer: '5 - Very knowledgeable',
            type: 'rating'
        },
        {
            question: 'How would you rate the vehicle condition?',
            answer: '5 - Perfect condition',
            type: 'rating'
        },
        {
            question: 'Would you recommend our dealership to others?',
            answer: 'Yes, definitely',
            type: 'choice'
        },
        {
            question: 'What did you like most about your experience?',
            answer: 'The professional service and detailed vehicle explanation',
            type: 'text'
        },
        {
            question: 'Any suggestions for improvement?',
            answer: 'None, everything was perfect',
            type: 'text'
        }
    ];

    const relatedActivities = [
        {
            timestamp: '2025-01-13 17:35:00',
            event: 'Test Drive Completed',
            system: 'Test Drive System',
            details: 'GPS tracking confirmed completion'
        },
        {
            timestamp: '2025-01-13 17:40:00',
            event: 'Survey Dispatched',
            system: 'Customer Experience',
            details: 'SMS sent to +1-555-0123'
        },
        {
            timestamp: '2025-01-13 19:15:00',
            event: 'Survey Completed',
            system: 'Customer Experience',
            details: 'Rating: 5/5, Feedback provided'
        },
        {
            timestamp: '2025-01-13 19:20:00',
            event: 'CRM Updated',
            system: 'CRM Integration',
            details: 'Customer profile updated with feedback'
        }
    ];

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

    const getRatingStars = (rating: number | null) => {
        if (!rating) return <span className="text-muted-foreground">No rating</span>;
        
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                ))}
                <span className="text-sm ml-2 font-medium">({rating}/5)</span>
            </div>
        );
    };

    const getEventIcon = (system: string) => {
        switch (system) {
            case 'Test Drive System':
                return <User className="h-4 w-4 text-purple-600" />;
            case 'Customer Experience':
                return <MessageSquare className="h-4 w-4 text-blue-600" />;
            case 'CRM Integration':
                return <Activity className="h-4 w-4 text-green-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Survey Details - ${mockSurvey.customer_name}`} />
            
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
                            <h1 className="text-2xl font-bold">Survey Details</h1>
                            <p className="text-muted-foreground">Customer: {mockSurvey.customer_name}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/sales/customer-experience/${mockSurvey.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Survey
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Survey Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <MessageSquare className="h-5 w-5 mr-2" />
                                        Survey Overview
                                    </div>
                                    <div className="flex space-x-2">
                                        {getSurveyTypeBadge(mockSurvey.survey_type)}
                                        {getStatusBadge(mockSurvey.status)}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                                            <p className="text-lg font-semibold">{mockSurvey.customer_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Trigger Event</p>
                                            <p className="text-sm">{mockSurvey.trigger_event}</p>
                                            <p className="text-xs text-muted-foreground">{mockSurvey.trigger_timestamp}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                                            <p className="text-sm font-semibold">{mockSurvey.vehicle}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Sales Representative</p>
                                            <p className="text-sm">{mockSurvey.sales_rep}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Dispatch Method</p>
                                            <div className="flex items-center space-x-2">
                                                {getDispatchMethodBadge(mockSurvey.dispatch_method)}
                                                <p className="text-xs text-muted-foreground">{mockSurvey.dispatch_timestamp}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                                            <p className="text-sm">{mockSurvey.response_timestamp}</p>
                                            <p className="text-xs text-muted-foreground">1h 35m after dispatch</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Survey Response */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Star className="h-5 w-5 mr-2" />
                                        Customer Response
                                    </div>
                                    <div className="text-right">
                                        {getRatingStars(mockSurvey.rating)}
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                    Detailed survey responses and feedback
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {surveyResponses.map((response, index) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <p className="font-medium text-sm mb-2">{response.question}</p>
                                            <div className="flex items-start space-x-2">
                                                {response.type === 'rating' && (
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current mt-0.5" />
                                                )}
                                                <p className="text-sm text-muted-foreground">{response.answer}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {mockSurvey.feedback && (
                                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="font-medium text-sm mb-2">Additional Feedback:</p>
                                        <p className="text-sm text-blue-800">"{mockSurvey.feedback}"</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Activity Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="h-5 w-5 mr-2" />
                                    Activity Timeline
                                </CardTitle>
                                <CardDescription>
                                    Automated system events and customer interactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {relatedActivities.map((activity, index) => (
                                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                                            <div className="flex-shrink-0 mt-1">
                                                {getEventIcon(activity.system)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium">{activity.event}</p>
                                                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                                                <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-2">
                                                    {activity.system}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Survey Link Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <LinkIcon className="h-5 w-5 mr-2" />
                                    Survey Link Details
                                </CardTitle>
                                <CardDescription>
                                    Survey link information and expiration details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium">Survey Link</p>
                                            <Button variant="ghost" size="sm">
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-mono bg-gray-50 p-2 rounded">
                                            {mockSurvey.survey_link}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Link Expires</p>
                                            <p className="text-sm">{mockSurvey.link_expires}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Link Status</p>
                                            <Badge variant="outline" className="bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Used
                                            </Badge>
                                        </div>
                                    </div>
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
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm">{mockSurvey.customer_phone}</p>
                                        <Button variant="ghost" size="sm">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm">{mockSurvey.customer_email}</p>
                                        <Button variant="ghost" size="sm">
                                            <Mail className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Survey Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Survey Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Overall Rating</span>
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                        {mockSurvey.rating}/5
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Response Time</span>
                                    <Badge variant="outline">1h 35m</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Questions Answered</span>
                                    <Badge variant="outline">{surveyResponses.length}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Feedback Length</span>
                                    <Badge variant="outline">{mockSurvey.feedback?.length || 0} chars</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Follow-up Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Follow-up Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {mockSurvey.follow_up_required ? (
                                    <div className="p-3 border rounded-lg bg-orange-50 border-orange-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                            <span className="font-medium text-orange-800">Follow-up Required</span>
                                        </div>
                                        <p className="text-sm text-orange-700">Due: {mockSurvey.follow_up_due}</p>
                                    </div>
                                ) : (
                                    <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="font-medium text-green-800">No Follow-up Needed</span>
                                        </div>
                                        <p className="text-sm text-green-700 mt-1">Customer satisfied</p>
                                    </div>
                                )}
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
                                    Schedule Follow-up
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
                                    <FileText className="h-4 w-4 mr-2" />
                                    Test Drive Record
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    <Activity className="h-4 w-4 mr-2" />
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
