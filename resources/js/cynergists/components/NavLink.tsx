import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { forwardRef } from 'react';

interface NavLinkCompatProps extends Omit<
    React.ComponentProps<typeof Link>,
    'className' | 'href'
> {
    className?: string;
    activeClassName?: string;
    pendingClassName?: string;
    to?: string;
    href?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
    (
        { className, activeClassName, pendingClassName, href, to, ...props },
        ref,
    ) => {
        const { url } = usePage();
        const pathname = url.split('?')[0];
        const target = href ?? to;
        const isActive = target
            ? pathname === target || pathname.startsWith(`${target}/`)
            : false;

        return (
            <Link
                ref={ref}
                href={target ?? '#'}
                className={cn(
                    className,
                    isActive && activeClassName,
                    pendingClassName,
                )}
                {...props}
            />
        );
    },
);

NavLink.displayName = 'NavLink';

export { NavLink };
