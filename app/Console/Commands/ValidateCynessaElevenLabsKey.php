<?php

namespace App\Console\Commands;

use App\Models\PortalAvailableAgent;
use App\Services\ElevenLabsService;
use Illuminate\Console\Command;

class ValidateCynessaElevenLabsKey extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cynessa:validate-elevenlabs-key';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Validate that Cynessa\'s ElevenLabs API key is working correctly';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Validating Cynessa ElevenLabs API key...');
        $this->newLine();

        // Find Cynessa agent
        $cynessa = PortalAvailableAgent::where('slug', 'cynessa')
            ->orWhere('name', 'LIKE', '%Cynessa%')
            ->first();

        if (! $cynessa) {
            $this->error('❌ Cynessa agent not found in database');

            return Command::FAILURE;
        }

        $this->info("✓ Found agent: {$cynessa->name}");

        // Get ElevenLabs API key
        $apiKey = $cynessa->apiKeys()
            ->where('provider', 'elevenlabs')
            ->where('is_active', true)
            ->first();

        if (! $apiKey) {
            $this->error('❌ ElevenLabs API key not configured for Cynessa');

            return Command::FAILURE;
        }

        $this->info("✓ Found API key: {$apiKey->name}");

        // Check if key is valid (not expired)
        if ($apiKey->isExpired()) {
            $this->error('❌ API key has expired');

            return Command::FAILURE;
        }

        $this->info('✓ API key is active and not expired');

        // Get the decrypted key (automatically decrypted by model cast)
        try {
            $decryptedKey = $apiKey->key;
            $this->info('✓ Successfully retrieved API key');
        } catch (\Exception $e) {
            $this->error('❌ Failed to retrieve API key: '.$e->getMessage());

            return Command::FAILURE;
        }

        // Test API connection - Get voices
        $this->info('Testing API connection...');
        $this->info('Using API key: '.substr($decryptedKey, 0, 10).'...'.substr($decryptedKey, -4));

        $elevenLabs = new ElevenLabsService($decryptedKey);
        $voicesResult = $elevenLabs->getVoices();

        if (! $voicesResult['success']) {
            $this->error('❌ Failed to fetch voices from ElevenLabs API');
            $error = $voicesResult['error'] ?? 'Unknown error';
            $this->error('Error: '.$error);

            // Check if it's a permissions error
            if (str_contains($error, 'missing_permissions') || str_contains($error, '401')) {
                $this->newLine();
                $this->warn('⚠️  This appears to be a permissions issue.');
                $this->warn('The API key is valid but is missing required permissions.');
                $this->newLine();
                $this->info('To fix this:');
                $this->line('1. Go to https://elevenlabs.io/app/settings/api-keys');
                $this->line('2. Find the API key for Cynessa');
                $this->line('3. Make sure it has the following permissions enabled:');
                $this->line('   - voices_read (required to fetch available voices)');
                $this->line('   - text_to_speech (required to generate audio)');
            }

            return Command::FAILURE;
        }

        $voiceCount = count($voicesResult['voices']);
        $this->info("✓ Successfully fetched {$voiceCount} voice(s) from ElevenLabs API");

        // Display voice information
        if ($voiceCount > 0) {
            $this->newLine();
            $this->info('Available voices:');
            foreach (array_slice($voicesResult['voices'], 0, 5) as $voice) {
                $this->line("  - {$voice['name']} (ID: {$voice['voice_id']})");
            }
            if ($voiceCount > 5) {
                $this->line('  ... and '.($voiceCount - 5).' more');
            }
        }

        // Test text-to-speech
        $this->newLine();
        $this->info('Testing text-to-speech generation...');

        $voiceId = $apiKey->metadata['voice_id'] ?? $voicesResult['voices'][0]['voice_id'];

        $ttsResult = $elevenLabs->textToSpeech('Hello, this is a test.', $voiceId, [
            'stability' => $apiKey->metadata['stability'] ?? 0.5,
            'similarity_boost' => $apiKey->metadata['similarity_boost'] ?? 0.75,
            'model_id' => $apiKey->metadata['model_id'] ?? 'eleven_monolingual_v1',
        ]);

        if (! $ttsResult['success']) {
            $this->error('❌ Failed to generate speech');
            $this->error('Error: '.($ttsResult['error'] ?? 'Unknown error'));

            return Command::FAILURE;
        }

        $audioSize = strlen(base64_decode($ttsResult['audio']));
        $this->info("✓ Successfully generated speech ({$audioSize} bytes)");

        // Summary
        $this->newLine();
        $this->info('✅ All validation checks passed! Cynessa ElevenLabs API key is working correctly.');

        return Command::SUCCESS;
    }
}
