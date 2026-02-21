<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Prism Agent Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration settings for the Prism podcast content decomposition agent
    |
    */

    'processing' => [
        'max_file_size_mb' => env('PRISM_MAX_FILE_SIZE', 500),
        'max_duration_minutes' => env('PRISM_MAX_DURATION', 300),
        'supported_audio_formats' => ['mp3', 'wav', 'flac', 'm4a'],
        'supported_video_formats' => ['mp4', 'mov', 'avi'],
        'processing_timeout_seconds' => env('PRISM_TIMEOUT', 1800),
    ],

    'quality' => [
        'minimum_snr_db' => 40,
        'minimum_bitrate_kbps' => 128,
        'minimum_sample_rate_hz' => 44100,
        'confidence_threshold' => 0.8,
        'content_density_threshold' => 0.7,
    ],

    'assets' => [
        'min_clip_duration_seconds' => 15,
        'max_clip_duration_seconds' => 90,
        'max_highlights_per_episode' => 10,
        'max_quotes_per_episode' => 15,
        'default_output_formats' => ['mp3', 'wav'],
    ],

    'storage' => [
        'temp_processing_path' => storage_path('app/prism/temp'),
        'audio_segments_path' => storage_path('app/prism/audio_segments'),
        'video_segments_path' => storage_path('app/prism/video_segments'),
        'enhanced_audio_path' => storage_path('app/prism/enhanced_audio'),
        'asset_packages_path' => storage_path('app/prism/packages'),
    ],

    'escalation' => [
        'max_retry_attempts' => 3,
        'specialist_response_time_minutes' => [
            'high' => 60,
            'medium' => 120,
            'normal' => 240,
        ],
        'emergency_contact_enabled' => env('PRISM_EMERGENCY_CONTACT', true),
    ],

    'crm' => [
        'logging_enabled' => env('PRISM_CRM_LOGGING', true),
        'batch_logging_size' => 50,
        'log_retention_days' => 90,
    ],
];
