import { TenantProvider } from '@/components/portal/TenantProvider';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import PortalContext from '@/contexts/PortalContext';
import { useSubdomain } from '@/hooks/useSubdomain';
import { useCurrentUserTenant, useTenant } from '@/hooks/useTenant';
import TenantNotFound from '@/pages/portal/TenantNotFound';
import { router, usePage } from '@inertiajs/react';
import { Loader2, LogOut, Menu, Shield, UserCircle } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Helmet } from 'react-helmet';

export function PortalLayout({ children }: { children: ReactNode }) {
    const { props } = usePage<{
        auth: {
            user: { id: number | string; email?: string | null } | null;
            roles?: string[];
        };
    }>();
    const { subdomain, isTenantDomain } = useSubdomain();
    const user = props.auth?.user ?? null;
    const isAdmin = props.auth?.roles?.includes('admin') ?? false;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Fetch tenant by subdomain (for subdomain-based access)
    const { data: tenantBySubdomain, isLoading: tenantBySubdomainLoading } =
        useTenant(subdomain);

    // Fetch current user's tenant (for checking onboarding status)
    const { data: userTenant, isLoading: userTenantLoading } =
        useCurrentUserTenant();

    // No longer redirect to onboarding - subdomain is auto-assigned
    // Users can change their subdomain in settings if needed

    const handleLogout = async () => {
        setMobileMenuOpen(false);
        router.post('/logout');
    };

    const isLoading =
        userTenantLoading || (isTenantDomain && tenantBySubdomainLoading);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // If accessing via subdomain and tenant not found, show 404
    if (
        isTenantDomain &&
        subdomain &&
        !tenantBySubdomain &&
        !tenantBySubdomainLoading
    ) {
        return <TenantNotFound subdomain={subdomain} />;
    }

    // Use the appropriate tenant based on access method
    const activeTenant = isTenantDomain ? tenantBySubdomain : userTenant;

    // Apply tenant branding if available
    const portalTitle = activeTenant?.company_name
        ? `${activeTenant.company_name} Portal`
        : 'Customer Portal';

    const userEmail = user?.email ?? 'guest@cynergists.ai';
    const userDisplayName = user?.email
        ? user.email.split('@')[0]
        : userEmail.split('@')[0];
    const portalTenant = activeTenant
        ? {
              ...activeTenant,
              onboarding_completed_at:
                  activeTenant.onboarding_completed_at ?? null,
          }
        : null;

    return (
        <TenantProvider
            tenant={portalTenant}
            isLoading={isLoading}
            isTenantDomain={isTenantDomain}
        >
            <PortalContext.Provider value={{ user, tenant: portalTenant }}>
                <Helmet>
                    <title>{portalTitle} | Cynergists</title>
                </Helmet>

                <div className="flex h-dvh flex-col overflow-hidden bg-background">
                    <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6 md:py-4">
                        <div className="min-w-0">
                            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                Customer Portal
                            </p>
                            <h1 className="truncate text-lg font-semibold text-foreground">
                                {activeTenant?.company_name ||
                                    'Customer Portal'}
                            </h1>
                            <p className="truncate text-xs text-muted-foreground">
                                {userEmail}
                            </p>
                        </div>

                        {/* Desktop nav */}
                        <div className="hidden items-center gap-3 md:flex">
                            <div className="text-right">
                                <p className="text-sm font-medium text-foreground">
                                    {userDisplayName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {userEmail}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                            >
                                <a href="/portal/account">
                                    <UserCircle className="mr-2 h-4 w-4" />
                                    Account
                                </a>
                            </Button>
                            {isAdmin && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <a href="/admin">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Admin
                                    </a>
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </header>

                    {/* Mobile menu Sheet */}
                    <Sheet
                        open={mobileMenuOpen}
                        onOpenChange={setMobileMenuOpen}
                    >
                        <SheetContent side="right" className="w-72">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-4 px-4">
                                <div className="rounded-lg border border-border bg-muted/50 p-3">
                                    <p className="text-sm font-medium text-foreground">
                                        {userDisplayName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {userEmail}
                                    </p>
                                </div>
                                <nav className="flex flex-col gap-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2"
                                        asChild
                                        onClick={() =>
                                            setMobileMenuOpen(false)
                                        }
                                    >
                                        <a href="/portal/account">
                                            <UserCircle className="h-4 w-4" />
                                            Account
                                        </a>
                                    </Button>
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2"
                                            asChild
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            <a href="/admin">
                                                <Shield className="h-4 w-4" />
                                                Admin
                                            </a>
                                        </Button>
                                    )}
                                </nav>
                                <div className="border-t border-border pt-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </PortalContext.Provider>
        </TenantProvider>
    );
}
