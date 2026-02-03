import { Calendar, Target, TrendingUp } from 'lucide-react';

interface ApexConfigProps {
    agentDetails: any;
}

export function ApexConfig({ agentDetails }: ApexConfigProps) {
    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-primary/10 bg-muted/30 p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Growth Metrics
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-muted-foreground">
                                Revenue Growth
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                            --
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-muted-foreground">
                                Active Campaigns
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                            0
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span className="text-xs text-muted-foreground">
                                Next Review
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                            --
                        </span>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-primary/10 bg-muted/30 p-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                    Quick Actions
                </h3>
                <div className="space-y-2">
                    <button className="w-full rounded-lg bg-background px-3 py-2 text-left text-xs transition-colors hover:bg-muted">
                        View Growth Report
                    </button>
                    <button className="w-full rounded-lg bg-background px-3 py-2 text-left text-xs transition-colors hover:bg-muted">
                        Schedule Strategy Call
                    </button>
                    <button className="w-full rounded-lg bg-background px-3 py-2 text-left text-xs transition-colors hover:bg-muted">
                        Analyze Competitors
                    </button>
                </div>
            </div>
        </div>
    );
}
