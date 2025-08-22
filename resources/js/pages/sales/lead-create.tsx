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
    Clock,
    Target
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

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

export default function LeadCreate() {
    const [selectedStatus, setSelectedStatus] = useState('new');
    const [selectedSource, setSelectedSource] = useState('web_form');
    const [selectedPriority, setSelectedPriority] = useState('medium');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [estimatedScore, setEstimatedScore] = useState(65);

    const leadSources = [
        { value: 'web_form', label: 'Web Form', description: 'Online inquiry form', score: 20 },
        { value: 'phone', label: 'Phone Call', description: 'Inbound phone inquiry', score: 30 },
        { value: 'walk_in', label: 'Walk-in', description: 'Physical visit to dealership', score: 40 },
        { value: 'referral', label: 'Referral', description: 'Customer referral', score: 35 },
        { value: 'social_media', label: 'Social Media', description: 'Social media inquiry', score: 15 },
    ];

    const leadStatuses = [
        { value: 'new', label: 'New', description: 'Recently received lead' },
        { value: 'contacted', label: 'Contacted', description: 'Initial contact made' },
        { value: 'qualified', label: 'Qualified', description: 'Meets qualification criteria' },
        { value: 'hot', label: 'Hot', description: 'High priority, ready to buy' },
        { value: 'unqualified', label: 'Unqualified', description: 'Does not meet criteria' },
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
        { id: '1', name: 'Sarah Sales Rep', specialties: ['Honda', 'Toyota'], workload: 'Light' },
        { id: '2', name: 'Mike Sales Rep', specialties: ['BMW', 'Mercedes'], workload: 'Medium' },
        { id: '3', name: 'Lisa Sales Rep', specialties: ['Hyundai', 'Kia'], workload: 'Heavy' },
        { id: '4', name: 'Tom Sales Rep', specialties: ['Ford', 'Chevrolet'], workload: 'Light' },
    ];

    const getStatusBadge = (status: string) => {
        const colors = {
            new: 'bg-gray-100 text-gray-800',
            contacted: 'bg-blue-100 text-blue-800',
            qualified: 'bg-green-100 text-green-800',
            hot: 'bg-red-100 text-red-800',
            unqualified: 'bg-yellow-100 text-yellow-800',
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

    const calculateLeadScore = () => {
        const sourceScore = leadSources.find(s => s.value === selectedSource)?.score || 0;
        const priorityScore = selectedPriority === 'urgent' ? 30 : selectedPriority === 'high' ? 20 : selectedPriority === 'medium' ? 10 : 0;
        const tagScore = selectedTags.length * 5;
        return Math.min(100, sourceScore + priorityScore + tagScore + 15); // Base score of 15
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Lead" />
            
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
                            <h1 className="text-2xl font-bold">Create New Lead</h1>
                            <p className="text-muted-foreground">Add a new lead to the sales pipeline</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Create Lead
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
                                            placeholder="Auto-generated"
                                            disabled
                                            value="LD-2025-005"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="created-date">Created Date</Label>
                                        <Input 
                                            id="created-date" 
                                            type="date"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input 
                                            id="email" 
                                            type="email"
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input 
                                            id="phone" 
                                            placeholder="Enter phone number"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input 
                                            id="location" 
                                            placeholder="City, State"
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
                                        <Label htmlFor="source">Lead Source *</Label>
                                        <Select value={selectedSource} onValueChange={setSelectedSource}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leadSources.map((source) => (
                                                    <SelectItem key={source.value} value={source.value}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{source.label}</span>
                                                            <span className="text-xs text-muted-foreground ml-2">+{source.score} pts</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Initial Status</Label>
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
                                        <Label htmlFor="assigned-to">Assign to Sales Rep</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Auto-assign or select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="auto">Auto-assign (Recommended)</SelectItem>
                                                {salesReps.map((rep) => (
                                                    <SelectItem key={rep.id} value={rep.id}>
                                                        <div>
                                                            <div className="font-medium">{rep.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {rep.specialties.join(', ')} • {rep.workload} workload
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
                                    <Target className="h-5 w-5 mr-2" />
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
                                        placeholder="e.g., 2024 Honda Civic, SUV, Sedan"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="budget-min">Budget Min ($)</Label>
                                        <Input 
                                            id="budget-min" 
                                            type="number"
                                            placeholder="15000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="budget-max">Budget Max ($)</Label>
                                        <Input 
                                            id="budget-max" 
                                            type="number"
                                            placeholder="25000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timeline">Purchase Timeline</Label>
                                    <Select>
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
                                    <Label htmlFor="notes">Initial Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        placeholder="Any additional information about the lead, their preferences, or conversation details"
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
                                    Initial Follow-up
                                </CardTitle>
                                <CardDescription>
                                    Set the first contact and follow-up schedule
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first-contact-date">First Contact Date</Label>
                                        <Input 
                                            id="first-contact-date" 
                                            type="date"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="first-contact-time">Preferred Time</Label>
                                        <Input 
                                            id="first-contact-time" 
                                            type="time"
                                            defaultValue="09:00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact-method">Preferred Contact Method</Label>
                                    <Select>
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Lead Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Lead Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    {getStatusBadge(selectedStatus)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Priority</p>
                                    {getPriorityBadge(selectedPriority)}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Estimated Lead Score</p>
                                    <p className="text-sm font-medium">{calculateLeadScore()}/100</p>
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
                                        {selectedTags.length === 0 && (
                                            <span className="text-xs text-muted-foreground">No tags selected</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scoring Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Score Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Source Score:</span>
                                    <span className="text-sm font-medium">+{leadSources.find(s => s.value === selectedSource)?.score || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Priority Score:</span>
                                    <span className="text-sm font-medium">+{selectedPriority === 'urgent' ? 30 : selectedPriority === 'high' ? 20 : selectedPriority === 'medium' ? 10 : 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Tags Score:</span>
                                    <span className="text-sm font-medium">+{selectedTags.length * 5}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Base Score:</span>
                                    <span className="text-sm font-medium">+15</span>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Total Score:</span>
                                        <span className="font-medium text-green-600">{calculateLeadScore()}/100</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Auto-Assignment Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Auto-Assignment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Recommended Assignment</p>
                                    <p className="text-sm font-medium">Sarah Sales Rep</p>
                                    <p className="text-xs text-muted-foreground">Based on: Light workload, Honda expertise</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Routing Method</p>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">Skill-based</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guidelines */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Lead Creation Guidelines</CardTitle>
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
            </div>
        </AppLayout>
    );
}
