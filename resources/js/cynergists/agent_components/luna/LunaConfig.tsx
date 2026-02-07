import { ImageIcon, Sparkles, TrendingUp } from 'lucide-react';

interface LunaConfigProps {
    agentDetails?: any;
    setupProgress?: any;
    seoStats?: any;
}

export function LunaConfig({ agentDetails }: LunaConfigProps) {
    const lunaData = agentDetails?.luna_data || {};
    const stats = lunaData?.generation_stats || {
        total_images: 0,
        this_month: 0,
    };

    return (
        <div className="space-y-1.5 rounded-xl border border-amber-500/10 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                    Images Created
                </span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.total_images}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 px-1.5 py-1">
                    <div className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                            Total
                        </span>
                    </div>
                    <span className="text-sm font-semibold">
                        {stats.total_images}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 px-1.5 py-1">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                            This Month
                        </span>
                    </div>
                    <span className="text-sm font-semibold">
                        {stats.this_month}
                    </span>
                </div>
            </div>
            <div className="pt-1">
                <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Powered by Gemini</span>
                </div>
            </div>
        </div>
    );
}
