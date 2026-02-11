<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$event = \App\Models\SystemEvent::where('slug', 'user_created')->first();
if (!$event) {
    echo "Event 'user_created' not found!\n";
    exit(1);
}

$template = $event->emailTemplates()->where('recipient_type', 'client')->first();
if (!$template) {
    echo "Client template not found!\n";
    exit(1);
}

echo "Current template body (first 500 chars):\n";
echo substr($template->body, 0, 500) . "\n\n";

// Check if it contains old URL
if (str_contains($template->body, '/portal/agents')) {
    echo "❌ Template STILL has old URL: /portal/agents\n";
    echo "Running seeder to fix...\n";
    \Artisan::call('db:seed', ['--class' => 'SystemEventSeeder']);
    echo "Seeder completed!\n";
} else if (str_contains($template->body, '/signin')) {
    echo "✅ Template has correct URL: /signin\n";
} else {
    echo "⚠️ Template doesn't have portal URL at all\n";
}
