<?php

namespace App\Ai\Agents;

use App\Ai\Tools\TriggerSeoAuditTool;
use App\Models\PortalTenant;
use App\Models\SeoSite;
use App\Models\User;
use App\Portal\Carbon\Config\CarbonSidebarConfig;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('anthropic')]
#[MaxTokens(1024)]
#[Temperature(0.7)]
#[Timeout(120)]
class Carbon implements Agent, Conversational, HasTools
{
    use Promptable;

    public function __construct(
        public User $user,
        public PortalTenant $tenant,
        public array $conversationHistory = []
    ) {}

    /**
     * Get the tools available to the agent.
     *
     * @return \Laravel\Ai\Contracts\Tool[]
     */
    public function tools(): iterable
    {
        return [
            new TriggerSeoAuditTool($this->tenant),
        ];
    }

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        $seoContext = $this->buildSeoContext();

        $sitesCount = count($seoContext['sites']);
        $healthScore = $seoContext['stats']['health_score'];
        $hasAudits = ! empty($seoContext['recent_audits']);

        $sitesList = '';
        if ($sitesCount > 0) {
            foreach ($seoContext['sites'] as $site) {
                $sitesList .= "\n- [{$site['id']}] {$site['name']} ({$site['url']}) - Status: {$site['status']}, Last audit: {$site['last_audit']}";
            }
        } else {
            $sitesList = "\n(No sites are currently being tracked)";
        }

        $healthLine = $healthScore !== null
            ? "- Overall Health Score: {$healthScore}% (based on completed audits)"
            : '- Overall Health Score: No audits completed yet';

        $auditsInfo = '';
        if ($hasAudits) {
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

Your role is to help users understand and improve their website's SEO performance. You have access to their current SEO data below. Only reference data that actually exists - never fabricate metrics, scores, audit results, or statistics.

CURRENT SEO STATUS:
- Total Sites Tracked: {$sitesCount}
{$healthLine}
- Active Audits: {$seoContext['stats']['active_audits']}

SITES BEING MONITORED:{$sitesList}{$auditsInfo}{$recommendationsInfo}

AUDIT CAPABILITIES:
- You have a tool to trigger SEO audits for any active tracked site. When the user asks you to run, start, or perform an audit, use the trigger_seo_audit tool with the site's ID (shown in brackets in the sites list above).
- Audits run asynchronously. After triggering one, let the user know it has been queued and results will be available shortly.
- Do not trigger audits unless the user explicitly asks for one.

CRITICAL RULES:
- NEVER invent or fabricate SEO scores, audit results, page speed numbers, or any metrics. Only report data shown above.
- If no audits have been completed, say so honestly. Do not make up audit findings.
- If a site has "Last audit: Never", do not pretend you have audit data for it.
- You can provide general SEO advice and best practices, but clearly distinguish between general knowledge and actual data from their audits.

GUIDELINES:
- Be friendly, professional, and knowledgeable about SEO
- Provide specific, actionable advice when asked
- Reference their actual site data when relevant
- If they ask about sites they're tracking, refer to the list above
- If they have no sites yet, encourage them to add one using the "Add Site" button
- Keep responses concise and focused (2-3 paragraphs max unless they ask for details)
- Use technical SEO terminology when appropriate, but explain concepts clearly
- When users ask for audits, use the trigger_seo_audit tool to start one for them

TONE: Expert yet approachable, data-driven, honest
PROMPT;
    }

    /**
     * Get the list of messages comprising the conversation so far.
     */
    public function messages(): iterable
    {
        return array_map(
            fn (array $msg) => new Message($msg['role'], $msg['content']),
            $this->conversationHistory
        );
    }

    /**
     * Build SEO context for the agent.
     */
    private function buildSeoContext(): array
    {
        $config = CarbonSidebarConfig::getConfig($this->tenant);

        $sites = SeoSite::where('tenant_id', $this->tenant->id)->get([
            'id', 'name', 'url', 'status', 'last_audit_at', 'created_at',
        ]);

        return [
            'stats' => $config['seo_stats'] ?? [],
            'sites' => $sites->map(fn ($site) => [
                'id' => $site->id,
                'name' => $site->name,
                'url' => $site->url,
                'status' => $site->status,
                'last_audit' => $site->last_audit_at?->diffForHumans() ?? 'Never',
            ])->toArray(),
            'recent_audits' => $config['recent_audits'] ?? [],
            'recommendations' => $config['top_recommendations'] ?? [],
        ];
    }
}
