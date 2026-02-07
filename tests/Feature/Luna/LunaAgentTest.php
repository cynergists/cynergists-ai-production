<?php

use App\Ai\Agents\Luna;
use App\Jobs\Luna\GenerateLunaImageJob;
use App\Models\AgentAccess;
use App\Models\LunaGeneratedImage;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Luna\LunaAgentHandler;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Laravel\Ai\Image;

use function Pest\Laravel\actingAs;

it('sends a message to the luna agent and gets a response', function () {
    Luna::fake(['Here are some ideas for your brand visuals...']);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'onboarding_completed_at' => now(),
    ]);

    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Luna',
        'description' => 'Graphic Content Creator',
        'agent_type' => 'bot',
        'features' => [],
        'is_active' => true,
        'portal_available' => true,
    ]);

    $agentAccess = AgentAccess::create([
        'id' => (string) Str::uuid(),
        'subscription_id' => (string) Str::uuid(),
        'customer_id' => (string) Str::uuid(),
        'tenant_id' => $tenant->id,
        'agent_type' => 'content',
        'agent_name' => 'Luna',
        'is_active' => true,
    ]);

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'What kind of images can you create?',
    ]);

    $response->assertSuccessful();
    $response->assertJsonPath('success', true);
    expect($response->json('assistantMessage'))->toBe('Here are some ideas for your brand visuals...');

    Luna::assertPrompted('What kind of images can you create?');
});

it('builds luna agent instructions with brand context', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'settings' => [
            'brand_tone' => 'Modern and bold',
            'brand_colors' => 'Navy blue #1a2b3c, gold #d4af37',
        ],
    ]);

    $agent = new Luna(
        user: $user,
        tenant: $tenant,
    );

    $instructions = $agent->instructions();

    expect((string) $instructions)->toContain('You are Luna, an elite Graphic Content Creator');
    expect((string) $instructions)->toContain('Test Company');
    expect((string) $instructions)->toContain('Modern and bold');
    expect((string) $instructions)->toContain('Navy blue #1a2b3c, gold #d4af37');
});

it('maps conversation history to messages', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $history = [
        ['role' => 'user', 'content' => 'Hello Luna'],
        ['role' => 'assistant', 'content' => 'Hi! Ready to create something amazing?'],
    ];

    $agent = new Luna(
        user: $user,
        tenant: $tenant,
        conversationHistory: $history,
    );

    $messages = iterator_to_array($agent->messages());

    expect($messages)->toHaveCount(2);
    expect($messages[0]->role->value)->toBe('user');
    expect($messages[0]->content)->toBe('Hello Luna');
    expect($messages[1]->role->value)->toBe('assistant');
    expect($messages[1]->content)->toBe('Hi! Ready to create something amazing?');
});

it('dispatches image generation job when response contains generation marker', function () {
    Queue::fake();
    Luna::fake(["I'll create a beautiful sunset for you!\n\n[GENERATE_IMAGE: A stunning sunset over the ocean with golden light]\n[ASPECT: landscape]"]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
    ]);

    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Luna',
        'description' => 'Graphic Content Creator',
        'features' => [],
        'is_active' => true,
    ]);

    $handler = app(LunaAgentHandler::class);
    $response = $handler->handle(
        'Create a sunset image',
        $user,
        $availableAgent,
        $tenant
    );

    expect($response)->toContain('[IMAGE_PENDING:');
    expect($response)->not->toContain('[IMAGE:');
    expect($response)->not->toContain('[GENERATE_IMAGE:');
    expect($response)->not->toContain('[ASPECT:');

    expect(LunaGeneratedImage::count())->toBe(1);
    $image = LunaGeneratedImage::first();
    expect($image->status)->toBe('pending');
    expect($image->aspect_ratio)->toBe('landscape');
    expect($image->storage_path)->toBeNull();

    Queue::assertPushed(GenerateLunaImageJob::class, function ($job) use ($image) {
        return $job->imageRecordId === $image->id;
    });
});

it('generates and stores image when job executes', function () {
    Image::fake();

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $imageRecord = LunaGeneratedImage::query()->create([
        'id' => (string) Str::uuid(),
        'tenant_id' => $tenant->id,
        'user_id' => (string) $user->id,
        'prompt' => 'A beautiful sunset',
        'storage_path' => null,
        'public_url' => null,
        'aspect_ratio' => 'landscape',
        'quality' => 'high',
        'status' => 'pending',
        'metadata' => ['original_prompt' => 'A beautiful sunset'],
    ]);

    $job = new GenerateLunaImageJob($imageRecord->id);
    $job->handle();

    $imageRecord->refresh();
    expect($imageRecord->status)->toBe('completed');
    expect($imageRecord->storage_path)->not->toBeNull();
    expect($imageRecord->public_url)->not->toBeNull();

    Image::assertGenerated(fn ($prompt) => $prompt->contains('sunset'));
});

it('strips all internal markers from the response', function () {
    Queue::fake();
    Luna::fake(["Here is your creation!\n\n[GENERATE_IMAGE: A test image]\n[ASPECT: portrait]"]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Luna',
        'description' => 'Graphic Content Creator',
        'features' => [],
        'is_active' => true,
    ]);

    $handler = app(LunaAgentHandler::class);
    $response = $handler->handle(
        'Make me a portrait',
        $user,
        $availableAgent,
        $tenant
    );

    expect($response)->not->toContain('[GENERATE_IMAGE:');
    expect($response)->not->toContain('[ASPECT:');
});

it('handles non-image chat responses without generating images', function () {
    Luna::fake(['I can create logos, social media graphics, marketing materials, and more!']);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Luna',
        'description' => 'Graphic Content Creator',
        'features' => [],
        'is_active' => true,
    ]);

    $handler = app(LunaAgentHandler::class);
    $response = $handler->handle(
        'What can you create?',
        $user,
        $availableAgent,
        $tenant
    );

    expect($response)->toBe('I can create logos, social media graphics, marketing materials, and more!');
    expect($response)->not->toContain('[IMAGE:');
    expect($response)->not->toContain('[IMAGE_PENDING:');
    expect(LunaGeneratedImage::count())->toBe(0);
});

it('returns pending status for a pending image', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $imageRecord = LunaGeneratedImage::query()->create([
        'id' => (string) Str::uuid(),
        'tenant_id' => $tenant->id,
        'user_id' => (string) $user->id,
        'prompt' => 'A test image',
        'storage_path' => null,
        'public_url' => null,
        'aspect_ratio' => 'landscape',
        'quality' => 'high',
        'status' => 'pending',
        'metadata' => [],
    ]);

    $response = actingAs($user)->getJson("/api/portal/luna/images/{$imageRecord->id}/status");

    $response->assertSuccessful();
    $response->assertJsonPath('status', 'pending');
});

it('returns completed image status with url', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $imageRecord = LunaGeneratedImage::query()->create([
        'id' => (string) Str::uuid(),
        'tenant_id' => $tenant->id,
        'user_id' => (string) $user->id,
        'prompt' => 'A test image',
        'storage_path' => 'tenants/123/luna_images/test.png',
        'public_url' => 'http://localhost/storage/tenants/123/luna_images/test.png',
        'aspect_ratio' => 'landscape',
        'quality' => 'high',
        'status' => 'completed',
        'metadata' => [],
    ]);

    $response = actingAs($user)->getJson("/api/portal/luna/images/{$imageRecord->id}/status");

    $response->assertSuccessful();
    $response->assertJsonPath('status', 'completed');
    $response->assertJsonPath('public_url', $imageRecord->public_url);
});

it('prevents accessing another users image status', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $otherUser->id,
    ]);

    $imageRecord = LunaGeneratedImage::query()->create([
        'id' => (string) Str::uuid(),
        'tenant_id' => $tenant->id,
        'user_id' => (string) $otherUser->id,
        'prompt' => 'A test image',
        'storage_path' => null,
        'aspect_ratio' => 'landscape',
        'quality' => 'high',
        'status' => 'pending',
        'metadata' => [],
    ]);

    $response = actingAs($user)->getJson("/api/portal/luna/images/{$imageRecord->id}/status");

    $response->assertNotFound();
});
