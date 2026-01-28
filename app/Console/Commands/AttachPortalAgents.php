<?php

namespace App\Console\Commands;

use App\Jobs\AttachPortalAgentsToUser;
use Illuminate\Console\Command;

class AttachPortalAgents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'portal:attach-agents
                            {email : User email to attach agents to}
                            {--company= : Company name for a new portal tenant}
                            {--subdomain= : Subdomain for a new portal tenant}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Attach all active portal agents to a user tenant';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $company = $this->option('company');
        $subdomain = $this->option('subdomain');

        AttachPortalAgentsToUser::dispatchSync($email, $company ?: null, $subdomain ?: null);

        $this->info("Attached all active portal agents to {$email}.");

        return self::SUCCESS;
    }
}
