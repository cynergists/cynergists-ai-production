import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Prospect {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  nick_name: string | null;
  name_updated_at: string | null;
  name_updated_by: string | null;
  email: string | null;
  email_updated_at: string | null;
  email_updated_by: string | null;
  phone: string | null;
  phone_updated_at: string | null;
  phone_updated_by: string | null;
  company: string | null;
  company_updated_at: string | null;
  company_updated_by: string | null;
  services: string | null;
  sales_rep: string | null;
  sales_rep_updated_at: string | null;
  sales_rep_updated_by: string | null;
  partner_name: string | null;
  partner_name_updated_at: string | null;
  partner_name_updated_by: string | null;
  tags: string[];
  tags_updated_at: string | null;
  tags_updated_by: string | null;
  status: string | null;
  interested_plan: string | null;
  estimated_value: number | null;
  lead_source: string | null;
  last_activity: string | null;
  last_activity_updated_at: string | null;
  last_activity_updated_by: string | null;
  last_contact: string | null;
  last_contact_updated_at: string | null;
  last_contact_updated_by: string | null;
  last_meeting: string | null;
  last_meeting_updated_at: string | null;
  last_meeting_updated_by: string | null;
  last_outreach: string | null;
  last_outreach_updated_at: string | null;
  last_outreach_updated_by: string | null;
  next_outreach: string | null;
  next_outreach_updated_at: string | null;
  next_outreach_updated_by: string | null;
  next_meeting: string | null;
  next_meeting_updated_at: string | null;
  next_meeting_updated_by: string | null;
  est_closing_date: string | null;
  est_closing_date_updated_at: string | null;
  est_closing_date_updated_by: string | null;
  sdr_set: boolean | null;
  ghl_contact_id: string | null;
  ghl_synced_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface UseProspectsListParams {
  page: number;
  limit: number;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  search: string;
  filters: Record<string, string>;
}

interface MonthlyData {
  month: number;
  year: number;
  count: number;
  value: number;
  hotCount: number;
  warmCount: number;
  coldCount: number;
  hotValue: number;
  warmValue: number;
  coldValue: number;
}

interface ProspectsSummary {
  totalProspects: number;
  coldCount: number;
  warmCount: number;
  hotCount: number;
  sdrSetCount: number;
  totalEstimatedValue: number;
  hotValue: number;
  warmValue: number;
  coldValue: number;
  monthlyData?: MonthlyData[];
}

interface UseProspectsListResult {
  prospects: Prospect[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  summary: ProspectsSummary | null;
  refetch: () => Promise<void>;
}

export function useProspectsList(params: UseProspectsListParams): UseProspectsListResult {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ProspectsSummary | null>(null);
  const { toast } = useToast();

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        sortColumn: params.sortColumn,
        sortDirection: params.sortDirection,
        search: params.search,
        filters: JSON.stringify(params.filters),
        includeSummary: 'true',
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-prospects?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prospects');
      }

      const result = await response.json();
      setProspects(result.prospects || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 0);
      setSummary(result.summary || null);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch prospects';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, params.sortColumn, params.sortDirection, params.search, params.filters, toast]);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  return {
    prospects,
    total,
    totalPages,
    loading,
    error,
    summary,
    refetch: fetchProspects,
  };
}