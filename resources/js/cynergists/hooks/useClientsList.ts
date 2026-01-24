import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  square_customer_id: string | null;
  square_subscription_id: string | null;
  ghl_contact_id: string | null;
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
  payment_type: string | null;
  payment_amount: number | null;
  last_payment_date: string | null;
  next_payment_due_date: string | null;
  square_plan_name: string | null;
  square_synced_at: string | null;
  last_activity: string | null;
  last_activity_updated_at: string | null;
  last_activity_updated_by: string | null;
  last_contact: string | null;
  last_contact_updated_at: string | null;
  last_contact_updated_by: string | null;
  next_meeting: string | null;
  next_meeting_updated_at: string | null;
  next_meeting_updated_by: string | null;
  ghl_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UseClientsListParams {
  page: number;
  limit: number;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  search: string;
  filters: Record<string, string>;
}

interface UseClientsListResult {
  clients: Client[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClientsList(params: UseClientsListParams): UseClientsListResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
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
      });

      const { data, error: fnError } = await supabase.functions.invoke('get-clients', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: null,
        method: 'GET',
      });

      // Since invoke doesn't support query params well with GET, we'll use POST
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-clients?${queryParams}`,
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
        throw new Error(errorData.error || 'Failed to fetch clients');
      }

      const result = await response.json();
      setClients(result.clients || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 0);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch clients';
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
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    total,
    totalPages,
    loading,
    error,
    refetch: fetchClients,
  };
}
