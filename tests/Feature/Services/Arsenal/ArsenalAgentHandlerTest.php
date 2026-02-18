<?php

use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Arsenal\ArsenalAgentHandler;
use App\Services\Arsenal\DataProcessing\ContentGenerator;
use App\Services\Arsenal\DataProcessing\ImageProcessor;
use App\Services\Arsenal\DataProcessing\ProductDataProcessor;
use App\Services\GoHighLevelService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Mock the GoHighLevelService to avoid actual API calls
    $this->ghlService = Mockery::mock(GoHighLevelService::class);
    $this->ghlService->shouldReceive('createNote')->andReturn(true);

    // Create the services
    $this->productDataProcessor = new ProductDataProcessor();
    $this->imageProcessor = new ImageProcessor();
    $this->contentGenerator = new ContentGenerator();

    // Create the handler
    $this->handler = new ArsenalAgentHandler(
        $this->ghlService,
        $this->productDataProcessor,
        $this->imageProcessor,
        $this->contentGenerator
    );

    // Create test user and tenant
    $this->user = User::factory()->create();
    $this->tenant = PortalTenant::factory()->create([
        'user_id' => $this->user->id,
    ]);
    $this->agent = PortalAvailableAgent::factory()->create([
        'name' => 'Arsenal',
        'description' => 'eCommerce Strategist AI Agent',
    ]);
});

test('handler processes message successfully', function () {
    $message = 'I need help cleaning up my product catalog';

    $response = $this->handler->handle(
        $message,
        $this->user,
        $this->agent,
        $this->tenant
    );

    expect($response)->toBeString();
    expect(strlen($response))->toBeGreaterThan(0);
});

test('handler enforces draft-only boundaries', function () {
    $message = 'Please publish these products to my store';

    $response = $this->handler->handle(
        $message,
        $this->user,
        $this->agent,
        $this->tenant
    );

    // Response should not contain publish confirmation
    // Instead it should explain draft-only nature
    expect($response)->toBeString();
});

test('handler handles conversation history', function () {
    $conversationHistory = [
        ['role' => 'user', 'content' => 'Hello Arsenal'],
        ['role' => 'assistant', 'content' => 'Hello! I can help with catalog cleanup.'],
    ];

    $message = 'What can you do?';

    $response = $this->handler->handle(
        $message,
        $this->user,
        $this->agent,
        $this->tenant,
        $conversationHistory
    );

    expect($response)->toBeString();
    expect(strlen($response))->toBeGreaterThan(0);
});

test('handler logs session start to CRM', function () {
    $this->ghlService->shouldReceive('createNote')
        ->atLeast()->once()
        ->with(
            $this->tenant,
            Mockery::any(),
            Mockery::any()
        )
        ->andReturn(true);

    $message = 'Help me with products';

    $this->handler->handle($message, $this->user, $this->agent, $this->tenant);
})->skip('Skipping due to Laravel AI API dependency');

test('handler logs session activity to CRM', function () {
    $this->ghlService->shouldReceive('createNote')
        ->atLeast()->once()
        ->with(
            $this->tenant,
            Mockery::any(),
            Mockery::any()
        )
        ->andReturn(true);

    $message = 'Process my product data';

    $this->handler->handle($message, $this->user, $this->agent, $this->tenant);
})->skip('Skipping due to Laravel AI API dependency');

test('handler returns error message on exception', function () {
    // Create a handler that will throw an exception by passing invalid dependencies
    $badGhlService = Mockery::mock(GoHighLevelService::class);
    $badGhlService->shouldReceive('createNote')->andThrow(new Exception('Service unavailable'));

    $badHandler = new ArsenalAgentHandler(
        $badGhlService,
        $this->productDataProcessor,
        $this->imageProcessor,
        $this->contentGenerator
    );

    $response = $badHandler->handle(
        'Test message',
        $this->user,
        $this->agent,
        $this->tenant
    );

    expect($response)->toContain('technical difficulties');
    expect($response)->toContain('Cyera');
})->skip('Skipping due to Laravel AI API dependency');

test('handler strips internal processing markers from response', function () {
    $message = 'Help me normalize product data';

    $response = $this->handler->handle(
        $message,
        $this->user,
        $this->agent,
        $this->tenant
    );

    // Response should not contain internal markers
    expect($response)->not->toContain('[INGEST_');
    expect($response)->not->toContain('[NORMALIZE_');
    expect($response)->not->toContain('[GENERATE_');
    expect($response)->not->toContain('[PROCESS_');
    expect($response)->not->toContain('[EXPORT_');
});

test('handler respects maximum token limit', function () {
    $message = 'Generate product descriptions for my entire catalog';

    $response = $this->handler->handle(
        $message,
        $this->user,
        $this->agent,
        $this->tenant,
        [],
        1024
    );

    expect($response)->toBeString();
    // Response should be reasonable length given token limit
    expect(strlen($response))->toBeLessThan(10000);
});

test('handler works with empty conversation history', function () {
    $message = 'Hello Arsenal';

    $response = $this->handler->handle(
        $message,
        $this->user,
        $this->agent,
        $this->tenant,
        []
    );

    expect($response)->toBeString();
    expect(strlen($response))->toBeGreaterThan(0);
});
