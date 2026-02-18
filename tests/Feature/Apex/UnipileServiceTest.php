<?php

use App\Models\AgentApiKey;
use App\Models\PortalAvailableAgent;
use App\Services\Apex\UnipileService;
use App\Services\ApiKeyService;
use App\Services\EventEmailService;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mock(EventEmailService::class)->shouldIgnoreMissing();
    $this->agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
});

it('configures successfully with a valid api key', function () {
    $apiKey = AgentApiKey::factory()->forProvider('unipile')->create();
    $this->agent->apiKeys()->attach($apiKey->id, ['priority' => 1]);

    $service = app(UnipileService::class);
    $service->forAgent($this->agent);

    expect($service->isConfigured())->toBeTrue();
});

it('remains unconfigured when no api key exists', function () {
    $service = app(UnipileService::class);
    $service->forAgent($this->agent);

    expect($service->isConfigured())->toBeFalse();
});

it('handles decryption failure gracefully', function () {
    $mockApiKeyService = Mockery::mock(ApiKeyService::class);
    $mockApiKeyService->shouldReceive('getKeyWithMetadata')
        ->once()
        ->andThrow(new DecryptException('The MAC is invalid.'));

    Log::shouldReceive('error')
        ->once()
        ->withArgs(fn (string $message) => str_contains($message, 'Failed to decrypt Unipile API key'));

    $service = new UnipileService($mockApiKeyService);
    $service->forAgent($this->agent);

    expect($service->isConfigured())->toBeFalse();
});
