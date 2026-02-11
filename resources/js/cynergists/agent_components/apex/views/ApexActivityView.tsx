import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApexActivityLogs } from '@/hooks/useApexApi';
import {
    Activity,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Link2,
    MessageSquare,
    Pause,
    Play,
    UserCheck,
    UserPlus,
    UserX,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const ACTIVITY_TYPES = [
    { label: 'All', value: '' },
    { label: 'Connections', value: 'connection_sent' },
    { label: 'Accepted', value: 'connection_accepted' },
    { label: 'Messages', value: 'message_sent' },
    { label: 'Replies', value: 'reply_received' },
    { label: 'Follow-ups', value: 'follow_up_sent' },
    { label: 'Meetings', value: 'meeting_scheduled' },
    { label: 'Campaign', value: 'campaign_started' },
];

export default function ApexActivityView() {
    const [page, setPage] = useState(1);
    const [activityType, setActivityType] = useState('');

    const { data, isLoading } = useApexActivityLogs({
        page,
        activityType: activityType || undefined,
    });

    const logs = data?.data ?? [];
    const totalPages = data?.last_page ?? 1;
    const total = data?.total ?? 0;

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'connection_sent':
                return <UserPlus className="h-4 w-4 text-blue-500" />;
            case 'connection_accepted':
                return <UserCheck className="h-4 w-4 text-green-500" />;
            case 'connection_rejected':
                return <UserX className="h-4 w-4 text-red-500" />;
            case 'message_sent':
                return <MessageSquare className="h-4 w-4 text-purple-500" />;
            case 'reply_received':
                return <MessageSquare className="h-4 w-4 text-green-500" />;
            case 'follow_up_sent':
                return <Zap className="h-4 w-4 text-yellow-500" />;
            case 'meeting_scheduled':
                return <Calendar className="h-4 w-4 text-purple-500" />;
            case 'campaign_started':
                return <Play className="h-4 w-4 text-green-500" />;
            case 'campaign_paused':
                return <Pause className="h-4 w-4 text-yellow-500" />;
            case 'campaign_completed':
                return <Activity className="h-4 w-4 text-blue-500" />;
            case 'linkedin_connected':
                return <Link2 className="h-4 w-4 text-blue-500" />;
            case 'linkedin_disconnected':
                return <Link2 className="h-4 w-4 text-red-500" />;
            default:
                return <Activity className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* Filter */}
            <div className="flex flex-wrap gap-1 border-b border-primary/10 px-4 py-2">
                {ACTIVITY_TYPES.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => {
                            setActivityType(f.value);
                            setPage(1);
                        }}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            activityType === f.value
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <div className="p-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex animate-pulse items-center gap-3"
                                >
                                    <div className="h-8 w-8 rounded-full bg-muted/50" />
                                    <div className="flex-1 space-y-1">
                                        <div className="h-3 w-48 rounded bg-muted/50" />
                                        <div className="h-2.5 w-24 rounded bg-muted/50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Activity className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mt-3 text-sm font-semibold text-foreground">
                                No activity yet
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                Your outreach activity will be logged here as
                                campaigns run.
                            </p>
                        </div>
                    ) : (
                        <div className="relative space-y-0">
                            {/* Timeline line */}
                            <div className="absolute top-4 bottom-4 left-4 w-px bg-primary/10" />

                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="relative flex gap-3 py-2"
                                >
                                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-card">
                                        {getActivityIcon(log.activity_type)}
                                    </div>
                                    <div className="min-w-0 flex-1 pt-0.5">
                                        <p className="text-sm text-foreground">
                                            {log.description ??
                                                log.activity_type.replace(
                                                    /_/g,
                                                    ' ',
                                                )}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDate(log.created_at)}
                                            </span>
                                            {log.campaign && (
                                                <span className="rounded border border-primary/10 bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                                    {log.campaign.name}
                                                </span>
                                            )}
                                            {log.prospect && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {log.prospect.full_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-primary/10 px-4 py-2">
                    <p className="text-xs text-muted-foreground">
                        {total} total
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-7 px-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            {page} / {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages}
                            className="h-7 px-2"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
