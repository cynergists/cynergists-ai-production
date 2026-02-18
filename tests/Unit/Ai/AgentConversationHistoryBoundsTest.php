<?php

use App\Ai\Agents\Carbon;
use App\Models\PortalTenant;
use App\Models\User;
use Tests\TestCase;

uses(TestCase::class);

it('bounds conversation history for carbon agent', function () {
    $history = [];

    for ($i = 1; $i <= 40; $i++) {
        $prefix = "message-{$i}-";
        $content = $prefix.str_repeat('x', 2000 - strlen($prefix));

        $history[] = [
            'role' => $i % 2 === 0 ? 'assistant' : 'user',
            'content' => $content,
        ];
    }

    $agent = new Carbon(
        user: new User,
        tenant: new PortalTenant,
        conversationHistory: $history
    );

    $messages = array_values(iterator_to_array($agent->messages()));

    expect($messages)->toHaveCount(12);
    expect($messages[0]->content)->toStartWith('message-29-');
    expect($messages[11]->content)->toStartWith('message-40-');
});
