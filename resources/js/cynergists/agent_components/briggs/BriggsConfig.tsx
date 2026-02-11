import { Award, BarChart3, GraduationCap } from 'lucide-react';

interface BriggsConfigProps {
    agentDetails: any;
}

export function BriggsConfig({ agentDetails }: BriggsConfigProps) {
    const briggsData = agentDetails?.briggs_data ?? null;
    const stats = briggsData?.user_stats;

    if (!stats || !stats.onboarding_completed) {
        return null;
    }

    const scoreColor =
        stats.average_score >= 75
            ? 'text-green-600'
            : stats.average_score >= 50
              ? 'text-yellow-600'
              : 'text-red-500';

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                            Training Active
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {stats.skill_level
                                ? `${stats.skill_level.charAt(0).toUpperCase() + stats.skill_level.slice(1)} Level`
                                : 'Getting started'}
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>{stats.total_sessions} sessions</span>
                    </div>
                    {stats.average_score !== null && (
                        <div
                            className={`flex items-center gap-1.5 text-xs font-medium ${scoreColor}`}
                        >
                            <Award className="h-3.5 w-3.5" />
                            <span>
                                Avg: {Number(stats.average_score).toFixed(0)}
                                /100
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
