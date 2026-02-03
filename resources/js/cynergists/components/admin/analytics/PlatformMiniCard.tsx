import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PlatformMiniCardProps {
    name: string;
    icon: LucideIcon | (() => ReactNode);
    primaryMetric?: number | string;
    primaryLabel?: string;
    status: 'connected' | 'error' | 'not_configured';
    iconColor?: string;
}

export function PlatformMiniCard({
    name,
    icon: Icon,
    primaryMetric,
    primaryLabel,
    status,
    iconColor = 'text-muted-foreground',
}: PlatformMiniCardProps) {
    const formatMetric = (value: number | string | undefined) => {
        if (value === undefined) return '—';
        if (typeof value === 'string') return value;
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toLocaleString();
    };

    return (
        <Card className="p-4 transition-colors hover:bg-accent/50">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className={cn('rounded-lg bg-muted p-2', iconColor)}>
                        {typeof Icon === 'function' && !('$$typeof' in Icon) ? (
                            <Icon />
                        ) : (
                            <Icon className="h-4 w-4" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{name}</p>
                        {status === 'connected' ? (
                            <p className="text-lg font-bold">
                                {primaryLabel === 'Revenue'
                                    ? `$${formatMetric(primaryMetric)}`
                                    : formatMetric(primaryMetric)}
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Not configured
                            </p>
                        )}
                    </div>
                </div>
                <Badge
                    variant={status === 'connected' ? 'default' : 'secondary'}
                    className={cn(
                        'shrink-0 px-1.5 text-[10px]',
                        status === 'connected' &&
                            'bg-green-500/20 text-green-400 hover:bg-green-500/30',
                        status === 'error' && 'bg-red-500/20 text-red-400',
                        status === 'not_configured' &&
                            'bg-muted text-muted-foreground',
                    )}
                >
                    {status === 'connected'
                        ? 'Live'
                        : status === 'error'
                          ? 'Error'
                          : 'Setup'}
                </Badge>
            </div>
            {status === 'connected' && primaryLabel && (
                <p className="mt-1 ml-11 text-xs text-muted-foreground">
                    {primaryLabel}
                </p>
            )}
        </Card>
    );
}
