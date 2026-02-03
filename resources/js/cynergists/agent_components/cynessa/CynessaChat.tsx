import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceMode } from '@/hooks/useVoiceMode';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Loader2, Mic, Paperclip, Send, Square, Trash2 } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface CynessaChatProps {
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
    onClearChat?: () => void;
    selectedAgentId?: string | null;
    onMessageReceived?: (message: {
        role: 'user' | 'assistant';
        content: string;
    }) => void;
}

export function CynessaChat({
    messages,
    input,
    setInput,
    isStreaming,
    isUploading,
    agentDetails,
    fileInputRef,
    scrollRef,
    onSend,
    onFileSelect,
    onFileClick,
    onClearChat,
    selectedAgentId,
    onMessageReceived,
}: CynessaChatProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const processedMessagesRef = useRef(new Set<number>());

    // Voice mode hook
    const {
        isRecording,
        isProcessing,
        isPlaying,
        toggleVoiceMode,
        isVoiceActive,
    } = useVoiceMode({
        agentId: selectedAgentId,
        onTranscriptReceived: (text) => {
            onMessageReceived?.({ role: 'user', content: text });
        },
        onResponseReceived: (response) => {
            onMessageReceived?.({ role: 'assistant', content: response.text });
        },
    });

    // Automatically speak all of Cynessa's responses
    useEffect(() => {
        const speakLatestMessage = async () => {
            if (!selectedAgentId || messages.length === 0) return;

            // Get the last message
            const lastMessage = messages[messages.length - 1];
            const lastIndex = messages.length - 1;

            // Only speak assistant messages that haven't been processed yet
            if (
                lastMessage.role === 'assistant' &&
                !processedMessagesRef.current.has(lastIndex)
            ) {
                processedMessagesRef.current.add(lastIndex);

                try {
                    console.log(
                        '[Auto-Voice] Converting Cynessa response to speech:',
                        lastMessage.content.substring(0, 50),
                    );

                    const response = await apiClient.post<{
                        success: boolean;
                        audio: string | null;
                        error?: string;
                    }>(`/api/portal/voice/${selectedAgentId}`, {
                        message: lastMessage.content,
                        textOnly: true, // Flag to indicate we're just converting text to speech
                    });

                    if (response.success && response.audio) {
                        console.log('[Auto-Voice] Playing audio response');
                        await playAudio(response.audio);
                    } else if (response.error) {
                        console.warn('[Auto-Voice] No audio:', response.error);
                    }
                } catch (error) {
                    console.error(
                        '[Auto-Voice] Failed to convert text to speech:',
                        error,
                    );
                }
            }
        };

        speakLatestMessage();
    }, [messages, selectedAgentId]);

    // Play audio from base64
    const playAudio = async (base64Audio: string): Promise<void> => {
        try {
            // Stop any currently playing audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            // Convert base64 to blob
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);

            // Create and play audio element
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onended = () => {
                URL.revokeObjectURL(audioUrl);
                audioRef.current = null;
            };
            audioRef.current.onerror = (e) => {
                console.error('[Auto-Voice] Audio playback error:', e);
                URL.revokeObjectURL(audioUrl);
                audioRef.current = null;
            };

            await audioRef.current.play();
        } catch (error) {
            console.error('[Auto-Voice] Failed to play audio:', error);
        }
    };

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

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
                            Start the conversation with{' '}
                            {agentDetails?.agent_name ?? 'your agent'}.
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
                                        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-2 ring-accent-purple/40">
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
                            Thinking...
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="rounded-xl bg-card px-4 pt-3 pb-3">
                <form onSubmit={onSend}>
                    <div className="flex items-end gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={onFileSelect}
                            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.svg,.webp,.mp4,.mov,.avi"
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={isUploading}
                            onClick={onFileClick}
                            className="h-10 w-10 shrink-0 rounded-lg"
                            title="Upload file"
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Paperclip className="h-4 w-4" />
                            )}
                        </Button>
                        <Textarea
                            value={input}
                            onChange={(
                                event: React.ChangeEvent<HTMLTextAreaElement>,
                            ) => setInput(event.target.value)}
                            placeholder="Type your message..."
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
                            isVoiceActive
                                ? 'border-primary bg-primary/20 hover:bg-primary/30'
                                : 'hover:border-primary/40 hover:bg-primary/10',
                        )}
                        onClick={toggleVoiceMode}
                        disabled={!selectedAgentId}
                    >
                        {isRecording ? (
                            <>
                                <Square className="h-3 w-3 animate-pulse" />
                                Recording...
                            </>
                        ) : isProcessing ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Processing...
                            </>
                        ) : isPlaying ? (
                            <>
                                <Square className="h-3 w-3 animate-pulse" />
                                Playing...
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
