import { LayoutTemplate, MonitorCheck, ShieldCheck } from 'lucide-react';

interface MosaicConfigProps {
    agentDetails: any;
}

export function MosaicConfig({ agentDetails }: MosaicConfigProps) {
    const progress = agentDetails?.mosaic_data?.progress || {
        completed: 0,
        total: 11,
        percent: 0,
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-primary/10 bg-muted/30 p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Onboarding Progress
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                            {progress.completed} of {progress.total} questions
                        </span>
                        <span className="font-semibold text-foreground">
                            {progress.percent}%
                        </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-sky-500 transition-all duration-300"
                            style={{ width: `${progress.percent}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-primary/10 bg-muted/30 p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Mosaic Build Status
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <LayoutTemplate className="h-4 w-4 text-sky-500" />
                            <span className="text-xs text-muted-foreground">
                                Blueprint
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                            {agentDetails?.mosaic_data?.config
                                ? 'Ready'
                                : 'Pending'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MonitorCheck className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs text-muted-foreground">
                                Preview
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                            {agentDetails?.mosaic_data?.config
                                ? 'Queued'
                                : 'Waiting'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-purple-500" />
                            <span className="text-xs text-muted-foreground">
                                Launch
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                            {agentDetails?.mosaic_data?.config
                                ?.deployment?.production_approved
                                ? 'Live'
                                : 'Locked'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-primary/10 bg-muted/30 p-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                    Project Details
                </h3>
                <div className="text-xs text-muted-foreground">
                    {agentDetails?.agent_name ?? 'Mosaic'} is gathering the
                    onboarding inputs needed to build your site.
                </div>
            </div>
        </div>
    );
}
