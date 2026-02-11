import { cn } from '@/lib/utils';
import { BarChart3, CircleCheck, Globe } from 'lucide-react';

interface SeoMetric {
    id: string;
    label: string;
    value: number | string;
    status?: 'good' | 'warning' | 'poor';
}

interface SeoStats {
    healthScore: number | null;
    totalSites: number;
    activeAudits: number;
    metrics: SeoMetric[];
}

interface CarbonConfigProps {
    seoStats?: SeoStats;
    setupProgress?: any;
    agentDetails?: any;
}

export function CarbonConfig({ seoStats }: CarbonConfigProps) {
    const stats = seoStats || {
        healthScore: null,
        totalSites: 0,
        activeAudits: 0,
        metrics: [],
    };

    const hasHealthScore = stats.healthScore !== null;
    const score = stats.healthScore ?? 0;

    const getHealthColor = (value: number) => {
        if (value >= 80) return 'text-green-600 dark:text-green-400';
        if (value >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="space-y-1.5 rounded-xl border border-green-500/10 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                    SEO Health Score
                </span>
                {hasHealthScore ? (
                    <span className={cn('text-xl font-bold', getHealthColor(score))}>
                        {score}%
                    </span>
                ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                        No audits yet
                    </span>
                )}
            </div>
            {hasHealthScore ? (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className={cn(
                            'h-full transition-all duration-300',
                            score >= 80 ? 'bg-green-500' :
                            score >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                        )}
                        style={{ width: `${score}%` }}
                    />
                </div>
            ) : (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" />
            )}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 px-1.5 py-1">
                    <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Sites</span>
                    </div>
                    <span className="text-sm font-semibold">{stats.totalSites}</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 px-1.5 py-1">
                    <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Active</span>
                    </div>
                    <span className="text-sm font-semibold">{stats.activeAudits}</span>
                </div>
            </div>
            {stats.metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                    {stats.metrics.map((metric) => (
                        <div
                            key={metric.id}
                            className={cn(
                                'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs',
                                metric.status === 'good'
                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                    : metric.status === 'warning'
                                    ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                    : metric.status === 'poor'
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                    : 'bg-muted/50 text-muted-foreground',
                            )}
                        >
                            {metric.status === 'good' && (
                                <CircleCheck className="h-3 w-3 text-green-500" />
                            )}
                            <span className="truncate text-[11px]">
                                {metric.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
