<?php

namespace Tests\Unit\Ai\Tools;

use App\Ai\Tools\PodcastFileIngestionTool;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class PodcastFileIngestionToolTest extends TestCase
{
    private string $testFile;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test directory if it doesn't exist
        $testDir = storage_path('app/test');
        if (! file_exists($testDir)) {
            mkdir($testDir, 0755, true);
        }
    }

    protected function tearDown(): void
    {
        // Cleanup test files
        if (isset($this->testFile) && file_exists($this->testFile)) {
            unlink($this->testFile);
        }

        parent::tearDown();
    }

    public function test_podcast_file_ingestion_tool_handles_valid_audio_file(): void
    {
        $tool = new PodcastFileIngestionTool;

        // Create a mock audio file
        $this->testFile = storage_path('app/test/test_episode.mp3');
        file_put_contents($this->testFile, str_repeat('mock audio content ', 1000)); // Make it reasonably sized

        $request = new Request([
            'file_path' => $this->testFile,
            'episode_metadata' => [
                'title' => 'Test Episode',
                'description' => 'Test Description',
                'participants' => ['Host', 'Guest'],
                'topics' => ['Technology', 'Business'],
            ],
        ]);

        $response = $tool->handle($request);
        $result = json_decode($response, true);

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('READY FOR DECOMPOSITION PROCESSING', $result['draft_status']);
        $this->assertArrayHasKey('file_specifications', $result);
        $this->assertArrayHasKey('quality_assessment', $result);
        $this->assertArrayHasKey('processing_feasibility', $result);
        $this->assertArrayHasKey('episode_metadata', $result);

        // Check operational boundaries
        $this->assertTrue($result['operational_boundaries']['source_material_only']);
        $this->assertTrue($result['operational_boundaries']['no_content_fabrication']);
        $this->assertTrue($result['operational_boundaries']['draft_outputs_only']);
        $this->assertTrue($result['operational_boundaries']['human_review_required']);
    }

    public function test_podcast_file_ingestion_tool_handles_missing_file(): void
    {
        $tool = new PodcastFileIngestionTool;

        $request = new Request([
            'file_path' => '/non/existent/file.mp3',
        ]);

        $response = $tool->handle($request);
        $result = json_decode($response, true);

        $this->assertFalse($result['success']);
        $this->assertTrue($result['escalation_triggered']);
        $this->assertStringContainsString('ESCALATED FOR MANUAL REVIEW', $result['draft_status']);
    }

    public function test_podcast_file_ingestion_validates_episode_metadata(): void
    {
        $tool = new PodcastFileIngestionTool;

        // Create a mock audio file
        $this->testFile = storage_path('app/test/test_episode_metadata.mp3');
        file_put_contents($this->testFile, 'mock audio content');

        $request = new Request([
            'file_path' => $this->testFile,
            'episode_metadata' => [
                'title' => 'Complete Episode',
                'description' => 'Complete description with all metadata',
                'participants' => ['Host', 'Guest 1', 'Guest 2'],
                'recording_date' => '2024-01-15',
                'topics' => ['AI', 'Technology', 'Business'],
            ],
        ]);

        $response = $tool->handle($request);
        $result = json_decode($response, true);

        $this->assertTrue($result['success']);

        $metadata = $result['episode_metadata'];
        $this->assertEquals('Complete Episode', $metadata['title']);
        $this->assertEquals(3, count($metadata['participants']));
        $this->assertEquals(3, count($metadata['topics']));
        $this->assertGreaterThan(80, $metadata['completeness_score']);
    }

    public function test_podcast_file_ingestion_identifies_missing_metadata(): void
    {
        $tool = new PodcastFileIngestionTool;

        // Create a mock audio file
        $this->testFile = storage_path('app/test/test_episode_incomplete.mp3');
        file_put_contents($this->testFile, 'mock audio content');

        $request = new Request([
            'file_path' => $this->testFile,
            'episode_metadata' => [
                'title' => 'Incomplete Episode',
                // Missing description, participants, topics
            ],
        ]);

        $response = $tool->handle($request);
        $result = json_decode($response, true);

        $this->assertTrue($result['success']);

        $metadata = $result['episode_metadata'];
        $this->assertContains('episode_description', $metadata['missing_elements']);
        $this->assertContains('speaker_information', $metadata['missing_elements']);
        $this->assertContains('topic_keywords', $metadata['missing_elements']);
        $this->assertLessThan(60, $metadata['completeness_score']);
    }

    public function test_podcast_file_ingestion_estimates_asset_counts(): void
    {
        $tool = new PodcastFileIngestionTool;

        // Create a larger mock audio file to simulate longer episode
        $this->testFile = storage_path('app/test/test_long_episode.mp3');
        file_put_contents($this->testFile, str_repeat('mock audio content for longer episode ', 5000));

        $request = new Request([
            'file_path' => $this->testFile,
            'episode_metadata' => [
                'title' => 'Long Episode',
                'description' => 'A longer episode for testing asset estimation',
            ],
        ]);

        $response = $tool->handle($request);
        $result = json_decode($response, true);

        $this->assertTrue($result['success']);

        $report = $result['ingestion_report'];
        $assetCounts = $report['ingestion_summary']['estimated_assets_extractable'];

        $this->assertArrayHasKey('highlight_clips', $assetCounts);
        $this->assertArrayHasKey('key_quotes', $assetCounts);
        $this->assertArrayHasKey('chapter_markers', $assetCounts);
        $this->assertArrayHasKey('summary_sections', $assetCounts);
        $this->assertArrayHasKey('social_media_assets', $assetCounts);

        // Should have reasonable estimates for a longer episode
        $this->assertGreaterThan(0, $assetCounts['highlight_clips']);
        $this->assertGreaterThan(0, $assetCounts['key_quotes']);
    }
}
