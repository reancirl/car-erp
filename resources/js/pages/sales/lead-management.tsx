import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Filter, Download, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock, Globe, Phone, MapPin, Star, Users, Mail } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sales & Customer',
        href: '/sales',
    },
    {
        title: 'Lead Management',
        href: '/sales/lead-management',
    },
];

export default function LeadManagement() {
    // Mock data for demonstration
    const mockLeads = [
        {
            id: 1,
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
            assigned_to: 'Sarah Sales Rep',
            created_at: '2025-01-13 09:15:00',
            last_contact: '2025-01-13 14:30:00',
            next_followup: '2025-01-14 10:00:00',
            duplicate_flags: [],
            fake_lead_score: 15,
            conversion_probability: 78,
            tags: ['hot_lead', 'financing_needed'],
            notes_count: 3,
            activities_count: 5
        },
        {
            id: 2,
            lead_id: 'LD-2025-002',
            name: 'Maria Rodriguez',
            email: 'maria.r@email.com',
            phone: '+1-555-0124',
            source: 'phone',
            ip_address: null,
            location: 'Los Angeles, CA',
            vehicle_interest: '2023 Toyota Camry',
            budget_range: '$20,000 - $25,000',
            lead_score: 72,
            status: 'contacted',
            assigned_to: 'Mike Sales Rep',
            created_at: '2025-01-12 16:45:00',
            last_contact: '2025-01-13 11:20:00',
            next_followup: '2025-01-15 09:30:00',
            duplicate_flags: [],
            fake_lead_score: 8,
            conversion_probability: 65,
            tags: ['trade_in', 'cash_buyer'],
            notes_count: 2,
            activities_count: 3
        },
        {
            id: 3,
            lead_id: 'LD-2025-003',
            name: 'Robert Johnson',
            email: 'fake.email@tempmail.com',
            phone: '+1-555-0125',
            source: 'walk_in',
            ip_address: '192.168.1.100',
            location: 'Chicago, IL',
            vehicle_interest: '2024 BMW X3',
            budget_range: '$40,000+',
            lead_score: 45,
            status: 'unqualified',
            assigned_to: 'Lisa Sales Rep',
            created_at: '2025-01-11 13:30:00',
            last_contact: '2025-01-11 13:30:00',
            next_followup: null,
            duplicate_flags: ['duplicate_ip', 'suspicious_email'],
            fake_lead_score: 85,
            conversion_probability: 12,
            tags: ['potential_fake'],
            notes_count: 1,
            activities_count: 1
        },
        {
            id: 4,
            lead_id: 'LD-2025-004',
            name: 'Emily Davis',
            email: 'emily.davis@company.com',
            phone: '+1-555-0126',
            source: 'web_form',
            ip_address: '10.0.0.50',
            location: 'Miami, FL',
            vehicle_interest: '2024 Hyundai Elantra',
            budget_range: '$18,000 - $22,000',
            lead_score: 91,
            status: 'hot',
            assigned_to: 'Tom Sales Rep',
            created_at: '2025-01-13 11:00:00',
            last_contact: '2025-01-13 15:45:00',
            next_followup: '2025-01-14 08:00:00',
            duplicate_flags: [],
            fake_lead_score: 5,
            conversion_probability: 89,
            tags: ['urgent', 'pre_approved'],
            notes_count: 4,
            activities_count: 7
        }
    ];

    const getSourceBadge = (source: string) => {
        switch (source) {
            case 'web_form':
                return (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <Globe className="h-3 w-3 mr-1" />
                        Web Form
                    </Badge>
                );
            case 'phone':
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                        <Phone className="h-3 w-3 mr-1" />
                        Phone
                    </Badge>
                );
            case 'walk_in':
                return (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        <MapPin className="h-3 w-3 mr-1" />
                        Walk-in
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{source}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'hot':
                return (
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                        <Star className="h-3 w-3 mr-1" />
                        Hot
                    </Badge>
                );
            case 'qualified':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Qualified
                    </Badge>
                );
            case 'contacted':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Phone className="h-3 w-3 mr-1" />
                        Contacted
                    </Badge>
                );
            case 'unqualified':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Unqualified
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getLeadScoreBadge = (score: number) => {
        if (score >= 80) {
            return <Badge variant="default" className="bg-green-100 text-green-800">High ({score})</Badge>;
        } else if (score >= 60) {
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium ({score})</Badge>;
        } else {
            return <Badge variant="outline" className="bg-red-100 text-red-800">Low ({score})</Badge>;
        }
    };

    const getFakeLeadIndicator = (score: number, flags: string[]) => {
        if (score > 70 || flags.length > 0) {
            return (
                <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Suspicious ({score}%)
                </Badge>
            );
        }
        return null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lead Management" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <UserPlus className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Lead Management</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Leads
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lead
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">1</div>
                            <p className="text-xs text-muted-foreground">Immediate attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">61%</div>
                            <p className="text-xs text-muted-foreground">Average probability</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Suspicious Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">1</div>
                            <p className="text-xs text-muted-foreground">Flagged for review</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Multi-channel lead capture with duplicate detection and automated scoring</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by name, email, phone, or lead ID..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    <SelectItem value="web_form">Web Form</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="walk_in">Walk-in</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="hot">Hot</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="unqualified">Unqualified</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Lead Score" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Scores</SelectItem>
                                    <SelectItem value="high">High (80+)</SelectItem>
                                    <SelectItem value="medium">Medium (60-79)</SelectItem>
                                    <SelectItem value="low">Low (&lt;60)</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Leads Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Pipeline</CardTitle>
                        <CardDescription>Automated scoring, routing, and duplicate/fake lead detection</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lead Details</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Source & Location</TableHead>
                                    <TableHead>Vehicle Interest</TableHead>
                                    <TableHead>Lead Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Next Follow-up</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockLeads.map((lead) => (
                                    <TableRow key={lead.id} className={lead.duplicate_flags.length > 0 || lead.fake_lead_score > 70 ? 'bg-orange-50' : ''}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{lead.name}</div>
                                                <div className="text-xs text-muted-foreground">{lead.lead_id}</div>
                                                <div className="text-xs text-muted-foreground">{lead.created_at}</div>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    {lead.tags.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag.replace('_', ' ')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                {getFakeLeadIndicator(lead.fake_lead_score, lead.duplicate_flags)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="flex items-center space-x-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="text-sm">{lead.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <Phone className="h-3 w-3" />
                                                    <span className="text-sm">{lead.phone}</span>
                                                </div>
                                                {lead.ip_address && (
                                                    <div className="text-xs text-muted-foreground font-mono mt-1">
                                                        IP: {lead.ip_address}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {getSourceBadge(lead.source)}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    <MapPin className="h-3 w-3 inline mr-1" />
                                                    {lead.location}
                                                </div>
                                                {lead.duplicate_flags.length > 0 && (
                                                    <div className="mt-1">
                                                        {lead.duplicate_flags.map((flag) => (
                                                            <Badge key={flag} variant="destructive" className="text-xs mr-1">
                                                                {flag.replace('_', ' ')}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{lead.vehicle_interest}</div>
                                                <div className="text-xs text-muted-foreground">{lead.budget_range}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {getLeadScoreBadge(lead.lead_score)}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Conv: {lead.conversion_probability}%
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Users className="h-3 w-3" />
                                                <span className="text-sm">{lead.assigned_to}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {lead.next_followup ? (
                                                <div>
                                                    <div className="text-sm font-medium">{lead.next_followup.split(' ')[0]}</div>
                                                    <div className="text-xs text-muted-foreground">{lead.next_followup.split(' ')[1]}</div>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-100 text-gray-800">No Follow-up</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Lead Scoring & Routing Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Scoring Rules</CardTitle>
                            <CardDescription>Automated scoring based on multiple factors</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Source Quality</div>
                                        <div className="text-sm text-muted-foreground">Web form: +20, Phone: +30, Walk-in: +40</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Budget Range</div>
                                        <div className="text-sm text-muted-foreground">Higher budget = higher score</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Response Time</div>
                                        <div className="text-sm text-muted-foreground">Quick responses boost score</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Duplicate/Fake Detection</CardTitle>
                            <CardDescription>Heuristics for email, phone, and IP analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Email Validation</div>
                                        <div className="text-sm text-muted-foreground">Temp email domains, format checks</div>
                                    </div>
                                    <Badge variant="destructive" className="bg-orange-100 text-orange-800">1 Flagged</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Phone Verification</div>
                                        <div className="text-sm text-muted-foreground">Duplicate numbers, invalid formats</div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">Clean</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">IP Analysis</div>
                                        <div className="text-sm text-muted-foreground">Multiple leads from same IP</div>
                                    </div>
                                    <Badge variant="destructive" className="bg-orange-100 text-orange-800">1 Flagged</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Automated Routing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Automated Lead Routing</CardTitle>
                        <CardDescription>Smart assignment based on sales rep availability, expertise, and workload</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-medium">Round Robin</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Equal distribution among available reps</p>
                                <div className="text-2xl font-bold">25%</div>
                                <p className="text-xs text-muted-foreground">Current allocation</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Star className="h-5 w-5 text-orange-600" />
                                    <h4 className="font-medium">Skill-Based</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Match vehicle expertise to lead interest</p>
                                <div className="text-2xl font-bold">50%</div>
                                <p className="text-xs text-muted-foreground">Current allocation</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium">Availability</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Assign to currently available reps first</p>
                                <div className="text-2xl font-bold">25%</div>
                                <p className="text-xs text-muted-foreground">Current allocation</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
