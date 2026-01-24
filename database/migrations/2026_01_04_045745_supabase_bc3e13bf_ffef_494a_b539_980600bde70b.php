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
-- Portal Available Agents - Agents customers can browse/purchase
CREATE TABLE public.portal_available_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT 'bot',
  features JSONB DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Portal Roadmap Items - Roadmap entries visible to customers
CREATE TABLE public.portal_roadmap_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('in_progress', 'coming_soon', 'planned')),
  eta TEXT,
  category TEXT,
  progress INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Portal Integrations - Available integrations list
CREATE TABLE public.portal_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'plug',
  category TEXT DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Portal FAQ Items - Support page FAQs
CREATE TABLE public.portal_faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent Suggestions - Customer-submitted agent ideas
CREATE TABLE public.agent_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_id UUID,
  agent_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  use_case TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'implemented', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.portal_available_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_suggestions ENABLE ROW LEVEL SECURITY;

-- Portal content tables: Anyone authenticated can read (customers read what admin configures)
CREATE POLICY "Authenticated users can view active agents"
  ON public.portal_available_agents FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view active roadmap items"
  ON public.portal_roadmap_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view active integrations"
  ON public.portal_integrations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view active FAQs"
  ON public.portal_faq_items FOR SELECT
  USING (is_active = true);

-- Admin full access to portal config tables
CREATE POLICY "Admins can manage portal agents"
  ON public.portal_available_agents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roadmap items"
  ON public.portal_roadmap_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage integrations"
  ON public.portal_integrations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage FAQs"
  ON public.portal_faq_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Agent suggestions: Customers can insert and view their own
CREATE POLICY "Users can submit agent suggestions"
  ON public.agent_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own suggestions"
  ON public.agent_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all suggestions"
  ON public.agent_suggestions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role access for all tables
CREATE POLICY "Service role full access - portal_available_agents"
  ON public.portal_available_agents FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access - portal_roadmap_items"
  ON public.portal_roadmap_items FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access - portal_integrations"
  ON public.portal_integrations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access - portal_faq_items"
  ON public.portal_faq_items FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access - agent_suggestions"
  ON public.agent_suggestions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create triggers for updated_at
CREATE TRIGGER update_portal_available_agents_updated_at
  BEFORE UPDATE ON public.portal_available_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portal_roadmap_items_updated_at
  BEFORE UPDATE ON public.portal_roadmap_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portal_integrations_updated_at
  BEFORE UPDATE ON public.portal_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portal_faq_items_updated_at
  BEFORE UPDATE ON public.portal_faq_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_suggestions_updated_at
  BEFORE UPDATE ON public.agent_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
