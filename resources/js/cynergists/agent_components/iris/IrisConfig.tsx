import { cn } from '@/lib/utils';
import { CircleCheck, Target } from 'lucide-react';

interface SetupStep {
    id: string;
    label: string;
    completed: boolean;
}

interface SetupProgress {
    completed: number;
    total: number;
    steps: SetupStep[];
}

interface IrisConfigProps {
    setupProgress: SetupProgress;
}

export function IrisConfig({ setupProgress }: IrisConfigProps) {
    return (
        <div className="space-y-1.5 rounded-xl border border-primary/10 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                    Setup Progress
                </span>
                <span className="text-xs text-muted-foreground">
                    {setupProgress.completed}/{setupProgress.total}
                </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                        width: `${(setupProgress.completed / setupProgress.total) * 100}%`,
                    }}
                />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
                {setupProgress.steps.map((step) => (
                    <div
                        key={step.id}
                        className={cn(
                            'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs',
                            step.completed
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : 'bg-muted/50 text-muted-foreground',
                        )}
                    >
                        {step.completed ? (
                            <CircleCheck className="h-3 w-3 text-green-500" />
                        ) : (
                            <Target className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className="truncate text-[11px]">
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
