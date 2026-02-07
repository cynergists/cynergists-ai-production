<?php

namespace Database\Seeders;

use App\Models\SystemEvent;
use Illuminate\Database\Seeder;

class SystemEventSeeder extends Seeder
{
    public function run(): void
    {
        $event = SystemEvent::query()->updateOrCreate(
            ['slug' => 'subscription_started'],
            [
                'name' => 'Subscription Started',
                'description' => 'Fired when a user starts a new subscription and gets access to an agent.',
                'is_active' => true,
            ]
        );

        $event->emailTemplates()->updateOrCreate(
            ['recipient_type' => 'client'],
            [
                'name' => 'Subscription Welcome Email',
                'subject' => 'Welcome to {{ agent_name }}!',
                'body' => $this->clientEmailBody(),
                'is_active' => true,
            ]
        );

        $event->emailTemplates()->updateOrCreate(
            ['recipient_type' => 'admin'],
            [
                'name' => 'New Subscription Admin Notification',
                'subject' => 'New Subscription: {{ user_name }} started {{ agent_name }}',
                'body' => $this->adminEmailBody(),
                'is_active' => true,
            ]
        );
    }

    private function clientEmailBody(): string
    {
        return '<h2>Welcome to '.$this->mt('agent_name').', '.$this->mt('user_name').'!</h2>'
            .'<p>Your subscription is active and your new AI agent is ready to work for you.</p>'
            .'<h3>'.$this->mt('agent_name').'</h3>'
            .'<p><strong>'.$this->mt('agent_job_title').'</strong></p>'
            .'<p>'.$this->mt('agent_description').'</p>'
            .'<p><strong>Plan:</strong> '.$this->mt('tier').'<br><strong>Start Date:</strong> '.$this->mt('start_date').'</p>'
            .'<p><a href="'.$this->mt('portal_url').'">Go to Your Agent Portal</a></p>';
    }

    private function adminEmailBody(): string
    {
        return '<h2>New Subscription Started</h2>'
            .'<p><strong>User:</strong> '.$this->mt('user_name').' ('.$this->mt('user_email').')<br>'
            .'<strong>Company:</strong> '.$this->mt('company_name').'<br>'
            .'<strong>Agent:</strong> '.$this->mt('agent_name').'<br>'
            .'<strong>Tier:</strong> '.$this->mt('tier').'<br>'
            .'<strong>Start Date:</strong> '.$this->mt('start_date').'</p>';
    }

    /**
     * Generate a TipTap merge tag node.
     */
    private function mt(string $name): string
    {
        return '<span data-type="mergeTag" data-id="'.$name.'">{{ '.$name.' }}</span>';
    }
}
