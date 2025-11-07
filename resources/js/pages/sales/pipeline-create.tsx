import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, User, TrendingUp, AlertCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Pipeline',
        href: '/sales/pipeline',
    },
    {
        title: 'Create Opportunity',
        href: '/sales/pipeline/create',
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
}

interface Lead {
    id: number;
    lead_id: string;
    name: string;
    email: string;
    phone: string;
    branch_id: number;
    vehicle_interest?: string;
    vehicle_variant?: string;
    vehicle_model_id?: number;
}

interface VehicleModel {
    id: number;
    model_code: string;
    make: string;
    model: string;
    year: number;
    base_price?: number;
}

interface Props {
    branches: Branch[] | null;
    salesReps: SalesRep[];
    leads: Lead[];
    vehicleModels: VehicleModel[];
}

export default function PipelineCreate({ branches, salesReps, leads, vehicleModels }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: '',
        lead_id: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        sales_rep_id: '',
        vehicle_interest: '',
        vehicle_model_id: undefined as string | undefined,
        quote_amount: '',
        probability: 50,
        current_stage: 'lead',
        priority: 'medium',
        next_action: '',
        next_action_due: '',
        auto_progression_enabled: true as boolean,
        auto_loss_rule_enabled: true as boolean,
        follow_up_frequency: 'weekly',
        notes: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/sales/pipeline');
    };

    const handleLeadSelect = (leadId: string | undefined) => {
        if (leadId) {
            const selectedLead = leads.find(l => l.id.toString() === leadId);
            
            if (selectedLead) {
                // Find the vehicle model if lead has vehicle_model_id
                let vehicleModel = selectedLead.vehicle_model_id 
                    ? vehicleModels.find(m => m.id === selectedLead.vehicle_model_id)
                    : null;

                // If no vehicle_model_id but has vehicle_interest text, try to match it
                if (!vehicleModel && selectedLead.vehicle_interest) {
                    const interestText = selectedLead.vehicle_interest.toLowerCase();
                    vehicleModel = vehicleModels.find(m => {
                        const modelText = `${m.year} ${m.make} ${m.model}`.toLowerCase();
                        return interestText.includes(modelText) || modelText.includes(interestText);
                    });
                }

                setData({
                    ...data,
                    lead_id: leadId,
                    branch_id: selectedLead.branch_id.toString(),
                    customer_name: selectedLead.name,
                    customer_email: selectedLead.email,
                    customer_phone: selectedLead.phone,
                    // Auto-populate vehicle interest and model from lead
                    vehicle_interest: selectedLead.vehicle_interest || '',
                    vehicle_model_id: vehicleModel ? vehicleModel.id.toString() : undefined,
                    // Auto-populate quote amount if vehicle model has base_price
                    quote_amount: vehicleModel?.base_price ? vehicleModel.base_price.toString() : data.quote_amount,
                });
            }
        } else {
            // Clear lead-related data when deselected
            setData({
                ...data,
                lead_id: '',
            });
        }
    };

    const handleVehicleModelSelect = (value: string) => {
        if (!value) {
            setData({
                ...data,
                vehicle_model_id: undefined,
                vehicle_interest: '',
            });
            return;
        }

        const selectedModel = vehicleModels.find(m => m.id.toString() === value);
        if (selectedModel) {
            const vehicleText = `${selectedModel.year} ${selectedModel.make} ${selectedModel.model}`;
            setData({
                ...data,
                vehicle_model_id: value,
                vehicle_interest: vehicleText,
                quote_amount: selectedModel.base_price ? selectedModel.base_price.toString() : data.quote_amount,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Pipeline Opportunity" />
            
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
                        <Link href="/sales/pipeline">
                            <Button variant="outline" size="sm" type="button">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center">
                                <TrendingUp className="h-6 w-6 mr-2" />
                                Create Pipeline Opportunity
                            </h1>
                            <p className="text-muted-foreground">Add a new opportunity to the sales pipeline</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/sales/pipeline">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Opportunity'}
                        </Button>
                    </div>
                </div>
                    {/* Link to Existing Lead */}
                    {leads && leads.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Link to Existing Lead (Optional)</CardTitle>
                                <CardDescription>Select an existing lead to auto-fill customer information and branch</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select value={data.lead_id || undefined} onValueChange={handleLeadSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="None - Manual Entry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leads.map((lead) => (
                                            <SelectItem key={lead.id} value={lead.id.toString()}>
                                                {lead.lead_id} - {lead.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    )}

                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Customer Information
                            </CardTitle>
                            <CardDescription>Basic contact details for the opportunity</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_name">Customer Name *</Label>
                                    <Input
                                        id="customer_name"
                                        value={data.customer_name}
                                        onChange={(e) => setData('customer_name', e.target.value)}
                                        placeholder="Enter customer name"
                                    />
                                    {errors.customer_name && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.customer_name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_phone">Phone Number *</Label>
                                    <Input
                                        id="customer_phone"
                                        value={data.customer_phone}
                                        onChange={(e) => setData('customer_phone', e.target.value)}
                                        placeholder="e.g., +63-917-123-4567 or 09171234567"
                                    />
                                    {errors.customer_phone && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.customer_phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customer_email">Email Address</Label>
                                <Input
                                    id="customer_email"
                                    type="email"
                                    value={data.customer_email}
                                    onChange={(e) => setData('customer_email', e.target.value)}
                                    placeholder="customer@example.com"
                                />
                                {errors.customer_email && (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.customer_email}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vehicle Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Interest</CardTitle>
                            <CardDescription>Details about the vehicle the customer is interested in</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="vehicle_model_id">Vehicle Interest</Label>
                                <Select value={data.vehicle_model_id} onValueChange={handleVehicleModelSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a vehicle model..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleModels
                                            .filter((model) => model.id && model.id.toString().trim() !== '' && !isNaN(Number(model.id)))
                                            .map((model) => (
                                                <SelectItem key={model.id} value={model.id.toString()}>
                                                    {`${model.year} ${model.make} ${model.model} (${model.model_code})`}
                                                    {model.base_price ? ` - ₱${Number(model.base_price).toLocaleString()}` : ''}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.vehicle_interest && (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.vehicle_interest}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quote_amount">Quote Amount (₱)</Label>
                                <Input
                                    id="quote_amount"
                                    type="number"
                                    step="0.01"
                                    value={data.quote_amount}
                                    onChange={(e) => setData('quote_amount', e.target.value)}
                                    placeholder="1500000.00"
                                />
                                {errors.quote_amount && (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.quote_amount}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pipeline Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pipeline Details</CardTitle>
                            <CardDescription>Stage, priority, and probability settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_stage">Current Stage *</Label>
                                    <Select value={data.current_stage} onValueChange={(value) => setData('current_stage', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lead">Lead</SelectItem>
                                            <SelectItem value="qualified">Qualified</SelectItem>
                                            <SelectItem value="quote_sent">Quote Sent</SelectItem>
                                            <SelectItem value="test_drive_scheduled">Test Drive Scheduled</SelectItem>
                                            <SelectItem value="test_drive_completed">Test Drive Completed</SelectItem>
                                            <SelectItem value="reservation_made">Reservation Made</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.current_stage && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.current_stage}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.priority}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="probability">Probability (%) *</Label>
                                    <Input
                                        id="probability"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.probability}
                                        onChange={(e) => setData('probability', parseInt(e.target.value) || 0)}
                                    />
                                    {errors.probability && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.probability}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sales_rep_id">Assign Sales Rep</Label>
                                <Select value={data.sales_rep_id || undefined} onValueChange={(value) => setData('sales_rep_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {salesReps.map((rep) => (
                                            <SelectItem key={rep.id} value={rep.id.toString()}>
                                                {rep.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Next Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Next Actions</CardTitle>
                            <CardDescription>Plan follow-up activities</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="next_action">Next Action</Label>
                                <Input
                                    id="next_action"
                                    value={data.next_action}
                                    onChange={(e) => setData('next_action', e.target.value)}
                                    placeholder="e.g., Follow up on quote"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="next_action_due">Next Action Due Date</Label>
                                <Input
                                    id="next_action_due"
                                    type="datetime-local"
                                    value={data.next_action_due}
                                    onChange={(e) => setData('next_action_due', e.target.value)}
                                />
                                {errors.next_action_due && (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.next_action_due}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="follow_up_frequency">Follow-up Frequency</Label>
                                <Select value={data.follow_up_frequency} onValueChange={(value) => setData('follow_up_frequency', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="biweekly">Biweekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Automation Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Automation Settings</CardTitle>
                            <CardDescription>Configure auto-logging and progression rules</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="auto_progression_enabled"
                                    checked={data.auto_progression_enabled}
                                    onCheckedChange={(checked) => setData('auto_progression_enabled', checked === true)}
                                />
                                <Label htmlFor="auto_progression_enabled" className="cursor-pointer">
                                    Enable auto-progression (automatically advance stages based on triggers)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="auto_loss_rule_enabled"
                                    checked={data.auto_loss_rule_enabled}
                                    onCheckedChange={(checked) => setData('auto_loss_rule_enabled', checked === true)}
                                />
                                <Label htmlFor="auto_loss_rule_enabled" className="cursor-pointer">
                                    Enable auto-loss detection (mark as lost after 7 days of inactivity)
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                            <CardDescription>Additional information about this opportunity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="notes" className="sr-only">
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Enter any additional notes..."
                                rows={4}
                            />
                            {errors.notes && (
                                <p className="text-sm text-red-600 flex items-center mt-1">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.notes}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </form>
        </AppLayout>
    );
}
