<?php

use Database\Seeders\PortalAvailableAgentsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

it('seeds portal available agents from export', function () {
    $this->seed(PortalAvailableAgentsSeeder::class);

    expect(DB::table('portal_available_agents')->where('name', 'Apex')->exists())
        ->toBeTrue();

    expect(DB::table('portal_available_agents')->where('id', '30e75b0c-b562-463a-ba9f-67ef44d421a2')->value('created_at'))
        ->toBe('2026-01-08 02:01:13');
});
