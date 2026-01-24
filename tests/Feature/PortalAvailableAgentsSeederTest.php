<?php

use Database\Seeders\PortalAvailableAgentsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

it('seeds portal available agents from export', function () {
    $this->seed(PortalAvailableAgentsSeeder::class);

    expect(DB::table('portal_available_agents')->where('name', 'Apex')->exists())
        ->toBeTrue();
});
