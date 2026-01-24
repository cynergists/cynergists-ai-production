import { ReactNode, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  LayoutDashboard, 
  Bot, 
  LogOut, 
  ArrowLeft,
  Compass,
  Map,
  Settings,
  HelpCircle,
  CreditCard,
  Activity,
  Plug,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSubdomain } from "@/hooks/useSubdomain";
import { useTenant, useCurrentUserTenant } from "@/hooks/useTenant";
import { TenantProvider } from "@/components/portal/TenantProvider";
import TenantNotFound from "@/pages/portal/TenantNotFound";
import PortalContext from "@/contexts/PortalContext";

export function PortalLayout({ children }: { children: ReactNode }) {
  const { url } = usePage();
  const pathname = url.split("?")[0];
  const { subdomain, isTenantDomain, isDevelopment } = useSubdomain();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['portal-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Fetch tenant by subdomain (for subdomain-based access)
  const { data: tenantBySubdomain, isLoading: tenantBySubdomainLoading, error: tenantError } = useTenant(subdomain);
  
  // Fetch current user's tenant (for checking onboarding status)
  const { data: userTenant, isLoading: userTenantLoading } = useCurrentUserTenant();

  const { data: clientAccess, isLoading: accessLoading } = useQuery({
    queryKey: ['portal-client-access', session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return null;
      
      const { data, error } = await supabase
        .from('agent_access')
        .select(`
          id,
          agent_type,
          agent_name,
          is_active,
          customer_subscriptions!inner(
            status,
            clients!inner(email)
          )
        `)
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching access:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!session?.user?.email,
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.visit("/signin");
    }
  }, [sessionLoading, session]);

  // No longer redirect to onboarding - subdomain is auto-assigned
  // Users can change their subdomain in settings if needed

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.visit("/signin");
  };

  const isLoading = sessionLoading || accessLoading || userTenantLoading || 
    (isTenantDomain && tenantBySubdomainLoading);

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

  if (!session) {
    return null;
  }

  // Use the appropriate tenant based on access method
  const activeTenant = isTenantDomain ? tenantBySubdomain : userTenant;

  const mainNavItems = [
    { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
    { label: "My Agents", href: "/portal/agents", icon: Bot },
    { label: "Browse Agents", href: "/portal/browse", icon: Compass },
    { label: "Roadmap", href: "/portal/roadmap", icon: Map },
    { label: "Suggest Agent", href: "/portal/suggest", icon: Lightbulb },
  ];


  const secondaryNavItems = [
    { label: "Settings", href: "/portal/settings", icon: Settings },
    { label: "Support", href: "/portal/support", icon: HelpCircle },
    { label: "Billing", href: "/portal/billing", icon: CreditCard },
    { label: "Activity", href: "/portal/activity", icon: Activity },
    { label: "Integrations", href: "/portal/integrations", icon: Plug },
  ];

  const getUserInitials = () => {
    const email = session.user.email || "";
    return email.substring(0, 2).toUpperCase();
  };

  const isActive = (href: string, external?: boolean) => {
    if (external) return false;
    return pathname === href || (href !== "/portal" && pathname.startsWith(href));
  };

  // Apply tenant branding if available
  const portalTitle = activeTenant?.company_name 
    ? `${activeTenant.company_name} Portal` 
    : "Customer Portal";

  return (
    <TenantProvider 
      tenant={activeTenant || null} 
      isLoading={isLoading} 
      isTenantDomain={isTenantDomain}
    >
      <PortalContext.Provider value={{ session, clientAccess }}>
        <Helmet>
          <title>{portalTitle} | Cynergists</title>
        </Helmet>

      <div className="min-h-screen flex bg-background">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Site</span>
            </Link>
            <h1 className="text-xl font-bold text-foreground mt-4">
              {activeTenant?.company_name || "Customer Portal"}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>


            {/* Secondary Navigation */}
            <div className="space-y-1">
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.user_metadata?.first_name 
                    ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ""}`
                    : session.user.email?.split("@")[0]
                  }
                </p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      </PortalContext.Provider>
    </TenantProvider>
  );
}
