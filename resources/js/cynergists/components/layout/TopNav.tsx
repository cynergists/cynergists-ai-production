import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';

type AuthUser = {
    id: number | string;
} | null;

type TopNavProps = {
    className?: string;
};

function getCurrentSection(pathname: string): 'marketplace' | 'portal' | 'sales' | 'admin' | null {
    if (pathname === '/marketplace' || pathname.startsWith('/marketplace/')) {
        return 'marketplace';
    }

    if (pathname === '/portal' || pathname.startsWith('/portal/')) {
        return 'portal';
    }

    if (
        pathname === '/sales' ||
        pathname.startsWith('/sales/') ||
        pathname === '/sales-rep' ||
        pathname.startsWith('/sales-rep/')
    ) {
        return 'sales';
    }

    if (
        pathname === '/admin' ||
        pathname.startsWith('/admin/') ||
        pathname === '/filament' ||
        pathname.startsWith('/filament/')
    ) {
        return 'admin';
    }

    return null;
}

export default function TopNav({ className = '' }: TopNavProps) {
    const { url, props } = usePage<{
        auth?: {
            user?: AuthUser;
            roles?: string[];
        };
    }>();

    const user = props.auth?.user ?? null;
    const roles = props.auth?.roles ?? [];

    if (!user) {
        return null;
    }

    const pathname = url.split('?')[0];
    const currentSection = getCurrentSection(pathname);
    const hasSalesAccess = roles.includes('sales_rep') || roles.includes('admin');
    const isAdmin = roles.includes('admin');

    const items: Array<{ key: string; label: string; href: string }> = [];

    if (currentSection !== 'marketplace') {
        items.push({ key: 'marketplace', label: 'Marketplace', href: '/marketplace' });
    }

    items.push({ key: 'portal', label: 'AI Agent Portal', href: '/portal' });

    if (hasSalesAccess) {
        items.push({ key: 'sales', label: 'Sales Resources', href: '/sales' });
    }

    if (isAdmin) {
        items.push({ key: 'admin', label: 'Admin', href: '/admin' });
    }

    if (items.length === 0) {
        return null;
    }

    return (
        <div className={`glass border-b border-border/40 ${className}`.trim()}>
            <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-12">
                {items.map((item) => (
                    <Button
                        key={item.key}
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-foreground/70 hover:bg-muted/80 hover:text-foreground"
                        asChild
                    >
                        <Link href={item.href}>{item.label}</Link>
                    </Button>
                ))}
            </div>
        </div>
    );
}
