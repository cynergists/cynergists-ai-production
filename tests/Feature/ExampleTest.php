<?php

use Inertia\Testing\AssertableInertia as Assert;

it('renders the cynergists inertia page', function () {
    $response = $this->get('/');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cynergists')
        );
});
