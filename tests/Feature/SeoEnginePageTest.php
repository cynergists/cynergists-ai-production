<?php

use Inertia\Testing\AssertableInertia as Assert;

it('renders the seo engine product page', function () {
    $response = $this->get('/products/seo-engine');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/SEOEngine')
        );
});
