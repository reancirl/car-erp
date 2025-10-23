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
import { ArrowLeft, Save, User, Building2, MapPin, Star, Phone, Mail, X, AlertCircle, Users, Crown, Calendar } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { FormEvent, useState } from 'react';

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
        title: 'Edit Customer',
        href: '#',
    },
];

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface Manager {
    id: number;
    name: string;
    branch_id: number;
}

interface ExistingCustomer {
    id: number;
    customer_id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
}

interface Customer {
    id: number;
    customer_id: string;
    branch_id: number;
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
    email_notifications: boolean;
    sms_notifications: boolean;
    marketing_consent: boolean;
    assigned_to: number | null;
    notes: string | null;
    tags: string[] | null;
    referred_by: number | null;
    referral_source: string | null;
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
    customer: Customer;
    managers: Manager[];
    existingCustomers: ExistingCustomer[];
    auth: {
        user: {
            roles?: Role[];
            branch_id?: number;
        };
    };
    errors: Record<string, string>;
}

export default function CustomerExperienceEdit({ customer, managers, existingCustomers, auth, errors }: Props) {
    const isAdmin = auth.user.roles?.some(role => role.name === 'admin');
    
    const { data, setData, put, processing } = useForm({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        alternate_phone: customer.alternate_phone || '',
        date_of_birth: customer.date_of_birth || '',
        gender: customer.gender || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postal_code: customer.postal_code || '',
        country: customer.country || 'Philippines',
        customer_type: customer.customer_type || 'individual',
        company_name: customer.company_name || '',
        tax_id: customer.tax_id || '',
        status: customer.status || 'active',
        email_notifications: (customer.email_notifications ?? true) as boolean,
        sms_notifications: (customer.sms_notifications ?? true) as boolean,
        marketing_consent: (customer.marketing_consent ?? false) as boolean,
        assigned_to: customer.assigned_to ? customer.assigned_to.toString() : 'unassigned',
        notes: customer.notes || '',
        tags: customer.tags || [] as string[],
        referred_by: customer.referred_by ? customer.referred_by.toString() : 'none',
        referral_source: customer.referral_source || '',
    });

    const availableTags = [
        { id: 'vip', name: 'VIP' },
        { id: 'fleet_buyer', name: 'Fleet Buyer' },
        { id: 'referral_source', name: 'Referral Source' },
        { id: 'high_value', name: 'High Value' },
        { id: 'repeat_customer', name: 'Repeat Customer' },
        { id: 'corporate_account', name: 'Corporate Account' },
        { id: 'cash_buyer', name: 'Cash Buyer' },
        { id: 'financing_preferred', name: 'Financing Preferred' },
    ];

    const toggleTag = (tagId: string) => {
        setData('tags', data.tags.includes(tagId)
            ? data.tags.filter(id => id !== tagId)
            : [...data.tags, tagId]
        );
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/sales/customer-experience/${customer.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer" />
            
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
                        <Link href="/sales/customer-experience">
                            <Button variant="outline" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Customers
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Customer</h1>
                            <p className="text-muted-foreground">Update customer information - {customer.customer_id}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/sales/customer-experience">
                            <Button variant="outline" type="button">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Customer'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Branch Display (Not Editable) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Branch Assignment</CardTitle>
                                <CardDescription>Branch cannot be changed after creation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label>Branch</Label>
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="font-medium">{customer.branch.name} ({customer.branch.code})</p>
                                        <p className="text-sm text-muted-foreground">Branch is locked after customer creation</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>Basic customer details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            className={errors.first_name ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            className={errors.last_name ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={errors.email ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className={errors.phone ? 'border-red-500' : ''}
                                            placeholder="09171234567"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">Format: 09XXXXXXXXX or +639XXXXXXXXX</p>
                                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="alternate_phone">Alternate Phone</Label>
                                        <Input
                                            id="alternate_phone"
                                            type="tel"
                                            value={data.alternate_phone}
                                            onChange={(e) => setData('alternate_phone', e.target.value)}
                                            className={errors.alternate_phone ? 'border-red-500' : ''}
                                            placeholder="09171234567"
                                        />
                                        <p className="text-xs text-muted-foreground">Format: 09XXXXXXXXX or +639XXXXXXXXX</p>
                                        {errors.alternate_phone && <p className="text-sm text-red-600">{errors.alternate_phone}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            className={errors.date_of_birth ? 'border-red-500' : ''}
                                        />
                                        {errors.date_of_birth && <p className="text-sm text-red-600">{errors.date_of_birth}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                        <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Address Information
                                </CardTitle>
                                <CardDescription>Customer location details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Street Address</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className={errors.address ? 'border-red-500' : ''}
                                        rows={2}
                                    />
                                    {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className={errors.city ? 'border-red-500' : ''}
                                        />
                                        {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state">State/Province</Label>
                                        <Input
                                            id="state"
                                            value={data.state}
                                            onChange={(e) => setData('state', e.target.value)}
                                            className={errors.state ? 'border-red-500' : ''}
                                        />
                                        {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code (ZIP)</Label>
                                        <Input
                                            id="postal_code"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            className={errors.postal_code ? 'border-red-500' : ''}
                                            placeholder="1000"
                                            maxLength={4}
                                        />
                                        <p className="text-xs text-muted-foreground">4-digit Philippine ZIP code</p>
                                        {errors.postal_code && <p className="text-sm text-red-600">{errors.postal_code}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            value={data.country}
                                            onChange={(e) => setData('country', e.target.value)}
                                            className={errors.country ? 'border-red-500' : ''}
                                        />
                                        {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Building2 className="h-5 w-5 mr-2" />
                                    Business Information
                                </CardTitle>
                                <CardDescription>Corporate customer details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_type">Customer Type *</Label>
                                    <Select value={data.customer_type} onValueChange={(value) => setData('customer_type', value)} required>
                                        <SelectTrigger className={errors.customer_type ? 'border-red-500' : ''}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="corporate">Corporate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_type && <p className="text-sm text-red-600">{errors.customer_type}</p>}
                                </div>

                                {data.customer_type === 'corporate' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="company_name">Company Name *</Label>
                                            <Input
                                                id="company_name"
                                                value={data.company_name}
                                                onChange={(e) => setData('company_name', e.target.value)}
                                                className={errors.company_name ? 'border-red-500' : ''}
                                                required={data.customer_type === 'corporate'}
                                            />
                                            {errors.company_name && <p className="text-sm text-red-600">{errors.company_name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tax_id">Tax ID (TIN)</Label>
                                            <Input
                                                id="tax_id"
                                                value={data.tax_id}
                                                onChange={(e) => setData('tax_id', e.target.value)}
                                                className={errors.tax_id ? 'border-red-500' : ''}
                                                placeholder="XXX-XXX-XXX-XXX"
                                            />
                                            {errors.tax_id && <p className="text-sm text-red-600">{errors.tax_id}</p>}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Notes</CardTitle>
                                <CardDescription>Internal notes and comments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className={errors.notes ? 'border-red-500' : ''}
                                        rows={4}
                                        placeholder="Add any additional information about this customer..."
                                    />
                                    {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                </div>
                            </CardContent>
                        </Card>
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
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)} required>
                                        <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="vip">VIP</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="blacklisted">Blacklisted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned_to">Assigned Manager</Label>
                                    <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                                        <SelectTrigger className={errors.assigned_to ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Unassigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {managers.map((manager) => (
                                                <SelectItem key={manager.id} value={manager.id.toString()}>
                                                    {manager.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.assigned_to && <p className="text-sm text-red-600">{errors.assigned_to}</p>}
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
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="email_notifications"
                                        checked={data.email_notifications}
                                        onCheckedChange={(checked) => setData('email_notifications', !!checked)}
                                    />
                                    <label htmlFor="email_notifications" className="text-sm font-medium">
                                        Email Notifications
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="sms_notifications"
                                        checked={data.sms_notifications}
                                        onCheckedChange={(checked) => setData('sms_notifications', !!checked)}
                                    />
                                    <label htmlFor="sms_notifications" className="text-sm font-medium">
                                        SMS Notifications
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="marketing_consent"
                                        checked={data.marketing_consent}
                                        onCheckedChange={(checked) => setData('marketing_consent', !!checked)}
                                    />
                                    <label htmlFor="marketing_consent" className="text-sm font-medium">
                                        Marketing Consent
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                                <CardDescription>Categorize this customer</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant={data.tags.includes(tag.id) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => toggleTag(tag.id)}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Referral Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="h-5 w-5 mr-2" />
                                    Referral Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="referred_by">Referred By</Label>
                                    <Select value={data.referred_by} onValueChange={(value) => setData('referred_by', value)}>
                                        <SelectTrigger className={errors.referred_by ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {existingCustomers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.customer_id} - {customer.first_name} {customer.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.referred_by && <p className="text-sm text-red-600">{errors.referred_by}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="referral_source">Referral Source</Label>
                                    <Input
                                        id="referral_source"
                                        value={data.referral_source}
                                        onChange={(e) => setData('referral_source', e.target.value)}
                                        className={errors.referral_source ? 'border-red-500' : ''}
                                        placeholder="How did they find us?"
                                    />
                                    {errors.referral_source && <p className="text-sm text-red-600">{errors.referral_source}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
