import { Lock } from "lucide-react";
import { ActivationChecklist } from "./ActivationChecklist";

interface ChecklistItem {
  label: string;
  completed: boolean;
  anchor?: string;
}

interface LockedPageStateProps {
  title: string;
  description: string;
  checklistItems: ChecklistItem[];
}

export function LockedPageState({ title, description, checklistItems }: LockedPageStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 text-left">
            Complete these steps to unlock this feature:
          </h3>
          <ActivationChecklist items={checklistItems} />
        </div>
      </div>
    </div>
  );
}
