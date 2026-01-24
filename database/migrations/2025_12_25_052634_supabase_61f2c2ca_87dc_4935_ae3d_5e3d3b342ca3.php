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
-- Create clients table with field-level timestamps for "last write wins" sync
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- External system identifiers
  square_customer_id TEXT UNIQUE,
  square_subscription_id TEXT,
  ghl_contact_id TEXT,
  
  -- Contact info (field-level timestamps for sync)
  name TEXT NOT NULL,
  name_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name_updated_by TEXT DEFAULT 'website',
  
  email TEXT,
  email_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  email_updated_by TEXT DEFAULT 'website',
  
  phone TEXT,
  phone_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  phone_updated_by TEXT DEFAULT 'website',
  
  company TEXT,
  company_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_updated_by TEXT DEFAULT 'website',
  
  -- Local admin fields
  sales_rep TEXT,
  sales_rep_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sales_rep_updated_by TEXT DEFAULT 'website',
  
  partner_name TEXT,
  partner_name_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  partner_name_updated_by TEXT DEFAULT 'website',
  
  tags TEXT[] DEFAULT '{}',
  tags_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags_updated_by TEXT DEFAULT 'website',
  
  -- Square payment/subscription data
  status TEXT DEFAULT 'active',
  payment_type TEXT,
  payment_amount NUMERIC(10,2),
  last_payment_date DATE,
  next_payment_due_date DATE,
  square_plan_name TEXT,
  square_synced_at TIMESTAMP WITH TIME ZONE,
  
  -- GHL CRM engagement data
  last_activity TIMESTAMP WITH TIME ZONE,
  last_activity_updated_at TIMESTAMP WITH TIME ZONE,
  last_activity_updated_by TEXT,
  
  last_contact TIMESTAMP WITH TIME ZONE,
  last_contact_updated_at TIMESTAMP WITH TIME ZONE,
  last_contact_updated_by TEXT,
  
  next_meeting TIMESTAMP WITH TIME ZONE,
  next_meeting_updated_at TIMESTAMP WITH TIME ZONE,
  next_meeting_updated_by TEXT,
  
  ghl_synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Record timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indices for common queries
CREATE INDEX idx_clients_name ON public.clients(name);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_square_customer_id ON public.clients(square_customer_id);
CREATE INDEX idx_clients_company ON public.clients(company);
CREATE INDEX idx_clients_sales_rep ON public.clients(sales_rep);
CREATE INDEX idx_clients_partner_name ON public.clients(partner_name);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Service role only access (edge functions manage this)
CREATE POLICY "Service role only - clients"
  ON public.clients
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create client view preferences table for user customization
CREATE TABLE public.client_view_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Column customization
  column_order TEXT[] DEFAULT ARRAY['name', 'email', 'phone', 'status', 'payment_type', 'last_activity', 'last_contact', 'next_meeting', 'last_payment_date', 'next_payment_due_date', 'payment_amount', 'sales_rep', 'partner_name', 'tags'],
  hidden_columns TEXT[] DEFAULT '{}',
  column_widths JSONB DEFAULT '{}',
  
  -- Sort preferences
  sort_column TEXT DEFAULT 'name',
  sort_direction TEXT DEFAULT 'asc',
  
  -- Filter preferences
  active_filters JSONB DEFAULT '{}',
  
  -- Pagination
  rows_per_page INTEGER DEFAULT 50,
  
  -- Saved views
  saved_views JSONB DEFAULT '[]',
  active_view_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.client_view_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.client_view_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.client_view_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.client_view_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON public.client_view_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger for clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger for preferences
CREATE TRIGGER update_client_view_preferences_updated_at
  BEFORE UPDATE ON public.client_view_preferences
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
