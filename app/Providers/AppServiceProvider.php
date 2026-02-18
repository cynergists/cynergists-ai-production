<?php

namespace App\Providers;

use App\Ai\Support\AiManager as SafeAiManager;
use App\Ai\Support\AnthropicRequestPayloadLimiter;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Ai\AiManager;
use Psr\Http\Message\RequestInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->extend(AiManager::class, fn ($manager, $app) => new SafeAiManager($app));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureHttpDefaults();

        Gate::define('viewPulse', function (User $user) {
            return $user->userRoles()->where('role', 'admin')->exists();
        });
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }

    protected function configureHttpDefaults(): void
    {
        $limiter = new AnthropicRequestPayloadLimiter;

        Http::globalRequestMiddleware(function (RequestInterface $request) use ($limiter): RequestInterface {
            return $limiter->apply($request);
        });
    }
}
