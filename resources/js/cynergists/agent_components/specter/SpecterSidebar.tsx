import { AgentQuickLinks } from '@/components/portal/AgentQuickLinks';
import { Button } from '@/components/ui/button';
import {
    Activity,
    Building2,
    ChevronRight,
    ShieldCheck,
    Target,
    Timer,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface SpecterSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    agentDetails?: any;
}

export default function SpecterSidebar({
    activeView,
    setActiveView,
    agentDetails,
}: SpecterSidebarProps) {
    const specterData = agentDetails?.specter_data ?? null;
    const metrics = specterData?.metrics ?? {};
    const topSignals: string[] = specterData?.top_signals ?? [];

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Quick Links
                </h2>
                <AgentQuickLinks activeView={activeView} setActiveView={setActiveView} />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Live Signals
                </h2>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        <MetricRow
                            icon={<Activity className="h-4 w-4 text-primary" />}
                            label="Sessions Today"
                            value={(metrics.sessions_today ?? 0).toString()}
                        />
                        <MetricRow
                            icon={<Target className="h-4 w-4 text-primary" />}
                            label="High Intent"
                            value={(metrics.high_intent_sessions ?? 0).toString()}
                        />
                        <MetricRow
                            icon={<Building2 className="h-4 w-4 text-primary" />}
                            label="Resolved Companies"
                            value={(metrics.resolved_companies ?? 0).toString()}
                        />
                        <MetricRow
                            icon={<Timer className="h-4 w-4 text-primary" />}
                            label="Avg Processing"
                            value={`${metrics.avg_processing_seconds ?? '—'}s`}
                        />
                        <MetricRow
                            icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                            label="Consent Compliance"
                            value={`${metrics.consent_compliant_rate ?? 100}%`}
                        />
                    </div>

                    <div className="mt-4 border-t border-primary/20 pt-4">
                        <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                            Top Signals
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {(topSignals.length > 0
                                ? topSignals
                                : ['Pricing Viewed', 'Demo Page Dwell', 'Form Started']
                            ).map((signal) => (
                                <span
                                    key={signal}
                                    className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                                >
                                    {signal}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 border-t border-primary/20 pt-4">
                    <Button
                        variant="outline"
                        className="h-9 w-full gap-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setActiveView('signals')}
                    >
                        Review Signal Rules
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function MetricRow({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {icon}
                </div>
                <span className="text-sm text-foreground">{label}</span>
            </div>
            <span className="text-lg font-semibold text-foreground">{value}</span>
        </div>
    );
}
