import { AgentQuickLinks } from '@/components/portal/AgentQuickLinks';
import { Button } from '@/components/ui/button';
import { BarChart3, DollarSign, Target, TrendingUp } from 'lucide-react';

interface VectorSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    agentDetails?: any;
}

export default function VectorSidebar({
    activeView,
    setActiveView,
    agentDetails,
}: VectorSidebarProps) {
    const vectorData = agentDetails?.vector_data ?? null;
    const performance = vectorData?.performance;
    const platforms = vectorData?.platforms ?? [];

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Quick Links */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Quick Links
                </h2>
                <AgentQuickLinks activeView={activeView} setActiveView={setActiveView} />
            </div>

            {/* Performance & Platforms */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Performance
                </h2>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Target className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    ROAS
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {performance?.roas
                                    ? `${Number(performance.roas).toFixed(1)}x`
                                    : '—'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Total Spend
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {performance?.total_spend
                                    ? `$${Number(performance.total_spend).toLocaleString()}`
                                    : '—'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Conversions
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {performance?.conversions ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Active Platforms */}
                    {platforms.length > 0 && (
                        <div className="mt-4 border-t border-primary/20 pt-4">
                            <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                                Active Platforms
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {platforms.map((platform: string) => (
                                    <span
                                        key={platform}
                                        className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                                    >
                                        {platform}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="shrink-0 border-t border-primary/20 pt-4">
                    <Button
                        variant="outline"
                        className="h-9 w-full gap-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setActiveView('analytics')}
                    >
                        <BarChart3 className="h-4 w-4" />
                        View Full Analytics
                    </Button>
                </div>
            </div>
        </div>
    );
}
