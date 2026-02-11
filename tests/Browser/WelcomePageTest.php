<?php

use Pest\Laravel\Livewire;

it('displays the welcome page with all agents', function () {
    visit('/')
        ->assertSee('Cynergists AI')
        ->assertSee('Apex')
        ->assertSee('LinkedIn')
        ->assertSee('AI Agents')
        ->screenshot('01-welcome-page-hero');
});

it('shows featured agents section', function () {
    $page = visit('/');

    $page
        ->assertSee('Apex')
        ->assertSee('Aether')
        ->assertSee('Backbeat')
        ->assertSee('Luna');

    $page->screenshot('02-featured-agents');
});

it('displays capabilities section', function () {
    visit('/')
        ->assertSee('Capabilities')
        ->assertSee('Lead Generation')
        ->screenshot('03-capabilities-section');
});

it('shows the complete landing page', function () {
    visit('/')
        ->scroll(1000)
        ->screenshot('04-roster-section');
});

it('shows bottom divisions section', function () {
    visit('/')
        ->scroll(2000)
        ->screenshot('05-divisions-section');
});

it('displays login page', function () {
    visit('/login')
        ->assertSee('Sign In')
        ->screenshot('06-login-page');
});

it('displays register page when enabled', function () {
    visit('/register')
        ->assertSee('Register')
        ->screenshot('07-register-page');
});
