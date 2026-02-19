import { Card } from '@/components/ui/card';

interface MosaicBlueprintPanelProps {
    config?: any;
}

export function MosaicBlueprintPanel({ config }: MosaicBlueprintPanelProps) {
    if (!config) {
        return (
            <Card className="rounded-2xl border border-primary/10 bg-muted/20 p-6">
                <h3 className="text-sm font-semibold text-foreground">
                    Blueprint Not Ready
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Complete onboarding to generate your canonical JSON
                    configuration.
                </p>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl border border-primary/10 bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">
                Canonical JSON Configuration
            </h3>
            <div className="mt-3 max-h-[520px] overflow-auto rounded-xl border border-border-strong bg-background px-4 py-3 text-xs text-muted-foreground">
                <pre className="whitespace-pre-wrap">
                    {JSON.stringify(config, null, 2)}
                </pre>
            </div>
        </Card>
    );
}
