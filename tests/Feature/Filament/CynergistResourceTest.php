<?php

use App\Filament\Resources\Cynergists\Pages\EditCynergist;
use App\Models\Cynergist;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

it('attaches and detaches users from a cynergist', function () {
    $admin = User::factory()->create();
    $users = User::factory()->count(2)->create();
    $cynergist = Cynergist::factory()->create();

    $this->actingAs($admin);

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();

    Livewire::test(EditCynergist::class, ['record' => $cynergist->getKey()])
        ->set('data.users', $users->pluck('id')->all())
        ->call('save')
        ->assertHasNoErrors();

    $cynergist->refresh();

    expect($cynergist->users)->toHaveCount(2);

    Livewire::test(EditCynergist::class, ['record' => $cynergist->getKey()])
        ->set('data.users', [$users->first()->id])
        ->call('save')
        ->assertHasNoErrors();

    $cynergist->refresh();

    expect($cynergist->users)->toHaveCount(1);
});
