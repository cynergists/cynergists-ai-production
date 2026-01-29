<?php

use App\Models\AgentApiKey;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Services\ApiKeyService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->agent = PortalAvailableAgent::factory()->create();
});

describe('AgentApiKey Model', function () {
    it('encrypts the api key', function () {
        $apiKey = AgentApiKey::factory()->create([
            'key' => 'sk-test-key-123',
        ]);

        // The key should be encrypted in the database
        $rawValue = \DB::table('agent_api_keys')->where('id', $apiKey->id)->value('key');
        expect($rawValue)->not->toBe('sk-test-key-123');

        // But accessible via the model
        expect($apiKey->key)->toBe('sk-test-key-123');
    });

    it('can be attached to agents', function () {
        $apiKey = AgentApiKey::factory()->create();

        $apiKey->agents()->attach($this->agent->id, ['priority' => 10]);

        expect($apiKey->agents)->toHaveCount(1);
        expect($apiKey->agents->first()->id)->toBe($this->agent->id);
        expect($apiKey->agents->first()->pivot->priority)->toBe(10);
    });

    it('has active scope', function () {
        AgentApiKey::factory()->create(['is_active' => true]);
        AgentApiKey::factory()->create(['is_active' => false]);

        expect(AgentApiKey::active()->count())->toBe(1);
    });

    it('has forProvider scope', function () {
        AgentApiKey::factory()->create(['provider' => 'openai']);
        AgentApiKey::factory()->create(['provider' => 'unipile']);

        expect(AgentApiKey::forProvider('openai')->count())->toBe(1);
    });

    it('checks expiration correctly', function () {
        $expired = AgentApiKey::factory()->expired()->create();
        $valid = AgentApiKey::factory()->create(['expires_at' => now()->addMonth()]);
        $noExpiry = AgentApiKey::factory()->create(['expires_at' => null]);

        expect($expired->isExpired())->toBeTrue();
        expect($valid->isExpired())->toBeFalse();
        expect($noExpiry->isExpired())->toBeFalse();
    });

    it('validates key correctly', function () {
        $activeValid = AgentApiKey::factory()->create([
            'is_active' => true,
            'expires_at' => now()->addMonth(),
        ]);

        $inactive = AgentApiKey::factory()->inactive()->create();
        $expired = AgentApiKey::factory()->expired()->create();

        expect($activeValid->isValid())->toBeTrue();
        expect($inactive->isValid())->toBeFalse();
        expect($expired->isValid())->toBeFalse();
    });
});

describe('PortalAvailableAgent API Key Relationship', function () {
    it('can get api keys through relationship', function () {
        $apiKey = AgentApiKey::factory()->create(['provider' => 'openai']);
        $this->agent->apiKeys()->attach($apiKey->id, ['priority' => 5]);

        expect($this->agent->apiKeys)->toHaveCount(1);
        expect($this->agent->apiKeys->first()->provider)->toBe('openai');
    });

    it('can get api key for provider', function () {
        $apiKey = AgentApiKey::factory()->create([
            'provider' => 'openai',
            'key' => 'sk-openai-test',
            'is_active' => true,
        ]);
        $this->agent->apiKeys()->attach($apiKey->id);

        $key = $this->agent->getApiKey('openai');

        expect($key)->toBe('sk-openai-test');
    });

    it('returns highest priority key when multiple exist', function () {
        $lowPriority = AgentApiKey::factory()->create([
            'provider' => 'openai',
            'key' => 'sk-low-priority',
            'is_active' => true,
        ]);
        $highPriority = AgentApiKey::factory()->create([
            'provider' => 'openai',
            'key' => 'sk-high-priority',
            'is_active' => true,
        ]);

        $this->agent->apiKeys()->attach($lowPriority->id, ['priority' => 1]);
        $this->agent->apiKeys()->attach($highPriority->id, ['priority' => 10]);

        $key = $this->agent->getApiKey('openai');

        expect($key)->toBe('sk-high-priority');
    });

    it('skips inactive keys', function () {
        $inactive = AgentApiKey::factory()->inactive()->create([
            'provider' => 'openai',
            'key' => 'sk-inactive',
        ]);
        $active = AgentApiKey::factory()->create([
            'provider' => 'openai',
            'key' => 'sk-active',
            'is_active' => true,
        ]);

        $this->agent->apiKeys()->attach($inactive->id, ['priority' => 10]);
        $this->agent->apiKeys()->attach($active->id, ['priority' => 1]);

        $key = $this->agent->getApiKey('openai');

        expect($key)->toBe('sk-active');
    });

    it('returns null when no key exists for provider', function () {
        $key = $this->agent->getApiKey('nonexistent');

        expect($key)->toBeNull();
    });
});

describe('ApiKeyService', function () {
    it('gets key for agent and provider', function () {
        $apiKey = AgentApiKey::factory()->create([
            'provider' => 'unipile',
            'key' => 'sk-unipile-test',
            'is_active' => true,
        ]);
        $this->agent->apiKeys()->attach($apiKey->id);

        $service = app(ApiKeyService::class);
        $key = $service->getKey($this->agent, 'unipile');

        expect($key)->toBe('sk-unipile-test');
    });

    it('gets key with metadata', function () {
        $apiKey = AgentApiKey::factory()->create([
            'provider' => 'unipile',
            'metadata' => ['domain' => 'api1.unipile.com'],
            'is_active' => true,
        ]);
        $this->agent->apiKeys()->attach($apiKey->id);

        $service = app(ApiKeyService::class);
        $keyWithMetadata = $service->getKeyWithMetadata($this->agent, 'unipile');

        expect($keyWithMetadata)->not->toBeNull();
        expect($keyWithMetadata->metadata['domain'])->toBe('api1.unipile.com');
    });

    it('checks if agent has valid key', function () {
        $apiKey = AgentApiKey::factory()->create([
            'provider' => 'openai',
            'is_active' => true,
        ]);
        $this->agent->apiKeys()->attach($apiKey->id);

        $service = app(ApiKeyService::class);

        expect($service->hasValidKey($this->agent, 'openai'))->toBeTrue();
        expect($service->hasValidKey($this->agent, 'apify'))->toBeFalse();
    });
});
