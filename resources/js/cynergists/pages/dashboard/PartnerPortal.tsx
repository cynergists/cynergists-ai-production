import cynergistsLogo from '@/assets/logos/cynergists-ai-full.webp';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    DollarSign,
    FileText,
    Loader2,
    LogOut,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

interface UserProfile {
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    status: string;
    roles: string[];
}

export default function PartnerPortal() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.visit('/signin');
                return;
            }

            const { data, error } = await supabase.rpc('get_user_profile', {
                _user_id: session.user.id,
            });

            if (error) {
                console.error('Error fetching profile:', error);
                router.visit('/signin');
                return;
            }

            if (data && data.length > 0) {
                const userProfile = data[0];

                // Check if user has partner role
                if (!userProfile.roles?.includes('partner')) {
                    router.visit('/dashboard');
                    return;
                }

                setProfile(userProfile);
            }

            setLoading(false);
        };

        fetchProfile();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.visit('/signin');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.visit('/signin');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isPending = profile?.status === 'pending';
    const hasClientRole = profile?.roles?.includes('client');

    return (
        <>
            <Helmet>
                <title>Partner Portal | Cynergists</title>
            </Helmet>

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b border-border bg-card">
                    <div className="container mx-auto flex items-center justify-between px-4 py-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={cynergistsLogo}
                                alt="Cynergists"
                                className="h-8 w-auto"
                            />
                            {hasClientRole && (
                                <div className="ml-4 flex items-center gap-2 border-l border-border pl-4">
                                    <span className="text-sm text-muted-foreground">
                                        Workspace:
                                    </span>
                                    <select
                                        className="rounded border border-border bg-input px-2 py-1 text-sm text-foreground"
                                        defaultValue="partner"
                                        onChange={(e) => {
                                            if (e.target.value === 'client') {
                                                router.visit('/dashboard');
                                            }
                                        }}
                                    >
                                        <option value="client">
                                            Client Workspace
                                        </option>
                                        <option value="partner">
                                            Partner Portal
                                        </option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </header>

                {/* Main content */}
                <main className="container mx-auto px-4 py-8">
                    {isPending ? (
                        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
                                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                                </div>
                            </div>
                            <h1 className="mb-4 text-2xl font-bold text-foreground">
                                Application Under Review
                            </h1>
                            <p className="mb-6 text-muted-foreground">
                                Thank you for applying to become a Cynergists
                                partner. Our team is currently reviewing your
                                application. You'll receive an email once your
                                application has been approved.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Have questions? Contact us at{' '}
                                <a
                                    href="mailto:partners@cynergists.com"
                                    className="text-primary hover:underline"
                                >
                                    partners@cynergists.com
                                </a>
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    Partner Portal
                                </h1>
                                <p className="text-muted-foreground">
                                    {profile?.company_name &&
                                        `${profile.company_name} | `}
                                    Manage referrals, track commissions, and
                                    access partner resources.
                                </p>
                            </div>

                            {/* Quick actions */}
                            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="cursor-pointer rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
                                    <Users className="mb-4 h-8 w-8 text-primary" />
                                    <h3 className="mb-1 font-semibold text-foreground">
                                        Referrals
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Submit and track referrals
                                    </p>
                                </div>
                                <div className="cursor-pointer rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
                                    <DollarSign className="mb-4 h-8 w-8 text-primary" />
                                    <h3 className="mb-1 font-semibold text-foreground">
                                        Commissions
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        View earnings and payouts
                                    </p>
                                </div>
                                <div className="cursor-pointer rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
                                    <BarChart3 className="mb-4 h-8 w-8 text-primary" />
                                    <h3 className="mb-1 font-semibold text-foreground">
                                        Analytics
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Performance metrics
                                    </p>
                                </div>
                                <div className="cursor-pointer rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
                                    <FileText className="mb-4 h-8 w-8 text-primary" />
                                    <h3 className="mb-1 font-semibold text-foreground">
                                        Resources
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Marketing materials
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <p className="mb-1 text-sm text-muted-foreground">
                                        Total Referrals
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        0
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <p className="mb-1 text-sm text-muted-foreground">
                                        Active Clients
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        0
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <p className="mb-1 text-sm text-muted-foreground">
                                        Total Earnings
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        $0
                                    </p>
                                </div>
                            </div>

                            {/* Content area */}
                            <div className="rounded-xl border border-border bg-card p-8">
                                <h2 className="mb-4 text-xl font-semibold text-foreground">
                                    Recent Activity
                                </h2>
                                <p className="text-muted-foreground">
                                    No recent activity to display.
                                </p>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </>
    );
}
