import { cn } from '@/lib/utils';
import { DollarSign, Target } from 'lucide-react';

interface VectorConfigProps {
    agentDetails?: any;
}

export function VectorConfig({ agentDetails }: VectorConfigProps) {
    const vectorData = agentDetails?.vector_data || {};
    const metrics = vectorData?.metrics || {};

    const totalSpend = metrics.total_spend ?? null;
    const roas = metrics.roas ?? null;
    const activeCampaigns = metrics.active_campaigns ?? 0;

    return (
        <div className="space-y-1.5 rounded-xl border border-primary/10 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                    Campaign Performance
                </span>
                {roas !== null ? (
                    <span
                        className={cn(
                            'text-xl font-bold',
                            roas >= 3
                                ? 'text-green-600 dark:text-green-400'
                                : roas >= 1.5
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-red-600 dark:text-red-400',
                        )}
                    >
                        {roas}x ROAS
                    </span>
                ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                        No data yet
                    </span>
                )}
            </div>
            {roas !== null && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className={cn(
                            'h-full transition-all duration-300',
                            roas >= 3
                                ? 'bg-green-500'
                                : roas >= 1.5
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500',
                        )}
                        style={{
                            width: `${Math.min((roas / 5) * 100, 100)}%`,
                        }}
                    />
                </div>
            )}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 px-1.5 py-1">
                    <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                            Spend
                        </span>
                    </div>
                    <span className="text-sm font-semibold">
                        {totalSpend !== null
                            ? `$${Number(totalSpend).toLocaleString()}`
                            : '—'}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 px-1.5 py-1">
                    <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                            Campaigns
                        </span>
                    </div>
                    <span className="text-sm font-semibold">
                        {activeCampaigns}
                    </span>
                </div>
            </div>
        </div>
    );
}
