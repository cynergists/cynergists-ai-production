import cynergistsLogo from '@/assets/cynergists-logo-new.png';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    FileBarChart,
    FlaskConical,
    HelpCircle,
    LayoutDashboard,
    Link as LinkIcon,
    Lock,
    LogOut,
    Megaphone,
    Settings,
    Users,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PartnerSidebarProps {
    status: 'pending' | 'active' | 'suspended' | null;
    partnerName: string;
    companyName?: string | null;
    partnerSlug?: string | null;
    onLogout: () => void;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    requiresActive?: boolean;
    suspendedOnly?: boolean;
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/partner', icon: LayoutDashboard },
    { label: 'Marketplace', href: '/partner/marketplace', icon: Briefcase },
    { label: 'Referrals', href: '/partner/referrals', icon: Users },
    { label: 'Deals', href: '/partner/deals', icon: Briefcase },
    { label: 'Commissions', href: '/partner/commissions', icon: DollarSign },
    {
        label: 'Payouts',
        href: '/partner/payouts',
        icon: Wallet,
        requiresActive: true,
    },
    { label: 'Marketing', href: '/partner/marketing', icon: Megaphone },
    {
        label: 'Reports',
        href: '/partner/reports',
        icon: FileBarChart,
        requiresActive: true,
    },
    { label: 'Beta', href: '/partner/beta', icon: FlaskConical },
    {
        label: 'Tickets',
        href: '/partner/tickets',
        icon: HelpCircle,
        suspendedOnly: true,
    },
    { label: 'Settings', href: '/partner/settings', icon: Settings },
];

export function PartnerSidebar({
    status,
    partnerName,
    companyName,
    partnerSlug,
    onLogout,
}: PartnerSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { url } = usePage();
    const pathname = url.split('?')[0];
    const isActive = status === 'active';
    const isSuspended = status === 'suspended';

    const handleCopyLink = () => {
        if (partnerSlug) {
            const url = `${window.location.origin}/p/${partnerSlug}`;
            navigator.clipboard.writeText(url);
            toast.success('Partner link copied to clipboard!');
        }
    };

    // Filter items for suspended partners
    const visibleItems = isSuspended
        ? navItems.filter(
              (item) => item.href === '/partner' || item.suspendedOnly,
          )
        : navItems;

    return (
        <aside
            className={cn(
                'flex h-full flex-col border-r border-border bg-card transition-all duration-300',
                isCollapsed ? 'w-16' : 'w-64',
            )}
        >
            {/* Logo */}
            <div className="flex items-center justify-between border-b border-border p-4">
                {!isCollapsed && (
                    <Link href="/partner" className="flex items-center gap-2">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="h-8 w-auto"
                        />
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Partner Info */}
            {!isCollapsed && (
                <div className="border-b border-border px-4 py-3">
                    <p className="truncate font-semibold text-foreground">
                        {partnerName}
                    </p>
                    {companyName && (
                        <p className="truncate text-sm text-muted-foreground">
                            {companyName}
                        </p>
                    )}
                    <div className="mt-2">
                        <span
                            className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                status === 'active' &&
                                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                                status === 'pending' &&
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                                status === 'suspended' &&
                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                            )}
                        >
                            {status?.charAt(0).toUpperCase()}
                            {status?.slice(1)}
                        </span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                    {visibleItems.map((item) => {
                        const isCurrentPath = pathname === item.href;
                        const isLocked = item.requiresActive && !isActive;
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                {isLocked ? (
                                    <div
                                        className={cn(
                                            'flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground opacity-50',
                                            isCollapsed && 'justify-center',
                                        )}
                                        title={
                                            isCollapsed
                                                ? `${item.label} (Active partners only)`
                                                : undefined
                                        }
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1">
                                                    {item.label}
                                                </span>
                                                <Lock className="h-3 w-3" />
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                                            isCurrentPath
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                            isCollapsed && 'justify-center',
                                        )}
                                        title={
                                            isCollapsed ? item.label : undefined
                                        }
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        {!isCollapsed && (
                                            <span>{item.label}</span>
                                        )}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Copy Link & Logout */}
            <div className="space-y-1 border-t border-border p-2">
                {!isCollapsed && partnerSlug && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={handleCopyLink}
                    >
                        <LinkIcon className="h-4 w-4" />
                        Copy Referral Link
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size={isCollapsed ? 'icon' : 'sm'}
                    className={cn(
                        'w-full',
                        !isCollapsed && 'justify-start gap-2',
                    )}
                    onClick={onLogout}
                >
                    <LogOut className="h-4 w-4" />
                    {!isCollapsed && 'Sign Out'}
                </Button>
            </div>
        </aside>
    );
}
