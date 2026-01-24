<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() != 'pgsql') {
            return;
        }

        DB::unprepared(<<<'SQL'
-- Add additional fields needed for pricing page display
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS tagline text,
ADD COLUMN IF NOT EXISTS hours text,
ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cta_text text DEFAULT 'Add to Cart';

-- Update existing plans with taglines, hours, and CTA text
UPDATE public.plans SET 
  tagline = 'For the Solo Hero Ready to Take Flight',
  hours = '40 Monthly Team Hours',
  cta_text = 'Start The Emerge Plan'
WHERE slug = 'emerge';

UPDATE public.plans SET 
  tagline = 'For the Growing Empire (Most Popular)',
  hours = '100 Monthly Team Hours',
  is_popular = true,
  cta_text = 'Activate Expansion'
WHERE slug = 'expansion';

UPDATE public.plans SET 
  tagline = 'For Complex Operations at Scale',
  hours = 'Custom Hours',
  cta_text = 'Contact Us'
WHERE slug = 'enterprise';

UPDATE public.plans SET 
  tagline = 'Basic support for small teams',
  hours = '20 Monthly Team Hours',
  cta_text = 'Start Essentials'
WHERE slug = 'essentials';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
