<?php

use App\Filament\Pages\SeoEngineDashboard;
use App\Models\SeoSite;
use App\Models\User;
use App\Models\UserRole;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

it('renders the seo engine dashboard for admins', function () {
    $admin = User::factory()->create();
    UserRole::create([
        'user_id' => $admin->id,
        'role' => 'admin',
    ]);

    SeoSite::factory()->create(['name' => 'Example Site']);

    $this->actingAs($admin);

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();

    Livewire::test(SeoEngineDashboard::class)
        ->assertSee('SEO Engine');
});
