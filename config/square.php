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
    'application_id' => env('SQUARE_APPLICATION_ID'),

    /*
    |--------------------------------------------------------------------------
    | Square Location ID
    |--------------------------------------------------------------------------
    |
    | Your Square location ID. Get this from Square Dashboard -> Locations.
    |
    */
    'location_id' => env('SQUARE_LOCATION_ID'),
];
