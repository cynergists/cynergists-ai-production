import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    BookOpen,
    Eye,
    Lightbulb,
    MessageSquare,
    TrendingUp,
    Users,
} from 'lucide-react';

interface OptixSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    agentDetails?: any;
}

export default function OptixSidebar({
    activeView,
    setActiveView,
    agentDetails,
}: OptixSidebarProps) {
    const optixData = agentDetails?.optix_data ?? null;
    const stats = optixData?.channel_stats;

    const formatNumber = (num: number): string => {
        if (num >= 1_000_000) {
            return `${(num / 1_000_000).toFixed(1)}M`;
        }
        if (num >= 1_000) {
            return `${(num / 1_000).toFixed(1)}K`;
        }
        return num.toString();
    };

    const navItems = [
        { key: 'chat', label: 'Chat', icon: MessageSquare },
        { key: 'channel-bible', label: 'Channel Bible', icon: BookOpen },
        { key: 'video-ideas', label: 'Video Ideas', icon: Lightbulb },
    ];

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Quick Links */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Quick Links
                </h2>
                <nav className="flex flex-col space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.key}
                                onClick={() => setActiveView(item.key)}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                                    activeView === item.key
                                        ? 'border-l-primary bg-primary/10 text-primary'
                                        : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Channel Stats */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Channel Stats
                </h2>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Users className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Subscribers
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {formatNumber(stats?.subscribers ?? 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Eye className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Total Views
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {formatNumber(stats?.total_views ?? 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Total Videos
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {stats?.total_videos ?? 0}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 border-t border-primary/20 pt-4">
                    <Button
                        variant="outline"
                        className="h-9 w-full gap-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setActiveView('channel-bible')}
                    >
                        <TrendingUp className="h-4 w-4" />
                        View Channel Bible
                    </Button>
                </div>
            </div>
        </div>
    );
}
