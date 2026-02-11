<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ElevenLabsService
{
    private string $apiKey;

    private string $baseUrl = 'https://api.elevenlabs.io/v1';

    public function __construct(?string $apiKey = null)
    {
        $this->apiKey = $apiKey ?? config('services.elevenlabs.api_key', '');
    }

    /**
     * Convert text to speech using ElevenLabs.
     *
     * @param  string  $text  The text to convert
     * @param  string  $voiceId  The voice ID to use
     * @param  array  $settings  Optional voice settings
     * @return array{success: bool, audio?: string, error?: string}
     */
    public function textToSpeech(string $text, string $voiceId, array $settings = []): array
    {
        try {
            $response = Http::withHeaders([
                'xi-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/text-to-speech/{$voiceId}", [
                'text' => $text,
                'model_id' => $settings['model_id'] ?? 'eleven_monolingual_v1',
                'voice_settings' => [
                    'stability' => $settings['stability'] ?? 0.5,
                    'similarity_boost' => $settings['similarity_boost'] ?? 0.75,
                    'style' => $settings['style'] ?? 0,
                    'use_speaker_boost' => $settings['use_speaker_boost'] ?? true,
                ],
            ]);

            if ($response->successful()) {
                // Return base64 encoded audio
                return [
                    'success' => true,
                    'audio' => base64_encode($response->body()),
                ];
            }

            Log::error('ElevenLabs TTS error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => 'Failed to generate speech: '.$response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('ElevenLabs TTS exception', [
                'message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get list of available voices.
     *
     * @return array{success: bool, voices?: array, error?: string}
     */
    public function getVoices(): array
    {
        try {
            $response = Http::withHeaders([
                'xi-api-key' => $this->apiKey,
            ])->get("{$this->baseUrl}/voices");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'voices' => $response->json()['voices'] ?? [],
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to fetch voices: '.$response->status().' - '.$response->body(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Convert speech to text using ElevenLabs (if available).
     * Note: ElevenLabs primarily focuses on TTS. For STT, we'll use browser's Web Speech API
     * or integrate with OpenAI Whisper.
     */
    public function speechToText(string $audioData): array
    {
        // ElevenLabs doesn't provide STT, so we'll use OpenAI Whisper or browser API
        return [
            'success' => false,
            'error' => 'Speech-to-text should be handled by browser Web Speech API or OpenAI Whisper',
        ];
    }
}
