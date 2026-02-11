<?php

namespace App\Services;

use App\Jobs\SendEventEmail;
use App\Models\EventEmailTemplate;
use App\Models\SystemEvent;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;

class EventEmailService
{
    /**
     * Fire a system event and send associated emails.
     *
     * @param  array{user?: \App\Models\User, agent?: \App\Models\PortalAvailableAgent, subscription?: \App\Models\CustomerSubscription, tenant?: \App\Models\PortalTenant, generate_password_reset_link?: bool, password?: string}  $data
     */
    public function fire(string $slug, array $data = []): void
    {
        Log::info('=== EventEmailService::fire START ===', [
            'slug' => $slug,
            'has_user' => isset($data['user']),
            'has_password' => isset($data['password']),
            'password_length' => isset($data['password']) ? strlen($data['password']) : 0,
        ]);

        $event = SystemEvent::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $event) {
            Log::warning('System event not found or inactive', ['slug' => $slug]);

            return;
        }

        Log::info('System event found', ['event_id' => $event->id]);

        $variables = $this->buildVariables($data);
        Log::info('Variables built', [
            'password_length' => strlen($variables['password'] ?? ''),
            'portal_url' => $variables['portal_url'] ?? 'missing',
        ]);

        $templates = $event->emailTemplates()
            ->where('is_active', true)
            ->get();

        Log::info('Found templates', ['count' => $templates->count()]);

        foreach ($templates as $template) {
            Log::info('Sending template', [
                'template_id' => $template->id,
                'recipient_type' => $template->recipient_type,
            ]);
            $this->sendTemplate($template, $variables, $data);
        }

        Log::info('=== EventEmailService::fire END ===');
    }

    /**
     * Build the standard variable set from event data.
     *
     * @return array<string, string>
     */
    private function buildVariables(array $data): array
    {
        $user = $data['user'] ?? null;
        $agent = $data['agent'] ?? null;
        $subscription = $data['subscription'] ?? null;
        $tenant = $data['tenant'] ?? null;
        $generatePasswordResetLink = $data['generate_password_reset_link'] ?? false;
        $password = $data['password'] ?? '';

        $variables = [
            'user_name' => $user?->name ?? '',
            'user_email' => $user?->email ?? '',
            'agent_name' => $agent?->name ?? '',
            'agent_description' => strip_tags($agent?->description ?? ''),
            'agent_job_title' => $agent?->job_title ?? '',
            'tier' => $subscription?->tier ?? '',
            'start_date' => $subscription?->start_date?->format('F j, Y') ?? '',
            'company_name' => $tenant?->company_name ?? '',
            'app_name' => config('app.name'),
            'app_url' => config('app.url'),
            'portal_url' => config('app.url').'/portal/agents',
            'password_reset_url' => '',
            'password' => $password,
        ];

        if ($generatePasswordResetLink && $user) {
            $token = Password::createToken($user);
            $variables['password_reset_url'] = route('password.reset', [
                'token' => $token,
                'email' => $user->email,
            ]);
        }

        return $variables;
    }

    /**
     * Render and dispatch a single email template.
     *
     * @param  array<string, string>  $variables
     */
    private function sendTemplate(EventEmailTemplate $template, array $variables, array $data): void
    {
        try {
            $renderedSubject = $this->renderMergeTags($template->subject, $variables);
            $bladeBody = $this->convertMergeTagsToBlade($template->body);
            $renderedBody = Blade::render($bladeBody, $variables);

            $recipients = $this->resolveRecipients($template->recipient_type, $data);

            if (empty($recipients)) {
                return;
            }

            SendEventEmail::dispatch($recipients, $renderedSubject, $renderedBody);
        } catch (\Throwable $e) {
            Log::error('Failed to send event email', [
                'template_id' => $template->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Convert TipTap merge tag nodes to Blade {{ $variable }} syntax.
     */
    private function convertMergeTagsToBlade(string $html): string
    {
        return preg_replace(
            '/<span\s+data-type="mergeTag"\s+data-id="(\w+)">[^<]*<\/span>/',
            '{{ $$1 }}',
            $html
        );
    }

    /**
     * Render merge tags in plain text (subject lines).
     */
    private function renderMergeTags(string $text, array $variables): string
    {
        return preg_replace_callback('/\{\{\s*(\w+)\s*\}\}/', function (array $matches) use ($variables) {
            return $variables[$matches[1]] ?? $matches[0];
        }, $text);
    }

    /**
     * Resolve email recipients based on the template recipient type.
     *
     * @return array<int, string>
     */
    private function resolveRecipients(string $recipientType, array $data): array
    {
        if ($recipientType === 'client') {
            $user = $data['user'] ?? null;

            return $user?->email ? [$user->email] : [];
        }

        if ($recipientType === 'admin') {
            return config('services.filament.admin_emails', []);
        }

        return [];
    }
}
