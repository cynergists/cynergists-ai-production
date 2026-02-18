<?php

namespace App\Services\Ai;

class ConversationHistoryWindow
{
    /**
     * Keep only the most recent conversation content to avoid context overflows.
     */
    public function trim(
        array $messages,
        int $maxMessages = 24,
        int $maxCharacters = 48_000
    ): array {
        if ($maxMessages < 1 || $maxCharacters < 1) {
            return [];
        }

        $window = array_slice($messages, -$maxMessages);
        $result = [];
        $usedCharacters = 0;

        for ($index = count($window) - 1; $index >= 0; $index--) {
            $message = $window[$index];

            if (! is_array($message)) {
                continue;
            }

            $role = $message['role'] ?? null;
            $content = $message['content'] ?? null;

            if (! is_string($role) || ! is_string($content) || $content === '') {
                continue;
            }

            $messageLength = mb_strlen($content);

            if ($usedCharacters + $messageLength > $maxCharacters) {
                if (empty($result)) {
                    $remaining = $maxCharacters - $usedCharacters;

                    if ($remaining > 0) {
                        $result[] = [
                            'role' => $role,
                            'content' => mb_substr($content, -$remaining),
                        ];
                    }
                }

                break;
            }

            $result[] = [
                'role' => $role,
                'content' => $content,
            ];

            $usedCharacters += $messageLength;
        }

        return array_values(array_reverse($result));
    }
}
