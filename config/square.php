<?php

$squareEnv = env('SQUARE_ENVIRONMENT', env('APP_ENV') === 'production' ? 'production' : 'sandbox');

return [
    /*
    |--------------------------------------------------------------------------
    | Square Environment
    |--------------------------------------------------------------------------
    |
    | This value determines which Square environment to use.
    | Defaults to 'production' when APP_ENV=production, otherwise 'sandbox'.
    | Override with SQUARE_ENVIRONMENT env var if needed.
    |
    */
    'environment' => $squareEnv,

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
    'application_id' => $squareEnv === 'production'
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
    'location_id' => $squareEnv === 'production'
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

    /*
    |--------------------------------------------------------------------------
    | Square Monthly Plan Variation ID
    |--------------------------------------------------------------------------
    |
    | The catalog plan variation ID for the generic monthly subscription plan.
    | Create this in Square Dashboard under Catalog > Subscription Plans.
    | Used with priceOverrideMoney to set per-agent subscription prices.
    |
    */
    'monthly_plan_variation_id' => env('SQUARE_MONTHLY_PLAN_VARIATION_ID'),
];
