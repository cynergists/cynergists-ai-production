<?php

use App\Ai\Support\AiManager as SafeAiManager;
use Tests\TestCase;

uses(TestCase::class);

it('binds the custom ai manager implementation', function () {
    expect(app(\Laravel\Ai\AiManager::class))->toBeInstanceOf(SafeAiManager::class);
});
