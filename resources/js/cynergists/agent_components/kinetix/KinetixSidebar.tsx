import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Film,
    Gauge,
    MessageSquare,
    Palette,
    Settings,
    TrendingUp,
    Video,
} from 'lucide-react';

interface KinetixSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    agentDetails?: any;
}

export default function KinetixSidebar({
    activeView,
    setActiveView,
    agentDetails,
}: KinetixSidebarProps) {
    const kinetixData = agentDetails?.kinetix_data ?? null;
    const usage = kinetixData?.usage;
    const brand = kinetixData?.brand;

    const remaining = usage
        ? Math.max(0, usage.monthly_limit - usage.current_usage)
        : 0;

    const navItems = [
        { key: 'chat', label: 'Chat', icon: MessageSquare },
        { key: 'video-library', label: 'Video Library', icon: Film },
        { key: 'brand-settings', label: 'Brand Settings', icon: Palette },
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

            {/* Usage & Brand */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Video Stats
                </h2>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Video className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Videos Remaining
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {remaining}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Gauge className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Default Duration
                                </span>
                            </div>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {brand?.default_duration ?? 30}s
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Settings className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Style Preset
                                </span>
                            </div>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {brand?.style_preset ?? 'Modern'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 border-t border-primary/20 pt-4">
                    <Button
                        variant="outline"
                        className="h-9 w-full gap-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setActiveView('video-library')}
                    >
                        <TrendingUp className="h-4 w-4" />
                        View Video Library
                    </Button>
                </div>
            </div>
        </div>
    );
}
