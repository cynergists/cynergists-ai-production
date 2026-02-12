import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Activity,
    BarChart3,
    DollarSign,
    Target,
    TrendingDown,
    TrendingUp,
    Zap,
} from 'lucide-react';

interface VectorSidebarProps {
    agentDetails: any;
    activeView?: string;
    setActiveView?: (view: string) => void;
}

export default function VectorSidebar({
    agentDetails,
}: VectorSidebarProps) {
    const vectorData = agentDetails?.vector_data || {};
    const metrics = vectorData?.metrics || {};
    const recentActions = vectorData?.recent_actions || [];
    const platforms = vectorData?.platforms || [];

    const totalSpend = metrics.total_spend ?? null;
    const roas = metrics.roas ?? null;
    const cpa = metrics.cpa ?? null;
    const conversions = metrics.conversions ?? null;

    const getRoasColor = (value: number) => {
        if (value >= 3) return 'text-green-600';
        if (value >= 1.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Performance Overview */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Performance
                    </h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                ROAS
                            </span>
                        </div>
                        {roas !== null ? (
                            <div className="flex items-baseline gap-2">
                                <p
                                    className={`text-2xl font-bold ${getRoasColor(roas)}`}
                                >
                                    {roas}x
                                </p>
                                <span className="text-xs text-muted-foreground">
                                    Rolling 7d
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No data yet
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Total Spend
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {totalSpend !== null
                                ? `$${Number(totalSpend).toLocaleString()}`
                                : 'No spend tracked'}
                        </p>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                CPA
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {cpa !== null ? `$${cpa}` : 'No data'}
                        </p>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Conversions
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {conversions !== null
                                ? Number(conversions).toLocaleString()
                                : 'No data'}
                        </p>
                    </div>
                </div>

                {platforms.length > 0 && (
                    <div className="mt-4 border-t border-primary/20 pt-4">
                        <div className="mb-2 text-xs text-muted-foreground">
                            Active Platforms
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {platforms.map((platform: string) => (
                                <span
                                    key={platform}
                                    className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                                >
                                    {platform}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Agent Actions */}
            <div className="flex max-h-[400px] flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Actions
                </h2>

                <ScrollArea className="max-h-[320px] flex-1">
                    {recentActions.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No actions yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentActions.map(
                                (action: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 rounded-lg border border-primary/10 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                            {action.type ===
                                            'budget_increase' ? (
                                                <TrendingUp className="h-5 w-5 text-green-500" />
                                            ) : action.type ===
                                              'budget_decrease' ? (
                                                <TrendingDown className="h-5 w-5 text-red-500" />
                                            ) : (
                                                <Zap className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {action.description ||
                                                    action.type}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {action.status} •{' '}
                                                {action.date || 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
