import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, User, Globe, Target, Star, Calendar, X, AlertCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { FormEvent, useState } from 'react';
import { formatPHP, formatPhoneNumberPH, isValidPhoneNumberPH, PH_REGIONS } from '@/utils/formatters';

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
        title: 'Create Lead',
        href: '/sales/lead-management/create',
    },
];

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface SalesRep {
    id: number;
    name: string;
    branch_id: number;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
}

interface VehicleModel {
    id: number;
    make: string;
    model: string;
    year: number;
    body_type: string;
}

interface Props {
    branches: Branch[] | null;
    salesReps: SalesRep[];
    vehicleModels: VehicleModel[];
    auth: {
        user: {
            roles?: Role[];
            branch_id?: number;
        };
    };
}

export default function LeadCreate({ branches, salesReps, vehicleModels, auth }: Props) {
    const isAdmin = auth.user.roles?.some(role => role.name === 'admin');
    
    const { data, setData, post, processing, errors } = useForm({
        branch_id: !isAdmin && auth.user.branch_id ? auth.user.branch_id.toString() : '',
        name: '',
        email: '',
        phone: '',
        location: '',
        ip_address: '',
        source: 'web_form',
        status: 'new',
        priority: 'medium',
        vehicle_interest: '',
        vehicle_model_id: '' as string,
        budget_min: '',
        budget_max: '',
        purchase_timeline: '',
        assigned_to: 'unassigned',
        next_followup_at: '',
        contact_method: '',
        notes: '',
        tags: [] as string[],
    });

    const availableTags = [
        { id: 'hot_lead', name: 'Hot Lead' },
        { id: 'financing_needed', name: 'Financing Needed' },
        { id: 'trade_in', name: 'Trade-in' },
        { id: 'cash_buyer', name: 'Cash Buyer' },
        { id: 'first_time_buyer', name: 'First Time Buyer' },
        { id: 'repeat_customer', name: 'Repeat Customer' },
        { id: 'urgent', name: 'Urgent' },
        { id: 'pre_approved', name: 'Pre-approved' },
    ];

    const toggleTag = (tagId: string) => {
        setData('tags', data.tags.includes(tagId)
            ? data.tags.filter(id => id !== tagId)
            : [...data.tags, tagId]
        );
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Submitting lead data:', data);
        post('/sales/lead-management', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Lead" />
            
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {/* Validation Error Banner */}
                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-900">Validation Error</h3>
                                    <p className="text-sm text-red-800 mt-1">
                                        Please correct the following errors before submitting:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field}>
                                                <strong className="capitalize">{field.replace(/_/g, ' ')}</strong>: {message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/sales/lead-management">
                            <Button variant="outline" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Leads
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Create New Lead</h1>
                            <p className="text-muted-foreground">Add a new lead to the sales pipeline</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/sales/lead-management">
                            <Button variant="outline" type="button">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Lead'}
                        </Button>
                    </div>
                </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Branch Selection (Admin Only) */}
                            {isAdmin && branches && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Branch Assignment</CardTitle>
                                        <CardDescription>Select which branch this lead belongs to (Required)</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Label htmlFor="branch_id">Branch *</Label>
                                            <Select value={data.branch_id} onValueChange={(value) => setData('branch_id', value)} required>
                                                <SelectTrigger className={errors.branch_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select branch (Required)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {branches.map((branch) => (
                                                        <SelectItem key={branch.id} value={branch.id.toString()}>
                                                            {branch.name} ({branch.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.branch_id && <p className="text-sm text-red-600">{errors.branch_id}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Lead Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Lead Information
                                    </CardTitle>
                                    <CardDescription>Basic contact and identification details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input 
                                                id="name" 
                                                placeholder="Enter full name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input 
                                                id="email" 
                                                type="email"
                                                placeholder="Enter email address"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                            />
                                            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input 
                                                id="phone" 
                                                placeholder="e.g., 0912 345 6789 or +63 912 345 6789"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                required
                                            />
                                            {data.phone && !isValidPhoneNumberPH(data.phone) && (
                                                <p className="text-xs text-amber-600">⚠️ Please enter a valid Philippine mobile number</p>
                                            )}
                                            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location / Region</Label>
                                            <Select value={data.location} onValueChange={(value) => setData('location', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select region" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PH_REGIONS.map((region) => (
                                                        <SelectItem key={region} value={region}>
                                                            {region}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ip_address">IP Address (Optional)</Label>
                                        <Input 
                                            id="ip_address" 
                                            placeholder="e.g., 192.168.1.1"
                                            value={data.ip_address}
                                            onChange={(e) => setData('ip_address', e.target.value)}
                                        />
                                        {errors.ip_address && <p className="text-sm text-red-600">{errors.ip_address}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Source & Classification */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Globe className="h-5 w-5 mr-2" />
                                        Source & Classification
                                    </CardTitle>
                                    <CardDescription>Lead source, status, and priority settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="source">Lead Source *</Label>
                                            <Select value={data.source} onValueChange={(value) => setData('source', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select source" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="web_form">Web Form</SelectItem>
                                                    <SelectItem value="phone">Phone Call</SelectItem>
                                                    <SelectItem value="walk_in">Walk-in</SelectItem>
                                                    <SelectItem value="referral">Referral</SelectItem>
                                                    <SelectItem value="social_media">Social Media</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.source && <p className="text-sm text-red-600">{errors.source}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Initial Status</Label>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="new">New</SelectItem>
                                                    <SelectItem value="contacted">Contacted</SelectItem>
                                                    <SelectItem value="qualified">Qualified</SelectItem>
                                                    <SelectItem value="hot">Hot</SelectItem>
                                                    <SelectItem value="unqualified">Unqualified</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.priority && <p className="text-sm text-red-600">{errors.priority}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="assigned_to">Assign to Sales Rep</Label>
                                            <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select sales rep" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {salesReps.map((rep) => (
                                                        <SelectItem key={rep.id} value={rep.id.toString()}>
                                                            {rep.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.assigned_to && <p className="text-sm text-red-600">{errors.assigned_to}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Vehicle Interest & Budget */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Target className="h-5 w-5 mr-2" />
                                        Vehicle Interest & Budget
                                    </CardTitle>
                                    <CardDescription>Customer preferences and budget information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle_interest">Vehicle of Interest</Label>
                                        <Select 
                                            value={data.vehicle_model_id} 
                                            onValueChange={(value) => {
                                                console.log('Selected vehicle model ID:', value);
                                                const selectedModel = vehicleModels.find(m => m.id.toString() === value);
                                                console.log('Found model:', selectedModel);
                                                if (selectedModel) {
                                                    const vehicleText = `${selectedModel.year} ${selectedModel.make} ${selectedModel.model}`;
                                                    setData((prevData) => ({
                                                        ...prevData,
                                                        vehicle_model_id: value,
                                                        vehicle_interest: vehicleText,
                                                    }));
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vehicle model" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vehicleModels && vehicleModels.length > 0 ? (
                                                    vehicleModels
                                                        .filter((model) => model.id && model.id.toString().trim() !== '' && !isNaN(Number(model.id)))
                                                        .map((model) => (
                                                            <SelectItem key={model.id} value={model.id.toString()}>
                                                                {model.year} {model.make} {model.model} - {model.body_type}
                                                            </SelectItem>
                                                        ))
                                                ) : (
                                                    <div className="p-2 text-sm text-muted-foreground">
                                                        No vehicle models available
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Select from available vehicle models in inventory
                                        </p>
                                        {errors.vehicle_interest && <p className="text-sm text-red-600">{errors.vehicle_interest}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="budget_min">Budget Min (₱)</Label>
                                            <Input 
                                                id="budget_min" 
                                                type="number"
                                                placeholder="500000"
                                                value={data.budget_min}
                                                onChange={(e) => setData('budget_min', e.target.value)}
                                            />
                                            {data.budget_min && (
                                                <p className="text-xs text-muted-foreground">{formatPHP(data.budget_min)}</p>
                                            )}
                                            {errors.budget_min && <p className="text-sm text-red-600">{errors.budget_min}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="budget_max">Budget Max (₱)</Label>
                                            <Input 
                                                id="budget_max" 
                                                type="number"
                                                placeholder="1000000"
                                                value={data.budget_max}
                                                onChange={(e) => setData('budget_max', e.target.value)}
                                            />
                                            {data.budget_max && (
                                                <p className="text-xs text-muted-foreground">{formatPHP(data.budget_max)}</p>
                                            )}
                                            {errors.budget_max && <p className="text-sm text-red-600">{errors.budget_max}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purchase_timeline">Purchase Timeline</Label>
                                        <Select value={data.purchase_timeline} onValueChange={(value) => setData('purchase_timeline', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="When are they looking to buy?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="immediate">Immediate (within 1 week)</SelectItem>
                                                <SelectItem value="soon">Soon (1-4 weeks)</SelectItem>
                                                <SelectItem value="month">Within a month</SelectItem>
                                                <SelectItem value="quarter">Within 3 months</SelectItem>
                                                <SelectItem value="exploring">Just exploring</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.purchase_timeline && <p className="text-sm text-red-600">{errors.purchase_timeline}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tags & Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Star className="h-5 w-5 mr-2" />
                                        Tags & Notes
                                    </CardTitle>
                                    <CardDescription>Additional classification and notes</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Lead Tags</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {availableTags.map((tag) => (
                                                <div key={tag.id} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={tag.id}
                                                        checked={data.tags.includes(tag.id)}
                                                        onCheckedChange={() => toggleTag(tag.id)}
                                                    />
                                                    <Label htmlFor={tag.id} className="text-sm cursor-pointer">
                                                        {tag.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Initial Notes</Label>
                                        <Textarea 
                                            id="notes" 
                                            placeholder="Any additional information about the lead"
                                            rows={4}
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                        />
                                        {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Follow-up Schedule */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Initial Follow-up
                                    </CardTitle>
                                    <CardDescription>Set the first contact schedule</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="next_followup_at">Next Follow-up Date & Time</Label>
                                            <Input 
                                                id="next_followup_at" 
                                                type="datetime-local"
                                                value={data.next_followup_at}
                                                onChange={(e) => setData('next_followup_at', e.target.value)}
                                            />
                                            {errors.next_followup_at && <p className="text-sm text-red-600">{errors.next_followup_at}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_method">Preferred Contact Method</Label>
                                            <Select value={data.contact_method} onValueChange={(value) => setData('contact_method', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="How should we contact them?" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="phone">Phone Call</SelectItem>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="text">Text Message</SelectItem>
                                                    <SelectItem value="any">Any Method</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.contact_method && <p className="text-sm text-red-600">{errors.contact_method}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Lead Preview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <Badge>{data.status || 'new'}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Priority</p>
                                        <Badge>{data.priority || 'medium'}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Source</p>
                                        <Badge variant="outline">{data.source}</Badge>
                                    </div>
                                    {data.tags.length > 0 && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Tags</p>
                                            <div className="flex flex-wrap gap-1">
                                                {data.tags.map((tagId) => {
                                                    const tag = availableTags.find(t => t.id === tagId);
                                                    return tag ? (
                                                        <Badge key={tagId} variant="outline" className="text-xs">
                                                            {tag.name}
                                                        </Badge>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Guidelines */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Guidelines</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs text-muted-foreground">
                                    <p>• Verify contact information accuracy</p>
                                    <p>• Set appropriate priority based on urgency</p>
                                    <p>• Add relevant tags for better categorization</p>
                                    <p>• Schedule follow-up within 24 hours for hot leads</p>
                                    <p>• Include detailed notes from initial conversation</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
            </form>
        </AppLayout>
    );
}
