import { AgentQuickLinks } from '@/components/portal/AgentQuickLinks';
import { Button } from '@/components/ui/button';
import { Calendar, CircleCheck, MessageSquare, TrendingUp, Users } from 'lucide-react';

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
    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Quick Links */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Quick Links
                </h2>
                <AgentQuickLinks activeView={activeView} setActiveView={setActiveView} />
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
