import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Award,
    BarChart3,
    BookOpen,
    GraduationCap,
    History,
    MessageSquare,
    TrendingUp,
} from 'lucide-react';

interface BriggsSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    agentDetails?: any;
}

export default function BriggsSidebar({
    activeView,
    setActiveView,
    agentDetails,
}: BriggsSidebarProps) {
    const briggsData = agentDetails?.briggs_data ?? null;
    const stats = briggsData?.user_stats;

    const navItems = [
        { key: 'chat', label: 'Chat', icon: MessageSquare },
        {
            key: 'training-library',
            label: 'Training Library',
            icon: BookOpen,
        },
        { key: 'past-sessions', label: 'Past Sessions', icon: History },
    ];

    const scoreColor =
        stats?.average_score >= 75
            ? 'text-green-600'
            : stats?.average_score >= 50
              ? 'text-yellow-600'
              : stats?.average_score > 0
                ? 'text-red-500'
                : 'text-muted-foreground';

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

            {/* Performance Summary */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Performance
                </h2>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Sessions Completed
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {stats?.total_sessions ?? 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Award className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Average Score
                                </span>
                            </div>
                            <span
                                className={`text-lg font-semibold ${scoreColor}`}
                            >
                                {stats?.average_score !== null &&
                                stats?.average_score !== undefined
                                    ? `${Number(stats.average_score).toFixed(0)}%`
                                    : '—'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Skill Level
                                </span>
                            </div>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {stats?.skill_level
                                    ? stats.skill_level
                                          .charAt(0)
                                          .toUpperCase() +
                                      stats.skill_level.slice(1)
                                    : 'Beginner'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 border-t border-primary/20 pt-4">
                    <Button
                        variant="outline"
                        className="h-9 w-full gap-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setActiveView('past-sessions')}
                    >
                        <TrendingUp className="h-4 w-4" />
                        View Full Report
                    </Button>
                </div>
            </div>
        </div>
    );
}
