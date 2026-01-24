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
-- Create storage bucket for plan and product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('plan-product-images', 'plan-product-images', true);

-- Allow public read access to images
CREATE POLICY "Public can view plan product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'plan-product-images');

-- Allow authenticated admins to upload images
CREATE POLICY "Admins can upload plan product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'plan-product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated admins to update images
CREATE POLICY "Admins can update plan product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'plan-product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated admins to delete images
CREATE POLICY "Admins can delete plan product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'plan-product-images' 
  AND auth.role() = 'authenticated'
);

-- Add image_url column to plans table
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
