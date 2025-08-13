import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ClipboardCheck, Search, Filter, Download, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Compliance',
        href: '/compliance',
    },
    {
        title: 'Checklists',
        href: '/compliance/checklists',
    },
];

export default function ComplianceChecklists() {
    // Mock data for demonstration
    const mockChecklists = [
        {
            id: 1,
            title: 'Daily Service Bay Inspection',
            category: 'Safety',
            frequency: 'Daily',
            assigned_to: 'Service Manager',
            due_date: '2025-01-13',
            status: 'completed',
            completion_rate: 100,
            last_completed: '2025-01-13 08:30:00',
            completed_by: 'Sarah Service Manager',
            total_items: 15,
            completed_items: 15,
            priority: 'high'
        },
        {
            id: 2,
            title: 'Weekly Parts Inventory Audit',
            category: 'Inventory',
            frequency: 'Weekly',
            assigned_to: 'Parts Head',
            due_date: '2025-01-15',
            status: 'in_progress',
            completion_rate: 60,
            last_completed: null,
            completed_by: null,
            total_items: 25,
            completed_items: 15,
            priority: 'medium'
        },
        {
            id: 3,
            title: 'Monthly Fire Safety Check',
            category: 'Safety',
            frequency: 'Monthly',
            assigned_to: 'Admin',
            due_date: '2025-01-20',
            status: 'overdue',
            completion_rate: 0,
            last_completed: '2024-12-20 14:00:00',
            completed_by: 'Admin User',
            total_items: 12,
            completed_items: 0,
            priority: 'critical'
        },
        {
            id: 4,
            title: 'Customer Data Privacy Audit',
            category: 'Data Protection',
            frequency: 'Quarterly',
            assigned_to: 'Auditor',
            due_date: '2025-01-31',
            status: 'pending',
            completion_rate: 0,
            last_completed: '2024-10-31 16:30:00',
            completed_by: 'Mike Auditor',
            total_items: 20,
            completed_items: 0,
            priority: 'high'
        },
        {
            id: 5,
            title: 'Environmental Compliance Check',
            category: 'Environmental',
            frequency: 'Monthly',
            assigned_to: 'Service Manager',
            due_date: '2025-01-25',
            status: 'pending',
            completion_rate: 0,
            last_completed: '2024-12-25 10:15:00',
            completed_by: 'Sarah Service Manager',
            total_items: 18,
            completed_items: 0,
            priority: 'medium'
        }
    ];

    const mockChecklistItems = [
        { id: 1, item: 'Check fire extinguisher pressure', completed: true },
        { id: 2, item: 'Inspect emergency exits', completed: true },
        { id: 3, item: 'Test smoke detectors', completed: false },
        { id: 4, item: 'Verify first aid kit contents', completed: false },
        { id: 5, item: 'Check safety signage visibility', completed: true }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'overdue':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'critical':
                return <Badge variant="destructive">Critical</Badge>;
            case 'high':
                return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
            case 'medium':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        const colors = {
            'Safety': 'bg-red-100 text-red-800',
            'Inventory': 'bg-purple-100 text-purple-800',
            'Environmental': 'bg-green-100 text-green-800',
            'Data Protection': 'bg-blue-100 text-blue-800',
            'Quality': 'bg-orange-100 text-orange-800'
        };
        return <Badge variant="outline" className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compliance Checklists" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ClipboardCheck className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Compliance Checklists</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Checklist
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Checklists</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5</div>
                            <p className="text-xs text-muted-foreground">Active compliance checks</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">On schedule</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground text-red-600">Requires immediate attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">85%</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage digitized internal checklists with automated reminders and soft deadlines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search checklists..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="safety">Safety</SelectItem>
                                    <SelectItem value="inventory">Inventory</SelectItem>
                                    <SelectItem value="environmental">Environmental</SelectItem>
                                    <SelectItem value="data_protection">Data Protection</SelectItem>
                                    <SelectItem value="quality">Quality</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Checklists Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Checklists</CardTitle>
                        <CardDescription>Digitized internal checklists with automated reminders and deadline tracking</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Checklist</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockChecklists.map((checklist) => (
                                    <TableRow key={checklist.id}>
                                        <TableCell className="font-medium">{checklist.title}</TableCell>
                                        <TableCell>{getCategoryBadge(checklist.category)}</TableCell>
                                        <TableCell>{checklist.frequency}</TableCell>
                                        <TableCell>{checklist.assigned_to}</TableCell>
                                        <TableCell className={checklist.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                                            {checklist.due_date}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            checklist.completion_rate === 100 ? 'bg-green-500' : 
                                                            checklist.completion_rate >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                                        }`}
                                                        style={{ width: `${checklist.completion_rate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {checklist.completed_items}/{checklist.total_items}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getPriorityBadge(checklist.priority)}</TableCell>
                                        <TableCell>{getStatusBadge(checklist.status)}</TableCell>
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

                {/* Sample Checklist Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Checklist Preview: Monthly Fire Safety Check</CardTitle>
                        <CardDescription>Example of digitized checklist items with completion tracking</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockChecklistItems.map((item) => (
                                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                    <Checkbox 
                                        checked={item.completed}
                                        className={item.completed ? 'data-[state=checked]:bg-green-500' : ''}
                                    />
                                    <span className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {item.item}
                                    </span>
                                    {item.completed && (
                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Complete
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                                Progress: 3/5 items completed (60%)
                            </span>
                            <Button size="sm">Save Progress</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Checklist Templates */}
                <Card>
                    <CardHeader>
                        <CardTitle>Checklist Templates</CardTitle>
                        <CardDescription>Pre-configured compliance checklist templates for common scenarios</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                <h4 className="font-medium">Daily Safety Inspection</h4>
                                <p className="text-sm text-muted-foreground mt-1">15 items • Safety category</p>
                                <Badge variant="outline" className="mt-2">Template</Badge>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                <h4 className="font-medium">Weekly Inventory Audit</h4>
                                <p className="text-sm text-muted-foreground mt-1">25 items • Inventory category</p>
                                <Badge variant="outline" className="mt-2">Template</Badge>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                <h4 className="font-medium">Monthly Environmental Check</h4>
                                <p className="text-sm text-muted-foreground mt-1">18 items • Environmental category</p>
                                <Badge variant="outline" className="mt-2">Template</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
