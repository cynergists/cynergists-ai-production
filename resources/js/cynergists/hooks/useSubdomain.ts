import { useMemo } from "react";

interface SubdomainInfo {
  subdomain: string | null;
  isMainDomain: boolean;
  isTenantDomain: boolean;
  isDevelopment: boolean;
}

export function useSubdomain(): SubdomainInfo {
  return useMemo(() => {
    const hostname = window.location.hostname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Development mode: use ?tenant= query parameter
    const tenantParam = searchParams.get("tenant");
    if (tenantParam) {
      return {
        subdomain: tenantParam.toLowerCase(),
        isMainDomain: false,
        isTenantDomain: true,
        isDevelopment: true,
      };
    }
    
    // Production mode: extract subdomain from hostname
    // Expected format: {subdomain}.cynergists.com
    const parts = hostname.split(".");
    
    // localhost or IP address - treat as main domain
    if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return {
        subdomain: null,
        isMainDomain: true,
        isTenantDomain: false,
        isDevelopment: true,
      };
    }
    
    // Preview URLs (e.g., xxx.lovableproject.com) - treat as main domain
    if (hostname.includes("lovableproject.com") || hostname.includes("lovable.app")) {
      return {
        subdomain: null,
        isMainDomain: true,
        isTenantDomain: false,
        isDevelopment: true,
      };
    }
    
    // Check for subdomain pattern: subdomain.cynergists.com (3 parts)
    // or subdomain.app.cynergists.com (4 parts)
    if (parts.length >= 3) {
      const subdomain = parts[0].toLowerCase();
      
      // Skip www - treat as main domain
      if (subdomain === "www") {
        return {
          subdomain: null,
          isMainDomain: true,
          isTenantDomain: false,
          isDevelopment: false,
        };
      }
      
      // Check if it's a real subdomain (not app, api, admin, etc.)
      const reservedSubdomains = ["app", "api", "admin", "mail", "ftp", "portal"];
      if (reservedSubdomains.includes(subdomain)) {
        return {
          subdomain: null,
          isMainDomain: true,
          isTenantDomain: false,
          isDevelopment: false,
        };
      }
      
      return {
        subdomain,
        isMainDomain: false,
        isTenantDomain: true,
        isDevelopment: false,
      };
    }
    
    // No subdomain detected
    return {
      subdomain: null,
      isMainDomain: true,
      isTenantDomain: false,
      isDevelopment: false,
    };
  }, []);
}
