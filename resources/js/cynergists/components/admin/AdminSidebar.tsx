import cynergistsLogo from '@/assets/cynergists-logo-new.png';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    PermissionKey,
    useAdminPermissions,
} from '@/hooks/useAdminPermissions';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign,
    BarChart3,
    Bot,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Facebook,
    FileText,
    Globe,
    Handshake,
    Key,
    LayoutDashboard,
    LayoutGrid,
    Linkedin,
    LogOut,
    MousePointerClick,
    Music2,
    Search,
    Settings,
    ShieldCheck,
    Sliders,
    UserCog,
    UserSearch,
    Youtube,
} from 'lucide-react';
import { useState } from 'react';

interface AdminSidebarProps {
    onLogout: () => void;
}

interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    permissions?: PermissionKey[];
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const { url } = usePage();
    const pathname = url.split('?')[0];
    const { hasAnyPermission, isSuperAdmin, isLoading } = useAdminPermissions();

    // Check if current route is an analytics sub-route (not the main overview)
    const isAnalyticsSubRoute =
        location.pathname.startsWith('/admin/analytics/');

    // Initialize analytics open state based on current route, but allow manual toggle
    const [analyticsOpen, setAnalyticsOpen] = useState(isAnalyticsSubRoute);

    // Navigation items with required permissions
    const navItemsTop: NavItem[] = [
        {
            to: '/admin/ai-agents',
            label: 'AI Agents',
            icon: Bot,
            permissions: ['ai_agents.view'],
        },
        {
            to: '/admin/prospects',
            label: 'Prospects',
            icon: UserSearch,
            permissions: ['prospects.view_assigned', 'prospects.view_all'],
        },
        {
            to: '/admin/sales',
            label: 'Sales Team',
            icon: BadgeDollarSign,
            permissions: ['sales_team.view'],
        },
        {
            to: '/admin/employees',
            label: 'Employees',
            icon: UserCog,
            permissions: ['employees.view'],
        },
        {
            to: '/admin/partners',
            label: 'Partners',
            icon: Handshake,
            permissions: ['partners.view_directory'],
        },
        {
            to: '/admin/users',
            label: 'Users',
            icon: ShieldCheck,
            permissions: ['users.view'],
        },
        {
            to: '/admin/calendars',
            label: 'Calendars',
            icon: Calendar,
            permissions: ['calendars.view'],
        },
        {
            to: '/admin/payment-settings',
            label: 'Transactions',
            icon: Sliders,
            permissions: ['transactions.view'],
        },
        {
            to: '/admin/contracts',
            label: 'Contracts',
            icon: FileText,
            permissions: ['contracts.view_signed', 'contracts.view_templates'],
        },
    ];

    const navItemsBottom: NavItem[] = [
        {
            to: '/admin/settings',
            label: 'Settings',
            icon: Settings,
            permissions: ['settings.personal'],
        },
    ];

    const analyticsItems: NavItem[] = [
        {
            to: '/admin/analytics/website',
            label: 'Google Analytics',
            icon: Globe,
        },
        { to: '/admin/analytics/seo', label: 'SEO', icon: Search },
        { to: '/admin/analytics/youtube', label: 'YouTube', icon: Youtube },
        { to: '/admin/analytics/tiktok', label: 'TikTok', icon: Music2 },
        { to: '/admin/analytics/linkedin', label: 'LinkedIn', icon: Linkedin },
        { to: '/admin/analytics/meta', label: 'Meta', icon: Facebook },
        {
            to: '/admin/analytics/clarity',
            label: 'Microsoft Clarity',
            icon: MousePointerClick,
        },
        { to: '/admin/analytics/revenue', label: 'Square', icon: DollarSign },
    ];

    // Check if user has permission to see a nav item
    const canSeeItem = (item: NavItem): boolean => {
        if (isSuperAdmin) return true;
        if (!item.permissions || item.permissions.length === 0) return true;
        return hasAnyPermission(...item.permissions);
    };

    // Check if user can see analytics section
    const canSeeAnalytics = (): boolean => {
        if (isSuperAdmin) return true;
        return hasAnyPermission('analytics.view');
    };

    // Filter nav items based on permissions
    const visibleNavItemsTop = navItemsTop.filter(canSeeItem);
    const visibleNavItemsBottom = navItemsBottom.filter(canSeeItem);

    return (
        <aside
            className={cn(
                'bg-sidebar border-sidebar-border flex h-full shrink-0 flex-col overflow-hidden border-r transition-all duration-300',
                collapsed ? 'w-16' : 'w-52',
            )}
        >
            {/* Logo */}
            <div className="border-sidebar-border flex items-center justify-between border-b p-4">
                {!collapsed && (
                    <Link href="/">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="h-8 transition-opacity hover:opacity-80"
                        />
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="shrink-0"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-2">
                {/* Dashboard - Top Item (always visible for admins) */}
                <Link
                    href="/admin/dashboard"
                    className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        pathname === '/admin/dashboard' || pathname === '/admin'
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                    )}
                >
                    <LayoutDashboard className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Dashboard</span>}
                </Link>

                {/* Nav items - Top section */}
                {visibleNavItemsTop.map((item) => {
                    const isActive = pathname === item.to;
                    return (
                        <Link
                            key={item.to}
                            href={item.to}
                            className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}

                {/* Analytics Dropdown - only show if user has analytics permission */}
                {canSeeAnalytics() && (
                    <Collapsible
                        open={analyticsOpen}
                        onOpenChange={setAnalyticsOpen}
                    >
                        <CollapsibleTrigger asChild>
                            <button
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    isAnalyticsSubRoute
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                                )}
                            >
                                <BarChart3 className="h-5 w-5 shrink-0" />
                                {!collapsed && (
                                    <>
                                        <span className="flex-1 text-left">
                                            Analytics
                                        </span>
                                        <ChevronDown
                                            className={cn(
                                                'h-4 w-4 transition-transform',
                                                (analyticsOpen ||
                                                    isAnalyticsSubRoute) &&
                                                    'rotate-180',
                                            )}
                                        />
                                    </>
                                )}
                            </button>
                        </CollapsibleTrigger>
                        {!collapsed && (
                            <CollapsibleContent className="mt-1 space-y-1 pl-4">
                                {analyticsItems.map((item) => {
                                    const isActive = pathname === item.to;
                                    return (
                                        <Link
                                            key={item.to}
                                            href={item.to}
                                            className={cn(
                                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                                isActive
                                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                                            )}
                                        >
                                            <item.icon className="h-4 w-4 shrink-0" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </CollapsibleContent>
                        )}
                    </Collapsible>
                )}

                {/* Nav items - Bottom section (Settings) */}
                {visibleNavItemsBottom.map((item) => {
                    const isActive = pathname === item.to;
                    return (
                        <Link
                            key={item.to}
                            href={item.to}
                            className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}

                {/* Permissions - Super Admin only */}
                {isSuperAdmin && (
                    <Link
                        href="/admin/permissions"
                        className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            pathname === '/admin/permissions'
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                        )}
                    >
                        <Key className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Permissions</span>}
                    </Link>
                )}
            </nav>

            {/* Client Portal - Green Button */}
            <div className="space-y-1 p-2">
                <Link
                    href="/admin/client-portal"
                    className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        pathname.startsWith('/admin/client-portal')
                            ? 'bg-[#81C918] text-black'
                            : 'bg-[#81C918]/90 text-black hover:bg-[#81C918]',
                    )}
                >
                    <LayoutGrid className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Client Portal</span>}
                </Link>
                <Link
                    href="/admin/partner-portal"
                    className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        pathname.startsWith('/admin/partner-portal')
                            ? 'bg-[#81C918] text-black'
                            : 'bg-[#81C918]/90 text-black hover:bg-[#81C918]',
                    )}
                >
                    <Handshake className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Partner Portal</span>}
                </Link>
            </div>

            {/* Logout */}
            <div className="border-sidebar-border border-t p-2">
                <Button
                    variant="ghost"
                    onClick={onLogout}
                    className={cn(
                        'w-full justify-start gap-3 text-white hover:bg-white/10 hover:text-white',
                        collapsed && 'justify-center',
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </Button>
            </div>
        </aside>
    );
}
