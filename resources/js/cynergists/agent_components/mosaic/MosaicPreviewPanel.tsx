import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Rocket } from 'lucide-react';

interface MosaicPreviewPanelProps {
    config?: any;
    state?: string;
    onApproveProduction?: () => void;
}

export function MosaicPreviewPanel({
    config,
    state,
    onApproveProduction,
}: MosaicPreviewPanelProps) {
    if (!config) {
        return (
            <Card className="rounded-2xl border border-primary/10 bg-muted/20 p-6">
                <h3 className="text-sm font-semibold text-foreground">
                    Preview Not Ready
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Complete onboarding to generate your preview. Current state:{' '}
                    {state ?? 'Not started'}.
                </p>
            </Card>
        );
    }

    const homePage = config.pages?.find((page: any) => page.slug === 'home');
    const hero = homePage?.sections?.find(
        (section: any) => section.type === 'hero',
    )?.content;

    return (
        <div className="space-y-4">
            <Card className="rounded-2xl border border-primary/10 bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Preview Snapshot
                </p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">
                    {hero?.headline ?? config.site?.name ?? 'Preview'}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    {hero?.subheadline ??
                        'Your hero copy will appear here once generated.'}
                </p>
                <div className="mt-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {hero?.primary_cta ??
                        config.site?.primary_cta ??
                        'Primary CTA'}
                </div>
            </Card>

            <Card className="rounded-2xl border border-primary/10 bg-card p-6">
                <h4 className="text-sm font-semibold text-foreground">
                    Deployment Status
                </h4>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <div>Environment: {config.deployment?.environment}</div>
                    <div>
                        Domain:{' '}
                        {config.site?.domain
                            ? config.site.domain
                            : 'Not set yet'}
                    </div>
                    <div>
                        Production Approved:{' '}
                        {config.deployment?.production_approved
                            ? 'Yes'
                            : 'No'}
                    </div>
                </div>

                {!config.deployment?.production_approved && (
                    <div className="mt-4 space-y-2">
                        <p className="text-xs text-muted-foreground">
                            Ready to go live? Approve this site for production
                            deployment.
                        </p>
                        <Button
                            onClick={onApproveProduction}
                            className="w-full gap-2"
                            disabled={!onApproveProduction}
                        >
                            <Rocket className="h-4 w-4" />
                            Approve Production
                        </Button>
                    </div>
                )}

                {config.deployment?.production_approved && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Production Approved
                        </span>
                    </div>
                )}
            </Card>
        </div>
    );
}
