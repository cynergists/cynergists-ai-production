import { ScrollArea } from '@/components/ui/scroll-area';
import {
    BarChart3,
    Film,
    Lightbulb,
    Target,
    TrendingUp,
    Youtube,
} from 'lucide-react';

interface OptixSidebarProps {
    agentDetails: any;
}

export default function OptixSidebar({ agentDetails }: OptixSidebarProps) {
    const optixData = agentDetails?.optix_data || {};
    const channelStats = optixData?.channel_stats || {};
    const recentIdeas = optixData?.recent_ideas || [];
    const contentPillars = optixData?.content_pillars || [];

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Channel Stats */}
            <div className="flex flex-col rounded-2xl border border-red-500/20 bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Youtube className="h-5 w-5 text-red-600" />
                    Channel Studio
                </h2>

                <div className="space-y-4">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Idea Backlog
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                            {channelStats?.total_ideas || 0}
                        </p>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Film className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Videos Packaged
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {channelStats?.videos_packaged || 0} ready to produce
                        </p>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Avg Idea Score
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {channelStats?.avg_score ? `${channelStats.avg_score}/5.0` : 'No scores yet'}
                        </p>
                    </div>
                </div>

                {/* Content Pillars */}
                {contentPillars.length > 0 && (
                    <div className="mt-4 border-t border-red-500/20 pt-4">
                        <div className="mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground uppercase">
                                Content Pillars
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {contentPillars.map((pillar: string, index: number) => (
                                <span
                                    key={index}
                                    className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600"
                                >
                                    {pillar}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Ideas */}
            <div className="flex max-h-[400px] flex-col overflow-hidden rounded-2xl border border-red-500/20 bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                    Top Ideas
                </h2>

                <ScrollArea className="max-h-[320px] flex-1">
                    {recentIdeas.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No ideas generated yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentIdeas.map((idea: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 rounded-lg border border-red-500/10 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                                        <span className="text-sm font-bold text-red-600">
                                            {idea.score ? idea.score.toFixed(1) : '—'}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {idea.title || 'Untitled Idea'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {idea.pillar || 'General'} &middot; {idea.type || 'hybrid'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
