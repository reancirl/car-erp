import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Plus, Eye, Edit, AlertTriangle, CheckCircle, Phone, MapPin, Star, Users, Mail, Globe, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState, FormEvent } from 'react';

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

interface Lead {
    id: number;
    lead_id: string;
    name: string;
    email: string;
    phone: string;
    source: string;
    location: string | null;
    vehicle_interest: string | null;
    budget_range: string | null;
    lead_score: number;
    status: string;
    conversion_probability: number;
    tags: string[] | null;
    duplicate_flags: string[] | null;
    fake_lead_score: number;
    next_followup_at: string | null;
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
}

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface Stats {
    total: number;
    hot: number;
    conversion_rate: number;
    suspicious: number;
}

interface Props {
    leads: {
        data: Lead[];
        links: any;
        meta: any;
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        source?: string;
        branch_id?: number;
        lead_score?: string;
    };
    branches: Branch[] | null;
}

export default function LeadManagement({ leads, stats, filters, branches }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [source, setSource] = useState(filters.source || 'all');
    const [branchId, setBranchId] = useState<string>(filters.branch_id?.toString() || 'all');
    const [leadScore, setLeadScore] = useState(filters.lead_score || 'all');

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get('/sales/lead-management', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            source: source !== 'all' ? source : undefined,
            branch_id: branchId !== 'all' ? branchId : undefined,
            lead_score: leadScore !== 'all' ? leadScore : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (lead: Lead) => {
        if (confirm(`Are you sure you want to delete lead ${lead.lead_id}?`)) {
            router.delete(`/sales/lead-management/${lead.id}`);
        }
    };

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
            case 'referral':
                return (
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                        <Users className="h-3 w-3 mr-1" />
                        Referral
                    </Badge>
                );
            case 'social_media':
                return (
                    <Badge variant="outline" className="bg-pink-100 text-pink-800">
                        <Star className="h-3 w-3 mr-1" />
                        Social Media
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
            case 'new':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        New
                    </Badge>
                );
            case 'unqualified':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Unqualified
                    </Badge>
                );
            case 'lost':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Lost
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

    const getFakeLeadIndicator = (score: number, flags: string[] | null) => {
        if (score > 70 || (flags && flags.length > 0)) {
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
                        <Link href="/sales/lead-management/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Lead
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">All leads</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.hot}</div>
                            <p className="text-xs text-muted-foreground">Immediate attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.conversion_rate}%</div>
                            <p className="text-xs text-muted-foreground">Average probability</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Suspicious Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.suspicious}</div>
                            <p className="text-xs text-muted-foreground">Flagged for review</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Search and filter leads by multiple criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by name, email, phone, or lead ID..." 
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {branches && (
                                <Select value={branchId} onValueChange={setBranchId}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="All Branches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            
                            <Select value={source} onValueChange={setSource}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="All Sources" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    <SelectItem value="web_form">Web Form</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="walk_in">Walk-in</SelectItem>
                                    <SelectItem value="referral">Referral</SelectItem>
                                    <SelectItem value="social_media">Social Media</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="hot">Hot</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="unqualified">Unqualified</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={leadScore} onValueChange={setLeadScore}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="All Scores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Scores</SelectItem>
                                    <SelectItem value="high">High (80+)</SelectItem>
                                    <SelectItem value="medium">Medium (60-79)</SelectItem>
                                    <SelectItem value="low">Low (&lt;60)</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Button type="submit">Apply Filters</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Leads Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Pipeline</CardTitle>
                        <CardDescription>
                            {leads.data.length === 0 ? 'No leads found' : `Showing ${leads.data.length} lead(s)`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {leads.data.length === 0 ? (
                            <div className="text-center py-12">
                                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No leads yet</h3>
                                <p className="text-muted-foreground mb-4">Get started by creating your first lead</p>
                                <Link href="/sales/lead-management/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Lead
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Lead Details</TableHead>
                                        <TableHead>Contact Info</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Vehicle Interest</TableHead>
                                        <TableHead>Lead Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Assigned To</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads.data.map((lead) => (
                                        <TableRow key={lead.id} className={(lead.duplicate_flags && lead.duplicate_flags.length > 0) || lead.fake_lead_score > 70 ? 'bg-orange-50' : ''}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-medium">{lead.name}</div>
                                                    <div className="text-xs text-muted-foreground">{lead.lead_id}</div>
                                                    <div className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</div>
                                                    {lead.tags && lead.tags.length > 0 && (
                                                        <div className="flex items-center space-x-1 mt-1">
                                                            {lead.tags.map((tag) => (
                                                                <Badge key={tag} variant="outline" className="text-xs">
                                                                    {tag.replace('_', ' ')}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
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
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{lead.branch.name}</div>
                                                <div className="text-xs text-muted-foreground">{lead.branch.code}</div>
                                            </TableCell>
                                            <TableCell>
                                                {getSourceBadge(lead.source)}
                                                {lead.location && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        <MapPin className="h-3 w-3 inline mr-1" />
                                                        {lead.location}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-sm">{lead.vehicle_interest || 'Not specified'}</div>
                                                    {lead.budget_range && (
                                                        <div className="text-xs text-muted-foreground">{lead.budget_range}</div>
                                                    )}
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
                                                {lead.assigned_user ? (
                                                    <div className="flex items-center space-x-1">
                                                        <Users className="h-3 w-3" />
                                                        <span className="text-sm">{lead.assigned_user.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Link href={`/sales/lead-management/${lead.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/sales/lead-management/${lead.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(lead)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {leads.meta && leads.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {leads.meta.from} to {leads.meta.to} of {leads.meta.total} leads
                        </div>
                        <div className="flex space-x-2">
                            {leads.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
