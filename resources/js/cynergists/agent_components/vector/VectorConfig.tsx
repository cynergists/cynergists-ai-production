import { DollarSign, Target, TrendingUp } from 'lucide-react';

interface VectorConfigProps {
    agentDetails: any;
}

export function VectorConfig({ agentDetails }: VectorConfigProps) {
    const vectorData = agentDetails?.vector_data ?? null;
    const performance = vectorData?.performance;

    if (!performance) {
        return null;
    }

    const roasColor =
        performance.roas >= 3
            ? 'text-green-600'
            : performance.roas >= 1.5
              ? 'text-yellow-600'
              : 'text-red-500';

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                            Ad Performance
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {vectorData?.active_campaigns ?? 0} active campaigns
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${roasColor}`}>
                        <Target className="h-3.5 w-3.5" />
                        <span>ROAS: {Number(performance.roas).toFixed(1)}x</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>${Number(performance.total_spend).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
