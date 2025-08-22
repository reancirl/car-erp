import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    UserPlus, 
    Edit, 
    User, 
    Phone, 
    Mail, 
    MapPin,
    Globe,
    Star,
    Clock,
    DollarSign,
    Calendar,
    CheckCircle,
    AlertTriangle,
    XCircle,
    MessageSquare,
    FileText,
    TrendingUp,
    Users,
    Activity,
    Target,
    Download,
    Printer
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface LeadViewProps {
    id: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Lead Management',
        href: '/sales/lead-management',
    },
    {
        title: 'View Lead',
        href: '/sales/lead-management/view',
    },
];

// Mock lead data
const mockLead = {
    id: '1',
    lead_id: 'LD-2025-001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    source: 'web_form',
    ip_address: '192.168.1.100',
    location: 'New York, NY',
    vehicle_interest: '2024 Honda Civic',
    budget_range: '$25,000 - $30,000',
    lead_score: 85,
    status: 'qualified',
    priority: 'high',
    assigned_to: 'Sarah Sales Rep',
    created_at: '2025-01-13 09:15:00',
    last_contact: '2025-01-13 14:30:00',
    next_followup: '2025-01-14 10:00:00',
    conversion_probability: 78,
    fake_lead_score: 15,
    duplicate_flags: [],
    tags: ['hot_lead', 'financing_needed', 'urgent'],
    notes: 'Interested in financing options. Prefers automatic transmission. Looking to purchase within 2 weeks. Has trade-in vehicle (2018 Toyota Corolla). Pre-approved for financing up to $30,000.',
    contact_history: [
        { id: 1, type: 'call', date: '2025-01-13 14:30:00', user: 'Sarah Sales Rep', notes: 'Initial contact call. Customer very interested, wants to schedule test drive.' },
        { id: 2, type: 'email', date: '2025-01-13 10:45:00', user: 'System', notes: 'Welcome email sent with dealership information and contact details.' },
        { id: 3, type: 'web_form', date: '2025-01-13 09:15:00', user: 'System', notes: 'Lead submitted via website contact form.' }
    ],
    activities: [
        { id: 1, type: 'status_change', date: '2025-01-13 14:35:00', user: 'Sarah Sales Rep', description: 'Status changed from "new" to "qualified"' },
        { id: 2, type: 'assignment', date: '2025-01-13 09:20:00', user: 'System', description: 'Lead automatically assigned to Sarah Sales Rep based on Honda specialization' },
        { id: 3, type: 'lead_created', date: '2025-01-13 09:15:00', user: 'System', description: 'Lead created from web form submission' }
    ]
};

export default function LeadView({ id }: LeadViewProps) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            new: { color: 'bg-gray-100 text-gray-800', icon: Clock },
            contacted: { color: 'bg-blue-100 text-blue-800', icon: Phone },
            qualified: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            hot: { color: 'bg-red-100 text-red-800', icon: Star },
            unqualified: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
            lost: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
        const IconComponent = config.icon;
        
        return (
            <Badge className={config.color}>
                <IconComponent className="h-3 w-3 mr-1" />
                {status.toUpperCase()}
            </Badge>
        );
    };

    const getSourceBadge = (source: string) => {
        const colors = {
            web_form: 'bg-blue-100 text-blue-800',
            phone: 'bg-green-100 text-green-800',
            walk_in: 'bg-purple-100 text-purple-800',
            referral: 'bg-indigo-100 text-indigo-800',
            social_media: 'bg-pink-100 text-pink-800',
        };
        return <Badge className={colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{source.replace('_', ' ').toUpperCase()}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{priority.toUpperCase()}</Badge>;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'status_change':
                return <TrendingUp className="h-4 w-4 text-blue-600" />;
            case 'assignment':
                return <Users className="h-4 w-4 text-green-600" />;
            case 'lead_created':
                return <UserPlus className="h-4 w-4 text-purple-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    const getContactIcon = (type: string) => {
        switch (type) {
            case 'call':
                return <Phone className="h-4 w-4 text-green-600" />;
            case 'email':
                return <Mail className="h-4 w-4 text-blue-600" />;
            case 'web_form':
                return <Globe className="h-4 w-4 text-purple-600" />;
            default:
                return <MessageSquare className="h-4 w-4 text-gray-600" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lead Details - ${mockLead.lead_id}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/lead-management">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Leads
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Lead Details - {mockLead.lead_id}</h1>
                            <div className="flex items-center space-x-2 mt-1">
                                {getStatusBadge(mockLead.status)}
                                {getSourceBadge(mockLead.source)}
                                {getPriorityBadge(mockLead.priority)}
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Link href={`/sales/lead-management/${id}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Lead
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Lead Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <UserPlus className="h-5 w-5 mr-2" />
                                    Lead Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created Date</p>
                                        <p className="font-medium">{new Date(mockLead.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lead Score</p>
                                        <p className="font-medium">{mockLead.lead_score}/100</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Conversion Probability</p>
                                        <p className="font-medium text-green-600">{mockLead.conversion_probability}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Assigned To</p>
                                        <p className="font-medium">{mockLead.assigned_to}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {mockLead.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="bg-blue-100 text-blue-800">
                                                {tag.replace('_', ' ')}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="font-medium text-lg">{mockLead.name}</p>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                                            <Mail className="h-4 w-4" />
                                            <span>{mockLead.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span>{mockLead.phone}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{mockLead.location}</span>
                                        </div>
                                    </div>
                                    {mockLead.ip_address && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">IP Address</p>
                                            <p className="text-sm font-mono">{mockLead.ip_address}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Target className="h-5 w-5 mr-2" />
                                        Vehicle Interest
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Vehicle of Interest</p>
                                        <p className="font-medium">{mockLead.vehicle_interest}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Budget Range</p>
                                        <p className="font-medium">{mockLead.budget_range}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Next Follow-up</p>
                                        <p className="font-medium">{new Date(mockLead.next_followup).toLocaleString()}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Contact History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockLead.contact_history.map((contact) => (
                                        <div key={contact.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                            {getContactIcon(contact.type)}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium capitalize">{contact.type.replace('_', ' ')}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(contact.date).toLocaleString()}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">By: {contact.user}</p>
                                                <p className="text-sm mt-1">{contact.notes}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="h-5 w-5 mr-2" />
                                    Activity Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockLead.activities.map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3">
                                            {getActivityIcon(activity.type)}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium capitalize">{activity.type.replace('_', ' ')}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(activity.date).toLocaleString()}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">By: {activity.user}</p>
                                                <p className="text-sm">{activity.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{mockLead.notes}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Lead Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Lead Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">Lead Score:</span>
                                    <span className="text-sm font-medium">{mockLead.lead_score}/100</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Conversion Probability:</span>
                                    <span className="text-sm font-medium text-green-600">{mockLead.conversion_probability}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Fake Lead Score:</span>
                                    <span className="text-sm font-medium">{mockLead.fake_lead_score}%</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm">Days Since Created:</span>
                                    <span className="text-sm font-medium">1</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Last Contact:</span>
                                    <span className="text-sm font-medium">Today</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quality Indicators */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quality Indicators</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Email Validity</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">Valid</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Phone Validity</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">Valid</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Duplicate Risk</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Source Quality</span>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">Good</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Lead
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Test Drive
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Add Note
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Update Status
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Lead Source Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Source Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Source Type</p>
                                    {getSourceBadge(mockLead.source)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Location</p>
                                    <p className="text-sm font-medium">{mockLead.location}</p>
                                </div>
                                {mockLead.ip_address && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">IP Address</p>
                                        <p className="text-sm font-mono">{mockLead.ip_address}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground">Routing Method</p>
                                    <p className="text-sm">Skill-based (Honda specialist)</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
