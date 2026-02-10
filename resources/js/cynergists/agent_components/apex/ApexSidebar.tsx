import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Activity,
    Calendar,
    CircleCheck,
    LayoutDashboard,
    Lock,
    MessageSquare,
    Settings,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';

interface ApexSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    agentDetails?: any;
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
    agentDetails,
    todayActivity,
}: ApexSidebarProps) {
    const isLinkedInConnected =
        agentDetails?.apex_data?.linkedin?.connected === true;

    const navItems = [
        { key: 'chat', label: 'Chat', icon: MessageSquare, requiresLinkedIn: false },
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresLinkedIn: true },
        { key: 'campaigns', label: 'Campaigns', icon: Target, requiresLinkedIn: true },
        { key: 'connections', label: 'Connections', icon: Users, requiresLinkedIn: true },
        { key: 'messages', label: 'Messages', icon: MessageSquare, requiresLinkedIn: true },
        { key: 'activity', label: 'Activity Log', icon: Activity, requiresLinkedIn: true },
        { key: 'settings', label: 'Settings', icon: Settings, requiresLinkedIn: true },
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
                        const isDisabled = item.requiresLinkedIn && !isLinkedInConnected;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.key}
                                onClick={() => !isDisabled && setActiveView(item.key)}
                                disabled={isDisabled}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                                    isDisabled
                                        ? 'cursor-not-allowed border-l-transparent text-foreground/30'
                                        : activeView === item.key
                                          ? 'border-l-primary bg-primary/10 text-primary'
                                          : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                                )}
                            >
                                {isDisabled ? (
                                    <Lock className="h-4 w-4 shrink-0" />
                                ) : (
                                    <Icon className="h-5 w-5 shrink-0" />
                                )}
                                {item.label}
                            </button>
                        );
                    })}
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
