<?php

use App\Services\AiConversationHistoryLimiter;

it('keeps the most recent bounded history under message and character limits', function () {
    $limiter = new AiConversationHistoryLimiter;

    $history = [];

    for ($i = 0; $i < 40; $i++) {
        $history[] = [
            'role' => $i % 2 === 0 ? 'user' : 'assistant',
            'content' => "history-{$i} ".str_repeat('x', 1200),
        ];
    }

    $bounded = $limiter->limit($history);

    $indices = array_map(function (array $message): int {
        preg_match('/history-(\d+)/', $message['content'], $matches);

        return (int) ($matches[1] ?? -1);
    }, $bounded);

    $totalCharacters = array_sum(array_map(
        fn (array $message): int => strlen($message['content']),
        $bounded
    ));

    expect($bounded)->not->toBeEmpty()
        ->and(count($bounded))->toBeLessThanOrEqual(24)
        ->and($totalCharacters)->toBeLessThanOrEqual(24000)
        ->and(min($indices))->toBeGreaterThan(0)
        ->and(max($indices))->toBe(39);
});

it('filters invalid messages and truncates oversized content', function () {
    $limiter = new AiConversationHistoryLimiter;

    $bounded = $limiter->limit([
        ['role' => 'system', 'content' => 'skip role'],
        ['role' => 'user', 'content' => '   '],
        ['role' => 'assistant', 'content' => str_repeat('a', 3500)],
        ['role' => 'user', 'content' => 'keep me'],
        ['role' => 'assistant', 'content' => null],
    ]);

    expect($bounded)->toHaveCount(2)
        ->and($bounded[0]['role'])->toBe('assistant')
        ->and(str_ends_with($bounded[0]['content'], ' [truncated]'))->toBeTrue()
        ->and(strlen($bounded[0]['content']))->toBe(3012)
        ->and($bounded[1]['content'])->toBe('keep me');
});
