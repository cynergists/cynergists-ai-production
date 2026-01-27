import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Tenant {
  id: string;
  company_name: string;
  subdomain: string;
  is_temp_subdomain: boolean;
  logo_url: string | null;
  primary_color: string;
  settings: Record<string, unknown>;
  status: string;
  onboarding_completed_at?: string | null;
}

export function useTenant(subdomain: string | null) {
  return useQuery({
    queryKey: ["tenant", subdomain],
    queryFn: async (): Promise<Tenant | null> => {
      if (!subdomain) return null;

      try {
        const response = await apiClient.get<{ tenant: Tenant | null }>(
          `/api/portal/tenant/by-subdomain?subdomain=${encodeURIComponent(subdomain)}`
        );
        return response.tenant ?? null;
      } catch (error) {
        console.error("Error fetching tenant:", error);
        return null;
      }
    },
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCurrentUserTenant() {
  return useQuery({
    queryKey: ["current-user-tenant"],
    queryFn: async (): Promise<Tenant | null> => {
      try {
        const response = await apiClient.get<{ tenant: Tenant | null }>("/api/portal/tenant");
        return response.tenant ?? null;
      } catch (error) {
        console.error("Error fetching current user tenant:", error);
        return null;
      }
    },
  });
}
