<?php

use App\Filament\Resources\Cynergists\Pages\EditCynergist;
use App\Models\Cynergist;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
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

it('stores cynergist images and sets a main image', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $cynergist = Cynergist::factory()->create();

    $this->actingAs($admin);

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();

    $images = [
        'cynergists/cynergist-one.jpg',
        'cynergists/cynergist-two.jpg',
    ];

    Storage::disk('public')->put($images[0], 'main');
    Storage::disk('public')->put($images[1], 'secondary');

    Livewire::test(EditCynergist::class, ['record' => $cynergist->getKey()])
        ->set('data.images', $images)
        ->set('data.main_image', $images[0])
        ->call('save')
        ->assertHasNoErrors();

    $cynergist->refresh();

    expect($cynergist->images)->toHaveCount(2);
    expect($cynergist->main_image)->toBe($cynergist->images[0]);
    Storage::disk('public')->assertExists($cynergist->main_image);
});
