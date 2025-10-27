import { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Scan,
    Camera,
    Search,
    Package,
    Plus,
    Minus,
    MapPin,
    AlertCircle,
    CheckCircle,
    XCircle,
    TrendingDown,
    History,
    X,
    ArrowLeft,
    Maximize2,
} from 'lucide-react';
import { type PartInventory } from '@/types';
import { Html5Qrcode } from 'html5-qrcode';

interface ScanHistoryItem {
    code: string;
    part: PartInventory;
    timestamp: Date;
}

export default function PartsInventoryScanner() {
    const [code, setCode] = useState('');
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [part, setPart] = useState<PartInventory | null>(null);
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Stock adjustment state
    const [showStockAdjust, setShowStockAdjust] = useState(false);
    const [quantityChange, setQuantityChange] = useState<number>(0);
    const [adjusting, setAdjusting] = useState(false);

    // Location update state
    const [showLocationUpdate, setShowLocationUpdate] = useState(false);
    const [locationData, setLocationData] = useState({
        warehouse_location: '',
        aisle: '',
        rack: '',
        bin: '',
    });
    const [updatingLocation, setUpdatingLocation] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerDivRef = useRef<HTMLDivElement>(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    // Start camera when showCamera becomes true
    useEffect(() => {
        if (showCamera && scannerDivRef.current && !scannerRef.current) {
            const initCamera = async () => {
                try {
                    const scanner = new Html5Qrcode('qr-reader');
                    scannerRef.current = scanner;

                    await scanner.start(
                        { facingMode: 'environment' },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 }
                        },
                        (decodedText) => {
                            handleScan(decodedText);
                            stopCameraScanner();
                        },
                        (errorMessage) => {
                            // Ignore frequent errors when no QR detected
                        }
                    );

                    setScanning(true);
                } catch (err) {
                    console.error('Camera error:', err);
                    setCameraError('Failed to start camera. Please ensure camera permissions are granted.');
                    setShowCamera(false);
                }
            };

            initCamera();
        }
    }, [showCamera]);

    const handleScan = async (scannedCode: string) => {
        if (!scannedCode.trim()) return;

        setLoading(true);
        setError(null);
        setSuccess(null);
        setPart(null);

        try {
            const response = await fetch(route('parts-inventory.scan'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ code: scannedCode }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setPart(data.part);
                setSuccess('Part found!');

                // Add to scan history
                setScanHistory(prev => [
                    { code: scannedCode, part: data.part, timestamp: new Date() },
                    ...prev.slice(0, 9) // Keep last 10
                ]);

                // Clear input for next scan
                setCode('');

                // Play success sound
                playBeep();
            } else {
                setError(data.message || 'Part not found');
                playErrorBeep();
            }
        } catch (err) {
            setError('Error scanning part. Please try again.');
            playErrorBeep();
            console.error('Scan error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            handleScan(code.trim());
        }
    };

    const startCameraScanner = () => {
        setCameraError(null);
        setShowCamera(true);
        // Camera will start via useEffect when div is rendered
    };

    const stopCameraScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current = null;
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
        setScanning(false);
        setShowCamera(false);
    };

    const playBeep = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };

    const playErrorBeep = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 400;
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    };

    const handleStockAdjustment = async () => {
        if (!part || quantityChange === 0) return;

        setAdjusting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(route('parts-inventory.quick-update', part.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    action: 'adjust_stock',
                    quantity_change: quantityChange,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setPart(data.part);
                setSuccess(`Stock adjusted by ${quantityChange > 0 ? '+' : ''}${quantityChange}`);
                setShowStockAdjust(false);
                setQuantityChange(0);
                playBeep();
            } else {
                setError(data.message || 'Failed to adjust stock');
                playErrorBeep();
            }
        } catch (err) {
            setError('Error adjusting stock. Please try again.');
            playErrorBeep();
            console.error('Stock adjustment error:', err);
        } finally {
            setAdjusting(false);
        }
    };

    const handleLocationUpdate = async () => {
        if (!part) return;

        setUpdatingLocation(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(route('parts-inventory.quick-update', part.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    action: 'update_location',
                    ...locationData,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setPart(data.part);
                setSuccess('Location updated successfully');
                setShowLocationUpdate(false);
                setLocationData({ warehouse_location: '', aisle: '', rack: '', bin: '' });
                playBeep();
            } else {
                setError(data.message || 'Failed to update location');
                playErrorBeep();
            }
        } catch (err) {
            setError('Error updating location. Please try again.');
            playErrorBeep();
            console.error('Location update error:', err);
        } finally {
            setUpdatingLocation(false);
        }
    };

    const getStockBadge = (currentPart: PartInventory) => {
        if (currentPart.quantity_on_hand <= 0) {
            return <Badge className="bg-red-100 text-red-800 text-lg px-3 py-1"><AlertCircle className="h-4 w-4 mr-1" />Out of Stock</Badge>;
        } else if (currentPart.quantity_on_hand <= currentPart.minimum_stock_level) {
            return <Badge className="bg-yellow-100 text-yellow-800 text-lg px-3 py-1"><TrendingDown className="h-4 w-4 mr-1" />Low Stock</Badge>;
        }
        return <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1"><CheckCircle className="h-4 w-4 mr-1" />In Stock</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { icon: any; className: string }> = {
            active: { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
            inactive: { icon: XCircle, className: 'bg-gray-100 text-gray-800' },
            discontinued: { icon: AlertCircle, className: 'bg-red-100 text-red-800' },
        };
        const badge = badges[status] || badges.active;
        const Icon = badge.icon;
        return (
            <Badge className={`${badge.className} text-lg px-3 py-1`}>
                <Icon className="h-4 w-4 mr-1" />
                {status.toUpperCase()}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Parts Scanner" />

            {/* Full Page Specialized Scanner Interface */}
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                {/* Top Bar */}
                <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <Scan className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Parts Scanner</h1>
                                    <p className="text-sm text-slate-300">Scan, Check & Update Inventory</p>
                                </div>
                            </div>
                            <a href="/inventory/parts-inventory" className="text-slate-300 hover:text-white transition-colors">
                                <Button variant="ghost" className="text-white border border-slate-600 hover:bg-slate-700">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Inventory
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Scanner Input */}
                        <div className="space-y-6">
                            {/* Scanner Input Card */}
                            <Card className="border-2 border-blue-500/30 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-2xl text-white flex items-center">
                                        <Search className="h-6 w-6 mr-2 text-blue-400" />
                                        Scan Code
                                    </CardTitle>
                                    <CardDescription className="text-slate-300 text-base">
                                        Use hardware scanner or camera
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Manual Input */}
                                    <form onSubmit={handleInputSubmit}>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                                            <Input
                                                ref={inputRef}
                                                type="text"
                                                placeholder="Scan or type code..."
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                className="pl-14 h-16 text-2xl bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                                                disabled={loading || scanning}
                                                autoFocus
                                            />
                                        </div>
                                    </form>

                                    {/* Camera Scanner Button */}
                                    <div className="flex justify-center pt-2">
                                        {!showCamera ? (
                                            <Button
                                                onClick={startCameraScanner}
                                                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                                                disabled={loading}
                                            >
                                                <Camera className="h-5 w-5 mr-2" />
                                                Use Camera Scanner
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={stopCameraScanner}
                                                variant="destructive"
                                                className="w-full h-14 text-lg"
                                            >
                                                <X className="h-5 w-5 mr-2" />
                                                Stop Camera
                                            </Button>
                                        )}
                                    </div>

                                    {/* Camera Scanner View */}
                                    {showCamera && (
                                        <div className="border-2 border-blue-500 rounded-lg overflow-hidden bg-black">
                                            <div id="qr-reader" ref={scannerDivRef}></div>
                                        </div>
                                    )}

                                    {/* Camera Error */}
                                    {cameraError && (
                                        <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg flex items-start space-x-3">
                                            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-red-200">{cameraError}</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Alerts */}
                            {error && (
                                <div className="p-5 bg-red-900/30 border-2 border-red-600 rounded-lg flex items-start space-x-3 animate-pulse">
                                    <AlertCircle className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-lg text-red-200 font-medium">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="p-5 bg-green-900/30 border-2 border-green-600 rounded-lg flex items-start space-x-3 animate-pulse">
                                    <CheckCircle className="h-6 w-6 text-green-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-lg text-green-200 font-medium">{success}</p>
                                </div>
                            )}

                            {/* Scan History */}
                            {scanHistory.length > 0 && (
                                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center space-x-2">
                                            <History className="h-5 w-5 text-blue-400" />
                                            <CardTitle className="text-lg text-white">Recent Scans</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {scanHistory.map((item, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleScan(item.code)}
                                                    className="w-full p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm text-white">{item.part.part_name}</p>
                                                            <p className="text-xs text-slate-400 font-mono">{item.code}</p>
                                                        </div>
                                                        <p className="text-xs text-slate-400">
                                                            {item.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column: Part Details & Actions */}
                        <div className="space-y-6">
                            {part ? (
                                <>
                                    {/* Part Details Card */}
                                    <Card className="border-2 border-green-500/30 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-2xl mb-2 text-white">{part.part_name}</CardTitle>
                                                    <p className="text-base text-slate-300 font-mono">{part.part_number}</p>
                                                    {part.manufacturer && (
                                                        <p className="text-base text-slate-400 mt-1">{part.manufacturer}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    {getStatusBadge(part.status)}
                                                    {getStockBadge(part)}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-5">
                                            {/* Stock Info - Large Display */}
                                            <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">On Hand</p>
                                                    <p className="text-4xl font-bold text-white">{part.quantity_on_hand}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Reserved</p>
                                                    <p className="text-4xl font-bold text-orange-400">{part.quantity_reserved}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Available</p>
                                                    <p className="text-4xl font-bold text-green-400">
                                                        {part.quantity_on_hand - part.quantity_reserved}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            {part.warehouse_location && (
                                                <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                                                    <p className="text-xs text-blue-300 uppercase tracking-wide mb-2">Location</p>
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="h-5 w-5 text-blue-400" />
                                                        <p className="font-semibold text-lg text-white">
                                                            {[part.warehouse_location, part.aisle, part.rack, part.bin]
                                                                .filter(Boolean)
                                                                .join(' / ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Pricing */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-700/50 rounded-lg">
                                                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Unit Cost</p>
                                                    <p className="text-xl font-bold text-white">{part.currency} {Number(part.unit_cost).toFixed(2)}</p>
                                                </div>
                                                <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                                                    <p className="text-xs text-green-300 uppercase tracking-wide mb-1">Selling Price</p>
                                                    <p className="text-xl font-bold text-green-400">
                                                        {part.currency} {Number(part.selling_price).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-3 pt-3">
                                                <Button
                                                    onClick={() => setShowStockAdjust(!showStockAdjust)}
                                                    variant={showStockAdjust ? "default" : "outline"}
                                                    className="h-14 text-base bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                                                    size="lg"
                                                >
                                                    <Package className="h-5 w-5 mr-2" />
                                                    Adjust Stock
                                                </Button>
                                                <Button
                                                    onClick={() => setShowLocationUpdate(!showLocationUpdate)}
                                                    variant={showLocationUpdate ? "default" : "outline"}
                                                    className="h-14 text-base bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                                                    size="lg"
                                                >
                                                    <MapPin className="h-5 w-5 mr-2" />
                                                    Update Location
                                                </Button>
                                            </div>

                                            {/* Stock Adjustment Panel */}
                                            {showStockAdjust && (
                                                <Card className="border-2 border-blue-400 bg-slate-900">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base text-white">Stock Adjustment</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="grid grid-cols-4 gap-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setQuantityChange(-10)}
                                                                className="h-12 text-base font-bold border-red-500 text-red-400 hover:bg-red-950"
                                                            >
                                                                -10
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setQuantityChange(-1)}
                                                                className="h-12 text-base font-bold border-red-500 text-red-400 hover:bg-red-950"
                                                            >
                                                                -1
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setQuantityChange(1)}
                                                                className="h-12 text-base font-bold border-green-500 text-green-400 hover:bg-green-950"
                                                            >
                                                                +1
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setQuantityChange(10)}
                                                                className="h-12 text-base font-bold border-green-500 text-green-400 hover:bg-green-950"
                                                            >
                                                                +10
                                                            </Button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-white">Custom Adjustment</Label>
                                                            <Input
                                                                type="number"
                                                                value={quantityChange}
                                                                onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
                                                                placeholder="Enter quantity (+ or -)"
                                                                className="h-12 text-lg bg-slate-800 border-slate-600 text-white"
                                                            />
                                                        </div>
                                                        <div className="flex space-x-2 pt-2">
                                                            <Button
                                                                onClick={() => setShowStockAdjust(false)}
                                                                variant="outline"
                                                                className="flex-1 h-12 border-slate-600 text-white"
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={handleStockAdjustment}
                                                                disabled={adjusting || quantityChange === 0}
                                                                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                {adjusting ? 'Updating...' : `Apply ${quantityChange > 0 ? '+' : ''}${quantityChange}`}
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Location Update Panel */}
                                            {showLocationUpdate && (
                                                <Card className="border-2 border-purple-400 bg-slate-900">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base text-white">Update Location</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="col-span-2 space-y-1">
                                                                <Label className="text-xs text-slate-300">Warehouse</Label>
                                                                <Input
                                                                    value={locationData.warehouse_location}
                                                                    onChange={(e) => setLocationData(prev => ({...prev, warehouse_location: e.target.value}))}
                                                                    placeholder={part.warehouse_location || "e.g., Main"}
                                                                    className="h-11 bg-slate-800 border-slate-600 text-white"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs text-slate-300">Aisle</Label>
                                                                <Input
                                                                    value={locationData.aisle}
                                                                    onChange={(e) => setLocationData(prev => ({...prev, aisle: e.target.value}))}
                                                                    placeholder={part.aisle || "e.g., A"}
                                                                    className="h-11 bg-slate-800 border-slate-600 text-white"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs text-slate-300">Rack</Label>
                                                                <Input
                                                                    value={locationData.rack}
                                                                    onChange={(e) => setLocationData(prev => ({...prev, rack: e.target.value}))}
                                                                    placeholder={part.rack || "e.g., R1"}
                                                                    className="h-11 bg-slate-800 border-slate-600 text-white"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs text-slate-300">Bin</Label>
                                                                <Input
                                                                    value={locationData.bin}
                                                                    onChange={(e) => setLocationData(prev => ({...prev, bin: e.target.value}))}
                                                                    placeholder={part.bin || "e.g., B1"}
                                                                    className="h-11 bg-slate-800 border-slate-600 text-white"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2 pt-2">
                                                            <Button
                                                                onClick={() => setShowLocationUpdate(false)}
                                                                variant="outline"
                                                                className="flex-1 h-12 border-slate-600 text-white"
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={handleLocationUpdate}
                                                                disabled={updatingLocation}
                                                                className="flex-1 h-12 bg-purple-600 hover:bg-purple-700"
                                                            >
                                                                {updatingLocation ? 'Updating...' : 'Update Location'}
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <Card className="border-2 border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                                    <CardContent className="py-20">
                                        <div className="text-center">
                                            <Scan className="h-20 w-20 mx-auto text-slate-600 mb-4" />
                                            <h3 className="text-2xl font-semibold text-white mb-2">Ready to Scan</h3>
                                            <p className="text-slate-400 text-lg">
                                                Scan a barcode or QR code to view part details
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
