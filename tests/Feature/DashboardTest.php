<?php

use Inertia\Testing\AssertableInertia as Assert;

test('dashboard route serves the cynergists inertia page', function () {
    $response = $this->get('/dashboard');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cynergists')
        );
});
