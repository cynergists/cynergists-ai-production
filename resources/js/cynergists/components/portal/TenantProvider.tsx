import React, { createContext, useContext, ReactNode } from "react";
import { Tenant } from "@/hooks/useTenant";

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  isTenantDomain: boolean;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoading: false,
  isTenantDomain: false,
});

interface TenantProviderProps {
  children: ReactNode;
  tenant: Tenant | null;
  isLoading: boolean;
  isTenantDomain: boolean;
}

export function TenantProvider({ children, tenant, isLoading, isTenantDomain }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={{ tenant, isLoading, isTenantDomain }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenantContext must be used within a TenantProvider");
  }
  return context;
}
