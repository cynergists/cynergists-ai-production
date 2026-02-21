import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceMode } from '@/hooks/useVoiceMode';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    Download,
    Loader2,
    Mic,
    Paperclip,
    Send,
    Square,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isVoiceGenerated?: boolean;
}

interface LunaChatProps {
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

function parseMessageContent(content: string): {
    text: string;
    imageUrl: string | null;
    pendingImageId: string | null;
} {
    // Check for completed image
    const imageMatch = content.match(/\[IMAGE:(.*?)\]/);
    if (imageMatch) {
        const text = content.replace(/\[IMAGE:.*?\]/, '').trim();
        return { text, imageUrl: imageMatch[1], pendingImageId: null };
    }

    // Check for pending image
    const pendingMatch = content.match(/\[IMAGE_PENDING:(.*?)\]/);
    if (pendingMatch) {
        const text = content.replace(/\[IMAGE_PENDING:.*?\]/, '').trim();
        return { text, imageUrl: null, pendingImageId: pendingMatch[1] };
    }

    return { text: content, imageUrl: null, pendingImageId: null };
}

function PendingImage({
    imageId,
    onExpand,
}: {
    imageId: string;
    onExpand: (url: string) => void;
}) {
    const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>(
        'pending',
    );
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (status !== 'pending') {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const response = await apiClient.get<{
                    status: 'pending' | 'completed' | 'failed';
                    public_url?: string;
                    error_message?: string;
                }>(`/api/portal/luna/images/${imageId}/status`);

                if (response.status === 'completed' && response.public_url) {
                    setStatus('completed');
                    setImageUrl(response.public_url);
                    clearInterval(interval);
                } else if (response.status === 'failed') {
                    setStatus('failed');
                    setErrorMessage(
                        response.error_message ?? 'Generation failed',
                    );
                    clearInterval(interval);
                }
            } catch {
                // Silently retry on network errors
            }
        }, 3000);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            setStatus('failed');
            setErrorMessage(
                'Image generation timed out. Please try again.',
            );
        }, 120000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [imageId, status]);

    if (status === 'pending') {
        return (
            <div className="max-w-[380px] overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex aspect-video items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-500/20 border-t-amber-500" />
                        <p className="text-sm text-amber-500/70">
                            Generating your image...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex max-w-[380px] items-center gap-2 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <p className="text-sm text-red-400">
                    {errorMessage ?? 'Image generation failed.'}
                </p>
            </div>
        );
    }

    return (
        <div className="group relative max-w-[380px] overflow-hidden rounded-xl border border-amber-500/20 shadow-lg">
            <img
                src={imageUrl!}
                alt="Generated by Luna"
                className="w-full cursor-pointer rounded-xl transition-transform duration-200 hover:scale-[1.02]"
                onClick={() => onExpand(imageUrl!)}
            />
            <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                    href={imageUrl!}
                    download
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                    title="Download image"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Download className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}

export function LunaChat({
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
    selectedAgentId,
    onMessageReceived,
}: LunaChatProps) {
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

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
            {/* Lightbox for expanded images */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setExpandedImage(null)}
                >
                    <img
                        src={expandedImage}
                        alt="Generated image"
                        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
                    />
                </div>
            )}

            {/* Messages */}
            <ScrollArea
                className="max-h-[600px] flex-1 px-4 py-3"
                ref={scrollRef}
            >
                <div className="space-y-3">
                    {messages.length === 0 ? (
                        <div className="animate-in py-8 text-center text-sm text-muted-foreground duration-300 fade-in">
                            <div className="mb-2 font-medium text-amber-500">
                                Your Vision. Her Power.
                            </div>
                            Tell Luna what you want to create.
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const { text, imageUrl, pendingImageId } =
                                parseMessageContent(message.content);

                            return (
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
                                            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-500/40">
                                                <img
                                                    src={
                                                        agentDetails.avatar_url
                                                    }
                                                    alt={
                                                        agentDetails.agent_name
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}
                                    <div className="flex flex-col gap-1">
                                        <Card
                                            className={cn(
                                                'max-w-[380px] rounded-xl px-3 py-2 text-foreground transition-all duration-200 hover:shadow-md',
                                                message.role === 'user'
                                                    ? 'rounded-br-sm bg-amber-600 text-white'
                                                    : 'rounded-bl-sm border border-amber-500/10 bg-surface-2',
                                            )}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {text}
                                            </p>
                                        </Card>
                                        {/* Inline image display */}
                                        {imageUrl && (
                                            <div className="group relative max-w-[380px] overflow-hidden rounded-xl border border-amber-500/20 shadow-lg">
                                                <img
                                                    src={imageUrl}
                                                    alt="Generated by Luna"
                                                    className="w-full cursor-pointer rounded-xl transition-transform duration-200 hover:scale-[1.02]"
                                                    onClick={() =>
                                                        setExpandedImage(
                                                            imageUrl,
                                                        )
                                                    }
                                                />
                                                <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <a
                                                        href={imageUrl}
                                                        download
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                                                        title="Download image"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {/* Pending image with spinner */}
                                        {pendingImageId && (
                                            <PendingImage
                                                imageId={pendingImageId}
                                                onExpand={(url) =>
                                                    setExpandedImage(url)
                                                }
                                            />
                                        )}
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
                            );
                        })
                    )}
                    {isStreaming && (
                        <div className="flex animate-in items-center gap-2 text-sm text-muted-foreground duration-300 fade-in">
                            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                            Crafting your vision...
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
                            placeholder="Describe what you want Luna to create..."
                            disabled={isStreaming}
                            className="max-h-[100px] min-h-[40px] flex-1 resize-none rounded-lg border-amber-500/15 bg-background px-3 py-2 text-sm focus:border-amber-500/40 focus:ring-amber-500/20"
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
                            className="h-10 w-10 shrink-0 rounded-lg bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-700"
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
                                ? 'border-amber-600 bg-amber-600/20 hover:bg-amber-600/30'
                                : 'hover:border-amber-500/40 hover:bg-amber-500/10',
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
