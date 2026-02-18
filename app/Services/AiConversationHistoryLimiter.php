<?php

namespace App\Services;

class AiConversationHistoryLimiter
{
    private const MAX_HISTORY_MESSAGES = 24;

    private const MAX_HISTORY_CHARACTERS = 24000;

    private const MAX_MESSAGE_CHARACTERS = 3000;

    /**
     * Keep recent, valid, and bounded conversation messages so model requests
     * stay under provider context limits.
     *
     * @param  array<int, mixed>  $conversationHistory
     * @return array<int, array{role: string, content: string}>
     */
    public function limit(array $conversationHistory): array
    {
        $recentMessages = array_reverse(
            array_slice($conversationHistory, -self::MAX_HISTORY_MESSAGES)
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

            if (strlen($content) > self::MAX_MESSAGE_CHARACTERS) {
                $content = substr($content, 0, self::MAX_MESSAGE_CHARACTERS).' [truncated]';
            }

            $messageLength = strlen($content);

            if ($totalCharacters + $messageLength > self::MAX_HISTORY_CHARACTERS) {
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
}
