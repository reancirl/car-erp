import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';

export interface Lead {
    id: number;
    lead_id: string;
    name: string;
    email: string;
    phone: string;
    branch_id: number;
    vehicle_interest?: string;
    vehicle_variant?: string;
    vehicle_model_id?: number;
}

interface LeadSelectorProps {
    leads: Lead[];
    selectedLeadId?: string;
    onLeadSelect: (leadId: string | undefined) => void;
    disabled?: boolean;
}

export default function LeadSelector({
    leads,
    selectedLeadId,
    onLeadSelect,
    disabled = false,
}: LeadSelectorProps) {
    if (!leads || leads.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Link to Existing Lead (Optional)
                </CardTitle>
                <CardDescription>
                    Select an existing lead to auto-fill customer information, branch, and vehicle interest
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Select 
                    value={selectedLeadId || undefined} 
                    onValueChange={onLeadSelect}
                    disabled={disabled}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="None - Manual Entry" />
                    </SelectTrigger>
                    <SelectContent>
                        {leads.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id.toString()}>
                                <div className="flex flex-col">
                                    <span className="font-medium">{lead.lead_id} - {lead.name}</span>
                                    {lead.vehicle_interest && (
                                        <span className="text-xs text-muted-foreground">
                                            Interest: {lead.vehicle_interest}
                                        </span>
                                    )}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
}
