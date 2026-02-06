<?php

namespace App\Services\Carbon;

use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\SeoSite;
use App\Models\User;
use App\Portal\Carbon\Config\CarbonSidebarConfig;
use App\Services\ClaudeService;

class CarbonAgentHandler
{
    public function __construct(
        private ClaudeService $claudeService
    ) {}

    /**
     * Handle an incoming chat message and generate a response.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant, array $conversationHistory = [], int $maxTokens = 1024): string
    {
        // Build SEO context
        $seoContext = $this->buildSeoContext($tenant);
        $systemPrompt = $this->buildSystemPrompt($seoContext);

        // Build messages array for Claude API
        $messages = [];

        // Add conversation history
        foreach ($conversationHistory as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content'],
            ];
        }

        // Add the current user message
        $messages[] = [
            'role' => 'user',
            'content' => $message,
        ];

        try {
            $response = $this->claudeService->chat($messages, $systemPrompt, $maxTokens);

            return $response;
        } catch (\Exception $e) {
            \Log::error('Carbon agent error', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ]);

            return "I'm having trouble connecting right now. Please try again in a moment.";
        }
    }

    /**
     * Build SEO context for the agent.
     */
    private function buildSeoContext(PortalTenant $tenant): array
    {
        $config = CarbonSidebarConfig::getConfig($tenant);

        $sites = SeoSite::where('tenant_id', $tenant->id)->get([
            'id', 'name', 'url', 'status', 'last_audit_at', 'created_at',
        ]);

        return [
            'stats' => $config['seo_stats'] ?? [],
            'sites' => $sites->map(fn ($site) => [
                'name' => $site->name,
                'url' => $site->url,
                'status' => $site->status,
                'last_audit' => $site->last_audit_at?->diffForHumans() ?? 'Never',
            ])->toArray(),
            'recent_audits' => $config['recent_audits'] ?? [],
            'recommendations' => $config['top_recommendations'] ?? [],
        ];
    }

    /**
     * Build the system prompt for Carbon.
     */
    private function buildSystemPrompt(array $seoContext): string
    {
        $sitesCount = count($seoContext['sites']);
        $healthScore = $seoContext['stats']['health_score'] ?? 0;

        $sitesList = '';
        if ($sitesCount > 0) {
            foreach ($seoContext['sites'] as $site) {
                $sitesList .= "\n- {$site['name']} ({$site['url']}) - Status: {$site['status']}, Last audit: {$site['last_audit']}";
            }
        } else {
            $sitesList = "\n(No sites are currently being tracked)";
        }

        $auditsInfo = '';
        if (! empty($seoContext['recent_audits'])) {
            $auditsInfo = "\n\nRecent Audits:";
            foreach (array_slice($seoContext['recent_audits'], 0, 3) as $audit) {
                $auditsInfo .= "\n- {$audit['site_name']}: {$audit['status']} ({$audit['date']})";
            }
        }

        $recommendationsInfo = '';
        if (! empty($seoContext['recommendations'])) {
            $recommendationsInfo = "\n\nTop Recommendations:";
            foreach (array_slice($seoContext['recommendations'], 0, 3) as $rec) {
                $recommendationsInfo .= "\n- [{$rec['priority']}] {$rec['title']} for {$rec['site_name']}";
            }
        }

        return <<<PROMPT
You are Carbon, an SEO expert agent specializing in search engine optimization, website performance, and digital marketing.

Your role is to help users understand and improve their website's SEO performance. You have access to their current SEO data and can provide insights, answer questions, and offer recommendations.

CURRENT SEO STATUS:
- Total Sites Tracked: {$sitesCount}
- Overall Health Score: {$healthScore}%
- Active Audits: {$seoContext['stats']['active_audits']}

SITES BEING MONITORED:{$sitesList}{$auditsInfo}{$recommendationsInfo}

GUIDELINES:
- Be friendly, professional, and knowledgeable about SEO
- Provide specific, actionable advice when asked
- Reference their actual site data when relevant
- If they ask about sites they're tracking, refer to the list above
- If they have no sites yet, encourage them to add one using the "Add Site" button
- Keep responses concise and focused (2-3 paragraphs max unless they ask for details)
- Use technical SEO terminology when appropriate, but explain concepts clearly
- Offer to help with specific SEO tasks like keyword research, technical audits, or content optimization

TONE: Expert yet approachable, data-driven, helpful
PROMPT;
    }
}
