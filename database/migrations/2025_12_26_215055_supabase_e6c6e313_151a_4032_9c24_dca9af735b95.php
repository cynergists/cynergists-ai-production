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
-- Create enums for product fields
CREATE TYPE public.product_billing_type AS ENUM (
  'one_time',
  'monthly_subscription',
  'annual_subscription',
  'subscription_with_minimum_commitment',
  'usage_based'
);

CREATE TYPE public.product_delivery_method AS ENUM (
  'instant_download',
  'email_delivery',
  'account_access',
  'platform_access',
  'onboarding_call_required'
);

CREATE TYPE public.product_access_duration AS ENUM (
  'lifetime_access',
  'x_months_access',
  'active_subscription_only',
  'access_ends_upon_cancellation'
);

CREATE TYPE public.product_time_to_value AS ENUM (
  'immediate',
  'one_two_weeks',
  'thirty_days',
  'after_onboarding'
);

CREATE TYPE public.product_support_level AS ENUM (
  'no_support',
  'email_support',
  'office_hours',
  'slack_chat_support',
  'dedicated_support'
);

CREATE TYPE public.product_refund_policy AS ENUM (
  'no_refunds',
  'refund_within_x_days',
  'conditional_refund'
);

CREATE TYPE public.product_license_type AS ENUM (
  'personal_use_only',
  'internal_business_use',
  'commercial_use',
  'resale_prohibited'
);

CREATE TYPE public.product_term_length AS ENUM (
  'month_to_month',
  'three_month_minimum',
  'six_month_minimum',
  'fixed_term'
);

CREATE TYPE public.product_status AS ENUM (
  'draft',
  'active',
  'hidden',
  'archived'
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Core Product Fields (Customer-Facing)
  product_name TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  billing_type public.product_billing_type NOT NULL DEFAULT 'one_time',
  delivery_method public.product_delivery_method NOT NULL DEFAULT 'account_access',
  access_duration public.product_access_duration NOT NULL DEFAULT 'lifetime_access',
  whats_included TEXT,
  who_this_is_for TEXT,
  who_this_is_not_for TEXT,
  prerequisites TEXT,
  estimated_time_to_value public.product_time_to_value NOT NULL DEFAULT 'immediate',
  support_level public.product_support_level NOT NULL DEFAULT 'email_support',
  
  -- Legal and Risk-Reduction Fields (Customer-Facing)
  refund_policy public.product_refund_policy NOT NULL DEFAULT 'no_refunds',
  license_type public.product_license_type NOT NULL DEFAULT 'internal_business_use',
  term_length public.product_term_length NOT NULL DEFAULT 'month_to_month',
  cancellation_policy TEXT,
  disclaimers TEXT,
  data_ai_disclaimer TEXT,
  
  -- Operational / Internal Fields (Admin-Only)
  product_sku TEXT,
  product_status public.product_status NOT NULL DEFAULT 'draft',
  version_date DATE DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}',
  internal_notes TEXT
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create policy for public read of active products
CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (product_status = 'active');

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
