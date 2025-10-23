import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, User, Building2, MapPin, Mail, Phone, Star, Users, Crown, CheckCircle, XCircle, AlertTriangle, Calendar, TrendingUp, Send, Copy, Link as LinkIcon, Clock } from 'lucide-react';
import { useState } from 'react';
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
        title: 'View Customer',
        href: '#',
    },
];

interface Customer {
    id: number;
    customer_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    alternate_phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string;
    customer_type: string;
    company_name: string | null;
    tax_id: string | null;
    status: string;
    satisfaction_rating: string | null;
    total_purchases: number;
    total_spent: number;
    loyalty_points: number;
    customer_lifetime_value: number;
    email_notifications: boolean;
    sms_notifications: boolean;
    marketing_consent: boolean;
    notes: string | null;
    tags: string[] | null;
    referral_source: string | null;
    created_at: string;
    branch: {
        id: number;
        name: string;
        code: string;
    };
    assigned_user: {
        id: number;
        name: string;
    } | null;
    referred_by_customer: {
        id: number;
        customer_id: string;
        first_name: string;
        last_name: string;
    } | null;
    referrals: Array<{
        id: number;
        customer_id: string;
        first_name: string;
        last_name: string;
    }>;
}

interface Survey {
    id: number;
    token: string;
    survey_type: string;
    status: string;
    created_at: string;
    completed_at: string | null;
    expires_at: string | null;
    overall_rating: number | null;
}

interface Props {
    customer: Customer;
    surveys: Survey[];
    can: {
        edit: boolean;
        delete: boolean;
        send_survey: boolean;
    };
    flash?: {
        survey_url?: string;
    };
}

export default function CustomerExperienceView({ customer, surveys, can, flash }: Props) {
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete customer ${customer.customer_id}?`)) {
            router.delete(`/sales/customer-experience/${customer.id}`);
        }
    };

    const handleGenerateSurvey = () => {
        if (confirm('Generate a new survey for this customer?')) {
            router.post(`/sales/customer-experience/${customer.id}/generate-survey`);
        }
    };

    const handleCopyLink = (token: string) => {
        const url = `${window.location.origin}/survey/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const handleSendEmail = (surveyId: number) => {
        if (confirm(`Send survey email to ${customer.email}?`)) {
            router.post(`/sales/customer-experience/${customer.id}/survey/${surveyId}/send-email`);
        }
    };

    const getSurveyStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Expired
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case 'vip':
                return (
                    <Badge className="bg-purple-100 text-purple-800">
                        <Crown className="h-3 w-3 mr-1" />
                        VIP
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                    </Badge>
                );
            case 'blacklisted':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Blacklisted
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getSatisfactionBadge = (rating: string | null) => {
        if (!rating) return <span className="text-muted-foreground">Not rated</span>;
        
        switch (rating) {
            case 'very_satisfied':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <Star className="h-3 w-3 mr-1 fill-green-800" />
                        Very Satisfied
                    </Badge>
                );
            case 'satisfied':
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        <Star className="h-3 w-3 mr-1" />
                        Satisfied
                    </Badge>
                );
            case 'neutral':
                return <Badge variant="secondary">Neutral</Badge>;
            case 'dissatisfied':
                return (
                    <Badge className="bg-orange-100 text-orange-800">
                        Dissatisfied
                    </Badge>
                );
            case 'very_dissatisfied':
                return <Badge variant="destructive">Very Dissatisfied</Badge>;
            default:
                return <Badge variant="secondary">{rating}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer - ${customer.customer_id}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/customer-experience">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Customers
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {customer.first_name} {customer.last_name}
                            </h1>
                            <p className="text-muted-foreground">{customer.customer_id}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {can.edit && (
                            <Link href={`/sales/customer-experience/${customer.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {can.delete && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">First Name</p>
                                    <p className="font-medium">{customer.first_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Name</p>
                                    <p className="font-medium">{customer.last_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                        {customer.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium flex items-center">
                                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                        {customer.phone}
                                    </p>
                                </div>
                                {customer.alternate_phone && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Alternate Phone</p>
                                        <p className="font-medium">{customer.alternate_phone}</p>
                                    </div>
                                )}
                                {customer.date_of_birth && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                                        <p className="font-medium flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {new Date(customer.date_of_birth).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {customer.gender && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Gender</p>
                                        <p className="font-medium capitalize">{customer.gender.replace(/_/g, ' ')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Address Information */}
                        {(customer.address || customer.city || customer.state) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        Address Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {customer.address && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Street Address</p>
                                            <p className="font-medium">{customer.address}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        {customer.city && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">City</p>
                                                <p className="font-medium">{customer.city}</p>
                                            </div>
                                        )}
                                        {customer.state && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">State/Province</p>
                                                <p className="font-medium">{customer.state}</p>
                                            </div>
                                        )}
                                        {customer.postal_code && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Postal Code</p>
                                                <p className="font-medium">{customer.postal_code}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-muted-foreground">Country</p>
                                            <p className="font-medium">{customer.country}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Business Information */}
                        {customer.customer_type === 'corporate' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Building2 className="h-5 w-5 mr-2" />
                                        Business Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Customer Type</p>
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                            <Building2 className="h-3 w-3 mr-1" />
                                            Corporate
                                        </Badge>
                                    </div>
                                    {customer.company_name && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Company Name</p>
                                            <p className="font-medium">{customer.company_name}</p>
                                        </div>
                                    )}
                                    {customer.tax_id && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tax ID (TIN)</p>
                                            <p className="font-medium">{customer.tax_id}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Purchase History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2" />
                                    Purchase History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Purchases</p>
                                    <p className="text-2xl font-bold">{customer.total_purchases}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Spent</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ₱{customer.total_spent.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Loyalty Points</p>
                                    <p className="text-xl font-bold text-purple-600">{customer.loyalty_points}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Lifetime Value</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        ₱{customer.customer_lifetime_value.toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {customer.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status & Classification */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Star className="h-5 w-5 mr-2" />
                                    Status & Classification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                                    {getStatusBadge(customer.status)}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Satisfaction Rating</p>
                                    {getSatisfactionBadge(customer.satisfaction_rating)}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Branch</p>
                                    <Badge variant="outline">{customer.branch.name} ({customer.branch.code})</Badge>
                                </div>
                                {customer.assigned_user && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Assigned Manager</p>
                                        <p className="font-medium">{customer.assigned_user.name}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Customer Since</p>
                                    <p className="font-medium">
                                        {new Date(customer.created_at).toLocaleDateString('en-US', { 
                                            month: 'long', 
                                            year: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Communication Preferences */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Mail className="h-5 w-5 mr-2" />
                                    Communication
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Email Notifications</span>
                                    {customer.email_notifications ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">SMS Notifications</span>
                                    {customer.sms_notifications ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Marketing Consent</span>
                                    {customer.marketing_consent ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-gray-400" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        {customer.tags && customer.tags.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tags</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {customer.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline">
                                                {tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Referral Information */}
                        {(customer.referred_by_customer || customer.referral_source || customer.referrals.length > 0) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Users className="h-5 w-5 mr-2" />
                                        Referral Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {customer.referred_by_customer && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Referred By</p>
                                            <Link href={`/sales/customer-experience/${customer.referred_by_customer.id}`}>
                                                <p className="font-medium text-blue-600 hover:underline">
                                                    {customer.referred_by_customer.customer_id} - {customer.referred_by_customer.first_name} {customer.referred_by_customer.last_name}
                                                </p>
                                            </Link>
                                        </div>
                                    )}
                                    {customer.referral_source && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Referral Source</p>
                                            <p className="font-medium">{customer.referral_source}</p>
                                        </div>
                                    )}
                                    {customer.referrals.length > 0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Referred Customers ({customer.referrals.length})</p>
                                            <div className="space-y-1">
                                                {customer.referrals.map((referral) => (
                                                    <Link key={referral.id} href={`/sales/customer-experience/${referral.id}`}>
                                                        <p className="text-sm text-blue-600 hover:underline">
                                                            {referral.customer_id} - {referral.first_name} {referral.last_name}
                                                        </p>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Customer Surveys */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center">
                                        <LinkIcon className="h-5 w-5 mr-2" />
                                        Customer Surveys
                                    </CardTitle>
                                    {can.send_survey && (
                                        <Button size="sm" onClick={handleGenerateSurvey}>
                                            <Send className="h-4 w-4 mr-2" />
                                            Generate Survey
                                        </Button>
                                    )}
                                </div>
                                <CardDescription>
                                    Send satisfaction surveys and track responses
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Flash message for newly generated survey */}
                                {flash?.survey_url && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="font-semibold text-green-900 mb-2">Survey Generated!</p>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={flash.survey_url}
                                                readOnly
                                                className="flex-1 p-2 border rounded text-sm bg-white"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(flash.survey_url!);
                                                    alert('Link copied to clipboard!');
                                                }}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Survey Statistics */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2 bg-blue-50 rounded">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {surveys.filter(s => s.status === 'pending').length}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Pending</p>
                                    </div>
                                    <div className="p-2 bg-green-50 rounded">
                                        <p className="text-2xl font-bold text-green-600">
                                            {surveys.filter(s => s.status === 'completed').length}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Completed</p>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded">
                                        <p className="text-2xl font-bold text-gray-600">{surveys.length}</p>
                                        <p className="text-xs text-muted-foreground">Total</p>
                                    </div>
                                </div>

                                {/* Recent Surveys List */}
                                {surveys.length > 0 ? (
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium">Recent Surveys</p>
                                        {surveys.map((survey) => (
                                            <div
                                                key={survey.id}
                                                className="border rounded-lg p-3 space-y-2 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getSurveyStatusBadge(survey.status)}
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(survey.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {survey.overall_rating && (
                                                        <div className="flex items-center">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                                            <span className="text-sm font-medium">
                                                                {survey.overall_rating}/5
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {survey.status !== 'completed' && (
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleCopyLink(survey.token)}
                                                            className="flex-1"
                                                        >
                                                            {copiedToken === survey.token ? (
                                                                <>
                                                                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                                                    Copied!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="h-3 w-3 mr-1" />
                                                                    Copy Link
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleSendEmail(survey.id)}
                                                            className="flex-1"
                                                        >
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            Send Email
                                                        </Button>
                                                    </div>
                                                )}

                                                {survey.expires_at && survey.status === 'pending' && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Expires: {new Date(survey.expires_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No surveys generated yet</p>
                                        {can.send_survey && (
                                            <p className="text-xs mt-1">Click "Generate Survey" to create one</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
