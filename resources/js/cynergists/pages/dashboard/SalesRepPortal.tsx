import cynergistsLogo from '@/assets/logos/cynergists-ai-full.webp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Building2,
    ChevronDown,
    DollarSign,
    ExternalLink,
    LogOut,
    MessageSquare,
    Target,
    TrendingUp,
    User,
    UserCircle,
    Users,
} from 'lucide-react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface AuthUser {
    id: number | string;
    email?: string | null;
}

interface AuthProfile {
    first_name?: string | null;
    last_name?: string | null;
    company_name?: string | null;
}

interface PageProps {
    auth: {
        user: AuthUser | null;
        roles?: string[];
        profile?: AuthProfile | null;
    };
}

export default function SalesRepPortal() {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user ?? null;
    const roles = props.auth?.roles ?? [];
    const profile = props.auth?.profile;
    const isSalesRep = roles.includes('sales_rep');
    const isAdmin = roles.includes('admin');

    // Redirect if not authenticated or not a sales rep / admin
    useEffect(() => {
        if (!user) {
            router.visit('/login');
            return;
        }
        if (!isSalesRep && !isAdmin) {
            router.visit('/portal');
        }
    }, [user, isSalesRep, isAdmin]);

    const handleLogout = () => {
        router.post('/logout');
    };

    const displayName = profile?.first_name
        ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
        : user?.email
          ? user.email.split('@')[0]
          : 'Sales Rep';

    const userEmail = user?.email ?? '';
    const avatarInitials = profile?.first_name
        ? `${profile.first_name[0]}${profile.last_name ? profile.last_name[0] : ''}`.toUpperCase()
        : (user?.email?.[0] ?? 'S').toUpperCase();

    if (!user || (!isSalesRep && !isAdmin)) {
        return null;
    }

    return (
        <>
            <Helmet>
                <title>Sales Rep Portal | Cynergists</title>
            </Helmet>

            <div className="flex h-dvh flex-col overflow-hidden bg-background">
                {/* Header */}
                <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6 md:py-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="h-24 object-contain"
                        />
                        <Badge variant="secondary" className="hidden md:inline-flex">
                            Sales Rep Portal
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <Button variant="outline" size="sm" asChild>
                                <a href="/admin">
                                    Admin
                                </a>
                            </Button>
                        )}
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
                                    <p className="text-sm font-medium text-foreground">{displayName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <a href="/portal/account/profile" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        My Profile
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href="/portal" className="flex items-center gap-2">
                                        <UserCircle className="h-4 w-4" />
                                        Client Portal
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
                </header>

                {/* Main layout */}
                <div className="flex min-h-0 flex-1 gap-6 overflow-hidden p-6">
                    {/* Sidebar */}
                    <aside className="hidden w-64 shrink-0 flex-col gap-4 lg:flex">
                        {/* Quick Access Links */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    Quick Access
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                    asChild
                                >
                                    <a
                                        href="https://app.gohighlevel.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        GoHighLevel (GHL)
                                    </a>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                    asChild
                                >
                                    <a
                                        href="https://cynergists.idevaffiliate.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        Commissions Dashboard
                                    </a>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                    asChild
                                >
                                    <a
                                        href="https://app.gohighlevel.com/contacts"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Users className="h-4 w-4" />
                                        Lead Management
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Attribution */}
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Attribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-3 text-xs text-muted-foreground">
                                    Your affiliate link tracks all referred clients for commission attribution.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-2"
                                    asChild
                                >
                                    <a
                                        href="https://cynergists.idevaffiliate.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        iDevAffiliate Portal
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main content */}
                    <ScrollArea className="flex-1">
                        <div className="space-y-6">
                            {/* Welcome */}
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Welcome back, {profile?.first_name ?? displayName}
                                </h1>
                                <p className="text-muted-foreground">
                                    Here's your sales overview for today.
                                </p>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Active Prospects
                                        </CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">—</div>
                                        <p className="text-xs text-muted-foreground">
                                            In your pipeline
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Closed This Month
                                        </CardTitle>
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">—</div>
                                        <p className="text-xs text-muted-foreground">
                                            Deals closed
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Revenue Generated
                                        </CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">—</div>
                                        <p className="text-xs text-muted-foreground">
                                            This month
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Commission Earned
                                        </CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">—</div>
                                        <p className="text-xs text-muted-foreground">
                                            This month
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Client Accounts + Performance */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {/* Client Accounts */}
                                <Card className="lg:col-span-2">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-primary" />
                                            Client Accounts
                                        </CardTitle>
                                        <Badge variant="outline" className="text-xs">
                                            Assigned
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="py-8 text-center text-muted-foreground">
                                            <Building2 className="mx-auto mb-3 h-10 w-10 opacity-30" />
                                            <p className="text-sm font-medium">No accounts assigned yet</p>
                                            <p className="mt-1 text-xs">
                                                Contact your manager to get accounts assigned to your portfolio.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Performance */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-primary" />
                                            Performance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Quota Attainment</span>
                                            <span className="font-medium">—</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Win Rate</span>
                                            <span className="font-medium">—</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Avg Deal Size</span>
                                            <span className="font-medium">—</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 w-full gap-2"
                                            asChild
                                        >
                                            <a
                                                href="https://cynergists.idevaffiliate.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Full Report
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Team Chat — Coming Soon */}
                            <Card className="border-dashed">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                        Team Chat
                                        <Badge variant="secondary" className="ml-auto text-xs">
                                            Coming Soon
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        A private internal chat for Sales Reps and authorized staff. Supports 1:1 messages,
                                        group channels, and real-time notifications — fully isolated from client data.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </>
    );
}
