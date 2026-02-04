import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Activity,
    Calendar,
    CircleCheck,
    LayoutDashboard,
    MessageSquare,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';

interface ApexSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    todayActivity: {
        connectionsRequested: number;
        connectionsMade: number;
        messagesSent: number;
        meetingsScheduled: number;
    };
}

export default function ApexSidebar({
    activeView,
    setActiveView,
    todayActivity,
}: ApexSidebarProps) {
    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Quick Links */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Quick Links
                </h2>
                <nav className="flex flex-col space-y-2">
                    <button
                        onClick={() => setActiveView('chat')}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                            activeView === 'chat'
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <MessageSquare className="h-5 w-5 shrink-0" />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveView('dashboard')}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                            activeView === 'dashboard'
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <LayoutDashboard className="h-5 w-5 shrink-0" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveView('campaigns')}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                            activeView === 'campaigns'
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <Target className="h-5 w-5 shrink-0" />
                        Campaigns
                    </button>
                    <button
                        onClick={() => setActiveView('connections')}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                            activeView === 'connections'
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <Users className="h-5 w-5 shrink-0" />
                        Connections
                    </button>
                    <button
                        onClick={() => setActiveView('messages')}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                            activeView === 'messages'
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <MessageSquare className="h-5 w-5 shrink-0" />
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveView('activity')}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                            activeView === 'activity'
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <Activity className="h-5 w-5 shrink-0" />
                        Activity Log
                    </button>
                </nav>
            </div>

            {/* Today's Activity */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Today&apos;s Activity
                </h2>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Users className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Connections Requested
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {todayActivity.connectionsRequested}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <CircleCheck className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Connections Made
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {todayActivity.connectionsMade}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Messages Sent
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {todayActivity.messagesSent}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">
                                    Meetings Scheduled
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">
                                {todayActivity.meetingsScheduled}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 border-t border-primary/20 pt-4">
                    <Button
                        variant="outline"
                        className="h-9 w-full gap-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    >
                        <TrendingUp className="h-4 w-4" />
                        View Full Report
                    </Button>
                </div>
            </div>
        </div>
    );
}
