<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class FeedbackController extends Controller
{
    /**
     * Form choice => intake API type.
     *
     * The intake board accepts bug and feature. A change request is stored as
     * a feature, with "Change request:" on the title, so it still becomes a card.
     *
     * @var array<string, string>
     */
    private const TYPES = [
        'bug' => 'bug',
        'change' => 'feature',
        'feature' => 'feature',
    ];

    public function create(): InertiaResponse
    {
        return Inertia::render('feedback/create', [
            'types' => [
                [
                    'value' => 'bug',
                    'label' => 'Bug report',
                    'description' => 'Something is broken or does not work the way it should.',
                ],
                [
                    'value' => 'change',
                    'label' => 'Change request',
                    'description' => 'Ask for a change to something that already exists.',
                ],
                [
                    'value' => 'feature',
                    'label' => 'Feature request',
                    'description' => 'Ask for something the system does not do yet.',
                ],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(array_keys(self::TYPES))],
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:5000'],
            'screenshot' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:5120'],
        ]);

        $intakeUrl = config('services.swiftly.intake_url');

        if (! is_string($intakeUrl) || $intakeUrl === '') {
            return back()
                ->with('error', 'Feedback intake is not configured yet.')
                ->withInput();
        }

        $user = $request->user();
        $title = $validated['title'];

        if ($validated['type'] === 'change') {
            $title = 'Change request: '.$title;
        }

        $payload = [
            'type' => self::TYPES[$validated['type']],
            'title' => $title,
            'description' => $validated['description'],
            'reporter_name' => $user->name,
            'reporter_email' => $user->email,
        ];

        $pending = Http::acceptJson()->timeout(20);

        if ($request->hasFile('screenshot')) {
            $file = $request->file('screenshot');
            $extension = $file->guessExtension() ?: 'png';

            $pending = $pending->attach(
                'screenshot',
                file_get_contents($file->getRealPath()),
                'screenshot.'.$extension,
                ['Content-Type' => $file->getMimeType() ?: 'image/png']
            );
        } else {
            $pending = $pending->asJson();
        }

        try {
            $response = $pending->post($intakeUrl, $payload);
        } catch (\Throwable $exception) {
            report($exception);

            return back()
                ->with('error', 'This could not be sent. Try again in a moment.')
                ->withInput();
        }

        if ($response->successful()) {
            return redirect()
                ->route('feedback.create')
                ->with('success', 'Sent. An owner or admin will review it before it becomes a card.');
        }

        if ($response->status() === 429) {
            return back()
                ->with('error', 'Too many submissions just now. Wait a minute and try again.')
                ->withInput();
        }

        if ($response->status() === 422) {
            throw ValidationException::withMessages($this->remoteErrors($response));
        }

        report(new \RuntimeException('Swiftly intake failed with status '.$response->status()));

        return back()
            ->with('error', 'This could not be sent. Try again in a moment.')
            ->withInput();
    }

    /**
     * @return array<string, string>
     */
    private function remoteErrors(Response $response): array
    {
        $errors = $response->json('errors');
        $mapped = [];

        if (is_array($errors)) {
            foreach (['type', 'title', 'description', 'screenshot'] as $field) {
                $message = $errors[$field][0] ?? null;

                if (is_string($message) && $message !== '') {
                    $mapped[$field] = $message;
                }
            }
        }

        if ($mapped === []) {
            $mapped['title'] = 'The intake service did not accept this submission.';
        }

        return $mapped;
    }
}
