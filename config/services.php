<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'filament' => [
        'admin_emails' => array_filter(
            array_map(
                static fn (string $email): string => strtolower(trim($email)),
                explode(',', env('FILAMENT_ADMIN_EMAILS', '')),
            ),
        ),
    ],

    'anthropic' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
    ],

    'google_drive' => [
        'credentials_path' => env('GOOGLE_DRIVE_CREDENTIALS_PATH'),
        'folder_id' => env('GOOGLE_DRIVE_ROOT_FOLDER_ID'),
    ],

    'gohighlevel' => [
        'api_key' => env('GOHIGHLEVEL_API_KEY'),
        'location_id' => env('GOHIGHLEVEL_LOCATION_ID'),
    ],

    'ghl' => [
        'api_key' => env('GHL_API_KEY', env('GOHIGHLEVEL_API_KEY')),
        'base_url' => env('GHL_BASE_URL', 'https://rest.gohighlevel.com/v1'),
    ],

    'haven' => [
        'api_url' => env('HAVEN_API_URL'),
        'api_key' => env('HAVEN_API_KEY'),
    ],

    'arsenal' => [
        'client_success_email' => env('ARSENAL_CLIENT_SUCCESS_EMAIL', 'support@cynergists.com'),
        'escalation_enabled' => env('ARSENAL_ESCALATION_ENABLED', true),
    ],

];
