<?php

namespace App\Services\Apex;

use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Services\ApiKeyService;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UnipileService
{
    private ?string $apiKey = null;

    private ?string $domain = null;

    public function __construct(
        private ApiKeyService $apiKeyService
    ) {}

    /**
     * Initialize the service with an agent's API key.
     */
    public function forAgent(PortalAvailableAgent $agent): self
    {
        $apiKey = $this->apiKeyService->getKeyWithMetadata($agent, 'unipile');

        if ($apiKey) {
            $this->apiKey = $apiKey->key;
            $this->domain = $apiKey->metadata['domain'] ?? 'api1.unipile.com';
        }

        return $this;
    }

    /**
     * Initialize the service with explicit credentials.
     */
    public function withCredentials(string $apiKey, string $domain = 'api1.unipile.com'): self
    {
        $this->apiKey = $apiKey;
        $this->domain = $domain;

        return $this;
    }

    /**
     * Check if the service is configured.
     */
    public function isConfigured(): bool
    {
        return $this->apiKey !== null && $this->domain !== null;
    }

    /**
     * Get the HTTP client with authentication.
     */
    private function client(): PendingRequest
    {
        if (! $this->isConfigured()) {
            throw new \RuntimeException('UnipileService is not configured. Call forAgent() or withCredentials() first.');
        }

        return Http::baseUrl("https://{$this->domain}/api/v1")
            ->withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Accept' => 'application/json',
            ])
            ->timeout(30);
    }

    /**
     * Connect a LinkedIn account using credentials.
     *
     * @return array{account_id: string, status: string, checkpoint_type: string|null}|null
     */
    public function connectWithCredentials(string $username, string $password): ?array
    {
        try {
            $response = $this->client()->post('/accounts', [
                'provider' => 'LINKEDIN',
                'username' => $username,
                'password' => $password,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                Log::info('Unipile connect response', [
                    'http_status' => $response->status(),
                    'response_keys' => array_keys($data),
                    'has_checkpoint' => isset($data['checkpoint']),
                    'has_connection_params' => isset($data['connection_params']),
                    'has_sources' => isset($data['sources']),
                ]);

                $sourceStatus = $data['sources'][0]['status'] ?? null;
                $status = $sourceStatus
                    ?? $data['connection_params']['status']
                    ?? $data['status']
                    ?? 'pending';

                $checkpointType = $data['checkpoint']['type']
                    ?? $data['connection_params']['checkpoint']['type']
                    ?? $data['sources'][0]['checkpoint']['type']
                    ?? null;

                // A 202 response indicates a checkpoint is required
                if ($response->status() === 202 && ! $checkpointType) {
                    $checkpointType = 'OTP';
                    $status = 'pending';
                }

                return [
                    'account_id' => $data['account_id'] ?? $data['id'] ?? null,
                    'status' => $status,
                    'checkpoint_type' => $checkpointType,
                ];
            }

            Log::error('Unipile connect with credentials failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Unipile connect with credentials exception', ['error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * Get the hosted auth URL for LinkedIn connection.
     *
     * @return array{url: string, account_id: string}|null
     */
    public function getHostedAuthUrl(string $redirectUrl): ?array
    {
        try {
            $response = $this->client()->post('/hosted/accounts/link', [
                'type' => 'create',
                'providers' => ['LINKEDIN'],
                'api_url' => "https://{$this->domain}/api/v1",
                'success_redirect_url' => $redirectUrl,
                'expiresOn' => now()->addHour()->format('Y-m-d\TH:i:s.v\Z'),
            ]);

            if ($response->successful()) {
                return [
                    'url' => $response->json('url'),
                    'account_id' => $response->json('account_id'),
                ];
            }

            Log::error('Unipile hosted auth URL failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Unipile hosted auth URL exception', ['error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * Get account status.
     *
     * @return array{status: string, checkpoint_type: string|null, profile: array}|null
     */
    public function getAccountStatus(string $accountId): ?array
    {
        try {
            $response = $this->client()->get("/accounts/{$accountId}");

            if ($response->successful()) {
                $data = $response->json();

                // Status lives in sources[].status (e.g., "OK", "ERROR")
                $sourceStatus = $data['sources'][0]['status'] ?? null;
                // Fallback to legacy path
                $status = $sourceStatus
                    ?? $data['connection_params']['status']
                    ?? 'unknown';

                $checkpointType = $data['checkpoint']['type']
                    ?? $data['connection_params']['checkpoint']['type']
                    ?? $data['sources'][0]['checkpoint']['type']
                    ?? null;

                // Profile info lives in connection_params.im for LinkedIn
                $im = $data['connection_params']['im'] ?? [];
                $publicId = $im['publicIdentifier'] ?? null;

                return [
                    'status' => $status,
                    'checkpoint_type' => $checkpointType,
                    'profile' => [
                        'id' => $data['id'] ?? null,
                        'name' => $data['name'] ?? null,
                        'email' => $data['email'] ?? null,
                        'profile_url' => $publicId ? "https://www.linkedin.com/in/{$publicId}" : null,
                    ],
                ];
            }

            // Account no longer exists on Unipile — return a failed status so the caller can clean up
            if ($response->status() === 404) {
                Log::warning('Unipile account not found', ['account_id' => $accountId]);

                return [
                    'status' => 'not_found',
                    'checkpoint_type' => null,
                    'profile' => [],
                ];
            }

            Log::error('Unipile get account status failed', [
                'account_id' => $accountId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Unipile get account status exception', ['error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * Solve a checkpoint (e.g., CAPTCHA, OTP).
     */
    public function solveCheckpoint(string $accountId, string $code): bool
    {
        try {
            $response = $this->client()->post("/accounts/{$accountId}/checkpoint", [
                'code' => $code,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Unipile solve checkpoint exception', ['error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Disconnect/delete an account.
     */
    public function disconnectAccount(string $accountId): bool
    {
        try {
            $response = $this->client()->delete("/accounts/{$accountId}");

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Unipile disconnect account exception', ['error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Get all LinkedIn connections for an account.
     *
     * @return Collection<int, array>
     */
    public function getConnections(string $accountId, int $limit = 100, ?string $cursor = null): Collection
    {
        try {
            $params = ['limit' => $limit];
            if ($cursor) {
                $params['cursor'] = $cursor;
            }

            $response = $this->client()->get("/users/{$accountId}/relations", $params);

            if ($response->successful()) {
                return collect($response->json('items') ?? []);
            }

            return collect();
        } catch (\Exception $e) {
            Log::error('Unipile get connections exception', ['error' => $e->getMessage()]);

            return collect();
        }
    }

    /**
     * Send a connection request.
     */
    public function sendConnectionRequest(string $accountId, string $profileUrl, ?string $message = null): bool
    {
        try {
            $payload = [
                'account_id' => $accountId,
                'linkedin_url' => $profileUrl,
            ];

            if ($message) {
                $payload['message'] = $message;
            }

            $response = $this->client()->post('/users/invite', $payload);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Unipile send connection request exception', ['error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Get all chats for an account.
     *
     * @return Collection<int, array>
     */
    public function getChats(string $accountId, int $limit = 50, ?string $cursor = null): Collection
    {
        try {
            $params = [
                'account_id' => $accountId,
                'limit' => $limit,
            ];
            if ($cursor) {
                $params['cursor'] = $cursor;
            }

            $response = $this->client()->get('/chats', $params);

            if ($response->successful()) {
                return collect($response->json('items') ?? []);
            }

            return collect();
        } catch (\Exception $e) {
            Log::error('Unipile get chats exception', ['error' => $e->getMessage()]);

            return collect();
        }
    }

    /**
     * Get messages from a specific chat.
     *
     * @return Collection<int, array>
     */
    public function getChatMessages(string $chatId, int $limit = 50, ?string $cursor = null): Collection
    {
        try {
            $params = ['limit' => $limit];
            if ($cursor) {
                $params['cursor'] = $cursor;
            }

            $response = $this->client()->get("/chats/{$chatId}/messages", $params);

            if ($response->successful()) {
                return collect($response->json('items') ?? []);
            }

            return collect();
        } catch (\Exception $e) {
            Log::error('Unipile get chat messages exception', ['error' => $e->getMessage()]);

            return collect();
        }
    }

    /**
     * Send a message to a chat.
     */
    public function sendMessage(string $chatId, string $text): bool
    {
        try {
            $response = $this->client()->post("/chats/{$chatId}/messages", [
                'text' => $text,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Unipile send message exception', ['error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Start a new chat with a user by their profile ID.
     *
     * @return string|null The chat ID if successful
     */
    public function startChat(string $accountId, string $attendeeId, string $text): ?string
    {
        try {
            $response = $this->client()->post('/chats', [
                'account_id' => $accountId,
                'attendees_ids' => [$attendeeId],
                'text' => $text,
            ]);

            if ($response->successful()) {
                return $response->json('chat_id');
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Unipile start chat exception', ['error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * Get all chat attendees for an account.
     *
     * @return Collection<int, array>
     */
    public function getChatAttendees(string $accountId, int $limit = 100, ?string $cursor = null): Collection
    {
        try {
            $params = [
                'account_id' => $accountId,
                'limit' => $limit,
            ];
            if ($cursor) {
                $params['cursor'] = $cursor;
            }

            $response = $this->client()->get('/chat_attendees', $params);

            if ($response->successful()) {
                return collect($response->json('items') ?? []);
            }

            return collect();
        } catch (\Exception $e) {
            Log::error('Unipile get chat attendees exception', ['error' => $e->getMessage()]);

            return collect();
        }
    }

    /**
     * Search for LinkedIn profiles.
     *
     * @return Collection<int, array>
     */
    public function searchProfiles(string $accountId, array $filters, int $limit = 25): Collection
    {
        try {
            $response = $this->client()->post('/linkedin/search/people', [
                'account_id' => $accountId,
                'limit' => $limit,
                ...$filters,
            ]);

            if ($response->successful()) {
                return collect($response->json('items') ?? []);
            }

            return collect();
        } catch (\Exception $e) {
            Log::error('Unipile search profiles exception', ['error' => $e->getMessage()]);

            return collect();
        }
    }

    /**
     * Get a LinkedIn profile by URL.
     */
    public function getProfile(string $accountId, string $profileUrl): ?array
    {
        try {
            $response = $this->client()->get('/users/profile', [
                'account_id' => $accountId,
                'linkedin_url' => $profileUrl,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Unipile get profile exception', ['error' => $e->getMessage()]);

            return null;
        }
    }
}
