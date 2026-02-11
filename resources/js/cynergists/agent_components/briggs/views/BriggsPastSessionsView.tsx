import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ArrowLeft, Award, Clock, History } from 'lucide-react';

interface BriggsPastSessionsViewProps {
    agentDetails: any;
    setActiveView: (view: string) => void;
}

const categoryLabels: Record<string, string> = {
    objection_handling: 'Objection Handling',
    cold_call: 'Cold Calling',
    discovery_call: 'Discovery',
    pitch: 'Pitching',
    closing: 'Closing',
    follow_up: 'Follow Up',
    negotiation: 'Negotiation',
};

function formatDuration(seconds: number | null): string {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

function scoreColor(score: number | null): string {
    if (score === null || score === undefined) return 'text-muted-foreground';
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-500';
}

export default function BriggsPastSessionsView({
    agentDetails,
    setActiveView,
}: BriggsPastSessionsViewProps) {
    const briggsData = agentDetails?.briggs_data ?? null;
    const sessions = briggsData?.recent_sessions ?? [];

    return (
        <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                <button
                    onClick={() => setActiveView('chat')}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <History className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                    Past Sessions
                </h2>
            </div>

            {/* Content */}
            <ScrollArea className="min-h-0 flex-1 px-6 py-4">
                {sessions.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        No training sessions yet. Head to the Training
                        Library to start your first session.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sessions.map((session: any) => (
                            <Card
                                key={session.id}
                                className="cursor-pointer p-4 transition-all duration-200 hover:shadow-md"
                                onClick={() =>
                                    setActiveView('session-detail')
                                }
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="truncate text-sm font-medium text-foreground">
                                                {session.title}
                                            </h4>
                                            <Badge
                                                variant={
                                                    session.status ===
                                                    'completed'
                                                        ? 'default'
                                                        : session.status ===
                                                            'in_progress'
                                                          ? 'secondary'
                                                          : 'outline'
                                                }
                                                className="text-[10px]"
                                            >
                                                {session.status ===
                                                'completed'
                                                    ? 'Completed'
                                                    : session.status ===
                                                        'in_progress'
                                                      ? 'In Progress'
                                                      : 'Abandoned'}
                                            </Badge>
                                        </div>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                            {session.category && (
                                                <span>
                                                    {categoryLabels[
                                                        session.category
                                                    ] ?? session.category}
                                                </span>
                                            )}
                                            {session.completed_at && (
                                                <span>
                                                    {new Date(
                                                        session.completed_at,
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </span>
                                            )}
                                            {session.duration_seconds && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDuration(
                                                        session.duration_seconds,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {session.score !== null &&
                                        session.score !== undefined && (
                                            <div className="flex items-center gap-1.5">
                                                <Award
                                                    className={cn(
                                                        'h-4 w-4',
                                                        scoreColor(
                                                            session.score,
                                                        ),
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        'text-lg font-semibold',
                                                        scoreColor(
                                                            session.score,
                                                        ),
                                                    )}
                                                >
                                                    {Number(
                                                        session.score,
                                                    ).toFixed(0)}
                                                </span>
                                            </div>
                                        )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
