<?php

namespace App\Ai\Tools;

use App\Jobs\RunSeoAuditJob;
use App\Models\PortalTenant;
use App\Models\SeoAudit;
use App\Models\SeoSite;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class TriggerSeoAuditTool implements Tool
{
    public function __construct(
        public PortalTenant $tenant
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): string
    {
        return 'Trigger an SEO audit for a specific site. Use this when the user asks you to run, start, or perform an SEO audit on one of their tracked sites.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): string
    {
        $siteId = $request['site_id'];

        $site = SeoSite::where('id', $siteId)
            ->where('tenant_id', $this->tenant->id)
            ->first();

        if (! $site) {
            return 'Site not found. Please provide a valid site ID from the tracked sites list.';
        }

        if ($site->status !== 'active') {
            return "The site \"{$site->name}\" is not active and cannot be audited.";
        }

        $runningAudit = SeoAudit::where('seo_site_id', $site->id)
            ->where('status', 'running')
            ->first();

        if ($runningAudit) {
            return "An audit is already running for \"{$site->name}\". Please wait for it to complete before starting a new one.";
        }

        $audit = SeoAudit::create([
            'seo_site_id' => $site->id,
            'status' => 'pending',
            'trigger' => 'agent',
            'issues_count' => 0,
            'metrics' => [],
            'summary' => null,
            'started_at' => null,
            'completed_at' => null,
        ]);

        RunSeoAuditJob::dispatch($audit);

        return "SEO audit has been triggered for \"{$site->name}\" ({$site->url}). The audit is now queued and will begin processing shortly. I'll be able to share the results once it completes.";
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'site_id' => $schema
                ->string()
                ->description('The UUID of the SEO site to audit. Use the site IDs from the tracked sites list.')
                ->required(),
        ];
    }
}
