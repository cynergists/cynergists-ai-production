import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceMode } from '@/hooks/useVoiceMode';
import { cn } from '@/lib/utils';
import {
    Loader2,
    Mic,
    Send,
    Square,
    Trash2,
} from 'lucide-react';
import React from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface VectorChatProps {
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
        isVoiceGenerated?: boolean;
    }) => void;
}

export function VectorChat({
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
}: VectorChatProps) {
    const {
        isListening,
        isProcessing,
        isSpeaking,
        isActive,
        toggleVoiceMode,
    } = useVoiceMode({
        agentId: selectedAgentId ?? null,
        onTranscriptReceived: (text) => {
            onMessageReceived?.({ 
                role: 'user', 
                content: text,
                isVoiceGenerated: true,
            });
        },
        onResponseReceived: (response) => {
            onMessageReceived?.({
                role: 'assistant',
                content: response.text,
                isVoiceGenerated: true,
            });
        },
    });

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
                            Start a conversation with Vector. Ask about
                            campaign performance, budget optimization, or
                            creative strategy.
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
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                }}
                            >
                                {message.role === 'assistant' &&
                                    agentDetails?.avatar_url && (
                                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                                            <img
                                                src={agentDetails.avatar_url}
                                                alt={
                                                    agentDetails.agent_name
                                                }
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
                            Optimizing your campaigns...
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
                            placeholder="Ask about ad performance, budgets, or creative strategy..."
                            disabled={isStreaming}
                            className="max-h-[100px] min-h-[40px] flex-1 resize-none rounded-lg border-primary/15 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:ring-primary/20"
                            rows={1}
                            onKeyDown={(
                                e: React.KeyboardEvent<HTMLTextAreaElement>,
                            ) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onSend(
                                        e as unknown as React.FormEvent,
                                    );
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
                        disabled={
                            !selectedAgentId || messages.length === 0
                        }
                    >
                        <Trash2 className="h-3 w-3" />
                        Clear Chat
                    </Button>
                </div>
            </div>
        </>
    );
}
