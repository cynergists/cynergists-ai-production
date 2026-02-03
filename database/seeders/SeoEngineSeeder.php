<?php

namespace Database\Seeders;

use App\Models\SeoAudit;
use App\Models\SeoChange;
use App\Models\SeoRecommendation;
use App\Models\SeoRecommendationApproval;
use App\Models\SeoReport;
use App\Models\SeoSite;
use Illuminate\Database\Seeder;

class SeoEngineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $site = SeoSite::factory()->create();

        $audit = SeoAudit::factory()->create([
            'seo_site_id' => $site->id,
        ]);

        $recommendation = SeoRecommendation::factory()->create([
            'seo_site_id' => $site->id,
            'seo_audit_id' => $audit->id,
        ]);

        SeoRecommendationApproval::factory()->create([
            'seo_recommendation_id' => $recommendation->id,
        ]);

        SeoChange::factory()->create([
            'seo_site_id' => $site->id,
            'seo_recommendation_id' => $recommendation->id,
        ]);

        SeoReport::factory()->create([
            'seo_site_id' => $site->id,
        ]);
    }
}
