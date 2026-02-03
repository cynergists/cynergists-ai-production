<?php

use App\Models\AgentApiKey;
use App\Models\PortalAvailableAgent;
use App\Services\ElevenLabsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

it('detects invalid elevenlabs api key', function () {
    Http::fake([
        'api.elevenlabs.io/v1/voices' => Http::response([
            'detail' => [
                'status' => 'invalid_api_key',
                'message' => 'Invalid API key',
            ],
        ], 401),
    ]);

    $elevenLabs = new ElevenLabsService('invalid-api-key-12345');
    $result = $elevenLabs->getVoices();

    expect($result['success'])->toBeFalse()
        ->and($result)->toHaveKey('error');
});

it('handles expired api keys correctly', function () {
    $apiKey = AgentApiKey::factory()
        ->forProvider('elevenlabs')
        ->expired()
        ->create();

    expect($apiKey->isExpired())->toBeTrue()
        ->and($apiKey->isValid())->toBeFalse();
});

it('handles inactive api keys correctly', function () {
    $apiKey = AgentApiKey::factory()
        ->forProvider('elevenlabs')
        ->inactive()
        ->create();

    expect($apiKey->is_active)->toBeFalse()
        ->and($apiKey->isValid())->toBeFalse();
});

it('can retrieve elevenlabs api key for an agent', function () {
    $agent = PortalAvailableAgent::factory()->create();
    $apiKey = AgentApiKey::factory()->forProvider('elevenlabs')->create();

    $agent->apiKeys()->attach($apiKey->id, ['priority' => 1]);

    $retrievedKey = $agent->getApiKeyWithMetadata('elevenlabs');

    expect($retrievedKey)->not->toBeNull()
        ->and($retrievedKey->id)->toBe($apiKey->id)
        ->and($retrievedKey->provider)->toBe('elevenlabs')
        ->and($retrievedKey->is_active)->toBeTrue();
});

it('returns null when no api key exists for provider', function () {
    $agent = PortalAvailableAgent::factory()->create();

    $retrievedKey = $agent->getApiKeyWithMetadata('elevenlabs');

    expect($retrievedKey)->toBeNull();
});

it('successfully fetches voices with valid api key', function () {
    Http::fake([
        'api.elevenlabs.io/v1/voices' => Http::response([
            'voices' => [
                [
                    'voice_id' => 'test-voice-1',
                    'name' => 'Test Voice 1',
                ],
                [
                    'voice_id' => 'test-voice-2',
                    'name' => 'Test Voice 2',
                ],
            ],
        ], 200),
    ]);

    $elevenLabs = new ElevenLabsService('valid-api-key');
    $result = $elevenLabs->getVoices();

    expect($result['success'])->toBeTrue()
        ->and($result)->toHaveKey('voices')
        ->and($result['voices'])->toBeArray()
        ->and(count($result['voices']))->toBe(2);
});

it('successfully generates speech with valid api key', function () {
    Http::fake([
        'api.elevenlabs.io/v1/text-to-speech/*' => Http::response('fake-audio-binary-data', 200),
    ]);

    $elevenLabs = new ElevenLabsService('valid-api-key');
    $result = $elevenLabs->textToSpeech('Hello test', 'voice-123');

    expect($result['success'])->toBeTrue()
        ->and($result)->toHaveKey('audio')
        ->and($result['audio'])->not->toBeEmpty();

    // Verify it's base64 encoded
    $decoded = base64_decode($result['audio'], true);
    expect($decoded)->not->toBeFalse()
        ->and($decoded)->toBe('fake-audio-binary-data');
});

it('handles missing permissions error gracefully', function () {
    Http::fake([
        'api.elevenlabs.io/v1/voices' => Http::response([
            'detail' => [
                'status' => 'missing_permissions',
                'message' => 'The API key you used is missing the permission voices_read to execute this operation.',
            ],
        ], 401),
    ]);

    $elevenLabs = new ElevenLabsService('api-key-without-permissions');
    $result = $elevenLabs->getVoices();

    expect($result['success'])->toBeFalse()
        ->and($result['error'])->toContain('missing_permissions');
});
