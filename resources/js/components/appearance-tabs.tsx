import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'inline-flex rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground',
                className,
            )}
            {...props}
        >
            Dark mode is enabled across the site.
        </div>
    );
}
