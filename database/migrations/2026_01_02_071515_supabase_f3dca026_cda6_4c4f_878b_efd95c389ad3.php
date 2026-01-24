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
-- Create customer_subscriptions table to track what customers have purchased
CREATE TABLE public.customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'pro', 'enterprise')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create agent_access table for AI Agent specific access
CREATE TABLE public.agent_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.customer_subscriptions(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create agent_conversations table for chat history
CREATE TABLE public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_access_id UUID NOT NULL REFERENCES public.agent_access(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create agent_memory table for shared context between agents
CREATE TABLE public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  agent_source TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, memory_key)
);

-- Enable RLS on all tables
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_subscriptions
CREATE POLICY "Service role can manage customer_subscriptions"
ON public.customer_subscriptions FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can manage customer_subscriptions"
ON public.customer_subscriptions FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for agent_access
CREATE POLICY "Service role can manage agent_access"
ON public.agent_access FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can manage agent_access"
ON public.agent_access FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for agent_conversations
CREATE POLICY "Service role can manage agent_conversations"
ON public.agent_conversations FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can manage agent_conversations"
ON public.agent_conversations FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for agent_memory
CREATE POLICY "Service role can manage agent_memory"
ON public.agent_memory FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can manage agent_memory"
ON public.agent_memory FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_customer_subscriptions_customer_id ON public.customer_subscriptions(customer_id);
CREATE INDEX idx_customer_subscriptions_product_id ON public.customer_subscriptions(product_id);
CREATE INDEX idx_customer_subscriptions_status ON public.customer_subscriptions(status);
CREATE INDEX idx_agent_access_subscription_id ON public.agent_access(subscription_id);
CREATE INDEX idx_agent_access_customer_id ON public.agent_access(customer_id);
CREATE INDEX idx_agent_access_agent_type ON public.agent_access(agent_type);
CREATE INDEX idx_agent_conversations_agent_access_id ON public.agent_conversations(agent_access_id);
CREATE INDEX idx_agent_conversations_customer_id ON public.agent_conversations(customer_id);
CREATE INDEX idx_agent_memory_customer_id ON public.agent_memory(customer_id);

-- Add triggers for updated_at
CREATE TRIGGER update_customer_subscriptions_updated_at
BEFORE UPDATE ON public.customer_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_access_updated_at
BEFORE UPDATE ON public.agent_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_conversations_updated_at
BEFORE UPDATE ON public.agent_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_memory_updated_at
BEFORE UPDATE ON public.agent_memory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
