<?php

use Inertia\Testing\AssertableInertia as Assert;

it('renders the welcome page', function () {
    $response = $this->get('/');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('canRegister', fn ($value) => is_bool($value))
        );
});
