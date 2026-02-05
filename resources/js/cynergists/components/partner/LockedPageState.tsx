import { Lock } from 'lucide-react';
import { ActivationChecklist } from './ActivationChecklist';

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

export function LockedPageState({
    title,
    description,
    checklistItems,
}: LockedPageStateProps) {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
            <div className="w-full max-w-md space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-4 text-left text-sm font-medium text-muted-foreground">
                        Complete these steps to unlock this feature:
                    </h3>
                    <ActivationChecklist items={checklistItems} />
                </div>
            </div>
        </div>
    );
}
