import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    Building2, 
    Search, 
    Filter, 
    Download, 
    Plus, 
    Eye, 
    Edit, 
    MapPin, 
    Users, 
    Phone, 
    Mail, 
    Calendar,
    CheckCircle,
    AlertTriangle,
    Clock,
    Crown,
    Building,
    UserPlus
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administration',
        href: '/admin',
    },
    {
        title: 'Branch Management',
        href: '/admin/branch-management',
    },
];

export default function BranchManagement() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<any>(null);

    // Mock data for demonstration - Philippines branches
    const mockBranches = [
        {
            id: 1,
            name: 'Headquarters',
            code: 'HQ',
            type: 'headquarters',
            address: '123 EDSA, Makati City, Metro Manila',
            region: 'National Capital Region',
            province: 'Metro Manila',
            city: 'Makati City',
            postal_code: '1200',
            phone: '+63-2-8123-4567',
            email: 'hq@dealership.com.ph',
            manager: 'Juan Dela Cruz',
            manager_email: 'juan.delacruz@dealership.com.ph',
            status: 'active',
            established_date: '2020-01-15',
            user_count: 25,
            services: ['Sales', 'Service', 'Parts', 'Finance'],
            coordinates: { lat: 14.5547, lng: 121.0244 }
        },
        {
            id: 2,
            name: 'Cebu Branch',
            code: 'CEB',
            type: 'branch',
            address: '456 Colon Street, Cebu City, Cebu',
            region: 'Central Visayas',
            province: 'Cebu',
            city: 'Cebu City',
            postal_code: '6000',
            phone: '+63-32-234-5678',
            email: 'cebu@dealership.com.ph',
            manager: 'Maria Santos',
            manager_email: 'maria.santos@dealership.com.ph',
            status: 'active',
            established_date: '2021-03-20',
            user_count: 12,
            services: ['Sales', 'Service', 'Parts'],
            coordinates: { lat: 10.3157, lng: 123.8854 }
        },
        {
            id: 3,
            name: 'Davao Branch',
            code: 'DAV',
            type: 'branch',
            address: '789 Roxas Avenue, Davao City, Davao del Sur',
            region: 'Davao Region',
            province: 'Davao del Sur',
            city: 'Davao City',
            postal_code: '8000',
            phone: '+63-82-345-6789',
            email: 'davao@dealership.com.ph',
            manager: 'Pedro Reyes',
            manager_email: 'pedro.reyes@dealership.com.ph',
            status: 'active',
            established_date: '2021-06-10',
            user_count: 8,
            services: ['Sales', 'Service'],
            coordinates: { lat: 7.0731, lng: 125.6128 }
        },
        {
            id: 4,
            name: 'Iloilo Branch',
            code: 'ILO',
            type: 'branch',
            address: '321 J.M. Basa Street, Iloilo City, Iloilo',
            region: 'Western Visayas',
            province: 'Iloilo',
            city: 'Iloilo City',
            postal_code: '5000',
            phone: '+63-33-456-7890',
            email: 'iloilo@dealership.com.ph',
            manager: 'Ana Garcia',
            manager_email: 'ana.garcia@dealership.com.ph',
            status: 'inactive',
            established_date: '2022-01-15',
            user_count: 6,
            services: ['Sales'],
            coordinates: { lat: 10.7202, lng: 122.5621 }
        },
        {
            id: 5,
            name: 'Baguio Branch',
            code: 'BAG',
            type: 'branch',
            address: '654 Session Road, Baguio City, Benguet',
            region: 'Cordillera Administrative Region',
            province: 'Benguet',
            city: 'Baguio City',
            postal_code: '2600',
            phone: '+63-74-567-8901',
            email: 'baguio@dealership.com.ph',
            manager: 'Carlos Mendoza',
            manager_email: 'carlos.mendoza@dealership.com.ph',
            status: 'active',
            established_date: '2022-09-05',
            user_count: 5,
            services: ['Sales', 'Service'],
            coordinates: { lat: 16.4023, lng: 120.5960 }
        }
    ];

    // Mock users for assignment
    const mockUsers = [
        { id: 1, name: 'John Admin', email: 'john.admin@dealership.com', role: 'admin', branch_id: 1 },
        { id: 2, name: 'Sarah Service Manager', email: 'sarah.service@dealership.com', role: 'service_manager', branch_id: 1 },
        { id: 3, name: 'Mike Sales Rep', email: 'mike.sales@dealership.com', role: 'sales_rep', branch_id: null },
        { id: 4, name: 'Lisa Parts Head', email: 'lisa.parts@dealership.com', role: 'parts_head', branch_id: 2 },
        { id: 5, name: 'Tom Technician', email: 'tom.tech@dealership.com', role: 'technician', branch_id: null },
    ];

    // Philippines regions for dropdown
    const philippineRegions = [
        'National Capital Region',
        'Ilocos Region',
        'Cagayan Valley',
        'Central Luzon',
        'Calabarzon',
        'Mimaropa',
        'Bicol Region',
        'Western Visayas',
        'Central Visayas',
        'Eastern Visayas',
        'Zamboanga Peninsula',
        'Northern Mindanao',
        'Davao Region',
        'Soccsksargen',
        'Caraga',
        'Barmm',
        'Cordillera Administrative Region'
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Inactive
                    </Badge>
                );
            case 'maintenance':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Maintenance
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'headquarters':
                return (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        <Crown className="h-3 w-3 mr-1" />
                        Headquarters
                    </Badge>
                );
            case 'branch':
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Building className="h-3 w-3 mr-1" />
                        Branch
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const getServicesBadges = (services: string[]) => {
        const colorMap: Record<string, string> = {
            'Sales': 'bg-green-100 text-green-800',
            'Service': 'bg-blue-100 text-blue-800',
            'Parts': 'bg-orange-100 text-orange-800',
            'Finance': 'bg-purple-100 text-purple-800'
        };

        return services.map((service) => (
            <Badge key={service} variant="outline" className={`${colorMap[service] || 'bg-gray-100 text-gray-800'} text-xs`}>
                {service}
            </Badge>
        ));
    };

    const unassignedUsers = mockUsers.filter(user => !user.branch_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Management" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Building2 className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Branch Management</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Branches
                        </Button>
                        <Link href="/admin/branch-management/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Branch
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5</div>
                            <p className="text-xs text-muted-foreground">1 HQ + 4 branches</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">80% operational</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">56</div>
                            <p className="text-xs text-muted-foreground">Across all branches</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Coverage Areas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5</div>
                            <p className="text-xs text-muted-foreground">Regions covered</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Manage dealership branches across the Philippines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by name, code, city, or manager..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Region" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Regions</SelectItem>
                                    {philippineRegions.map((region) => (
                                        <SelectItem key={region} value={region.toLowerCase().replace(/\s+/g, '_')}>
                                            {region}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="headquarters">Headquarters</SelectItem>
                                    <SelectItem value="branch">Branch</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Branches Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branch Locations</CardTitle>
                        <CardDescription>Dealership branches and headquarters across the Philippines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Branch Details</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Manager</TableHead>
                                    <TableHead>Services</TableHead>
                                    <TableHead>Staff</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockBranches.map((branch) => (
                                    <TableRow key={branch.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{branch.name}</div>
                                                <div className="text-xs text-muted-foreground">Code: {branch.code}</div>
                                                {getTypeBadge(branch.type)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="text-sm">{branch.city}, {branch.province}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">{branch.region}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Est: {branch.established_date}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="flex items-center space-x-1">
                                                    <Phone className="h-3 w-3" />
                                                    <span className="text-sm">{branch.phone}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="text-sm">{branch.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-sm">{branch.manager}</div>
                                                <div className="text-xs text-muted-foreground">{branch.manager_email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {getServicesBadges(branch.services)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Users className="h-3 w-3" />
                                                <span className="text-sm font-medium">{branch.user_count}</span>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => {
                                                        setSelectedBranch(branch);
                                                        setIsAssignUserDialogOpen(true);
                                                    }}
                                                >
                                                    <UserPlus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(branch.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Link href={`/admin/branch-management/${branch.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/branch-management/${branch.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* User Assignment Dialog */}
                <Dialog open={isAssignUserDialogOpen} onOpenChange={setIsAssignUserDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Assign Users to {selectedBranch?.name}</DialogTitle>
                            <DialogDescription>
                                Assign or reassign users to this branch location
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Current Branch Users</h4>
                                <div className="space-y-2">
                                    {mockUsers.filter(user => user.branch_id === selectedBranch?.id).map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email} • {user.role}</div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Available Users</h4>
                                <div className="space-y-2">
                                    {unassignedUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email} • {user.role}</div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Assign
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAssignUserDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
