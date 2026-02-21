import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Building2, FileText, Settings, Shield, Users } from 'lucide-react';
import { Helmet } from 'react-helmet';

type AdminNavItem = {
    label: string;
    href: string;
    icon: typeof Users;
};

const adminNavItems: AdminNavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: BarChart3 },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Clients', href: '/admin/clients', icon: Building2 },
    { label: 'Sales Team', href: '/admin/sales', icon: Shield },
    { label: 'Contracts', href: '/admin/contracts', icon: FileText },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminIndex() {
    const { url } = usePage();
    const pathname = url.split('?')[0];

    const activeItem =
        adminNavItems.find((item) =>
            item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href),
        ) ?? adminNavItems[0];

    return (
        <>
            <Helmet>
                <title>Admin | Cynergists</title>
                <meta name="description" content="Cynergists admin portal" />
            </Helmet>

            <div className="min-h-screen bg-background">
                <div className="mx-auto flex w-full max-w-screen-2xl gap-6 px-4 py-6 sm:px-6 lg:px-12">
                    <aside className="hidden h-fit w-64 shrink-0 rounded-xl border border-border/50 bg-card/60 p-3 lg:block">
                        <p className="px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Admin
                        </p>
                        <nav className="mt-1 grid gap-1">
                            {adminNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    item.href === '/admin'
                                        ? pathname === '/admin'
                                        : pathname.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                            isActive
                                                ? 'bg-primary/15 text-primary'
                                                : 'text-foreground/75 hover:bg-muted/70 hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    <main className="flex-1 rounded-xl border border-border/50 bg-card/40 p-6">
                        <h1 className="text-2xl font-semibold text-foreground">
                            {activeItem.label}
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Admin is now running at <code>/admin</code> with the same global header
                            used across Marketplace, AI Agent Portal, and Sales Resources.
                        </p>
                    </main>
                </div>
            </div>
        </>
    );
}
