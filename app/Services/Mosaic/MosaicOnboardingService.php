<?php

namespace App\Services\Mosaic;

use App\Jobs\Mosaic\MosaicOnboardingReminderJob;
use App\Models\PortalTenant;
use App\Models\User;

class MosaicOnboardingService
{
    public const STATE_NEW = 'NEW';

    public const STATE_Q1_BUSINESS_NAME = 'Q1_BUSINESS_NAME';

    public const STATE_Q2_BUSINESS_DESCRIPTION = 'Q2_BUSINESS_DESCRIPTION';

    public const STATE_Q3_PRIMARY_GOAL = 'Q3_PRIMARY_GOAL';

    public const STATE_Q4_TARGET_AUDIENCE = 'Q4_TARGET_AUDIENCE';

    public const STATE_Q5_OFFERINGS = 'Q5_OFFERINGS';

    public const STATE_Q6_BRAND_TONE = 'Q6_BRAND_TONE';

    public const STATE_Q7_SITEMAP = 'Q7_SITEMAP';

    public const STATE_Q8_PRIMARY_CTA = 'Q8_PRIMARY_CTA';

    public const STATE_Q9_DOMAIN = 'Q9_DOMAIN';

    public const STATE_Q10_FORM_DESTINATION = 'Q10_FORM_DESTINATION';

    public const STATE_Q11_AI_VISUALS = 'Q11_AI_VISUALS';

    public const STATE_CONFIRMATION = 'CONFIRMATION';

    public const STATE_CHANGE_REQUEST = 'CHANGE_REQUEST';

    public const STATE_CONFIRMED = 'CONFIRMED';

    public const STATE_PREVIEW_READY = 'PREVIEW_READY';

    public const STATE_APPROVE_PRODUCTION = 'APPROVE_PRODUCTION';

    public const STATE_PRODUCTION_APPROVED = 'PRODUCTION_APPROVED';

    private const STATE_ORDER = [
        self::STATE_Q1_BUSINESS_NAME,
        self::STATE_Q2_BUSINESS_DESCRIPTION,
        self::STATE_Q3_PRIMARY_GOAL,
        self::STATE_Q4_TARGET_AUDIENCE,
        self::STATE_Q5_OFFERINGS,
        self::STATE_Q6_BRAND_TONE,
        self::STATE_Q7_SITEMAP,
        self::STATE_Q8_PRIMARY_CTA,
        self::STATE_Q9_DOMAIN,
        self::STATE_Q10_FORM_DESTINATION,
        self::STATE_Q11_AI_VISUALS,
        self::STATE_CONFIRMATION,
    ];

    private const ANSWER_KEYS = [
        self::STATE_Q1_BUSINESS_NAME => 'business_name',
        self::STATE_Q2_BUSINESS_DESCRIPTION => 'business_description',
        self::STATE_Q3_PRIMARY_GOAL => 'primary_goal',
        self::STATE_Q4_TARGET_AUDIENCE => 'target_audience',
        self::STATE_Q5_OFFERINGS => 'offerings',
        self::STATE_Q6_BRAND_TONE => 'brand_tone',
        self::STATE_Q7_SITEMAP => 'sitemap',
        self::STATE_Q8_PRIMARY_CTA => 'primary_cta',
        self::STATE_Q9_DOMAIN => 'domain',
        self::STATE_Q10_FORM_DESTINATION => 'form_destination',
        self::STATE_Q11_AI_VISUALS => 'ai_visuals',
    ];

    /**
     * @var array<string, array{key: string, question: string, explanation: string, default?: string, type: string}>
     */
    private const QUESTION_MAP = [
        self::STATE_Q1_BUSINESS_NAME => [
            'key' => 'business_name',
            'question' => 'What is your business or brand name?',
            'explanation' => 'I need the business name to set your site branding and header.',
            'type' => 'text',
        ],
        self::STATE_Q2_BUSINESS_DESCRIPTION => [
            'key' => 'business_description',
            'question' => 'In 1-2 sentences, what do you do and who do you serve?',
            'explanation' => 'This anchors your homepage copy and positioning.',
            'type' => 'text',
        ],
        self::STATE_Q3_PRIMARY_GOAL => [
            'key' => 'primary_goal',
            'question' => 'What is the primary goal for this website?',
            'explanation' => 'This goal guides the page structure and calls-to-action.',
            'default' => 'Generate qualified leads.',
            'type' => 'text',
        ],
        self::STATE_Q4_TARGET_AUDIENCE => [
            'key' => 'target_audience',
            'question' => 'Who is your target audience?',
            'explanation' => 'I need this to tailor messaging and visual emphasis.',
            'type' => 'text',
        ],
        self::STATE_Q5_OFFERINGS => [
            'key' => 'offerings',
            'question' => 'What are the main services or products you want to highlight?',
            'explanation' => 'This becomes the core of your services or product sections.',
            'type' => 'text',
        ],
        self::STATE_Q6_BRAND_TONE => [
            'key' => 'brand_tone',
            'question' => 'What tone should the site use? (e.g., modern, bold, friendly)',
            'explanation' => 'Tone shapes the copy style across every page.',
            'default' => 'Clear, modern, and professional.',
            'type' => 'text',
        ],
        self::STATE_Q7_SITEMAP => [
            'key' => 'sitemap',
            'question' => 'Which pages do you want on the site? (e.g., Home, About, Services, Contact)',
            'explanation' => 'I need your page list to build a complete sitemap.',
            'default' => 'Home, About, Services, Contact.',
            'type' => 'text',
        ],
        self::STATE_Q8_PRIMARY_CTA => [
            'key' => 'primary_cta',
            'question' => 'What is the primary call-to-action?',
            'explanation' => 'This tells visitors the next step you want them to take.',
            'default' => 'Book a call.',
            'type' => 'text',
        ],
        self::STATE_Q9_DOMAIN => [
            'key' => 'domain',
            'question' => 'Do you already own a domain? If yes, share it. If not, say "no domain yet".',
            'explanation' => 'I need this to map your preview and deployment settings.',
            'default' => 'No domain yet.',
            'type' => 'text',
        ],
        self::STATE_Q10_FORM_DESTINATION => [
            'key' => 'form_destination',
            'question' => 'Where should form submissions go? (email address or CRM/URL)',
            'explanation' => 'Forms cannot publish without a valid destination.',
            'type' => 'email_or_url',
        ],
        self::STATE_Q11_AI_VISUALS => [
            'key' => 'ai_visuals',
            'question' => 'Do you approve AI-generated visuals if needed? (yes/no)',
            'explanation' => 'I need explicit approval before using AI-generated visuals.',
            'type' => 'yes_no',
        ],
    ];

    public function __construct(private MosaicBlueprintService $blueprintService) {}

    public function handleMessage(string $message, User $user, PortalTenant $tenant): string
    {
        $cleanMessage = trim($message);
        $state = $this->getState($tenant);

        if ($this->isHumanRequest($cleanMessage)) {
            return $this->handleHumanEscalation();
        }

        if ($state === self::STATE_CONFIRMED) {
            return $this->confirmedStatusResponse();
        }

        if ($state === self::STATE_PREVIEW_READY) {
            return $this->handlePreviewReady($tenant, $cleanMessage);
        }

        if ($state === self::STATE_APPROVE_PRODUCTION) {
            return $this->handleProductionApproval($tenant, $user, $cleanMessage);
        }

        if ($state === self::STATE_PRODUCTION_APPROVED) {
            return 'Your site is live in production. Changes can be requested anytime.';
        }

        if ($state === self::STATE_NEW) {
            $this->startOnboarding($tenant, $user);

            return $this->questionFor(self::STATE_Q1_BUSINESS_NAME);
        }

        if ($this->isOutOfScope($cleanMessage)) {
            return $this->outOfScopeResponse($state);
        }

        if ($state === self::STATE_CHANGE_REQUEST) {
            return $this->handleChangeRequest($tenant, $cleanMessage);
        }

        $pendingResponse = $this->handlePendingDefault($tenant, $state, $cleanMessage);
        if ($pendingResponse !== null) {
            return $pendingResponse;
        }

        if ($state === self::STATE_CONFIRMATION) {
            return $this->handleConfirmation($tenant, $cleanMessage);
        }

        if ($this->shouldSuggestDefault($state, $cleanMessage)) {
            return $this->suggestDefault($tenant, $state);
        }

        if (! $this->isValidAnswer($state, $cleanMessage)) {
            return $this->invalidAnswerResponse($state);
        }

        $this->storeAnswer($tenant, $state, $cleanMessage);

        $nextState = $this->advanceState($tenant, $state);

        if ($nextState === self::STATE_CONFIRMATION) {
            return $this->buildConfirmationSummary($tenant);
        }

        return $this->questionFor($nextState);
    }

    public function getState(PortalTenant $tenant): string
    {
        $settings = $this->getMosaicSettings($tenant);

        return $settings['state'] ?? self::STATE_NEW;
    }

    /**
     * @return array<string, string>
     */
    public function getAnswers(PortalTenant $tenant): array
    {
        $settings = $this->getMosaicSettings($tenant);

        return $settings['answers'] ?? [];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function getConfig(PortalTenant $tenant): ?array
    {
        $settings = $this->getMosaicSettings($tenant);

        return $settings['config'] ?? null;
    }

    /**
     * @return array<string, mixed>
     */
    public function getClientSummary(PortalTenant $tenant): array
    {
        $settings = $this->getMosaicSettings($tenant);

        return [
            'state' => $settings['state'] ?? self::STATE_NEW,
            'answers' => $settings['answers'] ?? [],
            'config' => $settings['config'] ?? null,
            'started_at' => $settings['started_at'] ?? null,
            'confirmed_at' => $settings['confirmed_at'] ?? null,
            'progress' => $this->getProgress($tenant),
        ];
    }

    /**
     * @return array{completed: int, total: int, percent: int}
     */
    public function getProgress(PortalTenant $tenant): array
    {
        $answers = $this->getAnswers($tenant);
        $total = count(self::ANSWER_KEYS);
        $completed = 0;

        foreach (self::ANSWER_KEYS as $key) {
            if (! empty($answers[$key] ?? null)) {
                $completed++;
            }
        }

        $percent = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

        return [
            'completed' => $completed,
            'total' => $total,
            'percent' => $percent,
        ];
    }

    public function trackAsset(PortalTenant $tenant, string $filename, string $path, string $type, string $url): void
    {
        $settings = $this->getMosaicSettings($tenant);
        $assets = $settings['assets'] ?? [];

        $assets[] = [
            'filename' => $filename,
            'path' => $path,
            'url' => $url,
            'type' => $type,
            'uploaded_at' => now()->toIso8601String(),
        ];

        $this->updateMosaicSettings($tenant, [
            'assets' => $assets,
        ]);
    }

    private function startOnboarding(PortalTenant $tenant, User $user): void
    {
        $this->updateMosaicSettings($tenant, [
            'state' => self::STATE_Q1_BUSINESS_NAME,
            'started_at' => now()->toIso8601String(),
        ]);

        $this->scheduleReminderIfNeeded($tenant, $user);
    }

    private function scheduleReminderIfNeeded(PortalTenant $tenant, User $user): void
    {
        $settings = $this->getMosaicSettings($tenant);

        if (! empty($settings['reminder_scheduled_at'] ?? null)) {
            return;
        }

        $this->updateMosaicSettings($tenant, [
            'reminder_scheduled_at' => now()->toIso8601String(),
        ]);

        MosaicOnboardingReminderJob::dispatch(
            tenantId: $tenant->id,
            userId: (string) $user->id
        )->delay(now()->addHour());
    }

    private function handlePendingDefault(PortalTenant $tenant, string $state, string $message): ?string
    {
        $settings = $this->getMosaicSettings($tenant);
        $pending = $settings['pending_default'] ?? null;

        if (! is_array($pending) || ($pending['state'] ?? null) !== $state) {
            return null;
        }

        if ($this->isAffirmative($message)) {
            $this->clearPendingDefault($tenant);
            $this->storeAnswer($tenant, $state, (string) ($pending['value'] ?? ''));
            $nextState = $this->advanceState($tenant, $state);

            if ($nextState === self::STATE_CONFIRMATION) {
                return $this->buildConfirmationSummary($tenant);
            }

            return $this->questionFor($nextState);
        }

        if ($this->isNegative($message)) {
            $this->clearPendingDefault($tenant);

            return $this->questionFor($state);
        }

        $this->clearPendingDefault($tenant);

        return null;
    }

    private function handleConfirmation(PortalTenant $tenant, string $message): string
    {
        if ($this->isAffirmative($message)) {
            $answers = $this->getAnswers($tenant);
            $assets = $this->getMosaicSettings($tenant)['assets'] ?? [];
            $config = $this->blueprintService->generate($answers, $assets);

            $this->updateMosaicSettings($tenant, [
                'state' => self::STATE_CONFIRMED,
                'confirmed_at' => now()->toIso8601String(),
                'config' => $config,
            ]);

            return 'Great, thanks. I am generating your blueprint and preview now. You can review it in the Preview tab. When ready, let me know if you would like to proceed to production approval.';
        }

        if ($this->isNegative($message)) {
            $target = $this->resolveChangeTarget($message);
            if ($target !== null) {
                $this->updateMosaicSettings($tenant, [
                    'state' => $target,
                ]);

                return $this->questionFor($target);
            }

            $this->updateMosaicSettings($tenant, [
                'state' => self::STATE_CHANGE_REQUEST,
            ]);

            return 'Which part should I change? (business name, description, goal, audience, offerings, tone, pages, CTA, domain, form destination, AI visuals)';
        }

        return 'Please reply with yes or no.';
    }

    private function handleChangeRequest(PortalTenant $tenant, string $message): string
    {
        $target = $this->resolveChangeTarget($message);

        if ($target === null) {
            return 'Tell me which item to change: business name, description, goal, audience, offerings, tone, pages, CTA, domain, form destination, or AI visuals.';
        }

        $this->updateMosaicSettings($tenant, [
            'state' => $target,
        ]);

        return $this->questionFor($target);
    }

    private function resolveChangeTarget(string $message): ?string
    {
        $normalized = strtolower($message);

        $map = [
            'description' => self::STATE_Q2_BUSINESS_DESCRIPTION,
            'goal' => self::STATE_Q3_PRIMARY_GOAL,
            'audience' => self::STATE_Q4_TARGET_AUDIENCE,
            'service' => self::STATE_Q5_OFFERINGS,
            'product' => self::STATE_Q5_OFFERINGS,
            'offer' => self::STATE_Q5_OFFERINGS,
            'tone' => self::STATE_Q6_BRAND_TONE,
            'brand tone' => self::STATE_Q6_BRAND_TONE,
            'page' => self::STATE_Q7_SITEMAP,
            'sitemap' => self::STATE_Q7_SITEMAP,
            'cta' => self::STATE_Q8_PRIMARY_CTA,
            'call to action' => self::STATE_Q8_PRIMARY_CTA,
            'domain' => self::STATE_Q9_DOMAIN,
            'form' => self::STATE_Q10_FORM_DESTINATION,
            'contact' => self::STATE_Q10_FORM_DESTINATION,
            'visual' => self::STATE_Q11_AI_VISUALS,
            'ai' => self::STATE_Q11_AI_VISUALS,
            'name' => self::STATE_Q1_BUSINESS_NAME,
            'business' => self::STATE_Q1_BUSINESS_NAME,
        ];

        foreach ($map as $keyword => $state) {
            if (str_contains($normalized, $keyword)) {
                return $state;
            }
        }

        return null;
    }

    private function buildConfirmationSummary(PortalTenant $tenant): string
    {
        $answers = $this->getAnswers($tenant);

        $lines = [
            'Here is what I have:',
            '• Business name: '.($answers['business_name'] ?? ''),
            '• Description: '.($answers['business_description'] ?? ''),
            '• Primary goal: '.($answers['primary_goal'] ?? ''),
            '• Target audience: '.($answers['target_audience'] ?? ''),
            '• Offerings: '.($answers['offerings'] ?? ''),
            '• Brand tone: '.($answers['brand_tone'] ?? ''),
            '• Pages: '.($answers['sitemap'] ?? ''),
            '• Primary CTA: '.($answers['primary_cta'] ?? ''),
            '• Domain: '.($answers['domain'] ?? ''),
            '• Form destination: '.($answers['form_destination'] ?? ''),
            '• AI visuals: '.($answers['ai_visuals'] ?? ''),
            '',
            'Does this look correct? (yes/no)',
        ];

        return implode("\n", $lines);
    }

    private function questionFor(string $state): string
    {
        return self::QUESTION_MAP[$state]['question'] ?? 'Please share the next detail.';
    }

    private function invalidAnswerResponse(string $state): string
    {
        $config = self::QUESTION_MAP[$state] ?? null;
        $explanation = $config['explanation'] ?? 'I need this detail to move forward.';

        return $explanation.' '.$this->questionFor($state);
    }

    private function confirmedStatusResponse(): string
    {
        return 'Mosaic is building your preview. Use the Preview or Blueprint tabs to review, and tell me if anything needs to change.';
    }

    private function outOfScopeResponse(string $state): string
    {
        return "Quick answer: I collect your website details and then generate your blueprint and preview. Now, {$this->questionFor($state)}";
    }

    private function handleHumanEscalation(): string
    {
        return 'I’ll pause here and escalate this conversation to a human with the context we’ve already collected.';
    }

    private function shouldSuggestDefault(string $state, string $message): bool
    {
        if (! $this->indicatesUncertainty($message)) {
            return false;
        }

        return array_key_exists('default', self::QUESTION_MAP[$state] ?? []);
    }

    private function suggestDefault(PortalTenant $tenant, string $state): string
    {
        $default = self::QUESTION_MAP[$state]['default'] ?? null;

        if (! $default) {
            return $this->invalidAnswerResponse($state);
        }

        $this->updateMosaicSettings($tenant, [
            'pending_default' => [
                'state' => $state,
                'value' => $default,
            ],
        ]);

        return "No problem. A safe default is: {$default} Does that work for you, or would you like to provide your own?";
    }

    private function indicatesUncertainty(string $message): bool
    {
        $normalized = strtolower($message);

        return (bool) preg_match('/\b(not sure|unsure|no idea|dont know|don\'t know|you decide|up to you|whatever)\b/', $normalized);
    }

    private function isValidAnswer(string $state, string $message): bool
    {
        if ($message === '') {
            return false;
        }

        $config = self::QUESTION_MAP[$state] ?? null;
        if (! $config) {
            return false;
        }

        $type = $config['type'] ?? 'text';

        return match ($type) {
            'yes_no' => $this->isAffirmative($message) || $this->isNegative($message),
            'email_or_url' => $this->isValidDestination($message),
            default => mb_strlen($message) >= 2,
        };
    }

    private function isValidDestination(string $message): bool
    {
        $normalized = trim($message);
        if ($normalized === '') {
            return false;
        }

        if (filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
            return true;
        }

        if (filter_var($normalized, FILTER_VALIDATE_URL)) {
            return true;
        }

        if (str_contains($normalized, '.') && ! str_contains($normalized, ' ')) {
            return true;
        }

        return false;
    }

    private function storeAnswer(PortalTenant $tenant, string $state, string $message): void
    {
        $key = self::ANSWER_KEYS[$state] ?? null;
        if (! $key) {
            return;
        }

        $answers = $this->getAnswers($tenant);
        $answers[$key] = $message;

        $this->updateMosaicSettings($tenant, [
            'answers' => $answers,
        ]);
    }

    private function advanceState(PortalTenant $tenant, string $state): string
    {
        $index = array_search($state, self::STATE_ORDER, true);
        if ($index === false) {
            return self::STATE_CONFIRMATION;
        }

        $nextState = self::STATE_ORDER[$index + 1] ?? self::STATE_CONFIRMATION;

        $this->updateMosaicSettings($tenant, [
            'state' => $nextState,
        ]);

        return $nextState;
    }

    private function clearPendingDefault(PortalTenant $tenant): void
    {
        $settings = $this->getMosaicSettings($tenant);
        if (! array_key_exists('pending_default', $settings)) {
            return;
        }

        unset($settings['pending_default']);

        $this->updateMosaicSettings($tenant, $settings, true);
    }

    private function isAffirmative(string $message): bool
    {
        $normalized = strtolower(trim($message));

        return (bool) preg_match('/\b(yes|yep|yeah|sure|ok|okay|sounds good|approved|looks good)\b/', $normalized);
    }

    private function isNegative(string $message): bool
    {
        $normalized = strtolower(trim($message));

        return (bool) preg_match('/\b(no|nope|nah|not yet|change|different)\b/', $normalized);
    }

    private function isHumanRequest(string $message): bool
    {
        $normalized = strtolower($message);

        return str_contains($normalized, 'human')
            || str_contains($normalized, 'person')
            || str_contains($normalized, 'representative');
    }

    private function isOutOfScope(string $message): bool
    {
        $normalized = strtolower($message);

        return (bool) preg_match('/^(help\\b|pricing\\b|cost\\b|support\\b|what can you do|who are you|what is mosaic|how does this work)/', $normalized);
    }

    /**
     * @return array<string, mixed>
     */
    private function getMosaicSettings(PortalTenant $tenant): array
    {
        $settings = $tenant->settings ?? [];

        return $settings['mosaic'] ?? [];
    }

    /**
     * @param  array<string, mixed>  $updates
     */
    private function updateMosaicSettings(PortalTenant $tenant, array $updates, bool $replace = false): void
    {
        $settings = $tenant->settings ?? [];
        $mosaic = $replace ? $updates : array_merge(($settings['mosaic'] ?? []), $updates);

        $settings['mosaic'] = $mosaic;

        $tenant->update([
            'settings' => $settings,
        ]);
    }

    private function handlePreviewReady(PortalTenant $tenant, string $message): string
    {
        if ($this->isAffirmative($message)) {
            $this->updateMosaicSettings($tenant, [
                'state' => self::STATE_APPROVE_PRODUCTION,
            ]);

            return 'Great. Your preview is ready to review. Once you have reviewed it, would you like to approve this site for production deployment? (yes/no)';
        }

        return 'Your preview is generating. You can review it in the Preview tab. When ready, say "yes" to continue to production approval.';
    }

    private function handleProductionApproval(PortalTenant $tenant, User $user, string $message): string
    {
        if ($this->isAffirmative($message)) {
            $settings = $this->getMosaicSettings($tenant);
            $config = $settings['config'] ?? null;

            if (is_array($config)) {
                $config['deployment']['production_approved'] = true;
                $config['deployment']['environment'] = 'production';
                $config['deployment']['approved_by'] = (string) $user->id;
                $config['deployment']['approved_at'] = now()->toIso8601String();

                $this->updateMosaicSettings($tenant, [
                    'state' => self::STATE_PRODUCTION_APPROVED,
                    'config' => $config,
                    'production_approved_at' => now()->toIso8601String(),
                ]);

                return 'Excellent. Your site is approved for production and will be deployed shortly. You will receive a notification once it is live.';
            }

            return 'Configuration not found. Please complete onboarding first.';
        }

        if ($this->isNegative($message)) {
            $this->updateMosaicSettings($tenant, [
                'state' => self::STATE_CONFIRMED,
            ]);

            return 'No problem. Your site will remain in preview mode. Let me know if you would like to make any changes.';
        }

        return 'Please reply with yes to approve production deployment, or no to keep the site in preview mode.';
    }
}
