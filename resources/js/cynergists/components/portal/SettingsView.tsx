import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsLink {
    label: string;
    view: string;
}

interface SettingsViewProps {
    agentId: string | null;
    agentDetails: any;
    settingsLinks?: SettingsLink[];
    setActiveView: (view: string) => void;
    onMemoryCleared?: () => void;
}

export function SettingsView({
    agentId,
    agentDetails,
    settingsLinks = [],
    setActiveView,
    onMemoryCleared,
}: SettingsViewProps) {
    const queryClient = useQueryClient();

    const restartOnboarding = useMutation({
        mutationFn: async () => {
            if (!agentId) throw new Error('No agent selected');
            return apiClient.post(`/api/portal/agents/${agentId}/onboarding/restart`, {});
        },
        onSuccess: () => {
            toast.success('Onboarding restarted. Chat with Cynessa to begin.');
            queryClient.invalidateQueries({ queryKey: ['portal-stats'] });
            queryClient.invalidateQueries({ queryKey: ['agent-conversation'] });
            queryClient.invalidateQueries({ queryKey: ['agent-details'] });
            setActiveView('chat');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to restart onboarding.');
        },
    });

    const clearMemory = useMutation({
        mutationFn: async () => {
            if (!agentId) throw new Error('No agent selected');
            return apiClient.delete(`/api/portal/agents/${agentId}/conversation`);
        },
        onSuccess: () => {
            toast.success('Agent memory cleared.');
            queryClient.invalidateQueries({ queryKey: ['agent-conversation', agentId] });
            onMemoryCleared?.();
            setActiveView('chat');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to clear memory.');
        },
    });

    const handleRestartOnboarding = () => {
        if (
            window.confirm(
                'This will clear all onboarding data and your conversation history with Cynessa. Continue?',
            )
        ) {
            restartOnboarding.mutate();
        }
    };

    const handleClearMemory = () => {
        if (
            window.confirm(
                `This will permanently clear ${agentDetails?.agent_name ?? 'this agent'}'s memory and conversation history. Continue?`,
            )
        ) {
            clearMemory.mutate();
        }
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-primary/20 px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                <p className="text-sm text-muted-foreground">
                    Manage{' '}
                    {agentDetails?.agent_name ? `${agentDetails.agent_name}'s` : 'agent'}{' '}
                    settings and memory.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-6">
                    {settingsLinks.length > 0 && (
                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Agent Links
                            </h3>
                            <div className="space-y-2">
                                {settingsLinks.map((link) => (
                                    <button
                                        key={link.view}
                                        type="button"
                                        onClick={() => setActiveView(link.view)}
                                        className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                                    >
                                        {link.label}
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Onboarding
                        </h3>
                        <Card className="p-4">
                            <p className="mb-3 text-sm text-muted-foreground">
                                Restart the onboarding process from scratch. This will clear
                                your company profile and conversation history with Cynessa.
                            </p>
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={handleRestartOnboarding}
                                disabled={restartOnboarding.isPending || !agentId}
                            >
                                {restartOnboarding.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                                Restart Onboarding
                            </Button>
                        </Card>
                    </div>

                    <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Memory
                        </h3>
                        <Card className="border-destructive/20 p-4">
                            <p className="mb-3 text-sm text-muted-foreground">
                                Clear{' '}
                                {agentDetails?.agent_name ?? 'this agent'}&apos;s entire
                                conversation history and memory. This cannot be undone.
                            </p>
                            <Button
                                variant="destructive"
                                className="gap-2"
                                onClick={handleClearMemory}
                                disabled={clearMemory.isPending || !agentId}
                            >
                                {clearMemory.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Clear Agent Memory
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
