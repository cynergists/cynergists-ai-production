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
-- Drop and recreate get_partner_dashboard_stats
DROP FUNCTION IF EXISTS get_partner_dashboard_stats(UUID);

CREATE FUNCTION get_partner_dashboard_stats(_partner_id UUID)
RETURNS TABLE (
  total_referrals BIGINT,
  qualified_referrals BIGINT,
  pending_referrals BIGINT,
  referrals_last_30_days BIGINT,
  total_deals BIGINT,
  open_deals BIGINT,
  closed_won_deals BIGINT,
  total_deal_value NUMERIC,
  pending_commissions NUMERIC,
  earned_commissions NUMERIC,
  payable_commissions NUMERIC,
  paid_commissions NUMERIC,
  next_payout_date DATE,
  next_payout_amount NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH referral_stats AS (
    SELECT 
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status IN ('qualified', 'converted', 'accepted')) AS qualified,
      COUNT(*) FILTER (WHERE status = 'new') AS pending,
      COUNT(*) FILTER (WHERE created_at > now() - interval '30 days') AS last_30_days
    FROM referrals
    WHERE partner_id = _partner_id
  ),
  deal_stats AS (
    SELECT 
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE stage IN ('new', 'in_progress')) AS open,
      COUNT(*) FILTER (WHERE stage = 'closed_won') AS won,
      COALESCE(SUM(deal_value) FILTER (WHERE stage = 'closed_won'), 0) AS total_value
    FROM partner_deals
    WHERE partner_id = _partner_id
  ),
  commission_stats AS (
    SELECT 
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'pending'), 0) AS pending,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'earned'), 0) AS earned,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'payable'), 0) AS payable,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'paid'), 0) AS paid
    FROM partner_commissions
    WHERE partner_id = _partner_id
  ),
  next_payout AS (
    SELECT 
      batch_date,
      total_amount
    FROM partner_payouts
    WHERE partner_id = _partner_id AND status = 'pending'
    ORDER BY batch_date ASC
    LIMIT 1
  )
  SELECT 
    r.total AS total_referrals,
    r.qualified AS qualified_referrals,
    r.pending AS pending_referrals,
    r.last_30_days AS referrals_last_30_days,
    d.total AS total_deals,
    d.open AS open_deals,
    d.won AS closed_won_deals,
    d.total_value AS total_deal_value,
    c.pending AS pending_commissions,
    c.earned AS earned_commissions,
    c.payable AS payable_commissions,
    c.paid AS paid_commissions,
    np.batch_date AS next_payout_date,
    COALESCE(np.total_amount, 0) AS next_payout_amount
  FROM referral_stats r, deal_stats d, commission_stats c
  LEFT JOIN next_payout np ON true;
$$;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
