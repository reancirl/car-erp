import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, Globe, Star, TrendingUp, PhilippinePeso, Calendar, Clock, AlertTriangle, Users, Target } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { formatPHP, formatPhoneNumberPH } from '@/utils/formatters';

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

interface Lead {
    id: number;
    lead_id: string;
    name: string;
    email: string;
    phone: string;
    location: string | null;
    ip_address: string | null;
    source: string;
    status: string;
    priority: string;
    vehicle_interest: string | null;
    budget_min: number | null;
    budget_max: number | null;
    budget_range: string | null;
    purchase_timeline: string | null;
    lead_score: number;
    fake_lead_score: number;
    conversion_probability: number;
    assigned_to: number | null;
    last_contact_at: string | null;
    next_followup_at: string | null;
    contact_method: string | null;
    notes: string | null;
    tags: string[] | null;
    duplicate_flags: string[] | null;
    created_at: string;
    updated_at: string;
    branch: {
        id: number;
        name: string;
        code: string;
    };
    assigned_user: {
        id: number;
        name: string;
    } | null;
}

interface Props {
    lead: Lead;
    can: {
        edit: boolean;
        delete: boolean;
    };
}

export default function LeadView({ lead, can }: Props) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete lead ${lead.lead_id}?`)) {
            router.delete(`/sales/lead-management/${lead.id}`, {
                onSuccess: () => {
                    router.visit('/sales/lead-management');
                }
            });
        }
    };

    const getSourceBadge = (source: string) => {
        const sourceConfig: Record<string, { color: string; label: string }> = {
            web_form: { color: 'bg-blue-100 text-blue-800', label: 'Web Form' },
            phone: { color: 'bg-green-100 text-green-800', label: 'Phone' },
            walk_in: { color: 'bg-purple-100 text-purple-800', label: 'Walk-in' },
            referral: { color: 'bg-indigo-100 text-indigo-800', label: 'Referral' },
            social_media: { color: 'bg-pink-100 text-pink-800', label: 'Social Media' },
        };
        
        const config = sourceConfig[source] || { color: '', label: source };
        return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
            hot: { color: 'bg-red-100 text-red-800', label: 'Hot' },
            qualified: { color: 'bg-green-100 text-green-800', label: 'Qualified' },
            contacted: { color: 'bg-blue-100 text-blue-800', label: 'Contacted' },
            new: { color: 'bg-gray-100 text-gray-800', label: 'New' },
            unqualified: { color: 'bg-yellow-100 text-yellow-800', label: 'Unqualified' },
            lost: { color: 'bg-gray-100 text-gray-800', label: 'Lost' },
        };
        
        const config = statusConfig[status] || { color: '', label: status };
        return <Badge className={config.color}>{config.label}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig: Record<string, { color: string; label: string }> = {
            urgent: { color: 'bg-red-600 text-white', label: 'Urgent' },
            high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
            medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
            low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
        };
        
        const config = priorityConfig[priority] || { color: '', label: priority };
        return <Badge className={config.color}>{config.label}</Badge>;
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lead - ${lead.lead_id}`} />
            
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
                            <h1 className="text-2xl font-bold">{lead.name}</h1>
                            <p className="text-muted-foreground">Lead ID: {lead.lead_id}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {can.edit && (
                            <Link href={`/sales/lead-management/${lead.id}/edit`}>
                                <Button size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {can.delete && (
                            <Button size="sm" variant="destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Warning Banner for Suspicious Leads */}
                {(lead.fake_lead_score > 70 || (lead.duplicate_flags && lead.duplicate_flags.length > 0)) && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-orange-900">Suspicious Lead Detected</h3>
                                    <p className="text-sm text-orange-800 mt-1">
                                        This lead has been flagged for potential issues. Fake lead score: {lead.fake_lead_score}%
                                    </p>
                                    {lead.duplicate_flags && lead.duplicate_flags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {lead.duplicate_flags.map((flag: string) => (
                                                <Badge key={flag} variant="outline" className="bg-white text-orange-800">
                                                    {flag.replace('_', ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Full Name</p>
                                        <p className="font-medium">{lead.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center">
                                            <Mail className="h-3 w-3 mr-1" />
                                            Email Address
                                        </p>
                                        <p className="font-medium">{lead.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center">
                                            <Phone className="h-3 w-3 mr-1" />
                                            Phone Number
                                        </p>
                                        <p className="font-medium">{formatPhoneNumberPH(lead.phone)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            Location
                                        </p>
                                        <p className="font-medium">{lead.location || 'Not specified'}</p>
                                    </div>
                                    {lead.ip_address && (
                                        <div>
                                            <p className="text-sm text-muted-foreground flex items-center">
                                                <Globe className="h-3 w-3 mr-1" />
                                                IP Address
                                            </p>
                                            <p className="font-medium">{lead.ip_address}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lead Classification */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Star className="h-5 w-5 mr-2" />
                                    Lead Classification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <div className="mt-1">{getStatusBadge(lead.status)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Priority</p>
                                        <div className="mt-1">{getPriorityBadge(lead.priority)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Source</p>
                                        <div className="mt-1">{getSourceBadge(lead.source)}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Branch</p>
                                        <p className="font-medium">{lead.branch.name} ({lead.branch.code})</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center">
                                            <Users className="h-3 w-3 mr-1" />
                                            Assigned To
                                        </p>
                                        <p className="font-medium">{lead.assigned_user?.name || 'Unassigned'}</p>
                                    </div>
                                </div>
                                {lead.tags && lead.tags.length > 0 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Tags</p>
                                        <div className="flex flex-wrap gap-1">
                                            {lead.tags.map((tag: string) => (
                                                <Badge key={tag} variant="outline">
                                                    {tag.replace('_', ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Vehicle Interest & Budget */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Target className="h-5 w-5 mr-2" />
                                    Vehicle Interest & Budget
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Vehicle of Interest</p>
                                    <p className="font-medium text-lg">{lead.vehicle_interest || 'Not specified'}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center">
                                            <PhilippinePeso className="h-3 w-3 mr-1" />
                                            Budget Range
                                        </p>
                                        <p className="font-medium">
                                            {lead.budget_min && lead.budget_max 
                                                ? `${formatPHP(lead.budget_min)} - ${formatPHP(lead.budget_max)}`
                                                : lead.budget_range || 'Not specified'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Purchase Timeline
                                        </p>
                                        <p className="font-medium">
                                            {lead.purchase_timeline
                                                ? lead.purchase_timeline.replace('_', ' ')
                                                : 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Follow-up & Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2" />
                                    Follow-up & Contact History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Contact</p>
                                        <p className="font-medium">{formatDate(lead.last_contact_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Next Follow-up</p>
                                        <p className="font-medium">{formatDate(lead.next_followup_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Preferred Contact Method</p>
                                        <p className="font-medium">{lead.contact_method || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lead Created</p>
                                        <p className="font-medium">{formatDate(lead.created_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {lead.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Lead Score Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Lead Quality Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Lead Score</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-3xl font-bold">{lead.lead_score}</div>
                                        <div className="text-muted-foreground">/100</div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                lead.lead_score >= 80 ? 'bg-green-600' : 
                                                lead.lead_score >= 60 ? 'bg-yellow-600' : 
                                                'bg-red-600'
                                            }`}
                                            style={{ width: `${lead.lead_score}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Conversion Probability</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-2xl font-bold text-green-600">{lead.conversion_probability}%</div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Fake Lead Score</p>
                                    <div className="flex items-center space-x-2">
                                        <div className={`text-2xl font-bold ${
                                            lead.fake_lead_score > 70 ? 'text-red-600' : 
                                            lead.fake_lead_score > 40 ? 'text-yellow-600' : 
                                            'text-green-600'
                                        }`}>
                                            {lead.fake_lead_score}%
                                        </div>
                                    </div>
                                    {lead.fake_lead_score > 70 && (
                                        <p className="text-xs text-red-600 mt-1">High risk - review required</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full" variant="outline" size="sm" asChild>
                                    <a href={`mailto:${lead.email}`}>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Send Email
                                    </a>
                                </Button>
                                <Button className="w-full" variant="outline" size="sm" asChild>
                                    <a href={`tel:${lead.phone}`}>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Lead
                                    </a>
                                </Button>
                                {can.edit && (
                                    <Link href={`/sales/lead-management/${lead.id}/edit`}>
                                        <Button className="w-full" variant="outline" size="sm">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Details
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs">
                                <div>
                                    <p className="text-muted-foreground">Created</p>
                                    <p className="font-medium">{formatDate(lead.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Last Updated</p>
                                    <p className="font-medium">{formatDate(lead.updated_at)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Lead ID</p>
                                    <p className="font-medium font-mono">{lead.lead_id}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
