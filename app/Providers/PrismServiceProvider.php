<?php

namespace App\Providers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\ServiceProvider;

class PrismServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../config/prism.php', 'prism');
    }

    public function boot(): void
    {
        // Create storage directories if they don't exist
        $this->createStorageDirectories();

        // Publish configuration
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../../config/prism.php' => config_path('prism.php'),
            ], 'prism-config');
        }
    }

    private function createStorageDirectories(): void
    {
        $directories = [
            config('prism.storage.temp_processing_path'),
            config('prism.storage.audio_segments_path'),
            config('prism.storage.video_segments_path'),
            config('prism.storage.enhanced_audio_path'),
            config('prism.storage.asset_packages_path'),
            storage_path('app/prism/crm_logs'),
            storage_path('logs'),
        ];

        foreach ($directories as $directory) {
            if (! File::exists($directory)) {
                File::makeDirectory($directory, 0755, true);
            }
        }
    }
}
