import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Award,
    CheckCircle,
    FileText,
    RefreshCw,
    TrendingUp,
} from 'lucide-react';

interface BriggsSessionDetailViewProps {
    agentDetails: any;
    setActiveView: (view: string) => void;
}

function scoreColor(score: number | null): string {
    if (score === null || score === undefined)
        return 'text-muted-foreground';
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-500';
}

function scoreBgColor(score: number | null): string {
    if (score === null || score === undefined) return 'bg-muted';
    if (score >= 75) return 'bg-green-500/10';
    if (score >= 50) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
}

export default function BriggsSessionDetailView({
    agentDetails,
    setActiveView,
}: BriggsSessionDetailViewProps) {
    const briggsData = agentDetails?.briggs_data ?? null;
    const sessions = briggsData?.recent_sessions ?? [];

    // Show the most recent completed session as a placeholder
    const session = sessions.find(
        (s: any) => s.status === 'completed',
    );

    if (!session) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                <p className="text-sm text-muted-foreground">
                    No session details available.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setActiveView('past-sessions')}
                >
                    Back to Sessions
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                <button
                    onClick={() => setActiveView('past-sessions')}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="truncate text-lg font-semibold text-foreground">
                    {session.title}
                </h2>
            </div>

            {/* Content */}
            <ScrollArea className="min-h-0 flex-1 px-6 py-4">
                <div className="space-y-6">
                    {/* Overall Score */}
                    {session.score !== null &&
                        session.score !== undefined && (
                            <Card
                                className={cn(
                                    'flex items-center justify-center p-8',
                                    scoreBgColor(session.score),
                                )}
                            >
                                <div className="text-center">
                                    <Award
                                        className={cn(
                                            'mx-auto mb-2 h-8 w-8',
                                            scoreColor(session.score),
                                        )}
                                    />
                                    <div
                                        className={cn(
                                            'text-4xl font-bold',
                                            scoreColor(session.score),
                                        )}
                                    >
                                        {Number(session.score).toFixed(
                                            0,
                                        )}
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        Overall Score
                                    </div>
                                </div>
                            </Card>
                        )}

                    {/* Score Breakdown */}
                    {session.score_breakdown &&
                        session.score_breakdown.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-foreground">
                                    Score Breakdown
                                </h3>
                                <div className="space-y-2">
                                    {session.score_breakdown.map(
                                        (item: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="rounded-lg border border-border p-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {item.criterion}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'text-sm font-semibold',
                                                            scoreColor(
                                                                (item.score /
                                                                    item.max_score) *
                                                                    100,
                                                            ),
                                                        )}
                                                    >
                                                        {item.score}/
                                                        {item.max_score}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            item.score /
                                                                item.max_score >=
                                                                0.75
                                                                ? 'bg-green-500'
                                                                : item.score /
                                                                        item.max_score >=
                                                                    0.5
                                                                  ? 'bg-yellow-500'
                                                                  : 'bg-red-500',
                                                        )}
                                                        style={{
                                                            width: `${(item.score / item.max_score) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                                {item.feedback && (
                                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                                        {item.feedback}
                                                    </p>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Strengths */}
                    {session.strengths &&
                        session.strengths.length > 0 && (
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-foreground">
                                    Strengths
                                </h3>
                                <div className="space-y-1.5">
                                    {session.strengths.map(
                                        (
                                            strength: string,
                                            idx: number,
                                        ) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-2"
                                            >
                                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                                                <span className="text-sm text-foreground">
                                                    {strength}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Improvements */}
                    {session.improvements &&
                        session.improvements.length > 0 && (
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-foreground">
                                    Areas for Improvement
                                </h3>
                                <div className="space-y-1.5">
                                    {session.improvements.map(
                                        (
                                            improvement: string,
                                            idx: number,
                                        ) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-2"
                                            >
                                                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                                                <span className="text-sm text-foreground">
                                                    {improvement}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                    {/* AI Feedback */}
                    {session.ai_feedback && (
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-foreground">
                                Coach Feedback
                            </h3>
                            <Card className="p-4">
                                <p className="text-sm leading-relaxed text-foreground">
                                    {session.ai_feedback}
                                </p>
                            </Card>
                        </div>
                    )}

                    {/* Practice Again */}
                    <Button
                        className="w-full gap-2"
                        onClick={() => setActiveView('chat')}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Practice Again
                    </Button>
                </div>
            </ScrollArea>
        </div>
    );
}
