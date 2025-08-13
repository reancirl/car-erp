import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Filter, Download, Plus, Eye, Edit, AlertTriangle, CheckCircle, Clock, QrCode, BarChart3, UserCheck, Link } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service & Parts',
        href: '/service',
    },
    {
        title: 'Parts & Inventory',
        href: '/service/parts-inventory',
    },
];

export default function PartsInventory() {
    // Mock data for demonstration
    const mockInventory = [
        {
            id: 1,
            part_number: 'BP-001-HON',
            part_name: 'Brake Pads - Front Set',
            category: 'Brakes',
            manufacturer: 'Honda OEM',
            current_stock: 15,
            minimum_stock: 5,
            maximum_stock: 50,
            unit_cost: 45.50,
            selling_price: 68.25,
            location: 'A-12-3',
            qr_code: 'QR-BP001HON',
            barcode: '1234567890123',
            last_issued: '2025-01-12 14:30:00',
            last_received: '2025-01-08 09:15:00',
            linked_work_orders: ['WO-2025-001', 'WO-2025-003'],
            linked_vins: ['JH4KA8260MC123456'],
            reorder_point: 8,
            pending_orders: 25,
            status: 'in_stock',
            audit_trail_count: 12,
            anomaly_alerts: 0
        },
        {
            id: 2,
            part_number: 'OF-002-VW',
            part_name: 'Oil Filter',
            category: 'Engine',
            manufacturer: 'Volkswagen OEM',
            current_stock: 3,
            minimum_stock: 10,
            maximum_stock: 100,
            unit_cost: 12.75,
            selling_price: 19.13,
            location: 'B-05-1',
            qr_code: 'QR-OF002VW',
            barcode: '2345678901234',
            last_issued: '2025-01-13 10:45:00',
            last_received: '2025-01-05 16:20:00',
            linked_work_orders: ['WO-2025-002'],
            linked_vins: ['WVWZZZ1JZ3W123789'],
            reorder_point: 10,
            pending_orders: 50,
            status: 'low_stock',
            audit_trail_count: 8,
            anomaly_alerts: 1
        },
        {
            id: 3,
            part_number: 'TF-003-HYU',
            part_name: 'Transmission Fluid - 5L',
            category: 'Transmission',
            manufacturer: 'Hyundai OEM',
            current_stock: 0,
            minimum_stock: 8,
            maximum_stock: 40,
            unit_cost: 28.90,
            selling_price: 43.35,
            location: 'C-08-2',
            qr_code: 'QR-TF003HYU',
            barcode: '3456789012345',
            last_issued: '2025-01-11 11:20:00',
            last_received: '2025-01-03 13:45:00',
            linked_work_orders: ['WO-2025-003'],
            linked_vins: ['KMHD84LF5EU456123'],
            reorder_point: 8,
            pending_orders: 30,
            status: 'out_of_stock',
            audit_trail_count: 15,
            anomaly_alerts: 2
        },
        {
            id: 4,
            part_number: 'AC-004-SUB',
            part_name: 'AC Compressor',
            category: 'Air Conditioning',
            manufacturer: 'Subaru OEM',
            current_stock: 2,
            minimum_stock: 2,
            maximum_stock: 10,
            unit_cost: 285.00,
            selling_price: 427.50,
            location: 'D-15-1',
            qr_code: 'QR-AC004SUB',
            barcode: '4567890123456',
            last_issued: '2025-01-09 15:30:00',
            last_received: '2025-01-07 11:00:00',
            linked_work_orders: ['WO-2025-004'],
            linked_vins: ['JF1VA1C60M9876543'],
            reorder_point: 2,
            pending_orders: 5,
            status: 'critical_stock',
            audit_trail_count: 6,
            anomaly_alerts: 0
        }
    ];

    const mockTransactions = [
        {
            id: 1,
            type: 'issue',
            part_number: 'BP-001-HON',
            quantity: 1,
            work_order: 'WO-2025-001',
            technician: 'Mike Johnson',
            approved_by: 'Sarah Parts Head',
            timestamp: '2025-01-12 14:30:00',
            status: 'completed'
        },
        {
            id: 2,
            type: 'return',
            part_number: 'OF-002-VW',
            quantity: 2,
            work_order: 'WO-2025-002',
            technician: 'Lisa Brown',
            approved_by: 'Tom Service Advisor',
            timestamp: '2025-01-13 09:15:00',
            status: 'pending_approval'
        },
        {
            id: 3,
            type: 'receive',
            part_number: 'TF-003-HYU',
            quantity: 30,
            work_order: null,
            technician: null,
            approved_by: 'Sarah Parts Head',
            timestamp: '2025-01-13 16:45:00',
            status: 'pending_approval'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_stock':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        In Stock
                    </Badge>
                );
            case 'low_stock':
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low Stock
                    </Badge>
                );
            case 'out_of_stock':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Out of Stock
                    </Badge>
                );
            case 'critical_stock':
                return (
                    <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Critical
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTransactionBadge = (type: string) => {
        switch (type) {
            case 'issue':
                return <Badge variant="destructive" className="bg-red-100 text-red-800">Issue</Badge>;
            case 'return':
                return <Badge variant="default" className="bg-blue-100 text-blue-800">Return</Badge>;
            case 'receive':
                return <Badge variant="default" className="bg-green-100 text-green-800">Receive</Badge>;
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const getStockLevel = (current: number, min: number, max: number) => {
        const percentage = (current / max) * 100;
        let color = 'bg-green-500';
        if (current <= min) color = 'bg-red-500';
        else if (current <= min * 2) color = 'bg-yellow-500';
        
        return (
            <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parts & Inventory" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Package className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Parts & Inventory</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <QrCode className="h-4 w-4 mr-2" />
                            Scan QR/Barcode
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Part
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">Active inventory items</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">2</div>
                            <p className="text-xs text-muted-foreground">Below minimum levels</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">1</div>
                            <p className="text-xs text-muted-foreground">Immediate reorder required</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">110</div>
                            <p className="text-xs text-muted-foreground">Units on order</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>Real-time stock levels with QR/barcode scanning and dual-approval workflows</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by part number, name, or barcode..." className="pl-10" />
                                </div>
                            </div>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="brakes">Brakes</SelectItem>
                                    <SelectItem value="engine">Engine</SelectItem>
                                    <SelectItem value="transmission">Transmission</SelectItem>
                                    <SelectItem value="air_conditioning">Air Conditioning</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Stock Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="in_stock">In Stock</SelectItem>
                                    <SelectItem value="low_stock">Low Stock</SelectItem>
                                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                    <SelectItem value="critical_stock">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Manufacturer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Manufacturers</SelectItem>
                                    <SelectItem value="honda">Honda OEM</SelectItem>
                                    <SelectItem value="volkswagen">Volkswagen OEM</SelectItem>
                                    <SelectItem value="hyundai">Hyundai OEM</SelectItem>
                                    <SelectItem value="subaru">Subaru OEM</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Parts Inventory</CardTitle>
                        <CardDescription>Real-time stock levels with immutable audit trail and anomaly alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Part Details</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Stock Level</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Pricing</TableHead>
                                    <TableHead>QR/Barcode</TableHead>
                                    <TableHead>Linked Orders</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockInventory.map((item) => (
                                    <TableRow key={item.id} className={item.status === 'out_of_stock' ? 'bg-red-50' : item.status === 'low_stock' ? 'bg-yellow-50' : ''}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{item.part_name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{item.part_number}</div>
                                                <div className="text-xs text-muted-foreground">{item.manufacturer}</div>
                                                {item.anomaly_alerts > 0 && (
                                                    <Badge variant="destructive" className="text-xs mt-1">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        {item.anomaly_alerts} Alert{item.anomaly_alerts > 1 ? 's' : ''}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{item.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium">{item.current_stock}</span>
                                                    {getStockLevel(item.current_stock, item.minimum_stock, item.maximum_stock)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Min: {item.minimum_stock} | Max: {item.maximum_stock}
                                                </div>
                                                {item.pending_orders > 0 && (
                                                    <div className="text-xs text-blue-600">
                                                        +{item.pending_orders} on order
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">{item.location}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-sm">Cost: ${item.unit_cost}</div>
                                                <div className="text-sm font-medium">Sell: ${item.selling_price}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <QrCode className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <div className="text-xs font-mono">{item.qr_code}</div>
                                                    <div className="text-xs font-mono text-muted-foreground">{item.barcode}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {item.linked_work_orders.length > 0 && (
                                                    <div className="flex items-center space-x-1 mb-1">
                                                        <Link className="h-3 w-3 text-blue-600" />
                                                        <span className="text-xs">{item.linked_work_orders.length} WO</span>
                                                    </div>
                                                )}
                                                {item.linked_vins.length > 0 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        VIN: {item.linked_vins[0].slice(-6)}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
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

                {/* Recent Transactions & Dual Approval */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Parts issue and return activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockTransactions.map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                {getTransactionBadge(transaction.type)}
                                                <span className="font-medium">{transaction.part_number}</span>
                                                <span className="text-sm">Qty: {transaction.quantity}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {transaction.work_order && `WO: ${transaction.work_order} | `}
                                                {transaction.technician && `Tech: ${transaction.technician} | `}
                                                {transaction.timestamp}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {transaction.status === 'pending_approval' ? (
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Approved
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dual-Approval Workflow</CardTitle>
                            <CardDescription>Parts Head + Service Advisor approval system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Issue Approval</div>
                                        <div className="text-sm text-muted-foreground">Parts Head approval required for issues</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">Return Approval</div>
                                        <div className="text-sm text-muted-foreground">Service Advisor approval for returns</div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">High-Value Items</div>
                                        <div className="text-sm text-muted-foreground">Dual approval for items &gt; $200</div>
                                    </div>
                                    <Badge variant="default" className="bg-blue-100 text-blue-800">Enhanced</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Audit Trail & Anomaly Detection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Audit Trail & Anomaly Detection</CardTitle>
                        <CardDescription>Immutable audit trail with alerts for unusual reorder patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-medium">Audit Events</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Total audit trail entries</p>
                                <div className="text-2xl font-bold">41</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                    <h4 className="font-medium">Anomaly Alerts</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Unusual reorder patterns detected</p>
                                <div className="text-2xl font-bold text-orange-600">3</div>
                                <p className="text-xs text-muted-foreground">Require review</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <UserCheck className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium">Approval Rate</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Dual-approval success rate</p>
                                <div className="text-2xl font-bold">96%</div>
                                <p className="text-xs text-muted-foreground">Last 30 days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
