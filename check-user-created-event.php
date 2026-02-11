<?php

// Quick script to check user_created event configuration
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\SystemEvent;

echo "Checking user_created event configuration...\n\n";

$event = SystemEvent::where('slug', 'user_created')->first();

if (!$event) {
    echo "❌ ERROR: user_created event not found in database!\n";
    echo "   Run: php artisan db:seed --class=SystemEventSeeder\n";
    exit(1);
}

echo "✓ Event found: {$event->name}\n";
echo "  Active: " . ($event->is_active ? 'Yes' : 'No') . "\n\n";

$templates = $event->emailTemplates;

echo "Email templates:\n";
foreach ($templates as $template) {
    echo "  - {$template->name} (to: {$template->recipient_type})\n";
    echo "    Active: " . ($template->is_active ? 'Yes' : 'No') . "\n";
}

if ($templates->isEmpty()) {
    echo "❌ ERROR: No email templates configured!\n";
    echo "   Run: php artisan db:seed --class=SystemEventSeeder\n";
    exit(1);
}

echo "\n✓ Email configuration looks good!\n";
echo "\nNext steps:\n";
echo "1. Check logs: tail -f storage/logs/laravel.log\n";
echo "2. Check queue is running: php artisan queue:work\n";
echo "3. Verify admin emails in .env: FILAMENT_ADMIN_EMAILS\n";
