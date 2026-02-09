import { ScrollArea } from '@/components/ui/scroll-area';
import { useApexCampaigns, useApexPendingActions } from '@/hooks/useApexApi';
import {
    Calendar,
    Loader2,
    MessageSquare,
    Target,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';

interface ApexDashboardViewProps {
    agentDetails: any;
    setActiveView: (view: string) => void;
}

export default function ApexDashboardView({
    agentDetails,
    setActiveView,
}: ApexDashboardViewProps) {
    const { data: campaignsData, isLoading: campaignsLoading } =
        useApexCampaigns();
    const { data: pendingData, isLoading: pendingLoading } =
        useApexPendingActions();

    const campaigns = campaignsData?.campaigns ?? [];
    const pendingActions = pendingData?.actions ?? [];

    const activeCampaigns = campaigns.filter((c) => c.status === 'active');
    const totalConnectionsSent = campaigns.reduce(
        (sum, c) => sum + c.connections_sent,
        0,
    );
    const totalConnectionsAccepted = campaigns.reduce(
        (sum, c) => sum + c.connections_accepted,
        0,
    );
    const totalMessagesSent = campaigns.reduce(
        (sum, c) => sum + c.messages_sent,
        0,
    );
    const totalReplies = campaigns.reduce(
        (sum, c) => sum + c.replies_received,
        0,
    );
    const totalMeetings = campaigns.reduce(
        (sum, c) => sum + c.meetings_booked,
        0,
    );

    const isLoading = campaignsLoading || pendingLoading;

    const linkedin = agentDetails?.apex_data?.linkedin;
    const isLinkedInConnected = linkedin?.connected === true;

    return (
        <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-6 p-4">
                {/* LinkedIn Status */}
                {isLinkedInConnected && (
                    <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                            <svg
                                className="h-4 w-4 text-green-600"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                                LinkedIn Connected
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {linkedin?.display_name ?? 'Account active'}
                            </p>
                        </div>
                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                            Active
                        </span>
                    </div>
                )}

                {/* Stats Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-24 animate-pulse rounded-xl border border-primary/10 bg-muted/30"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                        <StatCard
                            icon={<Target className="h-4 w-4" />}
                            label="Total Campaigns"
                            value={campaigns.length}
                            color="blue"
                        />
                        <StatCard
                            icon={<Zap className="h-4 w-4" />}
                            label="Active Campaigns"
                            value={activeCampaigns.length}
                            color="green"
                        />
                        <StatCard
                            icon={<Users className="h-4 w-4" />}
                            label="Connections Sent"
                            value={totalConnectionsSent}
                            color="purple"
                        />
                        <StatCard
                            icon={<TrendingUp className="h-4 w-4" />}
                            label="Connections Made"
                            value={totalConnectionsAccepted}
                            color="green"
                        />
                        <StatCard
                            icon={<MessageSquare className="h-4 w-4" />}
                            label="Messages Sent"
                            value={totalMessagesSent}
                            color="blue"
                        />
                        <StatCard
                            icon={<Calendar className="h-4 w-4" />}
                            label="Meetings Booked"
                            value={totalMeetings}
                            color="purple"
                        />
                    </div>
                )}

                {/* Pending Actions */}
                {!isLoading && pendingActions.length > 0 && (
                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    Pending Approval
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {pendingActions.length} action
                                    {pendingActions.length !== 1 ? 's' : ''}{' '}
                                    awaiting your review
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveView('messages')}
                                className="rounded-lg bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-600 transition-colors hover:bg-yellow-500/20"
                            >
                                Review
                            </button>
                        </div>
                    </div>
                )}

                {/* Campaign Performance */}
                {!isLoading && campaigns.length > 0 && (
                    <div className="rounded-xl border border-primary/10 bg-muted/30 p-4">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                            Campaign Performance
                        </h3>
                        <div className="space-y-3">
                            {campaigns.slice(0, 5).map((campaign) => {
                                const acceptanceRate =
                                    campaign.connections_sent > 0
                                        ? Math.round(
                                              (campaign.connections_accepted /
                                                  campaign.connections_sent) *
                                                  100,
                                          )
                                        : 0;
                                const replyRate =
                                    campaign.messages_sent > 0
                                        ? Math.round(
                                              (campaign.replies_received /
                                                  campaign.messages_sent) *
                                                  100,
                                          )
                                        : 0;

                                return (
                                    <div
                                        key={campaign.id}
                                        className="flex items-center justify-between rounded-lg bg-background p-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {campaign.name}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-3">
                                                <StatusBadge
                                                    status={campaign.status}
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {acceptanceRate}% accept
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {replyRate}% reply
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {campaigns.length > 5 && (
                            <button
                                onClick={() => setActiveView('campaigns')}
                                className="mt-3 w-full text-center text-xs font-medium text-primary hover:underline"
                            >
                                View all {campaigns.length} campaigns
                            </button>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && campaigns.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Target className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mt-3 text-sm font-semibold text-foreground">
                            No campaigns yet
                        </h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Start a conversation with Apex to create your first
                            LinkedIn outreach campaign.
                        </p>
                        <button
                            onClick={() => setActiveView('chat')}
                            className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Chat with Apex
                        </button>
                    </div>
                )}

                {/* Summary Stats */}
                {!isLoading && totalReplies > 0 && (
                    <div className="rounded-xl border border-primary/10 bg-muted/30 p-4">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">
                            Engagement Summary
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <p className="text-lg font-bold text-foreground">
                                    {totalConnectionsSent > 0
                                        ? Math.round(
                                              (totalConnectionsAccepted /
                                                  totalConnectionsSent) *
                                                  100,
                                          )
                                        : 0}
                                    %
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Accept Rate
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-foreground">
                                    {totalMessagesSent > 0
                                        ? Math.round(
                                              (totalReplies /
                                                  totalMessagesSent) *
                                                  100,
                                          )
                                        : 0}
                                    %
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Reply Rate
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-foreground">
                                    {totalMeetings}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Meetings
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: 'blue' | 'green' | 'purple';
}) {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-500',
        green: 'bg-green-500/10 text-green-500',
        purple: 'bg-purple-500/10 text-purple-500',
    };

    return (
        <div className="rounded-xl border border-primary/10 bg-muted/30 p-3">
            <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${colors[color]}`}
            >
                {icon}
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'border-green-500/30 bg-green-500/10 text-green-600',
        draft: 'border-gray-500/30 bg-gray-500/10 text-gray-500',
        paused: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
        completed: 'border-blue-500/30 bg-blue-500/10 text-blue-600',
    };

    return (
        <span
            className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${styles[status] ?? styles.draft}`}
        >
            {status}
        </span>
    );
}
