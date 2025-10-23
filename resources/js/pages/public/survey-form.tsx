import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Send, Heart, AlertCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    survey: {
        id: number;
        token: string;
        survey_type: string;
        expires_at: string | null;
    };
    customer: {
        first_name: string;
        last_name: string;
    };
    branch: {
        name: string;
    };
    errors: Record<string, string>;
}

export default function SurveyForm({ survey, customer, branch, errors }: Props) {
    const { data, setData, post, processing } = useForm({
        overall_rating: 0,
        product_quality: 0,
        service_quality: 0,
        staff_friendliness: 0,
        facility_cleanliness: 0,
        value_for_money: 0,
        what_went_well: '',
        what_needs_improvement: '',
        additional_comments: '',
        nps_score: -1,
        nps_reason: '',
        wants_followup: false,
        preferred_contact_method: '',
    });

    const [hoveredRating, setHoveredRating] = useState<{ [key: string]: number }>({});

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/survey/${survey.token}`);
    };

    const StarRating = ({ 
        name, 
        value, 
        onChange, 
        label 
    }: { 
        name: string; 
        value: number; 
        onChange: (value: number) => void; 
        label: string;
    }) => {
        const currentHover = hoveredRating[name] || 0;
        const displayValue = currentHover || value;

        return (
            <div className="space-y-2">
                <Label>{label} *</Label>
                <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(star)}
                            onMouseEnter={() => setHoveredRating({ ...hoveredRating, [name]: star })}
                            onMouseLeave={() => setHoveredRating({ ...hoveredRating, [name]: 0 })}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-8 w-8 ${
                                    star <= displayValue
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        </button>
                    ))}
                    <span className="ml-3 text-sm text-muted-foreground">
                        {value > 0 ? `${value} / 5` : 'Not rated'}
                    </span>
                </div>
            </div>
        );
    };

    const NPSButton = ({ score, label }: { score: number; label: string }) => (
        <button
            type="button"
            onClick={() => setData('nps_score', score)}
            className={`flex-1 py-3 px-2 text-center rounded-lg border-2 transition-all ${
                data.nps_score === score
                    ? score >= 9
                        ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                        : score >= 7
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-semibold'
                        : 'border-red-500 bg-red-50 text-red-700 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
            }`}
        >
            <div className="text-lg font-bold">{score}</div>
            <div className="text-xs mt-1">{label}</div>
        </button>
    );

    return (
        <>
            <Head title="Customer Satisfaction Survey" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            We Value Your Feedback
                        </h1>
                        <p className="text-lg text-gray-600">
                            Hello {customer.first_name}! Help us improve by sharing your experience at {branch.name}
                        </p>
                        {survey.expires_at && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Survey expires: {new Date(survey.expires_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Validation Error Banner */}
                        {Object.keys(errors).length > 0 && (
                            <Card className="border-red-200 bg-red-50">
                                <CardContent className="pt-6">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-red-900">Please complete all required fields</h3>
                                            <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                                                {Object.entries(errors).map(([field, message]) => (
                                                    <li key={field}>{message}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Overall Rating */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Overall Experience</CardTitle>
                                <CardDescription>How would you rate your overall experience?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <StarRating
                                    name="overall_rating"
                                    value={data.overall_rating}
                                    onChange={(value) => setData('overall_rating', value)}
                                    label="Overall Rating"
                                />
                                {errors.overall_rating && (
                                    <p className="text-sm text-red-600 mt-2">{errors.overall_rating}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Detailed Ratings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Rate Your Experience</CardTitle>
                                <CardDescription>Please rate the following aspects (optional)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <StarRating
                                    name="product_quality"
                                    value={data.product_quality}
                                    onChange={(value) => setData('product_quality', value)}
                                    label="Product Quality"
                                />
                                <StarRating
                                    name="service_quality"
                                    value={data.service_quality}
                                    onChange={(value) => setData('service_quality', value)}
                                    label="Service Quality"
                                />
                                <StarRating
                                    name="staff_friendliness"
                                    value={data.staff_friendliness}
                                    onChange={(value) => setData('staff_friendliness', value)}
                                    label="Staff Friendliness"
                                />
                                <StarRating
                                    name="facility_cleanliness"
                                    value={data.facility_cleanliness}
                                    onChange={(value) => setData('facility_cleanliness', value)}
                                    label="Facility Cleanliness"
                                />
                                <StarRating
                                    name="value_for_money"
                                    value={data.value_for_money}
                                    onChange={(value) => setData('value_for_money', value)}
                                    label="Value for Money"
                                />
                            </CardContent>
                        </Card>

                        {/* NPS Score */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommendation</CardTitle>
                                <CardDescription>
                                    How likely are you to recommend us to a friend or colleague? *
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                        <span>Not at all likely</span>
                                        <span>Extremely likely</span>
                                    </div>
                                    <div className="grid grid-cols-11 gap-1">
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                            <NPSButton
                                                key={score}
                                                score={score}
                                                label={score === 0 ? '0' : score === 10 ? '10' : ''}
                                            />
                                        ))}
                                    </div>
                                    {errors.nps_score && (
                                        <p className="text-sm text-red-600 mt-2">{errors.nps_score}</p>
                                    )}
                                </div>

                                {data.nps_score >= 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="nps_reason">
                                            What's the main reason for your score?
                                        </Label>
                                        <Textarea
                                            id="nps_reason"
                                            value={data.nps_reason}
                                            onChange={(e) => setData('nps_reason', e.target.value)}
                                            rows={3}
                                            placeholder="Tell us why..."
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Open-ended Feedback */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Feedback</CardTitle>
                                <CardDescription>Help us understand your experience better</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="what_went_well">What did we do well?</Label>
                                    <Textarea
                                        id="what_went_well"
                                        value={data.what_went_well}
                                        onChange={(e) => setData('what_went_well', e.target.value)}
                                        rows={3}
                                        placeholder="Tell us what you loved..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="what_needs_improvement">What could we improve?</Label>
                                    <Textarea
                                        id="what_needs_improvement"
                                        value={data.what_needs_improvement}
                                        onChange={(e) => setData('what_needs_improvement', e.target.value)}
                                        rows={3}
                                        placeholder="Share your suggestions..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="additional_comments">Additional Comments</Label>
                                    <Textarea
                                        id="additional_comments"
                                        value={data.additional_comments}
                                        onChange={(e) => setData('additional_comments', e.target.value)}
                                        rows={4}
                                        placeholder="Anything else you'd like to share?"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Follow-up */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Follow-up</CardTitle>
                                <CardDescription>Would you like us to contact you?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="wants_followup"
                                        checked={data.wants_followup}
                                        onCheckedChange={(checked) => setData('wants_followup', !!checked)}
                                    />
                                    <label htmlFor="wants_followup" className="text-sm font-medium">
                                        Yes, please follow up with me about my feedback
                                    </label>
                                </div>

                                {data.wants_followup && (
                                    <div className="space-y-2">
                                        <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                                        <Select
                                            value={data.preferred_contact_method}
                                            onValueChange={(value) => setData('preferred_contact_method', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="phone">Phone Call</SelectItem>
                                                <SelectItem value="sms">SMS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={processing}
                                className="px-12"
                            >
                                <Send className="h-5 w-5 mr-2" />
                                {processing ? 'Submitting...' : 'Submit Survey'}
                            </Button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            Thank you for taking the time to share your feedback!
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}
