import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Car } from 'lucide-react';

interface VehicleModel {
    id: number;
    model_code: string;
    make: string;
    model: string;
    year: number;
    base_price?: number;
}

interface VehicleInterestData {
    vehicle_interest: string;
    vehicle_model_id?: string;
    quote_amount?: string;
}

interface VehicleInterestSelectorProps {
    data: VehicleInterestData;
    setData: (key: keyof VehicleInterestData | Partial<VehicleInterestData>, value?: any) => void;
    errors?: Partial<Record<keyof VehicleInterestData, string>>;
    vehicleModels?: VehicleModel[];
    disabled?: boolean;
    showQuoteAmount?: boolean;
}

export default function VehicleInterestSelector({
    data,
    setData,
    errors = {},
    vehicleModels = [],
    disabled = false,
    showQuoteAmount = true,
}: VehicleInterestSelectorProps) {
    
    const handleVehicleModelSelect = (value: string) => {
        if (!value) {
            setData({
                ...data,
                vehicle_model_id: '',
                vehicle_interest: '',
            });
            return;
        }

        const selectedModel = vehicleModels.find(m => m.id.toString() === value);
        if (selectedModel) {
            const vehicleText = `${selectedModel.year} ${selectedModel.make} ${selectedModel.model}`;
            setData({
                ...data,
                vehicle_model_id: value,
                vehicle_interest: vehicleText,
                ...(showQuoteAmount && selectedModel.base_price ? { quote_amount: selectedModel.base_price.toString() } : {}),
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    Vehicle Interest
                </CardTitle>
                <CardDescription>Details about the vehicle of interest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Vehicle Model Selector */}
                <div className="space-y-2">
                    <Label htmlFor="vehicle_model_id">Vehicle Interest *</Label>
                    <Select 
                        value={data.vehicle_model_id || undefined} 
                        onValueChange={handleVehicleModelSelect}
                        disabled={disabled}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle model..." />
                        </SelectTrigger>
                        <SelectContent>
                            {vehicleModels
                                .filter((model) => model.id && model.id.toString().trim() !== '' && !isNaN(Number(model.id)))
                                .map((model) => (
                                    <SelectItem key={model.id} value={model.id.toString()}>
                                        {`${model.year} ${model.make} ${model.model} (${model.model_code})`}
                                        {model.base_price ? ` - ₱${Number(model.base_price).toLocaleString()}` : ''}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    {errors.vehicle_interest && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.vehicle_interest}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Select from available vehicle models in the catalog
                    </p>
                </div>

                {showQuoteAmount && (
                    <div className="space-y-2">
                        <Label htmlFor="quote_amount">Quote Amount (₱)</Label>
                        <Input
                            id="quote_amount"
                            type="number"
                            step="0.01"
                            value={data.quote_amount}
                            onChange={(e) => setData('quote_amount', e.target.value)}
                            placeholder="1500000.00"
                            disabled={disabled}
                        />
                        {errors.quote_amount && (
                            <p className="text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.quote_amount}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
