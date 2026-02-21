import cynergistsLogo from '@/assets/logos/cynergists-ai-full.webp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router, usePage } from '@inertiajs/react';
import {
    Bell,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    Loader2,
    LogOut,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

interface UserProfile {
    first_name: string | null;
    last_name: string | null;
    email: string;
}

export default function EmployeePortal() {
    const { props } = usePage<{
        auth: {
            user: { id: number; name?: string; email: string } | null;
            roles: string[];
            profile: {
                first_name: string | null;
                last_name: string | null;
                email: string | null;
            } | null;
        };
    }>();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const user = props.auth?.user;
        const roles = props.auth?.roles ?? [];

        if (!user) {
            router.visit('/signin?redirect=/employee');
            return;
        }

        if (!roles.includes('employee')) {
            router.visit('/signin');
            return;
        }

        setIsAdmin(roles.includes('admin'));

        const profileData = props.auth?.profile;
        setProfile({
            first_name: profileData?.first_name ?? null,
            last_name: profileData?.last_name ?? null,
            email: profileData?.email ?? user.email,
        });

        setLoading(false);
    }, [props.auth]);

    const handleSignOut = () => {
        router.post(
            '/logout',
            {},
            {
                onFinish: () => {
                    router.visit('/signin');
                },
            },
        );
    };

    const handleGoToAdmin = () => {
        router.visit('/admin/dashboard');
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
        : 'Employee';

    return (
        <>
            <Helmet>
                <title>Employee Portal | Cynergists</title>
                <meta
                    name="description"
                    content="Access your employee dashboard, tasks, and company resources."
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
                            <Badge variant="secondary">Employee Portal</Badge>
                            {isAdmin && (
                                <Badge variant="default" className="bg-primary">
                                    Admin Access
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                Welcome, {displayName}
                            </span>
                            {isAdmin && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGoToAdmin}
                                >
                                    Admin Panel
                                </Button>
                            )}
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
                            Employee Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Access your tasks, schedule, and company resources.
                        </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Hours This Week
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    of 40 hours
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tasks Due
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    This week
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Upcoming Meetings
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    Scheduled
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Unread Announcements
                                </CardTitle>
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    New updates
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
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
                                    <Clock className="mr-2 h-4 w-4" />
                                    Log Hours
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Submit Request
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Update Profile
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Announcements */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Company Announcements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="py-8 text-center text-muted-foreground">
                                    <Bell className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                    <p>No announcements at this time.</p>
                                    <p className="text-sm">
                                        Check back later for updates.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* My Tasks */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>My Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="py-8 text-center text-muted-foreground">
                                <CheckCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p>No tasks assigned.</p>
                                <p className="text-sm">
                                    Your assigned tasks will appear here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resources */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Resources</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Button
                                    variant="outline"
                                    className="h-auto flex-col py-4"
                                >
                                    <FileText className="mb-2 h-6 w-6" />
                                    <span>Employee Handbook</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-auto flex-col py-4"
                                >
                                    <Calendar className="mb-2 h-6 w-6" />
                                    <span>Company Calendar</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-auto flex-col py-4"
                                >
                                    <User className="mb-2 h-6 w-6" />
                                    <span>Team Directory</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
