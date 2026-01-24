import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Tenant {
  id: string;
  company_name: string;
  subdomain: string;
  is_temp_subdomain: boolean;
  logo_url: string | null;
  primary_color: string;
  settings: Record<string, unknown>;
  status: string;
}

export function useTenant(subdomain: string | null) {
  return useQuery({
    queryKey: ["tenant", subdomain],
    queryFn: async (): Promise<Tenant | null> => {
      if (!subdomain) return null;

      const { data, error } = await supabase.rpc("get_tenant_by_subdomain", {
        subdomain_input: subdomain,
      });

      if (error) {
        console.error("Error fetching tenant:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // RPC returns an array, get the first item
      const tenant = data[0];
      return {
        id: tenant.id,
        company_name: tenant.company_name,
        subdomain: tenant.subdomain,
        is_temp_subdomain: tenant.is_temp_subdomain,
        logo_url: tenant.logo_url,
        primary_color: tenant.primary_color,
        settings: tenant.settings as Record<string, unknown>,
        status: tenant.status,
      };
    },
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCurrentUserTenant() {
  return useQuery({
    queryKey: ["current-user-tenant"],
    queryFn: async (): Promise<Tenant | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("portal_tenants")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No tenant found
          return null;
        }
        console.error("Error fetching current user tenant:", error);
        throw error;
      }

      return {
        id: data.id,
        company_name: data.company_name,
        subdomain: data.subdomain,
        is_temp_subdomain: data.is_temp_subdomain,
        logo_url: data.logo_url,
        primary_color: data.primary_color,
        settings: data.settings as Record<string, unknown>,
        status: data.status,
      };
    },
  });
}
