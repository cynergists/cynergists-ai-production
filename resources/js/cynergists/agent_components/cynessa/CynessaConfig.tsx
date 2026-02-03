import { CircleCheck, Target } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

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

interface CynessaConfigProps {
  setupProgress: SetupProgress;
}

export function CynessaConfig({ setupProgress }: CynessaConfigProps) {
  return (
    <div className="space-y-1.5 p-3 bg-muted/30 border border-primary/10 rounded-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Setup Progress</span>
        <span className="text-xs text-muted-foreground">
          {setupProgress.completed}/{setupProgress.total}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(setupProgress.completed / setupProgress.total) * 100}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {setupProgress.steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-1 text-xs py-0.5 px-1.5 rounded-md",
              step.completed
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-muted/50 text-muted-foreground"
            )}
          >
            {step.completed ? (
              <CircleCheck className="h-3 w-3 text-green-500" />
            ) : (
              <Target className="h-3 w-3 text-muted-foreground" />
            )}
            <span className="truncate text-[11px]">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
