import { createContext, useContext } from "react";

export interface PortalTenant {
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

export interface PortalContextValue {
  user: { id: number | string; email?: string | null } | null;
  tenant: PortalTenant | null;
}

const PortalContext = createContext<PortalContextValue | null>(null);

export const usePortalContext = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortalContext must be used within PortalLayout");
  }
  return context;
};

export default PortalContext;
