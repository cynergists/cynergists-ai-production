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
-- Add TEST_MODE to payment_settings
ALTER TABLE public.payment_settings ADD COLUMN IF NOT EXISTS test_mode boolean NOT NULL DEFAULT false;

-- Create webhook_events table for logging all incoming webhooks
CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text NOT NULL,
  external_event_id text,
  idempotency_key text NOT NULL UNIQUE,
  payload_json jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  status text NOT NULL DEFAULT 'received',
  error_message text,
  replay_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT webhook_events_provider_external_unique UNIQUE (provider, external_event_id)
);

-- Create attribution_events table for tracking partner attribution
CREATE TABLE public.attribution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL,
  partner_slug text,
  event_type text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  landing_page_url text,
  referrer_url text,
  cookie_present boolean NOT NULL DEFAULT false,
  local_storage_present boolean NOT NULL DEFAULT false,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX idx_webhook_events_provider ON public.webhook_events(provider);
CREATE INDEX idx_webhook_events_received_at ON public.webhook_events(received_at DESC);
CREATE INDEX idx_attribution_events_partner_slug ON public.attribution_events(partner_slug);
CREATE INDEX idx_attribution_events_event_type ON public.attribution_events(event_type);
CREATE INDEX idx_attribution_events_created_at ON public.attribution_events(created_at DESC);

-- Enable RLS on both tables
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribution_events ENABLE ROW LEVEL SECURITY;

-- RLS policies - admin only access
CREATE POLICY "Admins only - webhook_events"
ON public.webhook_events
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins only - attribution_events"
ON public.attribution_events
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role access for edge functions
CREATE POLICY "Service role - webhook_events"
ON public.webhook_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role - attribution_events"
ON public.attribution_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Helper function to get test mode status
CREATE OR REPLACE FUNCTION public.get_test_mode()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(test_mode, false) FROM public.payment_settings LIMIT 1
$$;

-- Helper function to set test mode (admin only via edge function)
CREATE OR REPLACE FUNCTION public.set_test_mode(enabled boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.payment_settings SET test_mode = enabled;
  RETURN enabled;
END;
$$;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
