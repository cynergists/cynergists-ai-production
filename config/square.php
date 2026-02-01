<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Square Environment
    |--------------------------------------------------------------------------
    |
    | This value determines which Square environment to use. Set to 'sandbox'
    | for testing and 'production' for live transactions.
    |
    */
    'environment' => env('SQUARE_ENVIRONMENT', 'sandbox'),

    /*
    |--------------------------------------------------------------------------
    | Square Access Token
    |--------------------------------------------------------------------------
    |
    | Your Square API access token. Get this from Square Developer Dashboard.
    |
    */
    'access_token' => env('SQUARE_ACCESS_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | Square Application ID
    |--------------------------------------------------------------------------
    |
    | Your Square application ID. This is used to initialize the Web SDK.
    |
    */
    'application_id' => env('SQUARE_ENVIRONMENT') === 'production'
        ? env('SQUARE_PRODUCTION_APPLICATION_ID')
        : env('SQUARE_SANDBOX_APPLICATION_ID'),

    /*
    |--------------------------------------------------------------------------
    | Square Location ID
    |--------------------------------------------------------------------------
    |
    | Your Square location ID. Get this from Square Dashboard -> Locations.
    |
    */
    'location_id' => env('SQUARE_ENVIRONMENT') === 'production'
        ? env('SQUARE_PRODUCTION_LOCATION_ID')
        : env('SQUARE_SANDBOX_LOCATION_ID'),

    /*
    |--------------------------------------------------------------------------
    | Square Webhook Signature Key
    |--------------------------------------------------------------------------
    |
    | Used to verify Square webhook signatures for security.
    |
    */
    'webhook_signature_key' => env('SQUARE_WEBHOOK_SIGNATURE_KEY'),
];
