import { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check, X, RotateCcw, Pen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ESignatureModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (signatureData: SignatureData) => void;
    customerName?: string;
    reservationId?: string;
}

export interface SignatureData {
    signature_data: string; // Base64 encoded image
    customer_name: string;
    customer_acknowledgment: string;
    device_info: string;
    timestamp: string;
}

export default function ESignatureModal({ 
    open, 
    onClose, 
    onSave, 
    customerName = '',
    reservationId = ''
}: ESignatureModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [name, setName] = useState(customerName);
    const [acknowledgment, setAcknowledgment] = useState('');
    const [error, setError] = useState('');

    // Initialize canvas
    useEffect(() => {
        if (open && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set canvas size
                canvas.width = canvas.offsetWidth;
                canvas.height = 200;
                
                // Set drawing styles
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                // Clear canvas
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [open]);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            setName(customerName);
            setAcknowledgment('');
            setError('');
            setHasSignature(false);
            clearSignature();
        }
    }, [open, customerName]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        setHasSignature(true);

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const handleSave = () => {
        // Validation
        if (!name.trim()) {
            setError('Please enter your full name');
            return;
        }

        if (!hasSignature) {
            setError('Please provide your signature');
            return;
        }

        if (!acknowledgment.trim()) {
            setError('Please acknowledge the terms and conditions');
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Get signature as base64
        const signatureData = canvas.toDataURL('image/png');

        // Get device info
        const deviceInfo = `${navigator.userAgent} - ${window.innerWidth}x${window.innerHeight}`;

        // Create signature data object
        const data: SignatureData = {
            signature_data: signatureData,
            customer_name: name.trim(),
            customer_acknowledgment: acknowledgment.trim(),
            device_info: deviceInfo,
            timestamp: new Date().toISOString(),
        };

        onSave(data);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Pen className="h-5 w-5 mr-2" />
                        Electronic Signature
                    </DialogTitle>
                    <DialogDescription>
                        {reservationId && `Test Drive Reservation: ${reservationId}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Customer Name */}
                    <div className="space-y-2">
                        <Label htmlFor="customer_name">Full Name *</Label>
                        <Input
                            id="customer_name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Please enter your full legal name as it appears on your ID
                        </p>
                    </div>

                    {/* Signature Canvas */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Signature *</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearSignature}
                                disabled={!hasSignature}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
                            <canvas
                                ref={canvasRef}
                                className="w-full cursor-crosshair touch-none"
                                style={{ height: '200px' }}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Sign above using your mouse, trackpad, or touch screen
                        </p>
                    </div>

                    {/* Terms & Conditions Acknowledgment */}
                    <div className="space-y-2">
                        <Label htmlFor="acknowledgment">Acknowledgment & Agreement *</Label>
                        <Textarea
                            id="acknowledgment"
                            value={acknowledgment}
                            onChange={(e) => setAcknowledgment(e.target.value)}
                            placeholder="Type: I acknowledge that I have read and agree to the terms and conditions of this test drive"
                            rows={3}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Please type your acknowledgment of the terms and conditions
                        </p>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
                        <h4 className="font-semibold text-sm">Test Drive Terms & Conditions</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                            <li>I have a valid driver's license and am authorized to drive</li>
                            <li>I have valid insurance coverage</li>
                            <li>I agree to drive safely and follow all traffic laws</li>
                            <li>I am responsible for any damage to the vehicle during the test drive</li>
                            <li>I understand that GPS tracking will be enabled during the test drive</li>
                            <li>I agree to return the vehicle at the scheduled time</li>
                            <li>I acknowledge that a deposit may be required</li>
                        </ul>
                    </div>

                    {/* Device & Timestamp Info */}
                    <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Device:</strong> {navigator.userAgent.split(' ').slice(0, 3).join(' ')}</p>
                        <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave}>
                        <Check className="h-4 w-4 mr-2" />
                        Save Signature
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
