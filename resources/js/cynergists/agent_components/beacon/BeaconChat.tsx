import { Button } from '@/components/ui/button';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceMode } from '@/hooks/useVoiceMode';
import { cn } from '@/lib/utils';
import {
    Calendar,
    Clock,
    Loader2,
    Mic,
    Send,
    Square,
} from 'lucide-react';
import React from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isVoiceGenerated?: boolean;
}

interface BeaconChatProps {
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    isStreaming: boolean;
    isUploading: boolean;
    agentDetails: any;
    fileInputRef: React.RefObject<HTMLInputElement>;
    scrollRef: React.RefObject<HTMLDivElement>;
    onSend: (e: React.FormEvent) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileClick: () => void;
    selectedAgentId?: string | null;
    onMessageReceived?: (message: {
        role: 'user' | 'assistant';
        content: string;
        isVoiceGenerated?: boolean;
    }) => void;
}

export function BeaconChat({
    messages,
    input,
    setInput,
    isStreaming,
    agentDetails,
    scrollRef,
    onSend,
    selectedAgentId,
    onMessageReceived,
}: BeaconChatProps) {
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
                className="max-h-[600px] flex-1 px-4 py-3"
                ref={scrollRef}
            >
                <div className="space-y-3">
                    {messages.length === 0 ? (
                        <div className="animate-in py-8 text-center text-sm text-muted-foreground duration-300 fade-in">
                            <div className="mb-4 flex items-center justify-center gap-2 font-medium text-indigo-600">
                                <Calendar className="h-5 w-5" />
                                Event & Webinar Management
                            </div>
                            <div className="mb-3 text-indigo-600">
                                Configure your event workflow step by step.
                            </div>
                            <div className="text-xs space-y-1">
                                <div className="flex items-center justify-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    One question at a time
                                </div>
                                <div>Full validation before execution</div>
                                <div>Approval gates for safety</div>
                            </div>
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
                                        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-500/40">
                                            <img
                                                src={agentDetails.avatar_url}
                                                alt={agentDetails.agent_name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                <div className="flex flex-col gap-1">
                                    <Card
                                        className={cn(
                                            'max-w-[380px] rounded-xl px-3 py-2 text-foreground transition-all duration-200 hover:shadow-md',
                                            message.role === 'user'
                                                ? 'rounded-br-sm bg-indigo-600 text-white'
                                                : 'rounded-bl-sm border border-indigo-500/10 bg-surface-2',
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
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            Configuring your event workflow...
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="rounded-xl bg-card px-4 pt-3 pb-3">
                <form onSubmit={onSend}>
                    <div className="flex items-end gap-2">
                        <Textarea
                            value={input}
                            onChange={(
                                event: React.ChangeEvent<HTMLTextAreaElement>,
                            ) => setInput(event.target.value)}
                            placeholder="Configure your event details..."
                            disabled={isStreaming}
                            className="max-h-[100px] min-h-[40px] flex-1 resize-none rounded-lg border-indigo-500/15 bg-background px-3 py-2 text-sm focus:border-indigo-500/40 focus:ring-indigo-500/20"
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
                            className="h-10 w-10 shrink-0 rounded-lg bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:bg-indigo-700"
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
                                ? 'border-indigo-600 bg-indigo-600/20 hover:bg-indigo-600/30'
                                : 'hover:border-indigo-500/40 hover:bg-indigo-500/10',
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
                        disabled={isUploading}
                        onClick={onFileClick}
                    >
                        {isUploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Paperclip className="h-3 w-3" />
                        )}
                        Attach
                    </Button>
                </div>
            </div>
        </>
    );
}