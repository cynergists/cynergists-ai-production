import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatErrorMessage } from "@/utils/errorMessages";

// Partner from the dedicated partners table
export interface Partner {
  id: string;
  
  // Identity & Contact
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  partner_type: "company" | "sole_proprietor";
  
  // Status
  partner_status: "active" | "inactive" | "terminated";
  
  // Agreement & Legal
  agreement_sent: boolean;
  agreement_sent_date: string | null;
  agreement_signed: boolean;
  agreement_signed_date: string | null;
  agreement_version: string | null;
  commission_rate: number;
  
  // Financial Performance (calculated)
  referrals_given: number;
  qualified_referrals: number;
  closed_won_deals: number;
  revenue_generated: number;
  total_commissions_earned: number;
  outstanding_commission_balance: number;
  last_commission_payout_date: string | null;
  last_referral_date: string | null;
  
  // Relationship Management
  internal_owner_id: string | null;
  internal_owner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  partner_start_date: string | null;
  last_activity_date: string | null;
  next_follow_up_date: string | null;
  partner_notes: string | null;
  
  // Portal Access
  portal_access_enabled: boolean;
  linked_user_id: string | null;
  access_level: "standard" | "limited";
  last_login_date: string | null;
  
  // System Metadata
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface PartnerFormData {
  // Identity & Contact
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  partner_type?: "company" | "sole_proprietor";
  
  // Status
  partner_status?: "active" | "inactive" | "terminated";
  
  // Agreement & Legal
  agreement_sent?: boolean;
  agreement_sent_date?: string;
  agreement_signed?: boolean;
  agreement_signed_date?: string;
  agreement_version?: string;
  commission_rate?: number;
  
  // Relationship Management
  internal_owner_id?: string;
  partner_start_date?: string;
  next_follow_up_date?: string;
  partner_notes?: string;
  
  // Portal Access
  portal_access_enabled?: boolean;
  linked_user_id?: string;
  access_level?: "standard" | "limited";
}

export interface PartnersSummary {
  total: number;
  active: number;
  inactive: number;
  totalReferrals: number;
  totalRevenue: number;
  totalCommissions: number;
  outstandingBalance: number;
}

interface UsePartnersListResult {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  summary: PartnersSummary;
  refetch: () => void;
  createPartner: (data: PartnerFormData) => Promise<Partner | null>;
  updatePartner: (id: string, data: Partial<PartnerFormData>) => Promise<Partner | null>;
  deletePartner: (id: string) => Promise<boolean>;
  mutating: boolean;
}

const DEFAULT_SUMMARY: PartnersSummary = {
  total: 0,
  active: 0,
  inactive: 0,
  totalReferrals: 0,
  totalRevenue: 0,
  totalCommissions: 0,
  outstandingBalance: 0,
};

export function usePartnersList(): UsePartnersListResult {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const [summary, setSummary] = useState<PartnersSummary>(DEFAULT_SUMMARY);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const response = await supabase.functions.invoke("admin-data?action=get_partners", {
        body: {},
      });
      
      if (response.error) {
        console.error("Error fetching partners:", response.error);
        setError(response.error.message);
        setPartners([]);
      } else {
        setPartners(response.data.partners || []);
        setSummary(response.data.summary || DEFAULT_SUMMARY);
      }
    } catch (err) {
      console.error("Error in fetchPartners:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPartner = useCallback(async (data: PartnerFormData): Promise<Partner | null> => {
    setMutating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("admin-data?action=create_partner", {
        body: data,
      });

      if (response.error) throw new Error(response.error.message);
      
      toast.success("Partner created successfully");
      await fetchPartners();
      return response.data as Partner;
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "Failed to create partner";
      const message = formatErrorMessage(rawMessage, "partner");
      toast.error(message);
      return null;
    } finally {
      setMutating(false);
    }
  }, [fetchPartners]);

  const updatePartner = useCallback(async (id: string, data: Partial<PartnerFormData>): Promise<Partner | null> => {
    setMutating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke(`admin-data?action=update_partner&id=${id}`, {
        body: data,
      });

      if (response.error) throw new Error(response.error.message);
      
      toast.success("Partner updated successfully");
      await fetchPartners();
      return response.data as Partner;
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "Failed to update partner";
      const message = formatErrorMessage(rawMessage, "partner");
      toast.error(message);
      return null;
    } finally {
      setMutating(false);
    }
  }, [fetchPartners]);

  const deletePartner = useCallback(async (id: string): Promise<boolean> => {
    setMutating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke(`admin-data?action=delete_partner&id=${id}`, {
        body: {},
      });

      if (response.error) throw new Error(response.error.message);
      
      toast.success("Partner deleted successfully");
      await fetchPartners();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete partner";
      toast.error(message);
      return false;
    } finally {
      setMutating(false);
    }
  }, [fetchPartners]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  return {
    partners,
    loading,
    error,
    summary,
    refetch: fetchPartners,
    createPartner,
    updatePartner,
    deletePartner,
    mutating,
  };
}
