import { Activity, ShieldCheck, Target, Users } from 'lucide-react';

interface SpecterConfigProps {
    agentDetails: any;
}

export function SpecterConfig({ agentDetails }: SpecterConfigProps) {
    const specterData = agentDetails?.specter_data ?? null;
    const metrics = specterData?.metrics;

    if (!metrics) {
        return null;
    }

    const resolutionRate = Number(metrics.resolution_rate ?? 0);
    const resolutionColor =
        resolutionRate >= 60
            ? 'text-green-600'
            : resolutionRate >= 30
              ? 'text-yellow-600'
              : 'text-red-500';

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                            Signal Overview
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Website intelligence and identity resolution metrics
                        </p>
                    </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{metrics.sessions_today ?? 0} sessions today</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Target className="h-3.5 w-3.5" />
                        <span>{metrics.high_intent_sessions ?? 0} high intent</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${resolutionColor}`}>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>{resolutionRate.toFixed(0)}% resolution</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Activity className="h-3.5 w-3.5" />
                        <span>Avg score {Number(metrics.avg_intent_score ?? 0).toFixed(0)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
