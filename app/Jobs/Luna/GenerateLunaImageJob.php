<?php

namespace App\Jobs\Luna;

use App\Models\LunaGeneratedImage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Ai\Image;

class GenerateLunaImageJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $backoff = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $imageRecordId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $imageRecord = LunaGeneratedImage::query()->find($this->imageRecordId);

        if (! $imageRecord || $imageRecord->status !== 'pending') {
            Log::info('Luna image record not found or not pending', ['id' => $this->imageRecordId]);

            return;
        }

        try {
            Log::info('Luna image generation started', ['id' => $this->imageRecordId]);

            $imageBuilder = Image::of($imageRecord->prompt)->quality($imageRecord->quality ?? 'high');

            match ($imageRecord->aspect_ratio) {
                'portrait' => $imageBuilder->portrait(),
                'square' => $imageBuilder->square(),
                default => $imageBuilder->landscape(),
            };

            $image = $imageBuilder->generate(provider: 'gemini');

            $filename = 'luna-'.Str::uuid().'.png';
            $storagePath = "tenants/{$imageRecord->tenant_id}/luna_images/{$filename}";

            Storage::disk('public')->put($storagePath, (string) $image);

            $publicUrl = Storage::disk('public')->url($storagePath);

            $imageRecord->update([
                'status' => 'completed',
                'storage_path' => $storagePath,
                'public_url' => $publicUrl,
                'metadata' => array_merge($imageRecord->metadata ?? [], [
                    'generated_at' => now()->toDateTimeString(),
                ]),
            ]);

            Log::info('Luna image generation completed', ['id' => $this->imageRecordId]);
        } catch (\Exception $e) {
            Log::error('Luna image generation failed', [
                'id' => $this->imageRecordId,
                'error' => $e->getMessage(),
            ]);

            $imageRecord->update([
                'status' => 'failed',
                'error_message' => Str::limit($e->getMessage(), 255),
            ]);
        }
    }
}
