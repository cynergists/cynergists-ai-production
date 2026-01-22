<?php

use App\Models\Cynergist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('attaches cynergists to users', function () {
    $user = User::factory()->create();
    $cynergists = Cynergist::factory()->count(2)->create();

    $user->cynergists()->attach($cynergists->pluck('id'));

    expect($user->cynergists)->toHaveCount(2);
    expect($cynergists->first()->users)->toHaveCount(1);
});
