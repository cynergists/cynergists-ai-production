import { Eye, TrendingUp, Users } from 'lucide-react';

interface OptixConfigProps {
    agentDetails: any;
}

export function OptixConfig({ agentDetails }: OptixConfigProps) {
    const optixData = agentDetails?.optix_data ?? null;
    const stats = optixData?.channel_stats;

    if (!stats) {
        return null;
    }

    const formatNumber = (num: number): string => {
        if (num >= 1_000_000) {
            return `${(num / 1_000_000).toFixed(1)}M`;
        }
        if (num >= 1_000) {
            return `${(num / 1_000).toFixed(1)}K`;
        }
        return num.toString();
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                            Channel Overview
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            YouTube growth metrics
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{formatNumber(stats.subscribers)} subs</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{formatNumber(stats.total_views)} views</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
