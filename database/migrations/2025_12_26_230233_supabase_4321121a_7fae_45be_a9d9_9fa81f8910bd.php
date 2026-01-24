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
-- Update plans RLS policy to allow viewing active, hidden, and test plans
-- Draft plans remain invisible to the public
DROP POLICY IF EXISTS "Anyone can view live plans" ON public.plans;

CREATE POLICY "Anyone can view purchasable plans"
ON public.plans
FOR SELECT
USING (status IN ('active', 'hidden', 'test'));

-- Update products RLS policy to allow viewing active, hidden, and test products
-- Draft products remain invisible to the public
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

CREATE POLICY "Anyone can view purchasable products"
ON public.products
FOR SELECT
USING (product_status IN ('active', 'hidden', 'test'));
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
