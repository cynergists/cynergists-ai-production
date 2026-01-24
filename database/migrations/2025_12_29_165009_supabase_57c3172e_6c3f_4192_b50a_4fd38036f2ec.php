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
-- Create partners table (separate from users/profiles)
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identity & Contact
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  partner_type TEXT NOT NULL DEFAULT 'sole_proprietor' CHECK (partner_type IN ('company', 'sole_proprietor')),
  
  -- Status
  partner_status TEXT NOT NULL DEFAULT 'active' CHECK (partner_status IN ('active', 'inactive', 'terminated')),
  
  -- Agreement & Legal
  agreement_sent BOOLEAN NOT NULL DEFAULT false,
  agreement_sent_date DATE,
  agreement_signed BOOLEAN NOT NULL DEFAULT false,
  agreement_signed_date DATE,
  agreement_version TEXT,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  
  -- Financial Performance (calculated fields stored for performance)
  referrals_given INTEGER NOT NULL DEFAULT 0,
  qualified_referrals INTEGER NOT NULL DEFAULT 0,
  closed_won_deals INTEGER NOT NULL DEFAULT 0,
  revenue_generated NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_commissions_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  outstanding_commission_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_commission_payout_date DATE,
  last_referral_date DATE,
  
  -- Relationship Management
  internal_owner_id UUID REFERENCES public.profiles(id),
  partner_start_date DATE,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date DATE,
  partner_notes TEXT,
  
  -- Portal Access (optional)
  portal_access_enabled BOOLEAN NOT NULL DEFAULT false,
  linked_user_id UUID,
  access_level TEXT DEFAULT 'standard' CHECK (access_level IN ('standard', 'limited')),
  last_login_date TIMESTAMP WITH TIME ZONE,
  
  -- System Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Service role only policy
CREATE POLICY "Service role only - partners" ON public.partners
  FOR ALL USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- Create updated_at trigger
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_partners_status ON public.partners(partner_status);
CREATE INDEX idx_partners_internal_owner ON public.partners(internal_owner_id);

-- Add comment explaining the table
COMMENT ON TABLE public.partners IS 'External revenue partners - separate from users/clients. Financial fields are auto-calculated from referral records.';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
