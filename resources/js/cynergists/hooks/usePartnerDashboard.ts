import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface DashboardStats {
  total_referrals: number;
  qualified_referrals: number;
  pending_referrals: number;
  total_deals: number;
  open_deals: number;
  closed_won_deals: number;
  total_deal_value: number;
  pending_commissions: number;
  earned_commissions: number;
  payable_commissions: number;
  paid_commissions: number;
  next_payout_date: string | null;
  next_payout_amount: number;
  // New fields for Step 12
  deals_new: number;
  deals_in_progress: number;
  deals_closed_won: number;
  deals_closed_lost: number;
  referrals_last_30_days: number;
  earned_this_month: number;
  paid_ytd: number;
}

interface UsePartnerDashboardResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  total_referrals: 0,
  qualified_referrals: 0,
  pending_referrals: 0,
  total_deals: 0,
  open_deals: 0,
  closed_won_deals: 0,
  total_deal_value: 0,
  pending_commissions: 0,
  earned_commissions: 0,
  payable_commissions: 0,
  paid_commissions: 0,
  next_payout_date: null,
  next_payout_amount: 0,
  deals_new: 0,
  deals_in_progress: 0,
  deals_closed_won: 0,
  deals_closed_lost: 0,
  referrals_last_30_days: 0,
  earned_this_month: 0,
  paid_ytd: 0,
};

export function usePartnerDashboard(partnerId: string | undefined): UsePartnerDashboardResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!partnerId) {
      setStats(defaultStats);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<DashboardStats>(`/api/partner-dashboard/${partnerId}`);
      setStats(data || defaultStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard stats');
      setStats(defaultStats);
    } finally {
      setIsLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
