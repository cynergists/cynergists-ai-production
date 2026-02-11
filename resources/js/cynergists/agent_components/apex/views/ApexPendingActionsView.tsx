import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    useApexPendingActions,
    useApprovePendingAction,
    useDenyPendingAction,
} from '@/hooks/useApexApi';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Loader2,
    MessageSquare,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface ApexPendingActionsViewProps {
    agentDetails: any;
}

export default function ApexPendingActionsView({
    agentDetails,
}: ApexPendingActionsViewProps) {
    const agentId = agentDetails?.apex_data?.available_agent_id ?? null;
    const { data: pendingData, isLoading } = useApexPendingActions();
    const approveMutation = useApprovePendingAction(agentId ?? '');
    const denyMutation = useDenyPendingAction();
    const [processingActionId, setProcessingActionId] = useState<string | null>(null);

    const actions = pendingData?.actions ?? [];

    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case 'connection_request':
                return <UserPlus className="h-4 w-4" />;
            case 'message':
            case 'follow_up':
                return <MessageSquare className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getActionTypeLabel = (actionType: string) => {
        switch (actionType) {
            case 'connection_request':
                return 'Connection Request';
            case 'message':
                return 'Message';
            case 'follow_up':
                return 'Follow-up Message';
            default:
                return actionType;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    const handleApprove = (actionId: string) => {
        if (!agentId || processingActionId) return;
        setProcessingActionId(actionId);
        approveMutation.mutate(actionId, {
            onSettled: () => setProcessingActionId(null),
        });
    };

    const handleDeny = (actionId: string) => {
        if (!agentId || processingActionId) return;
        setProcessingActionId(actionId);
        denyMutation.mutate(actionId, {
            onSettled: () => setProcessingActionId(null),
        });
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* Header */}
            <div className="border-b border-primary/10 px-4 py-3">
                <h2 className="text-lg font-semibold text-foreground">
                    Pending Approvals
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    Review and approve actions before they're executed
                </p>
            </div>

            {/* Content */}
            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-3 p-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-32 animate-pulse rounded-xl border border-primary/10 bg-muted/30"
                                />
                            ))}
                        </div>
                    ) : actions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <CheckCircle className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-foreground">
                                All caught up!
                            </h3>
                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                You have no pending actions to review. We'll
                                notify you when new actions require approval.
                            </p>
                        </div>
                    ) : (
                        actions.map((action) => {
                            const expired = isExpired(action.expires_at);
                            const isThisActionProcessing = processingActionId === action.id;
                            const isAnyActionProcessing = processingActionId !== null;

                            return (
                                <div
                                    key={action.id}
                                    className={cn(
                                        'rounded-xl border p-4 transition-colors',
                                        expired
                                            ? 'border-red-500/20 bg-red-500/5'
                                            : 'border-primary/10 bg-card',
                                        isThisActionProcessing && 'opacity-60',
                                    )}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-1 items-start gap-3">
                                            <div
                                                className={cn(
                                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                                    expired
                                                        ? 'bg-red-500/10 text-red-600'
                                                        : 'bg-primary/10 text-primary',
                                                )}
                                            >
                                                {getActionIcon(
                                                    action.action_type,
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {getActionTypeLabel(
                                                            action.action_type,
                                                        )}
                                                    </span>
                                                    {expired && (
                                                        <span className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">
                                                            <XCircle className="h-3 w-3" />
                                                            Expired
                                                        </span>
                                                    )}
                                                </div>
                                                {action.prospect && (
                                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                                        To:{' '}
                                                        <span className="font-medium text-foreground">
                                                            {action.prospect
                                                                .full_name ||
                                                                `${action.prospect.first_name} ${action.prospect.last_name}`}
                                                        </span>
                                                    </p>
                                                )}
                                                {action.campaign && (
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        Campaign:{' '}
                                                        {action.campaign.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(action.created_at)}
                                        </div>
                                    </div>

                                    {/* Message Content */}
                                    {action.message_content && (
                                        <div className="mt-3 rounded-lg bg-muted/30 p-3">
                                            <p className="text-sm text-foreground/80">
                                                {action.message_content}
                                            </p>
                                        </div>
                                    )}

                                    {/* Expiry Info */}
                                    {action.expires_at && !expired && (
                                        <p className="mt-3 text-xs text-muted-foreground">
                                            Expires:{' '}
                                            {new Date(
                                                action.expires_at,
                                            ).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    {!expired && (
                                        <div className="mt-4 flex gap-2">
                                            <Button
                                                onClick={() =>
                                                    handleApprove(action.id)
                                                }
                                                disabled={isAnyActionProcessing}
                                                className="flex-1 gap-2 bg-green-600 text-white hover:bg-green-700"
                                                size="sm"
                                            >
                                                {isThisActionProcessing && approveMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    handleDeny(action.id)
                                                }
                                                disabled={isAnyActionProcessing}
                                                variant="outline"
                                                className="flex-1 gap-2 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-700"
                                                size="sm"
                                            >
                                                {isThisActionProcessing && denyMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                                Deny
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
