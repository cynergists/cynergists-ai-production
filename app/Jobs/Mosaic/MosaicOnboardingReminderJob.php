<?php

namespace App\Jobs\Mosaic;

use App\Mail\EventMail;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Mosaic\MosaicOnboardingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class MosaicOnboardingReminderJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $tenantId,
        public string $userId,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $tenant = PortalTenant::query()->find($this->tenantId);
        $user = User::query()->find($this->userId);

        if (! $tenant || ! $user || ! $user->email) {
            return;
        }

        $settings = $tenant->settings ?? [];
        $mosaic = $settings['mosaic'] ?? [];

        if (($mosaic['state'] ?? null) === MosaicOnboardingService::STATE_CONFIRMED) {
            return;
        }

        if (! empty($mosaic['reminder_sent_at'] ?? null)) {
            return;
        }

        $startedAt = $mosaic['started_at'] ?? null;
        if ($startedAt) {
            $started = Carbon::parse($startedAt);
            if (now()->lt($started->addHour())) {
                return;
            }
        }

        $subject = 'Finish your Mosaic website onboarding';
        $body = sprintf(
            '<p>Hi %s,</p><p>Your Mosaic website onboarding is still in progress. Reply in the portal when you are ready to continue, and I will generate your blueprint and preview.</p>',
            e($user->name ?? 'there')
        );

        Mail::to($user->email)->send(new EventMail(
            renderedSubject: $subject,
            renderedBody: $body,
        ));

        $mosaic['reminder_sent_at'] = now()->toIso8601String();
        $settings['mosaic'] = $mosaic;

        $tenant->update([
            'settings' => $settings,
        ]);
    }
}
