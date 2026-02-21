<?php

use App\Services\Ai\ConversationHistoryWindow;

it('keeps only the most recent messages within the configured window', function () {
    $window = new ConversationHistoryWindow;

    $history = [
        ['role' => 'user', 'content' => str_repeat('a', 10)],
        ['role' => 'assistant', 'content' => str_repeat('b', 10)],
        ['role' => 'user', 'content' => str_repeat('c', 10)],
        ['role' => 'assistant', 'content' => str_repeat('d', 10)],
    ];

    $trimmed = $window->trim($history, maxMessages: 3, maxCharacters: 25);

    expect($trimmed)->toHaveCount(2);
    expect($trimmed[0]['content'])->toBe(str_repeat('c', 10));
    expect($trimmed[1]['content'])->toBe(str_repeat('d', 10));
});

it('truncates the latest message when it alone exceeds the window', function () {
    $window = new ConversationHistoryWindow;

    $history = [
        ['role' => 'assistant', 'content' => str_repeat('x', 50)],
    ];

    $trimmed = $window->trim($history, maxMessages: 5, maxCharacters: 20);

    expect($trimmed)->toHaveCount(1);
    expect($trimmed[0]['role'])->toBe('assistant');
    expect($trimmed[0]['content'])->toBe(str_repeat('x', 20));
});
