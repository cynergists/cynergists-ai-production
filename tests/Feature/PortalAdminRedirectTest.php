<?php

it('redirects portal admin to the admin dashboard', function () {
    $response = $this->get('/portal/admin');

    $response->assertRedirect('/admin');
});
