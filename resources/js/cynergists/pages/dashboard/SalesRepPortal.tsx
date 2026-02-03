import cynergistsLogo from '@/assets/cynergists-logo-new.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { router } from '@inertiajs/react';
import {
    Calendar,
    DollarSign,
    Loader2,
    LogOut,
    Mail,
    Phone,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

interface UserProfile {
    first_name: string | null;
    last_name: string | null;
    email: string;
}

export default function SalesRepPortal() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);

    const checkAuthAndLoadData = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.visit('/signin');
                return;
            }

            // Check if user has sales_rep role
            const { data: hasRole } = await supabase.rpc('has_role', {
                _user_id: session.user.id,
                _role: 'sales_rep',
            });

            if (!hasRole) {
                router.visit('/signin');
                return;
            }

            // Fetch profile data
            const { data: profileData } = await supabase.rpc(
                'get_user_profile',
                {
                    _user_id: session.user.id,
                },
            );

            if (profileData && profileData.length > 0) {
                setProfile(profileData[0]);
            }
        } catch (error) {
            console.error('Error loading sales rep portal:', error);
            router.visit('/signin');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
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

    const displayName = profile?.first_name
        ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
        : 'Sales Rep';

    return (
        <>
            <Helmet>
                <title>Sales Rep Portal | Cynergists</title>
                <meta
                    name="description"
                    content="Access your sales dashboard, track prospects, and manage your pipeline."
                />
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
                            <Badge variant="secondary">Sales Rep Portal</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                Welcome, {displayName}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-bold text-foreground">
                            Sales Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Track your prospects, clients, and performance
                            metrics.
                        </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Prospects
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
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
                                <div className="text-2xl font-bold">0</div>
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
                                <div className="text-2xl font-bold">$0</div>
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
                                <div className="text-2xl font-bold">$0</div>
                                <p className="text-xs text-muted-foreground">
                                    This month
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions & Pipeline */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <Phone className="mr-2 h-4 w-4" />
                                    Log a Call
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Schedule Meeting
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Prospects */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Your Prospects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="py-8 text-center text-muted-foreground">
                                    <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                    <p>No prospects assigned yet.</p>
                                    <p className="text-sm">
                                        Contact your manager to get started.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming Tasks */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Upcoming Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="py-8 text-center text-muted-foreground">
                                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p>No upcoming tasks.</p>
                                <p className="text-sm">
                                    Your scheduled activities will appear here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
