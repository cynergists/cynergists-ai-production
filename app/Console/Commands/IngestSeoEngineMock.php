<?php

namespace App\Console\Commands;

use App\Models\PortalTenant;
use App\Models\User;
use App\Services\SeoEngine\SeoEngineMockIngestor;
use Illuminate\Console\Command;

class IngestSeoEngineMock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seo:ingest-mock
                            {email : User email to seed SEO engine data for}
                            {--force : Replace existing tenant SEO engine data}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed mock SEO engine data for a portal tenant';

    /**
     * Execute the console command.
     */
    public function handle(SeoEngineMockIngestor $ingestor): int
    {
        $email = (string) $this->argument('email');
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            $this->error("User not found with email: {$email}");

            return self::FAILURE;
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            $this->error("No portal tenant found for: {$email}");

            return self::FAILURE;
        }

        $result = $ingestor->ingestForTenant($tenant, $user, (bool) $this->option('force'));

        if (! $result['seeded']) {
            $this->warn('SEO engine data already exists for this tenant.');
            $this->line('Use --force to replace the existing data.');

            return self::SUCCESS;
        }

        $this->info('Mock SEO engine data seeded successfully.');
        $this->line(sprintf('Sites: %d', $result['sites']));
        $this->line(sprintf('Audits: %d', $result['audits']));
        $this->line(sprintf('Recommendations: %d', $result['recommendations']));
        $this->line(sprintf('Approvals: %d', $result['approvals']));
        $this->line(sprintf('Changes: %d', $result['changes']));
        $this->line(sprintf('Reports: %d', $result['reports']));

        return self::SUCCESS;
    }
}
