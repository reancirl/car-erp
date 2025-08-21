import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    Wrench, 
    Edit, 
    Car, 
    User, 
    Calendar, 
    Clock,
    AlertTriangle,
    CheckCircle,
    Settings,
    FileText,
    Activity,
    PlayCircle,
    PauseCircle,
    XCircle,
    Phone,
    Mail,
    MapPin,
    Camera,
    Download,
    Print
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface WorkOrderViewProps {
    workOrderId: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'PMS',
        href: '/pms',
    },
    {
        title: 'Work Orders',
        href: '/pms/work-orders',
    },
    {
        title: 'View Work Order',
        href: '/pms/work-orders/view',
    },
];

export default function WorkOrderView({ workOrderId }: WorkOrderViewProps) {
    // Mock work order data
    const mockWorkOrder = {
        id: parseInt(workOrderId) || 1,
        work_order_number: 'WO-2025-001',
        status: 'in_progress',
        priority: 'high',
        service_type: 'pms',
        created_at: '2025-01-15 09:30:00',
        scheduled_date: '2025-01-16',
        scheduled_time: '10:00',
        estimated_hours: 3.5,
        estimated_cost: 4500.00,
        actual_hours: 2.0,
        actual_cost: 3200.00,
        completion_percentage: 65,
        vehicle: {
            plate_number: 'ABC-1234',
            make: 'Toyota',
            model: 'Vios',
            year: 2023,
            mileage: 15000,
            vin: 'JH4KA8260MC123456',
            color: 'Silver',
            engine: '1.3L 4-Cylinder'
        },
        customer: {
            name: 'Maria Santos',
            phone: '+63-917-123-4567',
            email: 'maria.santos@email.com',
            type: 'individual',
            address: '123 Main St, Quezon City, Metro Manila'
        },
        work_description: 'Preventive Maintenance Service - 15,000km service including oil change, filter replacements, and general inspection.',
        assigned_technician: {
            id: 1,
            name: 'Carlos Mendoza',
            specialization: 'Engine & Transmission',
            phone: '+63-917-987-6543'
        },
        services: [
            { name: 'Oil Change', completed: true, cost: 800 },
            { name: 'Filter Replacement', completed: true, cost: 1200 },
            { name: 'Brake Inspection', completed: false, cost: 500 },
            { name: 'Battery Check', completed: false, cost: 300 }
        ],
        progress_notes: [
            {
                id: 1,
                timestamp: '2025-01-16 10:15:00',
                technician: 'Carlos Mendoza',
                note: 'Started oil change and filter replacement. Oil was very dirty, recommended shorter intervals.'
            },
            {
                id: 2,
                timestamp: '2025-01-16 11:30:00',
                technician: 'Carlos Mendoza',
                note: 'Completed oil change and air filter replacement. Moving to brake inspection next.'
            }
        ],
        photos: [
            { id: 1, type: 'before', description: 'Engine bay before service', timestamp: '2025-01-16 10:00:00' },
            { id: 2, type: 'progress', description: 'Old oil filter removed', timestamp: '2025-01-16 10:30:00' },
            { id: 3, type: 'progress', description: 'New oil filter installed', timestamp: '2025-01-16 11:00:00' }
        ]
    };

    const statuses = [
        { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: Clock },
        { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Calendar },
        { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: PlayCircle },
        { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800', icon: PauseCircle },
        { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
    ];

    const priorities = [
        { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
        { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
        { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
        { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
    ];

    const getStatusBadge = (status: string) => {
        const statusInfo = statuses.find(s => s.value === status);
        if (!statusInfo) return null;
        const IconComponent = statusInfo.icon;
        return (
            <Badge variant="outline" className={statusInfo.color}>
                <IconComponent className="h-3 w-3 mr-1" />
                {statusInfo.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityInfo = priorities.find(p => p.value === priority);
        if (!priorityInfo) return null;
        return (
            <Badge variant="outline" className={priorityInfo.color}>
                {priorityInfo.label}
            </Badge>
        );
    };

    const completedServices = mockWorkOrder.services.filter(s => s.completed).length;
    const totalServices = mockWorkOrder.services.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Work Order ${mockWorkOrder.work_order_number}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/pms/work-orders">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Work Orders
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Wrench className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">Work Order {mockWorkOrder.work_order_number}</h1>
                            {getStatusBadge(mockWorkOrder.status)}
                            {getPriorityBadge(mockWorkOrder.priority)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Print className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                        <Link href={`/pms/work-orders/${mockWorkOrder.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Work Order
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Progress Summary */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Progress</h3>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ width: `${mockWorkOrder.completion_percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{mockWorkOrder.completion_percentage}%</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {completedServices} of {totalServices} services completed
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Time</h3>
                                <p className="text-sm"><span className="font-medium">Estimated:</span> {mockWorkOrder.estimated_hours}h</p>
                                <p className="text-sm"><span className="font-medium">Actual:</span> {mockWorkOrder.actual_hours}h</p>
                                <p className="text-sm"><span className="font-medium">Remaining:</span> {(mockWorkOrder.estimated_hours - mockWorkOrder.actual_hours).toFixed(1)}h</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Cost</h3>
                                <p className="text-sm"><span className="font-medium">Estimated:</span> ₱{mockWorkOrder.estimated_cost.toLocaleString()}</p>
                                <p className="text-sm"><span className="font-medium">Actual:</span> ₱{mockWorkOrder.actual_cost.toLocaleString()}</p>
                                <p className="text-sm"><span className="font-medium">Variance:</span> ₱{(mockWorkOrder.estimated_cost - mockWorkOrder.actual_cost).toLocaleString()}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Schedule</h3>
                                <p className="text-sm"><span className="font-medium">Date:</span> {mockWorkOrder.scheduled_date}</p>
                                <p className="text-sm"><span className="font-medium">Time:</span> {mockWorkOrder.scheduled_time}</p>
                                <p className="text-sm"><span className="font-medium">Technician:</span> {mockWorkOrder.assigned_technician.name}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vehicle Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Car className="h-5 w-5" />
                                    <span>Vehicle Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Plate Number</span>
                                            <p className="font-medium">{mockWorkOrder.vehicle.plate_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Make & Model</span>
                                            <p className="font-medium">{mockWorkOrder.vehicle.year} {mockWorkOrder.vehicle.make} {mockWorkOrder.vehicle.model}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Engine</span>
                                            <p className="font-medium">{mockWorkOrder.vehicle.engine}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-muted-foreground">VIN</span>
                                            <p className="font-medium font-mono">{mockWorkOrder.vehicle.vin}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Color</span>
                                            <p className="font-medium">{mockWorkOrder.vehicle.color}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Mileage</span>
                                            <p className="font-medium">{mockWorkOrder.vehicle.mileage.toLocaleString()} km</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Customer Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Name</span>
                                        <p className="font-medium">{mockWorkOrder.customer.name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Phone</span>
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4" />
                                                <p className="font-medium">{mockWorkOrder.customer.phone}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Email</span>
                                            <div className="flex items-center space-x-2">
                                                <Mail className="h-4 w-4" />
                                                <p className="font-medium">{mockWorkOrder.customer.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Address</span>
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="h-4 w-4 mt-0.5" />
                                            <p className="font-medium">{mockWorkOrder.customer.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Service Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Work Description</span>
                                        <p className="font-medium">{mockWorkOrder.work_description}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Services Performed</span>
                                        <div className="mt-2 space-y-2">
                                            {mockWorkOrder.services.map((service, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        {service.completed ? (
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <Clock className="h-4 w-4 text-gray-400" />
                                                        )}
                                                        <span className={service.completed ? 'text-green-800' : 'text-gray-600'}>
                                                            {service.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-medium">₱{service.cost.toLocaleString()}</span>
                                                        {service.completed && (
                                                            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                                                                Completed
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progress Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Progress Notes</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockWorkOrder.progress_notes.map((note) => (
                                        <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm">{note.technician}</span>
                                                <span className="text-xs text-muted-foreground">{note.timestamp}</span>
                                            </div>
                                            <p className="text-sm">{note.note}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Work Order Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Work Order Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">WO Number</span>
                                    <span className="text-sm font-medium">{mockWorkOrder.work_order_number}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="text-sm font-medium">{mockWorkOrder.created_at.split(' ')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    {getStatusBadge(mockWorkOrder.status)}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Priority</span>
                                    {getPriorityBadge(mockWorkOrder.priority)}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Services</span>
                                    <span className="text-sm font-medium">{completedServices}/{totalServices} completed</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Technician Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Assigned Technician</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm text-muted-foreground">Name</span>
                                    <p className="font-medium">{mockWorkOrder.assigned_technician.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Specialization</span>
                                    <p className="font-medium">{mockWorkOrder.assigned_technician.specialization}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Contact</span>
                                    <p className="font-medium">{mockWorkOrder.assigned_technician.phone}</p>
                                </div>
                                <Separator />
                                <Button variant="outline" size="sm" className="w-full">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Technician
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Photos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Camera className="h-5 w-5" />
                                    <span>Photos</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockWorkOrder.photos.map((photo) => (
                                        <div key={photo.id} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <p className="text-sm font-medium">{photo.description}</p>
                                                <p className="text-xs text-muted-foreground">{photo.timestamp}</p>
                                            </div>
                                            <Badge variant="outline" className={
                                                photo.type === 'before' ? 'bg-blue-100 text-blue-800' :
                                                photo.type === 'progress' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }>
                                                {photo.type}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-3">
                                    <Camera className="h-4 w-4 mr-2" />
                                    View All Photos
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full">
                                    <Activity className="h-4 w-4 mr-2" />
                                    Add Progress Note
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Upload Photo
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Update Status
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
