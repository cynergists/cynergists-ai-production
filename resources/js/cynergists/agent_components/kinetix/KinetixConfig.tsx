import { Film, Gauge, Video } from 'lucide-react';

interface KinetixConfigProps {
    agentDetails: any;
}

export function KinetixConfig({ agentDetails }: KinetixConfigProps) {
    const kinetixData = agentDetails?.kinetix_data ?? null;
    const usage = kinetixData?.usage;
    const brand = kinetixData?.brand;

    if (!usage) {
        return null;
    }

    const remaining = Math.max(0, usage.monthly_limit - usage.current_usage);
    const usagePercent = usage.monthly_limit > 0
        ? Math.min(100, Math.round((usage.current_usage / usage.monthly_limit) * 100))
        : 0;

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Film className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                            Video Generation
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {brand?.brand_name || 'Brand'} &middot; {brand?.style_preset || 'Modern'}
                        </p>
                    </div>
                </div>
                <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Monthly Usage</span>
                        <span className="font-medium">{usage.current_usage}/{usage.monthly_limit}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Video className="h-3.5 w-3.5" />
                            <span>{remaining} remaining</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Gauge className="h-3.5 w-3.5" />
                            <span>{brand?.default_duration || 30}s default</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
