import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export default function Toast() {
    const { props } = usePage<{ flash: FlashMessages }>();
    const flash = props.flash || {};
    const [visible, setVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (flash.success || flash.error || flash.warning || flash.info) {
            setVisible(true);
            setShouldRender(true);

            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => {
                setVisible(false);
                // Wait for animation to complete before removing from DOM
                setTimeout(() => setShouldRender(false), 300);
            }, 5000);

            return () => clearTimeout(timer);
        } else {
            setShouldRender(false);
        }
    }, [flash]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => setShouldRender(false), 300);
    };

    if (!shouldRender) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
            {flash.success && (
                <Alert 
                    className={`bg-green-50 border-green-200 shadow-lg transition-all duration-300 ${
                        visible ? 'animate-in slide-in-from-right-full' : 'animate-out slide-out-to-right-full'
                    }`}
                >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 pr-6">Success</AlertTitle>
                    <AlertDescription className="text-green-700">
                        {flash.success}
                    </AlertDescription>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 text-green-600 hover:bg-green-100"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}

            {flash.error && (
                <Alert 
                    className={`bg-red-50 border-red-200 shadow-lg transition-all duration-300 ${
                        visible ? 'animate-in slide-in-from-right-full' : 'animate-out slide-out-to-right-full'
                    }`}
                    variant="destructive"
                >
                    <XCircle className="h-4 w-4" />
                    <AlertTitle className="pr-6">Error</AlertTitle>
                    <AlertDescription>
                        {flash.error}
                    </AlertDescription>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}

            {flash.warning && (
                <Alert 
                    className={`bg-yellow-50 border-yellow-200 shadow-lg transition-all duration-300 ${
                        visible ? 'animate-in slide-in-from-right-full' : 'animate-out slide-out-to-right-full'
                    }`}
                >
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800 pr-6">Warning</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                        {flash.warning}
                    </AlertDescription>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-100"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}

            {flash.info && (
                <Alert 
                    className={`bg-blue-50 border-blue-200 shadow-lg transition-all duration-300 ${
                        visible ? 'animate-in slide-in-from-right-full' : 'animate-out slide-out-to-right-full'
                    }`}
                >
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 pr-6">Info</AlertTitle>
                    <AlertDescription className="text-blue-700">
                        {flash.info}
                    </AlertDescription>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}
        </div>
    );
}
