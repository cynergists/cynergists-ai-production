import { ReactNode } from "react";
import { router, usePage } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubdomain } from "@/hooks/useSubdomain";
import { useTenant, useCurrentUserTenant } from "@/hooks/useTenant";
import { TenantProvider } from "@/components/portal/TenantProvider";
import TenantNotFound from "@/pages/portal/TenantNotFound";
import PortalContext from "@/contexts/PortalContext";

export function PortalLayout({ children }: { children: ReactNode }) {
  const { props } = usePage<{
    auth: {
      user: { id: number | string; email?: string | null } | null;
    };
  }>();
  const { subdomain, isTenantDomain } = useSubdomain();
  const user = props.auth?.user ?? null;

  // Fetch tenant by subdomain (for subdomain-based access)
  const { data: tenantBySubdomain, isLoading: tenantBySubdomainLoading } = useTenant(subdomain);
  
  // Fetch current user's tenant (for checking onboarding status)
  const { data: userTenant, isLoading: userTenantLoading } = useCurrentUserTenant();

  // No longer redirect to onboarding - subdomain is auto-assigned
  // Users can change their subdomain in settings if needed

  const handleLogout = async () => {
    router.post("/logout");
  };

  const isLoading = userTenantLoading || (isTenantDomain && tenantBySubdomainLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If accessing via subdomain and tenant not found, show 404
  if (isTenantDomain && subdomain && !tenantBySubdomain && !tenantBySubdomainLoading) {
    return <TenantNotFound subdomain={subdomain} />;
  }

  // Use the appropriate tenant based on access method
  const activeTenant = isTenantDomain ? tenantBySubdomain : userTenant;

  // Apply tenant branding if available
  const portalTitle = activeTenant?.company_name
    ? `${activeTenant.company_name} Portal`
    : "Customer Portal";

  const userEmail = user?.email ?? "guest@cynergists.ai";
  const userDisplayName = user?.email
    ? user.email.split("@")[0]
    : userEmail.split("@")[0];
  const portalTenant = activeTenant
    ? { ...activeTenant, onboarding_completed_at: activeTenant.onboarding_completed_at ?? null }
    : null;

  return (
    <TenantProvider tenant={portalTenant} isLoading={isLoading} isTenantDomain={isTenantDomain}>
      <PortalContext.Provider value={{ user, tenant: portalTenant }}>
        <Helmet>
          <title>{portalTitle} | Cynergists</title>
        </Helmet>

        <div className="min-h-screen bg-background flex flex-col">
          <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Customer Portal
              </p>
              <h1 className="text-lg font-semibold text-foreground">
                {activeTenant?.company_name || "Customer Portal"}
              </h1>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{userDisplayName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </PortalContext.Provider>
    </TenantProvider>
  );
}
