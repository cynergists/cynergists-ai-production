<?php

it('shows the welcome page', function () {
    visit('/')
        ->assertSee('Cynergists AI')
        ->screenshot('homepage');
});
