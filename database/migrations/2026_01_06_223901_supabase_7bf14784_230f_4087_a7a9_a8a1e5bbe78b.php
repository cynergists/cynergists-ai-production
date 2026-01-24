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
-- Create enum for user types that can access admin console
CREATE TYPE public.admin_user_type AS ENUM ('employee', 'sales_rep', 'admin');

-- Create permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create role_permissions table for mapping roles to permissions
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role admin_user_type NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Add is_super_admin to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_user_type admin_user_type DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Enable RLS on new tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Permissions are readable by all authenticated admins
CREATE POLICY "Permissions readable by authenticated users"
ON public.permissions FOR SELECT
TO authenticated
USING (true);

-- Role permissions readable by authenticated users
CREATE POLICY "Role permissions readable by authenticated users"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

-- Only super admins can modify role_permissions (enforced at app level, but RLS backup)
CREATE POLICY "Role permissions modifiable by super admins"
ON public.role_permissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = auth.jwt() ->> 'email' 
    AND is_super_admin = true
  )
);

-- Insert all permissions
INSERT INTO public.permissions (key, label, module, description) VALUES
-- Dashboard
('dashboard.view_basic', 'View Basic Dashboard', 'Dashboard', 'Access to basic dashboard metrics'),
('dashboard.view_financial_summary', 'View Financial Summary', 'Dashboard', 'Access to financial summary cards'),

-- Integrations
('integrations.manage', 'Manage Integrations', 'Integrations', 'Configure third-party integrations'),

-- AI Agents
('ai_agents.view', 'View AI Agents', 'AI Agents', 'View AI agent listings'),
('ai_agents.manage', 'Manage AI Agents', 'AI Agents', 'Create and edit AI agents'),
('ai_agents.pricing_manage', 'Manage AI Agent Pricing', 'AI Agents', 'Edit AI agent pricing'),
('ai_agents.publish', 'Publish AI Agents', 'AI Agents', 'Publish agents to marketplace'),

-- Prospects
('prospects.view_assigned', 'View Assigned Prospects', 'Prospects', 'View prospects assigned to you'),
('prospects.view_all', 'View All Prospects', 'Prospects', 'View all prospects'),
('prospects.edit_assigned', 'Edit Assigned Prospects', 'Prospects', 'Edit prospects assigned to you'),
('prospects.edit_all', 'Edit All Prospects', 'Prospects', 'Edit any prospect'),
('prospects.assign', 'Assign Prospects', 'Prospects', 'Assign prospects to sales reps'),
('prospects.export', 'Export Prospects', 'Prospects', 'Export prospect data'),

-- Sales Team
('sales_team.view', 'View Sales Team', 'Sales Team', 'View sales team members'),
('sales_team.manage', 'Manage Sales Team', 'Sales Team', 'Add and edit sales team members'),
('sales_team.commission_view', 'View Commissions', 'Sales Team', 'View commission data'),
('sales_team.commission_edit', 'Edit Commissions', 'Sales Team', 'Modify commission rates'),

-- Employees
('employees.view', 'View Employees', 'Employees', 'View employee directory'),
('employees.manage', 'Manage Employees', 'Employees', 'Add and edit employees'),

-- Payroll
('payroll.view', 'View Payroll', 'Payroll', 'View payroll information'),
('payroll.edit', 'Edit Payroll', 'Payroll', 'Modify payroll data'),

-- Partners
('partners.view_directory', 'View Partner Directory', 'Partners', 'View partner listings'),
('partners.manage', 'Manage Partners', 'Partners', 'Add and edit partners'),
('partners.commission_view', 'View Partner Commissions', 'Partners', 'View partner commission data'),
('partners.commission_edit', 'Edit Partner Commissions', 'Partners', 'Modify partner commission rates'),
('partners.payout_view', 'View Partner Payouts', 'Partners', 'View partner payout history'),

-- Users
('users.view', 'View Users', 'Users', 'View user listings'),
('users.invite', 'Invite Users', 'Users', 'Send user invitations'),
('users.deactivate', 'Deactivate Users', 'Users', 'Deactivate user accounts'),
('users.assign_admin_role', 'Assign Admin Role', 'Users', 'Assign admin role to users'),
('users.assign_super_admin', 'Assign Super Admin', 'Users', 'Grant super admin privileges'),

-- Calendars
('calendars.view', 'View Calendars', 'Calendars', 'View calendar listings'),
('calendars.manage', 'Manage Calendars', 'Calendars', 'Create and edit calendars'),
('calendars.publish', 'Publish Calendars', 'Calendars', 'Publish calendars'),
('calendars.assign_participants', 'Assign Participants', 'Calendars', 'Assign calendar participants'),

-- Transactions
('transactions.view', 'View Transactions', 'Transactions', 'View transaction history'),
('transactions.sync', 'Sync Transactions', 'Transactions', 'Sync with payment provider'),
('transactions.refund', 'Process Refunds', 'Transactions', 'Issue refunds'),
('transactions.test_mode', 'Test Mode', 'Transactions', 'Toggle test mode'),

-- Contracts
('contracts.view_templates', 'View Contract Templates', 'Contracts', 'View contract templates'),
('contracts.edit_templates', 'Edit Contract Templates', 'Contracts', 'Modify contract templates'),
('contracts.view_signed', 'View Signed Contracts', 'Contracts', 'View signed contracts'),
('contracts.manage_signed', 'Manage Signed Contracts', 'Contracts', 'Manage signed contract status'),

-- Analytics
('analytics.view', 'View Analytics', 'Analytics', 'Access analytics dashboard'),

-- Settings
('settings.personal', 'Personal Settings', 'Settings', 'Manage personal preferences'),
('settings.system', 'System Settings', 'Settings', 'Manage system-wide settings');

-- Insert default role permissions for Admin
INSERT INTO public.role_permissions (role, permission_id, enabled)
SELECT 'admin', id, CASE 
  WHEN key IN (
    'dashboard.view_basic',
    'dashboard.view_financial_summary',
    'analytics.view',
    'ai_agents.view',
    'ai_agents.manage',
    'prospects.view_all',
    'prospects.edit_all',
    'prospects.assign',
    'partners.view_directory',
    'users.view',
    'users.invite',
    'calendars.view',
    'calendars.manage',
    'calendars.publish',
    'calendars.assign_participants',
    'contracts.view_signed',
    'contracts.view_templates',
    'settings.personal'
  ) THEN true
  ELSE false
END
FROM public.permissions;

-- Insert default role permissions for Sales Rep
INSERT INTO public.role_permissions (role, permission_id, enabled)
SELECT 'sales_rep', id, CASE 
  WHEN key IN (
    'prospects.view_assigned',
    'prospects.edit_assigned',
    'calendars.view',
    'contracts.view_signed',
    'ai_agents.view',
    'settings.personal'
  ) THEN true
  ELSE false
END
FROM public.permissions;

-- Insert default role permissions for Employee
INSERT INTO public.role_permissions (role, permission_id, enabled)
SELECT 'employee', id, CASE 
  WHEN key IN (
    'ai_agents.view',
    'calendars.view',
    'settings.personal'
  ) THEN true
  ELSE false
END
FROM public.permissions;

-- Set Chris Irving and Ryan Van Ornum as Super Admins
UPDATE public.admin_users 
SET is_super_admin = true 
WHERE email IN ('chris@cynergists.com', 'ryan@cynergists.com');

-- Create function to check if user has permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_email TEXT, permission_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  has_perm BOOLEAN;
BEGIN
  -- Get user info
  SELECT is_super_admin, admin_user_type, is_active 
  INTO user_record
  FROM public.admin_users 
  WHERE email = user_email;
  
  -- User not found or inactive
  IF user_record IS NULL OR NOT user_record.is_active THEN
    RETURN false;
  END IF;
  
  -- Super admin has all permissions
  IF user_record.is_super_admin THEN
    RETURN true;
  END IF;
  
  -- Check role permissions
  SELECT rp.enabled INTO has_perm
  FROM public.role_permissions rp
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE rp.role = user_record.admin_user_type
  AND p.key = permission_key;
  
  RETURN COALESCE(has_perm, false);
END;
$$;

-- Create function to get all user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_email TEXT)
RETURNS TABLE(permission_key TEXT, enabled BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user info
  SELECT is_super_admin, admin_user_type, is_active 
  INTO user_record
  FROM public.admin_users 
  WHERE email = user_email;
  
  -- User not found or inactive
  IF user_record IS NULL OR NOT user_record.is_active THEN
    RETURN;
  END IF;
  
  -- Super admin has all permissions
  IF user_record.is_super_admin THEN
    RETURN QUERY
    SELECT p.key, true::BOOLEAN
    FROM public.permissions p;
    RETURN;
  END IF;
  
  -- Return role permissions
  RETURN QUERY
  SELECT p.key, COALESCE(rp.enabled, false)
  FROM public.permissions p
  LEFT JOIN public.role_permissions rp ON rp.permission_id = p.id 
    AND rp.role = user_record.admin_user_type;
END;
$$;

-- Create trigger for updated_at on role_permissions
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
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
