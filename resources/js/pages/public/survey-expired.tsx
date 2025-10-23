import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';

interface Props {
    survey: {
        expires_at: string;
    };
}

export default function SurveyExpired({ survey }: Props) {
    return (
        <>
            <Head title="Survey Expired" />
            
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center py-12 px-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-12 pb-12 text-center">
                        <AlertTriangle className="h-20 w-20 text-orange-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Survey Expired
                        </h1>
                        <p className="text-lg text-gray-600 mb-6">
                            Unfortunately, this survey link has expired and can no longer be completed.
                        </p>
                        
                        <div className="bg-white rounded-lg p-6 mb-6">
                            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-1">Expired on</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Date(survey.expires_at).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                                If you would still like to provide feedback, please contact us directly.
                                We value your input and would love to hear from you!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
