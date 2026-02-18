import { FileText, PenTool, Send } from 'lucide-react';

interface AetherConfigProps {
    agentDetails: any;
}

export function AetherConfig({ agentDetails }: AetherConfigProps) {
    const aetherData = agentDetails?.aether_data ?? null;
    const stats = aetherData?.pipeline_stats;

    if (!stats) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <PenTool className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                            Content Pipeline
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Blog content management
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{stats.drafts} drafts</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Send className="h-3.5 w-3.5" />
                        <span>{stats.published} published</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
