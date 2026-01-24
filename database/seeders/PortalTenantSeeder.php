<?php

namespace Database\Seeders;

use App\Models\PortalTenant;
use Illuminate\Database\Seeder;

class PortalTenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PortalTenant::factory()->count(3)->create();
    }
}
