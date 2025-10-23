import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star } from 'lucide-react';

interface Props {
    survey: {
        overall_rating: number;
        completed_at: string;
    };
    customer: {
        first_name: string;
        last_name: string;
    };
}

export default function SurveyCompleted({ survey, customer }: Props) {
    return (
        <>
            <Head title="Survey Completed" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-12 pb-12 text-center">
                        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Thank You, {customer.first_name}!
                        </h1>
                        <p className="text-lg text-gray-600 mb-6">
                            Your feedback has been submitted successfully.
                        </p>
                        
                        {survey.overall_rating > 0 && (
                            <div className="bg-white rounded-lg p-6 mb-6">
                                <p className="text-sm text-muted-foreground mb-2">Your Overall Rating</p>
                                <div className="flex justify-center items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-8 w-8 ${
                                                star <= survey.overall_rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {survey.overall_rating} / 5
                                </p>
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground">
                            Completed on {new Date(survey.completed_at).toLocaleString()}
                        </p>
                        
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                                We appreciate you taking the time to help us improve our service.
                                Your feedback is invaluable to us!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
