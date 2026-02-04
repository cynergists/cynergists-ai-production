<?php

namespace App\Jobs;

use App\Services\ElevenLabsService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProcessVoiceTextToSpeech implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $jobId,
        public string $text,
        public string $apiKey,
        public string $voiceId,
        public array $voiceSettings = []
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('TTS Job started', ['job_id' => $this->jobId, 'text_length' => strlen($this->text)]);

            // Convert text to speech
            $elevenLabs = new ElevenLabsService($this->apiKey);
            $ttsResult = $elevenLabs->textToSpeech($this->text, $this->voiceId, $this->voiceSettings);

            if ($ttsResult['success']) {
                // Store audio in cache for 10 minutes
                Cache::put(
                    "voice_tts:{$this->jobId}",
                    [
                        'status' => 'completed',
                        'audio' => $ttsResult['audio'],
                        'text' => $this->text,
                    ],
                    now()->addMinutes(10)
                );

                Log::info('TTS Job completed successfully', ['job_id' => $this->jobId]);
            } else {
                // Store error in cache
                Cache::put(
                    "voice_tts:{$this->jobId}",
                    [
                        'status' => 'failed',
                        'error' => $ttsResult['error'] ?? 'Unknown error',
                    ],
                    now()->addMinutes(10)
                );

                Log::error('TTS Job failed', [
                    'job_id' => $this->jobId,
                    'error' => $ttsResult['error'] ?? 'Unknown error',
                ]);
            }
        } catch (\Exception $e) {
            // Store error in cache
            Cache::put(
                "voice_tts:{$this->jobId}",
                [
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ],
                now()->addMinutes(10)
            );

            Log::error('TTS Job exception', [
                'job_id' => $this->jobId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
