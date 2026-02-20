import { TenantProvider } from '@/components/portal/TenantProvider';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { BookOpen, Building2, ChevronDown, Loader2, LogOut, Menu, Palette, Shield, User, UserCircle } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Helmet } from 'react-helmet';
import cynergistsLogo from '../../assets/logos/cynergists-ai-full.webp';

export function PortalLayout({ children }: { children: ReactNode }) {
    const { props } = usePage<{
        auth: {
            user: { id: number | string; email?: string | null } | null;
            roles?: string[];
            profile?: {
                first_name?: string | null;
                last_name?: string | null;
            } | null;
        };
    }>();
    const { subdomain, isTenantDomain } = useSubdomain();
    const user = props.auth?.user ?? null;
    const isAdmin = props.auth?.roles?.includes('admin') ?? false;
    const isSalesRep = props.auth?.roles?.includes('sales_rep') ?? false;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Fetch tenant by subdomain (for subdomain-based access)
    const { data: tenantBySubdomain, isLoading: tenantBySubdomainLoading } =
        useTenant(subdomain);

    // Fetch current user's tenant (for checking onboarding status)
    const { data: userTenant, isLoading: userTenantLoading } =
        useCurrentUserTenant();

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
    const profile = props.auth?.profile;
    const userDisplayName = profile?.first_name
        ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
        : user?.email
          ? user.email.split('@')[0]
          : 'User';

    // Build avatar initials from profile name or email
    const avatarInitials = profile?.first_name
        ? `${profile.first_name[0]}${profile.last_name ? profile.last_name[0] : ''}`.toUpperCase()
        : (user?.email?.[0] ?? 'U').toUpperCase();

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
                        <div>
                            <img
                                src={cynergistsLogo}
                                alt="Company Logo"
                                className="h-24 object-contain"
                            />
                        </div>

                        {/* Desktop nav */}
                        <div className="hidden items-center gap-3 md:flex">
                            {/* Sales Reps see Sales Resources button */}
                            {isSalesRep && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <a href="/sales-rep">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Sales Resources
                                    </a>
                                </Button>
                            )}
                            {/* Admins see Admin button */}
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
                            {/* Account dropdown — all users */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                                            {avatarInitials}
                                        </div>
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium text-foreground">{userDisplayName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <a href="/portal/account/company" className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Company Profile
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href="/portal/brand-kit" className="flex items-center gap-2">
                                            <Palette className="h-4 w-4" />
                                            Brand Kit
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href="/portal/account/profile" className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            My Profile
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href="/portal/account" className="flex items-center gap-2">
                                            <UserCircle className="h-4 w-4" />
                                            My Account
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                                        {avatarInitials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {userDisplayName}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {userEmail}
                                        </p>
                                    </div>
                                </div>
                                <nav className="flex flex-col gap-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2"
                                        asChild
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <a href="/portal/account">
                                            <UserCircle className="h-4 w-4" />
                                            My Account
                                        </a>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2"
                                        asChild
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <a href="/portal/brand-kit">
                                            <Palette className="h-4 w-4" />
                                            Brand Kit
                                        </a>
                                    </Button>
                                    {isSalesRep && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2"
                                            asChild
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <a href="/sales-rep">
                                                <BookOpen className="h-4 w-4" />
                                                Sales Resources
                                            </a>
                                        </Button>
                                    )}
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2"
                                            asChild
                                            onClick={() => setMobileMenuOpen(false)}
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
