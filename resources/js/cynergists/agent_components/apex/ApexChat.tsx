import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceMode } from '@/hooks/useVoiceMode';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
    Linkedin,
    Loader2,
    Mic,
    RotateCcw,
    Send,
    Square,
    Trash2,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { LinkedInConnectModal } from './LinkedInConnectModal';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ApexChatProps {
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    isStreaming: boolean;
    agentDetails: any;
    scrollRef: React.RefObject<HTMLDivElement>;
    onSend: (e: React.FormEvent) => void;
    onClearChat?: () => void;
    selectedAgentId?: string | null;
    onMessageReceived?: (message: {
        role: 'user' | 'assistant';
        content: string;
    }) => void;
}

export function ApexChat({
    messages,
    input,
    setInput,
    isStreaming,
    agentDetails,
    scrollRef,
    onSend,
    onClearChat,
    selectedAgentId,
    onMessageReceived,
}: ApexChatProps) {
    const queryClient = useQueryClient();
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const apexData = agentDetails?.apex_data ?? null;
    const linkedin = apexData?.linkedin;
    const availableAgentId = apexData?.available_agent_id;
    const isLinkedInConnected = linkedin?.connected === true;
    const isPending = linkedin?.status === 'pending' && !isLinkedInConnected;

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
    }, [
        linkedin?.account_id,
        availableAgentId,
        queryClient,
        agentDetails?.id,
    ]);

    // Auto-poll while status is pending
    useEffect(() => {
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
            } catch (error: any) {
                // Account not found — stop polling and refresh cache
                if (error?.status === 404) {
                    if (pollRef.current) {
                        clearInterval(pollRef.current);
                        pollRef.current = null;
                    }
                    queryClient.invalidateQueries({
                        queryKey: ['agent-details', agentDetails?.id],
                    });
                }
            }
        }, 5000);

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [
        isPending,
        linkedin?.account_id,
        availableAgentId,
        queryClient,
        agentDetails?.id,
    ]);

    // Voice mode hook for continuous conversation
    const {
        isListening,
        isProcessing,
        isSpeaking,
        isActive,
        toggleVoiceMode,
    } = useVoiceMode({
        agentId: selectedAgentId ?? null,
        onTranscriptReceived: (text) => {
            onMessageReceived?.({ role: 'user', content: text });
        },
        onResponseReceived: (response) => {
            onMessageReceived?.({
                role: 'assistant',
                content: response.text,
            });
        },
    });

    // Gate: LinkedIn must be connected before using Apex
    if (!isLinkedInConnected) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                <div className="flex max-w-sm flex-col items-center gap-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A66C2]/10">
                        <Linkedin className="h-8 w-8 text-[#0A66C2]" />
                    </div>

                    {isPending ? (
                        <>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    Connecting to LinkedIn
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {linkedin?.requires_checkpoint
                                        ? 'LinkedIn requires verification. Check your LinkedIn app to approve the login, then wait here.'
                                        : 'Your connection is being established. This usually takes a few moments.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-yellow-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Waiting for connection...
                            </div>
                            <button
                                onClick={reconnect}
                                disabled={isReconnecting}
                                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                            >
                                {isReconnecting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RotateCcw className="h-4 w-4" />
                                )}
                                Try Again
                            </button>
                        </>
                    ) : (
                        <>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    Connect Your LinkedIn
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Apex needs access to your LinkedIn account to
                                    manage outreach campaigns, send connection
                                    requests, and track messages.
                                </p>
                            </div>
                            {availableAgentId && (
                                <button
                                    onClick={() => setConnectModalOpen(true)}
                                    className="flex items-center gap-2 rounded-lg bg-[#0A66C2] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#004182]"
                                >
                                    <Linkedin className="h-4 w-4" />
                                    Connect LinkedIn
                                </button>
                            )}
                        </>
                    )}
                </div>

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

    return (
        <>
            {/* Messages */}
            <ScrollArea
                className="min-h-0 flex-1 px-4 py-3"
                ref={scrollRef}
            >
                <div className="space-y-3">
                    {messages.length === 0 ? (
                        <div className="animate-in py-8 text-center text-sm text-muted-foreground duration-300 fade-in">
                            Ask Apex about setting up your campaigns.
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={cn(
                                    'flex animate-in gap-3 duration-300 fade-in slide-in-from-bottom-2',
                                    message.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start',
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {message.role === 'assistant' &&
                                    agentDetails?.avatar_url && (
                                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                                            <img
                                                src={agentDetails.avatar_url}
                                                alt={agentDetails.agent_name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                <div className="flex flex-col gap-0.5">
                                    <Card
                                        className={cn(
                                            'max-w-[380px] rounded-xl px-3 py-2 text-foreground transition-all duration-200 hover:shadow-md',
                                            message.role === 'user'
                                                ? 'rounded-br-sm bg-primary text-primary-foreground'
                                                : 'rounded-bl-sm border border-primary/10 bg-surface-2',
                                        )}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </Card>
                                    <span className="px-1 text-left text-[10px] text-muted-foreground/60">
                                        {new Date().toLocaleTimeString(
                                            'en-US',
                                            {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            },
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    {isStreaming && (
                        <div className="flex animate-in items-center gap-2 text-sm text-muted-foreground duration-300 fade-in">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="rounded-xl bg-card px-4 pt-3 pb-6">
                <form onSubmit={onSend}>
                    <div className="flex items-end gap-2">
                        <Textarea
                            value={input}
                            onChange={(
                                event: React.ChangeEvent<HTMLTextAreaElement>,
                            ) => setInput(event.target.value)}
                            placeholder="Ask about growth strategies..."
                            disabled={isStreaming}
                            className="max-h-[100px] min-h-[40px] flex-1 resize-none rounded-lg border-primary/15 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:ring-primary/20"
                            rows={1}
                            onKeyDown={(
                                e: React.KeyboardEvent<HTMLTextAreaElement>,
                            ) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onSend(e as unknown as React.FormEvent);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || isStreaming}
                            className="shadow-glow-primary h-10 w-10 shrink-0 rounded-lg bg-primary hover:bg-primary-hover"
                        >
                            {isStreaming ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </form>
                <div className="mt-2 flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            'h-7 gap-1.5 rounded-button border-border-strong px-3 text-xs',
                            isActive
                                ? 'border-primary bg-primary/20 hover:bg-primary/30'
                                : 'hover:border-primary/40 hover:bg-primary/10',
                        )}
                        onClick={toggleVoiceMode}
                        disabled={!selectedAgentId}
                    >
                        {isListening ? (
                            <>
                                <Mic className="h-3 w-3 animate-pulse" />
                                Listening...
                            </>
                        ) : isProcessing ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Processing...
                            </>
                        ) : isSpeaking ? (
                            <>
                                <Square className="h-3 w-3 animate-pulse" />
                                Speaking...
                            </>
                        ) : (
                            <>
                                <Mic className="h-3 w-3" />
                                Voice Mode
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 rounded-button border-border-strong px-3 text-xs hover:border-primary/40 hover:bg-primary/10"
                        onClick={onClearChat}
                        disabled={!selectedAgentId || messages.length === 0}
                    >
                        <Trash2 className="h-3 w-3" />
                        Clear Chat
                    </Button>
                </div>
            </div>
        </>
    );
}
