<?php

namespace App\Ai\Support;

use App\Ai\Gateway\SafePrismGateway;
use Illuminate\Contracts\Events\Dispatcher;
use Laravel\Ai\AiManager as LaravelAiManager;
use Laravel\Ai\Providers\AnthropicProvider;

class AiManager extends LaravelAiManager
{
    /**
     * Create an Anthropic powered instance with a safe max-tokens fallback.
     */
    public function createAnthropicDriver(array $config): AnthropicProvider
    {
        return new AnthropicProvider(
            new SafePrismGateway($this->app['events']),
            $config,
            $this->app->make(Dispatcher::class)
        );
    }
}
