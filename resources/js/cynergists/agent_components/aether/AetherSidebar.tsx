import { AgentQuickLinks } from '@/components/portal/AgentQuickLinks';
import { Button } from '@/components/ui/button';
import { BarChart3, BookOpen, FileText, Send, TrendingUp } from 'lucide-react';

interface AetherSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    agentDetails?: any;
}

export default function AetherSidebar({
    activeView,
    setActiveView,
    agentDetails,
}: AetherSidebarProps) {
    const aetherData = agentDetails?.aether_data ?? null;
    const stats = aetherData?.pipeline_stats;

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Quick Links */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Quick Links
                </h2>
                <AgentQuickLinks activeView={activeView} setActiveView={setActiveView} />
            </div>

            {/* Pipeline Stats */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Pipeline
                </h2>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Drafts
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {stats?.drafts ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    In Review
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {stats?.in_review ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Send className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Published
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {stats?.published ?? 0}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 border-t border-primary/20 pt-4">
                    <Button
                        variant="outline"
                        className="h-9 w-full gap-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setActiveView('content-pipeline')}
                    >
                        <BarChart3 className="h-4 w-4" />
                        View Full Pipeline
                    </Button>
                </div>
            </div>
        </div>
    );
}
