import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    useLinkedInChats,
    useLinkedInChatMessages,
    useSendLinkedInMessage,
} from '@/hooks/useApexApi';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Loader2,
    MessageSquare,
    Send,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ApexMessagesViewProps {
    agentDetails: any;
}

export default function ApexMessagesView({
    agentDetails,
}: ApexMessagesViewProps) {
    const agentId = agentDetails?.apex_data?.available_agent_id ?? null;
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: chatsData, isLoading: chatsLoading } =
        useLinkedInChats(agentId);
    const { data: messagesData, isLoading: messagesLoading } =
        useLinkedInChatMessages(selectedChatId, agentId);
    const sendMessage = useSendLinkedInMessage(agentId ?? '');

    const allChats = chatsData?.chats ?? [];
    // Filter out read-only sponsored/offer chats for a cleaner experience
    const chats = allChats.filter((c) => !c.read_only);
    const messages = messagesData?.messages ?? [];

    const selectedChat = chats.find((c) => c.id === selectedChatId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChatId || !messageInput.trim()) return;
        sendMessage.mutate(
            { chatId: selectedChatId, text: messageInput.trim() },
            { onSuccess: () => setMessageInput('') },
        );
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2);
    };

    // Chat list view
    if (!selectedChatId) {
        return (
            <div className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-primary/10 px-4 py-2">
                    <p className="text-xs text-muted-foreground">
                        {chats.length} conversation
                        {chats.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <ScrollArea className="min-h-0 flex-1">
                    <div className="space-y-1 p-2">
                        {chatsLoading ? (
                            <div className="space-y-1">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex h-16 animate-pulse items-center gap-3 rounded-xl bg-muted/30 p-3"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-muted/50" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3 w-28 rounded bg-muted/50" />
                                            <div className="h-2.5 w-40 rounded bg-muted/50" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : chats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <MessageSquare className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mt-3 text-sm font-semibold text-foreground">
                                    No conversations yet
                                </h3>
                                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                    Your LinkedIn conversations will appear here
                                    once you start connecting with people.
                                </p>
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() =>
                                        setSelectedChatId(chat.id)
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                                        {chat.picture_url ? (
                                            <img
                                                src={chat.picture_url}
                                                alt={chat.name ?? 'Contact'}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium text-primary">
                                                {getInitials(chat.name)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {chat.name ?? 'Unknown'}
                                            </p>
                                            {chat.timestamp && (
                                                <span className="shrink-0 text-[10px] text-muted-foreground">
                                                    {formatTime(
                                                        chat.timestamp,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        {chat.occupation && (
                                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                {chat.occupation}
                                            </p>
                                        )}
                                    </div>
                                    {(chat.unread_count ?? 0) > 0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                                            {chat.unread_count}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        );
    }

    // Chat detail view
    const chatName = selectedChat?.name ?? 'Chat';
    const chatPicture = selectedChat?.picture_url ?? null;
    const chatInitials = getInitials(selectedChat?.name ?? null);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-primary/10 px-4 py-2">
                <button
                    onClick={() => setSelectedChatId(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                    {chatPicture ? (
                        <img
                            src={chatPicture}
                            alt={chatName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-xs font-medium text-primary">
                            {chatInitials}
                        </span>
                    )}
                </div>
                <p className="truncate text-sm font-medium text-foreground">
                    {chatName}
                </p>
            </div>

            {/* Messages */}
            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-3 p-4">
                    {messagesLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            No messages in this conversation yet.
                        </div>
                    ) : (
                        [...messages].reverse().map((msg) => {
                            const isSender = msg.is_sender === true;
                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        'flex',
                                        isSender
                                            ? 'justify-end'
                                            : 'justify-start',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[75%] rounded-xl px-3 py-2',
                                            isSender
                                                ? 'rounded-br-sm bg-primary text-primary-foreground'
                                                : 'rounded-bl-sm border border-primary/10 bg-muted/30',
                                        )}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {msg.text}
                                        </p>
                                        <p
                                            className={cn(
                                                'mt-1 text-right text-[10px]',
                                                isSender
                                                    ? 'text-primary-foreground/60'
                                                    : 'text-muted-foreground/60',
                                            )}
                                        >
                                            {formatTime(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-primary/10 px-4 py-3">
                <form onSubmit={handleSend} className="flex items-end gap-2">
                    <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="max-h-[80px] min-h-[36px] flex-1 resize-none rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        disabled={
                            !messageInput.trim() || sendMessage.isPending
                        }
                        className="h-9 w-9 shrink-0 rounded-lg bg-primary hover:bg-primary/90"
                        size="icon"
                    >
                        {sendMessage.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
