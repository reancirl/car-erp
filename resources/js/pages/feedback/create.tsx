import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ImagePlus, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface FeedbackType {
    value: string;
    label: string;
    description: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Send feedback', href: '/feedback' },
];

const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'];
const maxBytes = 5 * 1024 * 1024;

export default function FeedbackCreate({ types }: { types: FeedbackType[] }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors, transform, reset } = useForm<{
        type: string;
        title: string;
        description: string;
        screenshot: File | null;
    }>({
        type: 'bug',
        title: '',
        description: '',
        screenshot: null,
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    transform((form) => {
        if (form.screenshot) {
            return form;
        }

        return {
            type: form.type,
            title: form.title,
            description: form.description,
        };
    });

    const chooseFile = (file: File | undefined) => {
        if (!file) {
            return;
        }

        if (!acceptedTypes.includes(file.type)) {
            setFileError('Use a PNG, JPG, or WebP image.');
            return;
        }

        if (file.size > maxBytes) {
            setFileError('That image is larger than 5 MB.');
            return;
        }

        setFileError(null);
        setData('screenshot', file);
        setPreview((current) => {
            if (current) {
                URL.revokeObjectURL(current);
            }

            return URL.createObjectURL(file);
        });
    };

    const clearFile = () => {
        setData('screenshot', null);
        setFileError(null);
        setPreview((current) => {
            if (current) {
                URL.revokeObjectURL(current);
            }

            return null;
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('feedback.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                clearFile();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Send feedback" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Send feedback"
                    description="Report a bug, ask for a change, or request a feature. A screenshot helps. Nothing becomes a card until an owner or admin approves it."
                />

                <Card>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <fieldset className="space-y-3">
                                <legend className="text-sm font-medium">What is this?</legend>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {types.map((type) => {
                                        const selected = data.type === type.value;

                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setData('type', type.value)}
                                                className={`rounded-lg border p-3 text-left transition-colors ${
                                                    selected
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                        : 'hover:bg-muted/60'
                                                }`}
                                            >
                                                <span className="block text-sm font-medium">{type.label}</span>
                                                <span className="mt-1 block text-xs text-muted-foreground">{type.description}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.type} />
                            </fieldset>

                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(event) => setData('title', event.target.value)}
                                    placeholder="Short summary of what you need"
                                    maxLength={160}
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(event) => setData('description', event.target.value)}
                                    placeholder="What happened, what you expected, and how to see it again."
                                    rows={6}
                                    required
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="screenshot">Screenshot</Label>
                                <p className="text-xs text-muted-foreground">Optional. PNG, JPG, or WebP, up to 5 MB.</p>
                                {preview ? (
                                    <div className="relative w-fit">
                                        <img
                                            src={preview}
                                            alt="Screenshot preview"
                                            className="max-h-48 rounded-md border object-contain"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={clearFile}
                                        >
                                            <X />
                                            <span className="sr-only">Remove screenshot</span>
                                        </Button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="screenshot"
                                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-sm text-muted-foreground hover:bg-muted/40"
                                    >
                                        <ImagePlus className="size-5" />
                                        Choose an image
                                    </label>
                                )}
                                <input
                                    id="screenshot"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="sr-only"
                                    onChange={(event) => chooseFile(event.target.files?.[0])}
                                />
                                <InputError message={fileError ?? errors.screenshot} />
                            </div>

                            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Sending as {auth.user.name}
                                    {auth.user.email ? ` (${auth.user.email})` : ''}
                                </p>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Sending...' : 'Send feedback'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
