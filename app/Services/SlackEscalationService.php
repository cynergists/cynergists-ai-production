<?php

namespace App\Services;

use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SlackEscalationService
{
    private ?string $token;

    private ?string $channel;

    public function __construct(?string $token = null, ?string $channel = null)
    {
        $this->token = $token ?? config('services.slack.notifications.bot_user_oauth_token');
        $this->channel = $channel ?? config('services.slack.notifications.channel');
    }

    /**
     * Send an escalation message to the configured Slack channel.
     */
    public function escalate(PortalTenant $tenant, User $user, string $reason, array $context = []): bool
    {
        if (! $this->isConfigured()) {
            Log::info('Slack escalation skipped — not configured', [
                'tenant_id' => $tenant->id,
                'reason' => $reason,
            ]);

            return false;
        }

        $message = $this->buildMessage($tenant, $user, $reason, $context);

        try {
            $response = Http::withToken($this->token)
                ->post('https://slack.com/api/chat.postMessage', [
                    'channel' => $this->channel,
                    'text' => $message['text'],
                    'blocks' => $message['blocks'],
                ]);

            if ($response->successful() && $response->json('ok')) {
                Log::info('Slack escalation sent', [
                    'tenant_id' => $tenant->id,
                    'reason' => $reason,
                ]);

                return true;
            }

            Log::error('Slack escalation failed', [
                'tenant_id' => $tenant->id,
                'reason' => $reason,
                'slack_error' => $response->json('error'),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Slack escalation exception', [
                'tenant_id' => $tenant->id,
                'reason' => $reason,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Check if Slack is configured with required credentials.
     */
    public function isConfigured(): bool
    {
        return ! empty($this->token) && ! empty($this->channel);
    }

    /**
     * Build the Slack message payload.
     *
     * @return array{text: string, blocks: array}
     */
    private function buildMessage(PortalTenant $tenant, User $user, string $reason, array $context): array
    {
        $companyName = $tenant->company_name ?: 'Unknown Company';
        $reasonLabel = ucfirst(str_replace('_', ' ', $reason));

        $fallbackText = "Cynessa Escalation [{$reasonLabel}]: {$user->name} from {$companyName}";

        $blocks = [
            [
                'type' => 'header',
                'text' => [
                    'type' => 'plain_text',
                    'text' => "Cynessa Escalation: {$reasonLabel}",
                ],
            ],
            [
                'type' => 'section',
                'fields' => [
                    ['type' => 'mrkdwn', 'text' => "*Customer:*\n{$user->name}"],
                    ['type' => 'mrkdwn', 'text' => "*Company:*\n{$companyName}"],
                    ['type' => 'mrkdwn', 'text' => "*Email:*\n{$user->email}"],
                    ['type' => 'mrkdwn', 'text' => "*Reason:*\n{$reasonLabel}"],
                ],
            ],
        ];

        // Add links section if available
        $links = [];
        if (! empty($context['ghl_contact_id'])) {
            $links[] = "GHL Contact ID: `{$context['ghl_contact_id']}`";
        }
        if (! empty($context['google_drive_folder_id'])) {
            $links[] = "Drive Folder ID: `{$context['google_drive_folder_id']}`";
        }

        if (! empty($links)) {
            $blocks[] = [
                'type' => 'section',
                'text' => [
                    'type' => 'mrkdwn',
                    'text' => implode("\n", $links),
                ],
            ];
        }

        // Add conversation excerpt if available
        if (! empty($context['conversation_excerpt'])) {
            $excerpt = '';
            foreach ($context['conversation_excerpt'] as $msg) {
                $role = $msg['role'] === 'user' ? 'Customer' : 'Cynessa';
                $content = mb_substr($msg['content'], 0, 200);
                $excerpt .= "> *{$role}:* {$content}\n";
            }

            $blocks[] = [
                'type' => 'section',
                'text' => [
                    'type' => 'mrkdwn',
                    'text' => "*Recent Conversation:*\n{$excerpt}",
                ],
            ];
        }

        return [
            'text' => $fallbackText,
            'blocks' => $blocks,
        ];
    }
}
