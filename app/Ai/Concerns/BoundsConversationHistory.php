<?php

namespace App\Ai\Concerns;

trait BoundsConversationHistory
{
    private const DEFAULT_MAX_HISTORY_MESSAGES = 24;

    private const DEFAULT_MAX_HISTORY_CHARACTERS = 24000;

    private const DEFAULT_MAX_MESSAGE_CHARACTERS = 3000;

    /**
     * Keep recent, valid, and bounded conversation messages so model requests
     * stay below provider context limits.
     *
     * @param  array<int, mixed>  $conversationHistory
     * @return array<int, array{role: string, content: string}>
     */
    private function boundedConversationHistory(array $conversationHistory): array
    {
        $maxHistoryMessages = $this->resolveHistoryLimitValue(
            'MAX_HISTORY_MESSAGES',
            self::DEFAULT_MAX_HISTORY_MESSAGES
        );
        $maxHistoryCharacters = $this->resolveHistoryLimitValue(
            'MAX_HISTORY_CHARACTERS',
            self::DEFAULT_MAX_HISTORY_CHARACTERS
        );
        $maxMessageCharacters = $this->resolveHistoryLimitValue(
            'MAX_MESSAGE_CHARACTERS',
            self::DEFAULT_MAX_MESSAGE_CHARACTERS
        );

        $recentMessages = array_reverse(
            array_slice($conversationHistory, -$maxHistoryMessages)
        );

        $boundedMessages = [];
        $totalCharacters = 0;

        foreach ($recentMessages as $message) {
            if (! is_array($message)) {
                continue;
            }

            $role = $message['role'] ?? null;
            $content = $message['content'] ?? null;

            if (! is_string($role) || ! is_string($content)) {
                continue;
            }

            if (! in_array($role, ['user', 'assistant', 'tool_result'], true)) {
                continue;
            }

            $content = trim($content);

            if ($content === '') {
                continue;
            }

            if (strlen($content) > $maxMessageCharacters) {
                $content = substr($content, -$maxMessageCharacters);
                $content = '[truncated] '.$content;
            }

            $messageLength = strlen($content);

            if ($totalCharacters + $messageLength > $maxHistoryCharacters) {
                break;
            }

            $boundedMessages[] = [
                'role' => $role,
                'content' => $content,
            ];

            $totalCharacters += $messageLength;
        }

        return array_reverse($boundedMessages);
    }

    private function resolveHistoryLimitValue(string $constantName, int $default): int
    {
        $fqcnConstant = static::class.'::'.$constantName;

        if (! defined($fqcnConstant)) {
            return $default;
        }

        $value = constant($fqcnConstant);

        if (! is_int($value) || $value < 1) {
            return $default;
        }

        return $value;
    }
}
