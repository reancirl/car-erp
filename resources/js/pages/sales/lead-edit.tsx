import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    UserPlus, 
    Save, 
    User,
    Phone,
    Mail,
    MapPin,
    Star,
    AlertTriangle,
    CheckCircle,
    X,
    Globe,
    DollarSign,
    Calendar,
    Clock
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface LeadEditProps {
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
        title: 'Edit Lead',
        href: '/sales/lead-management/edit',
    },
];

export default function LeadEdit({ id }: LeadEditProps) {
    const [selectedStatus, setSelectedStatus] = useState('qualified');
    const [selectedSource, setSelectedSource] = useState('web_form');
    const [selectedPriority, setSelectedPriority] = useState('medium');
    const [selectedTags, setSelectedTags] = useState<string[]>(['hot_lead', 'financing_needed']);
    const [isQualified, setIsQualified] = useState(true);

    // Mock lead data for editing
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
        budget_min: 25000,
        budget_max: 30000,
        lead_score: 85,
        status: 'qualified',
        assigned_to: 'Sarah Sales Rep',
        created_at: '2025-01-13 09:15:00',
        last_contact: '2025-01-13 14:30:00',
        next_followup: '2025-01-14 10:00:00',
        conversion_probability: 78,
        notes: 'Interested in financing options. Prefers automatic transmission. Looking to purchase within 2 weeks.',
        tags: ['hot_lead', 'financing_needed'],
        duplicate_flags: [],
        fake_lead_score: 15
    };

    const leadSources = [
        { value: 'web_form', label: 'Web Form', description: 'Online inquiry form' },
        { value: 'phone', label: 'Phone Call', description: 'Inbound phone inquiry' },
        { value: 'walk_in', label: 'Walk-in', description: 'Physical visit to dealership' },
        { value: 'referral', label: 'Referral', description: 'Customer referral' },
        { value: 'social_media', label: 'Social Media', description: 'Social media inquiry' },
    ];

    const leadStatuses = [
        { value: 'new', label: 'New', description: 'Recently received lead' },
        { value: 'contacted', label: 'Contacted', description: 'Initial contact made' },
        { value: 'qualified', label: 'Qualified', description: 'Meets qualification criteria' },
        { value: 'hot', label: 'Hot', description: 'High priority, ready to buy' },
        { value: 'unqualified', label: 'Unqualified', description: 'Does not meet criteria' },
        { value: 'lost', label: 'Lost', description: 'No longer interested' },
    ];

    const priorities = [
        { value: 'low', label: 'Low', description: 'Standard follow-up' },
        { value: 'medium', label: 'Medium', description: 'Regular attention' },
        { value: 'high', label: 'High', description: 'Priority follow-up' },
        { value: 'urgent', label: 'Urgent', description: 'Immediate attention' },
    ];

    const availableTags = [
        { id: 'hot_lead', name: 'Hot Lead', color: 'bg-red-100 text-red-800' },
        { id: 'financing_needed', name: 'Financing Needed', color: 'bg-blue-100 text-blue-800' },
        { id: 'trade_in', name: 'Trade-in', color: 'bg-green-100 text-green-800' },
        { id: 'cash_buyer', name: 'Cash Buyer', color: 'bg-purple-100 text-purple-800' },
        { id: 'first_time_buyer', name: 'First Time Buyer', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'repeat_customer', name: 'Repeat Customer', color: 'bg-indigo-100 text-indigo-800' },
        { id: 'urgent', name: 'Urgent', color: 'bg-orange-100 text-orange-800' },
        { id: 'pre_approved', name: 'Pre-approved', color: 'bg-teal-100 text-teal-800' },
    ];

    const salesReps = [
        { id: '1', name: 'Sarah Sales Rep', specialties: ['Honda', 'Toyota'] },
        { id: '2', name: 'Mike Sales Rep', specialties: ['BMW', 'Mercedes'] },
        { id: '3', name: 'Lisa Sales Rep', specialties: ['Hyundai', 'Kia'] },
        { id: '4', name: 'Tom Sales Rep', specialties: ['Ford', 'Chevrolet'] },
    ];

    const getStatusBadge = (status: string) => {
        const colors = {
            new: 'bg-gray-100 text-gray-800',
            contacted: 'bg-blue-100 text-blue-800',
            qualified: 'bg-green-100 text-green-800',
            hot: 'bg-red-100 text-red-800',
            unqualified: 'bg-yellow-100 text-yellow-800',
            lost: 'bg-gray-100 text-gray-800',
        };
        return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{priority}</Badge>;
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev => 
            prev.includes(tagId) 
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Lead - ${mockLead.lead_id}`} />
            
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
                            <h1 className="text-2xl font-bold">Edit Lead - {mockLead.lead_id}</h1>
                            <p className="text-muted-foreground">Update lead information and qualification status</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Lead Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Lead Information
                                </CardTitle>
                                <CardDescription>
                                    Basic contact and identification details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lead-id">Lead ID</Label>
                                        <Input 
                                            id="lead-id" 
                                            value={mockLead.lead_id}
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="created-date">Created Date</Label>
                                        <Input 
                                            id="created-date" 
                                            value={new Date(mockLead.created_at).toLocaleDateString()}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input 
                                            id="name" 
                                            defaultValue={mockLead.name}
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input 
                                            id="email" 
                                            type="email"
                                            defaultValue={mockLead.email}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input 
                                            id="phone" 
                                            defaultValue={mockLead.phone}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input 
                                            id="location" 
                                            defaultValue={mockLead.location}
                                            placeholder="Enter location"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lead Source & Classification */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Globe className="h-5 w-5 mr-2" />
                                    Source & Classification
                                </CardTitle>
                                <CardDescription>
                                    Lead source, status, and priority settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="source">Lead Source</Label>
                                        <Select value={selectedSource} onValueChange={setSelectedSource}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leadSources.map((source) => (
                                                    <SelectItem key={source.value} value={source.value}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{source.label}</span>
                                                            <span className="text-xs text-muted-foreground ml-2">{source.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Lead Status</Label>
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leadStatuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{status.label}</span>
                                                            <span className="text-xs text-muted-foreground ml-2">{status.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priorities.map((priority) => (
                                                    <SelectItem key={priority.value} value={priority.value}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{priority.label}</span>
                                                            <span className="text-xs text-muted-foreground ml-2">{priority.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="assigned-to">Assigned Sales Rep</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sales rep" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {salesReps.map((rep) => (
                                                    <SelectItem key={rep.id} value={rep.id}>
                                                        <div>
                                                            <div className="font-medium">{rep.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Specialties: {rep.specialties.join(', ')}
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Interest & Budget */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2" />
                                    Vehicle Interest & Budget
                                </CardTitle>
                                <CardDescription>
                                    Customer preferences and budget information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle-interest">Vehicle of Interest</Label>
                                    <Input 
                                        id="vehicle-interest" 
                                        defaultValue={mockLead.vehicle_interest}
                                        placeholder="e.g., 2024 Honda Civic"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="budget-min">Budget Min ($)</Label>
                                        <Input 
                                            id="budget-min" 
                                            type="number"
                                            defaultValue={mockLead.budget_min}
                                            placeholder="25000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="budget-max">Budget Max ($)</Label>
                                        <Input 
                                            id="budget-max" 
                                            type="number"
                                            defaultValue={mockLead.budget_max}
                                            placeholder="30000"
                                        />
                                    </div>
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
                                <CardDescription>
                                    Additional classification and notes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Lead Tags</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {availableTags.map((tag) => (
                                            <div key={tag.id} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={tag.id}
                                                    checked={selectedTags.includes(tag.id)}
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
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        defaultValue={mockLead.notes}
                                        placeholder="Additional notes about the lead"
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Follow-up Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Follow-up Schedule
                                </CardTitle>
                                <CardDescription>
                                    Set next contact and follow-up reminders
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="next-followup-date">Next Follow-up Date</Label>
                                        <Input 
                                            id="next-followup-date" 
                                            type="date"
                                            defaultValue={mockLead.next_followup?.split(' ')[0]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="next-followup-time">Follow-up Time</Label>
                                        <Input 
                                            id="next-followup-time" 
                                            type="time"
                                            defaultValue={mockLead.next_followup?.split(' ')[1]}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="followup-notes">Follow-up Notes</Label>
                                    <Textarea 
                                        id="followup-notes" 
                                        placeholder="Notes for the next follow-up"
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Lead Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Lead Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Current Status</p>
                                    {getStatusBadge(selectedStatus)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Priority</p>
                                    {getPriorityBadge(selectedPriority)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Lead Score</p>
                                    <p className="text-sm font-medium">{mockLead.lead_score}/100</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Conversion Probability</p>
                                    <p className="text-sm font-medium text-green-600">{mockLead.conversion_probability}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Selected Tags</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedTags.map((tagId) => {
                                            const tag = availableTags.find(t => t.id === tagId);
                                            return tag ? (
                                                <Badge key={tagId} className={`text-xs ${tag.color}`}>
                                                    {tag.name}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lead Quality Indicators */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quality Indicators</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Duplicate Risk</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Fake Lead Score</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">{mockLead.fake_lead_score}%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Email Validity</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">Valid</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Phone Validity</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">Valid</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium">Lead Created</p>
                                        <p className="text-xs text-muted-foreground">{new Date(mockLead.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium">Last Contact</p>
                                        <p className="text-xs text-muted-foreground">{new Date(mockLead.last_contact).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium">Next Follow-up</p>
                                        <p className="text-xs text-muted-foreground">{new Date(mockLead.next_followup).toLocaleString()}</p>
                                    </div>
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
                                    Schedule Meeting
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Set Reminder
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
