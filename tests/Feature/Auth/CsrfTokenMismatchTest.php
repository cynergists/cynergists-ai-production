<?php

use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Route;

it('redirects back with a message on csrf token mismatch', function () {
    Route::post('/test-csrf', fn () => throw new TokenMismatchException);

    $response = $this->from('/portal/dashboard')
        ->post('/test-csrf');

    $response->assertRedirect('/portal/dashboard');
    $response->assertSessionHas('message', 'Your session has expired. Please try again.');
});
