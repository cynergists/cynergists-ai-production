<?php

namespace Database\Seeders;

use App\Models\SystemEvent;
use Illuminate\Database\Seeder;

class SystemEventSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedSubscriptionStarted();
        $this->seedSubscriptionCancelled();
        $this->seedUserCreated();
    }

    private function seedSubscriptionStarted(): void
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
                'body' => $this->startedClientBody(),
                'is_active' => true,
            ]
        );

        $event->emailTemplates()->updateOrCreate(
            ['recipient_type' => 'admin'],
            [
                'name' => 'New Subscription Admin Notification',
                'subject' => 'New Subscription: {{ user_name }} started {{ agent_name }}',
                'body' => $this->startedAdminBody(),
                'is_active' => true,
            ]
        );
    }

    private function seedSubscriptionCancelled(): void
    {
        $event = SystemEvent::query()->updateOrCreate(
            ['slug' => 'subscription_cancelled'],
            [
                'name' => 'Subscription Cancelled',
                'description' => 'Fired when a user cancels a subscription for an agent.',
                'is_active' => true,
            ]
        );

        $event->emailTemplates()->updateOrCreate(
            ['recipient_type' => 'client'],
            [
                'name' => 'Subscription Cancellation Confirmation',
                'subject' => 'Your {{ agent_name }} subscription has been cancelled',
                'body' => $this->cancelledClientBody(),
                'is_active' => true,
            ]
        );

        $event->emailTemplates()->updateOrCreate(
            ['recipient_type' => 'admin'],
            [
                'name' => 'Subscription Cancellation Admin Notification',
                'subject' => 'Subscription Cancelled: {{ user_name }} cancelled {{ agent_name }}',
                'body' => $this->cancelledAdminBody(),
                'is_active' => true,
            ]
        );
    }

    private function startedClientBody(): string
    {
        return '<h2>Welcome to '.$this->mt('agent_name').', '.$this->mt('user_name').'!</h2>'
            .'<p>Your subscription is active and your new AI agent is ready to work for you.</p>'
            .'<h3>'.$this->mt('agent_name').'</h3>'
            .'<p><strong>'.$this->mt('agent_job_title').'</strong></p>'
            .'<p>'.$this->mt('agent_description').'</p>'
            .'<p><strong>Plan:</strong> '.$this->mt('tier').'<br><strong>Start Date:</strong> '.$this->mt('start_date').'</p>'
            .'<p><a href="'.$this->mt('portal_url').'">Go to Your Agent Portal</a></p>';
    }

    private function startedAdminBody(): string
    {
        return '<h2>New Subscription Started</h2>'
            .'<p><strong>User:</strong> '.$this->mt('user_name').' ('.$this->mt('user_email').')<br>'
            .'<strong>Company:</strong> '.$this->mt('company_name').'<br>'
            .'<strong>Agent:</strong> '.$this->mt('agent_name').'<br>'
            .'<strong>Tier:</strong> '.$this->mt('tier').'<br>'
            .'<strong>Start Date:</strong> '.$this->mt('start_date').'</p>';
    }

    private function cancelledClientBody(): string
    {
        return '<h2>Subscription Cancelled</h2>'
            .'<p>Hi '.$this->mt('user_name').',</p>'
            .'<p>Your subscription for <strong>'.$this->mt('agent_name').'</strong> has been cancelled.</p>'
            .'<p>If this was a monthly subscription, your access will remain active until the end of your current billing period.</p>'
            .'<p>If you change your mind, you can re-subscribe at any time from your portal.</p>'
            .'<p><a href="'.$this->mt('portal_url').'">Go to Your Agent Portal</a></p>';
    }

    private function cancelledAdminBody(): string
    {
        return '<h2>Subscription Cancelled</h2>'
            .'<p><strong>User:</strong> '.$this->mt('user_name').' ('.$this->mt('user_email').')<br>'
            .'<strong>Company:</strong> '.$this->mt('company_name').'<br>'
            .'<strong>Agent:</strong> '.$this->mt('agent_name').'<br>'
            .'<strong>Tier:</strong> '.$this->mt('tier').'</p>';
    }

    private function seedUserCreated(): void
    {
        $event = SystemEvent::query()->updateOrCreate(
            ['slug' => 'user_created'],
            [
                'name' => 'User Created',
                'description' => 'Fired when a new user account is created in the admin panel.',
                'is_active' => true,
            ]
        );

        $event->emailTemplates()->updateOrCreate(
            ['recipient_type' => 'client'],
            [
                'name' => 'Welcome Email',
                'subject' => 'Welcome to '.$this->mt('app_name').', '.$this->mt('user_name').'!',
                'body' => $this->userCreatedClientBody(),
                'is_active' => true,
            ]
        );

        $event->emailTemplates()->updateOrCreate(
            ['recipient_type' => 'admin'],
            [
                'name' => 'New User Admin Notification',
                'subject' => 'New user created: '.$this->mt('user_name'),
                'body' => $this->userCreatedAdminBody(),
                'is_active' => true,
            ]
        );
    }

    private function userCreatedClientBody(): string
    {
        return '<h2>Welcome to '.$this->mt('app_name').', '.$this->mt('user_name').'!</h2>'
            .'<p>Your account has been successfully created. We\'re excited to have you on board!</p>'
            .'<p><strong>Your Login Details:</strong></p>'
            .'<ul>'
            .'<li><strong>Email:</strong> '.$this->mt('user_email').'</li>'
            .'<li><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">'.$this->mt('password').'</span></li>'
            .'</ul>'
            .'<p style="margin-top: 30px; text-align: center;"><a href="'.$this->mt('portal_url').'" style="background-color: #22c55e; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Sign In to Portal</a></p>'
            .'<p style="font-size: 14px; color: #666; margin-top: 20px;"><strong>Important:</strong> Please change your password after your first login for security.</p>'
            .'<p style="font-size: 12px; color: #999; margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>';
    }

    private function userCreatedAdminBody(): string
    {
        return '<h2>New User Created</h2>'
            .'<p>A new user account has been created in the admin panel.</p>'
            .'<p><strong>User Details:</strong></p>'
            .'<ul>'
            .'<li><strong>Name:</strong> '.$this->mt('user_name').'</li>'
            .'<li><strong>Email:</strong> '.$this->mt('user_email').'</li>'
            .'<li><strong>Company:</strong> '.$this->mt('company_name').'</li>'
            .'</ul>'
            .'<p>This user can now access the platform.</p>';
    }

    /**
     * Generate a TipTap merge tag node.
     */
    private function mt(string $name): string
    {
        return '<span data-type="mergeTag" data-id="'.$name.'">{{ '.$name.' }}</span>';
    }
}
