<?php

namespace App\Console\Commands;

use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GrantCynessaAccess extends Command
{
    protected $signature = 'cynessa:grant-access';

    protected $description = 'Grant Cynessa access to all portal users';

    public function handle(): int
    {
        $this->info('Granting Cynessa access to all portal users...');
        $this->newLine();

        // Find Cynessa agent
        $cynessa = PortalAvailableAgent::where('name', 'Cynessa')->first();

        if (! $cynessa) {
            $this->error('❌ Cynessa agent not found in portal_available_agents table');
            $this->info('Run: php artisan db:seed --class=PortalAvailableAgentsSeeder');

            return self::FAILURE;
        }

        $this->info("✅ Found Cynessa agent (ID: {$cynessa->id})");

        // Get all tenants
        $tenants = PortalTenant::all();
        $this->info("Found {$tenants->count()} tenant(s)");
        $this->newLine();

        $granted = 0;
        $skipped = 0;

        foreach ($tenants as $tenant) {
            // Check if already has access
            $existing = AgentAccess::where('tenant_id', $tenant->id)
                ->where('agent_name', 'Cynessa')
                ->first();

            if ($existing) {
                $this->line("  - Tenant {$tenant->id}: Already has access");
                $skipped++;

                continue;
            }

            // Grant access
            AgentAccess::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'subscription_id' => null,
                'customer_id' => null,
                'agent_type' => 'assistant',
                'agent_name' => 'Cynessa',
                'configuration' => null,
                'is_active' => true,
                'usage_count' => 0,
                'usage_limit' => null,
                'last_used_at' => null,
            ]);

            $this->line("  ✓ Tenant {$tenant->id}: Access granted");
            $granted++;
        }

        $this->newLine();
        $this->info("✅ Complete!");
        $this->info("  - Granted access: {$granted}");
        $this->info("  - Already had access: {$skipped}");
        $this->info("  - Total with Cynessa: ".AgentAccess::where('agent_name', 'Cynessa')->count());

        return self::SUCCESS;
    }
}
