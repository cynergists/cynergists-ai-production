import cynergistsLogo from '@/assets/cynergists-logo-new.png';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminPrefetch } from '@/hooks/useAdminPrefetch';
import { Link, router, usePage } from '@inertiajs/react';
import { Clock, Loader2, Mail } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout({ children }: { children: ReactNode }) {
    const { props } = usePage<{
        auth: {
            user: { id: number; email: string } | null;
            roles: string[];
            profile: { status?: string | null } | null;
        };
    }>();
    const { toast } = useToast();
    const isAuthenticated = Boolean(props.auth?.user);
    const roles = props.auth?.roles ?? [];
    const isAdmin = roles.includes('admin');
    const isPending = props.auth?.profile?.status === 'pending';

    // Prefetch all admin data once authenticated - must be at top level
    useAdminPrefetch(isAdmin && !isPending);

    useEffect(() => {
        if (!isAuthenticated) {
            router.visit('/signin');
            return;
        }

        if (!isAdmin) {
            toast({
                title: 'Access Denied',
                description: 'You do not have admin privileges',
                variant: 'destructive',
            });
            router.visit('/signin');
        }
    }, [isAuthenticated, isAdmin, toast]);

    const handleLogout = async () => {
        router.post(
            '/logout',
            {},
            { onSuccess: () => router.visit('/signin') },
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Show pending approval message
    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
                    <div className="mb-6 flex justify-center">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="h-10"
                        />
                    </div>

                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>

                    <h1 className="mb-2 text-2xl font-bold text-foreground">
                        Admin Access Pending
                    </h1>

                    <p className="mb-6 text-muted-foreground">
                        Your account has been created and your admin access
                        request has been submitted. An administrator will review
                        your request shortly.
                    </p>

                    <div className="mb-6 rounded-lg bg-muted/50 p-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>You'll receive an email once approved</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleLogout}
                        >
                            Sign Out
                        </Button>
                        <Link href="/" className="block">
                            <Button variant="ghost" className="w-full">
                                Return to Homepage
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <AdminSidebar onLogout={handleLogout} />
            <main className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
