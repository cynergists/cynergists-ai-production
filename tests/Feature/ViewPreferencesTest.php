<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('stores and returns view preferences for the user', function () {
    $user = User::factory()->create();

    $payload = [
        'column_order' => ['name', 'email'],
        'hidden_columns' => ['email'],
        'column_widths' => ['name' => 180],
        'sort_column' => 'name',
        'sort_direction' => 'asc',
        'active_filters' => ['status' => 'active'],
        'rows_per_page' => 25,
        'saved_views' => [],
        'active_view_name' => null,
        'default_view_name' => null,
    ];

    $this->actingAs($user)
        ->postJson('/api/view-preferences/client_view_preferences', $payload)
        ->assertOk();

    $response = $this->actingAs($user)
        ->getJson('/api/view-preferences/client_view_preferences')
        ->assertOk();

    $response->assertJsonFragment([
        'sort_column' => 'name',
        'sort_direction' => 'asc',
        'rows_per_page' => 25,
    ]);
});
