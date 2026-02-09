import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { Linkedin, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { LinkedInConnectModal } from './LinkedInConnectModal';

interface LinkedInStatus {
    connected: boolean;
    status: string | null;
    display_name: string | null;
    avatar_url: string | null;
    requires_checkpoint: boolean;
    account_id: string | null;
}

interface ApexData {
    linkedin: LinkedInStatus;
    available_agent_id: string | null;
}

interface ApexConfigProps {
    agentDetails: any;
}

export function ApexConfig({ agentDetails }: ApexConfigProps) {
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const queryClient = useQueryClient();

    const apexData: ApexData | null = agentDetails?.apex_data ?? null;
    const linkedin = apexData?.linkedin;
    const availableAgentId = apexData?.available_agent_id;
    const isConnected = linkedin?.connected === true;

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const checkStatus = useCallback(async () => {
        if (!linkedin?.account_id || !availableAgentId) return;
        setIsChecking(true);
        try {
            await apiClient.get(
                `/api/apex/linkedin/${linkedin.account_id}/status?agent_id=${availableAgentId}`,
            );
            queryClient.invalidateQueries({
                queryKey: ['agent-details', agentDetails?.id],
            });
        } catch {
            toast.error('Failed to check status');
        } finally {
            setIsChecking(false);
        }
    }, [linkedin?.account_id, availableAgentId, queryClient, agentDetails?.id]);

    const reconnect = useCallback(async () => {
        if (!linkedin?.account_id || !availableAgentId) return;
        setIsReconnecting(true);
        try {
            await apiClient.delete(
                `/api/apex/linkedin/${linkedin.account_id}?agent_id=${availableAgentId}`,
            );
            queryClient.invalidateQueries({
                queryKey: ['agent-details', agentDetails?.id],
            });
            setConnectModalOpen(true);
        } catch {
            toast.error('Failed to disconnect account');
        } finally {
            setIsReconnecting(false);
        }
    }, [linkedin?.account_id, availableAgentId, queryClient, agentDetails?.id]);

    // Auto-poll while status is pending
    useEffect(() => {
        const isPending = linkedin?.status === 'pending' && !isConnected;
        if (!isPending || !linkedin?.account_id || !availableAgentId) {
            return;
        }

        pollRef.current = setInterval(async () => {
            try {
                await apiClient.get(
                    `/api/apex/linkedin/${linkedin.account_id}/status?agent_id=${availableAgentId}`,
                );
                queryClient.invalidateQueries({
                    queryKey: ['agent-details', agentDetails?.id],
                });
            } catch {
                // Silently continue polling
            }
        }, 5000);

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [linkedin?.status, linkedin?.account_id, isConnected, availableAgentId, queryClient, agentDetails?.id]);

    return (
        <div className="space-y-4">
            {/* LinkedIn Connection Status */}
            {!isConnected && linkedin?.status !== 'pending' && availableAgentId && (
                <div className="rounded-xl border border-[#0A66C2]/20 bg-[#0A66C2]/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A66C2]/10">
                            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground">
                                Connect LinkedIn
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Link your LinkedIn account to start outreach
                                campaigns
                            </p>
                        </div>
                        <button
                            onClick={() => setConnectModalOpen(true)}
                            className="shrink-0 rounded-lg bg-[#0A66C2] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#004182]"
                        >
                            Connect
                        </button>
                    </div>
                </div>
            )}

            {isConnected && linkedin && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                            <Linkedin className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground">
                                LinkedIn Connected
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {linkedin.display_name ?? 'Account active'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                            Active
                        </div>
                    </div>
                </div>
            )}

            {linkedin?.status === 'pending' && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
                            <Linkedin className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground">
                                LinkedIn Pending
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {linkedin.requires_checkpoint
                                    ? 'Verification required — check your LinkedIn app'
                                    : 'Connection in progress...'}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                onClick={checkStatus}
                                disabled={isChecking || isReconnecting}
                                title="Check status"
                                className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-500/20"
                            >
                                {isChecking ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-3 w-3" />
                                )}
                            </button>
                            <button
                                onClick={reconnect}
                                disabled={isReconnecting || isChecking}
                                title="Reconnect"
                                className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-500/20"
                            >
                                {isReconnecting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <RotateCcw className="h-3 w-3" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LinkedIn Connect Modal */}
            {availableAgentId && agentDetails?.id && (
                <LinkedInConnectModal
                    open={connectModalOpen}
                    onOpenChange={setConnectModalOpen}
                    availableAgentId={availableAgentId}
                    selectedAgentId={agentDetails.id}
                />
            )}
        </div>
    );
}
