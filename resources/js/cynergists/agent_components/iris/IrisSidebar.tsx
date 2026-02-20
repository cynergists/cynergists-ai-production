import { AgentQuickLinks } from '@/components/portal/AgentQuickLinks';
import { cn } from '@/lib/utils';
import { CircleCheck, Sparkles, Target } from 'lucide-react';

interface IrisSidebarProps {
    agentDetails: any;
    activeView?: string;
    setActiveView?: (view: string) => void;
    setupProgress: {
        completed: number;
        total: number;
        steps: Array<{ id: string; label: string; completed: boolean }>;
    };
}

export default function IrisSidebar({
    activeView,
    setActiveView,
    setupProgress,
}: IrisSidebarProps) {
    const percentComplete =
        setupProgress.total > 0
            ? Math.round((setupProgress.completed / setupProgress.total) * 100)
            : 0;

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Quick Links */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Quick Links
                </h2>
                <AgentQuickLinks
                    activeView={activeView ?? 'chat'}
                    setActiveView={setActiveView ?? (() => {})}
                />
            </div>

            {/* Onboarding Progress */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Brand Kit Setup
                </h2>
                <p className="mb-4 text-xs text-muted-foreground">
                    Complete these steps to unlock all agents.
                </p>
                <div className="space-y-2">
                    {setupProgress.steps.map((step) => (
                        <div
                            key={step.id}
                            className={cn(
                                'flex items-center gap-3 rounded-lg p-2.5',
                                step.completed ? 'bg-green-500/10' : 'bg-muted/30',
                            )}
                        >
                            {step.completed ? (
                                <CircleCheck className="h-4 w-4 shrink-0 text-green-500" />
                            ) : (
                                <Target className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span
                                className={cn(
                                    'text-sm',
                                    step.completed
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 border-t border-primary/20 pt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{percentComplete}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${percentComplete}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
