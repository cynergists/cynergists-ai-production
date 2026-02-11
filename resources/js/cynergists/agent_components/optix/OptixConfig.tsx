import { cn } from '@/lib/utils';
import { Film, Lightbulb, TrendingUp, Youtube } from 'lucide-react';

interface OptixConfigProps {
    agentDetails?: any;
}

export function OptixConfig({ agentDetails }: OptixConfigProps) {
    const channelData = agentDetails?.optix_data?.channel_stats || {
        total_ideas: 0,
        videos_packaged: 0,
        avg_score: null,
    };

    const hasScore = channelData.avg_score !== null;

    return (
        <div className="space-y-1.5 rounded-xl border border-red-500/10 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                    Content Pipeline
                </span>
                <Youtube className="h-4 w-4 text-red-600" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 px-1.5 py-1">
                    <div className="flex items-center gap-1">
                        <Lightbulb className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Ideas</span>
                    </div>
                    <span className="text-sm font-semibold">{channelData.total_ideas}</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 px-1.5 py-1">
                    <div className="flex items-center gap-1">
                        <Film className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Packaged</span>
                    </div>
                    <span className="text-sm font-semibold">{channelData.videos_packaged}</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 px-1.5 py-1">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Avg Score</span>
                    </div>
                    <span className={cn('text-sm font-semibold', hasScore ? 'text-red-600' : '')}>
                        {hasScore ? channelData.avg_score : '—'}
                    </span>
                </div>
            </div>
        </div>
    );
}
