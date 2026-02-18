<?php

use App\Ai\Agents\Impulse;
use App\Models\PortalTenant;
use App\Models\User;
use Tests\TestCase;

uses(TestCase::class);

it('limits impulse conversation history to a recent bounded window', function () {
    $history = [];

    for ($i = 1; $i <= 40; $i++) {
        $prefix = "message-{$i}-";
        $content = $prefix.str_repeat('x', 2000 - strlen($prefix));

        $history[] = [
            'role' => $i % 2 === 0 ? 'assistant' : 'user',
            'content' => $content,
        ];
    }

    $agent = new Impulse(
        user: new User,
        tenant: new PortalTenant,
        conversationHistory: $history
    );

    $messages = array_values(iterator_to_array($agent->messages()));

    expect($messages)->toHaveCount(12);
    expect($messages[0]->content)->toStartWith('message-29-');
    expect($messages[11]->content)->toStartWith('message-40-');
});

it('truncates oversized messages and filters invalid message entries', function () {
    $history = [
        ['role' => 'system', 'content' => 'ignored'],
        ['role' => 'assistant', 'content' => str_repeat('a', 5000)],
        ['role' => 'user', 'content' => 'hello'],
        ['role' => 'assistant', 'content' => null],
        ['role' => 'assistant', 'content' => ''],
        ['role' => 'assistant', 'content' => 'final'],
    ];

    $agent = new Impulse(
        user: new User,
        tenant: new PortalTenant,
        conversationHistory: $history
    );

    $messages = array_values(iterator_to_array($agent->messages()));

    expect($messages)->toHaveCount(3);
    expect($messages[0]->content)->toStartWith('[truncated] ');
    expect(strlen($messages[0]->content))->toBe(3012);
    expect($messages[1]->content)->toBe('hello');
    expect($messages[2]->content)->toBe('final');
});
