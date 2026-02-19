import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bot, Loader2, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AgentChat({ agentId }: { agentId: string }) {
    const queryClient = useQueryClient();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch agent details
    const { data: agent, isLoading: agentLoading } = useQuery({
        queryKey: ['agent-details', agentId],
        queryFn: async () => {
            if (!agentId) return null;

            try {
                const response = await apiClient.get<{
                    agent: {
                        id: string;
                        agent_type: string;
                        agent_name: string;
                        configuration: Record<string, unknown> | null;
                        is_active: boolean;
                        usage_count: number | null;
                        usage_limit: number | null;
                    } | null;
                }>(`/api/portal/agents/${agentId}`);

                if (!response.agent) {
                    toast.error('Agent not found');
                    router.visit('/portal/agents');
                    return null;
                }

                if (!response.agent.is_active) {
                    toast.error('This agent is no longer active');
                    router.visit('/portal/agents');
                    return null;
                }

                return response.agent;
            } catch (error) {
                console.error('Error fetching agent:', error);
                toast.error('Agent not found');
                router.visit('/portal/agents');
                return null;
            }
        },
        enabled: !!agentId,
    });

    // Load existing conversation
    const { data: conversation } = useQuery({
        queryKey: ['agent-conversation', agentId],
        queryFn: async () => {
            if (!agentId) return null;

            try {
                const response = await apiClient.get<{
                    conversation: { id: string; messages: Message[] } | null;
                }>(`/api/portal/agents/${agentId}/conversation`);
                return response.conversation;
            } catch (error) {
                console.error('Error loading conversation:', error);
                return null;
            }
        },
        enabled: !!agentId,
    });

    // Load messages from conversation
    useEffect(() => {
        if (conversation?.messages) {
            try {
                const parsed =
                    typeof conversation.messages === 'string'
                        ? JSON.parse(conversation.messages)
                        : conversation.messages;
                setMessages(parsed);
            } catch (e) {
                console.error('Error parsing messages:', e);
            }
        }
    }, [conversation]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Send message mutation
    const sendMessage = useMutation({
        mutationFn: async (userMessage: string) => {
            if (!agent || !agentId) throw new Error('No agent selected');

            const newMessages: Message[] = [
                ...messages,
                { role: 'user', content: userMessage },
            ];
            setMessages(newMessages);
            setIsStreaming(true);

            const response = await apiClient.post<{
                success: boolean;
                assistantMessage: string;
                messages: Message[];
            }>(`/api/portal/agents/${agentId}/message`, {
                message: userMessage,
            });

            return response;
        },
        onSuccess: (response) => {
            setIsStreaming(false);
            setMessages(response.messages);
            queryClient.invalidateQueries({
                queryKey: ['agent-details', agentId],
            });
        },
        onError: (error: Error) => {
            setIsStreaming(false);
            toast.error(error.message);
            // Remove the pending user message if there was an error
            setMessages((prev) => prev.slice(0, -1));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        sendMessage.mutate(input.trim());
        setInput('');
    };

    if (agentLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!agent) {
        return null;
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header - Updated per spec: 2x larger image, larger text, job title */}
            <div className="flex items-center gap-4 border-b border-border p-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/portal/agents">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-4">
                    {/* 2x larger agent image (was 12x12, now 24x24) */}
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-12 w-12 text-primary" />
                    </div>
                    <div>
                        {/* Larger agent name */}
                        <h1 className="text-2xl font-semibold">{agent.agent_name}</h1>
                        {/* Show job title instead of category, slightly larger */}
                        <p className="text-base text-muted-foreground">
                            {(agent as any).job_title || agent.agent_type || 'AI Agent'}
                        </p>
                    </div>
                </div>
                {agent.usage_limit && (
                    <div className="ml-auto text-sm text-muted-foreground">
                        {agent.usage_count || 0} / {agent.usage_limit} messages
                    </div>
                )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="mx-auto max-w-3xl space-y-4">
                    {messages.length === 0 ? (
                        <div className="py-12 text-center">
                            <Bot className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                            <h2 className="mb-2 text-xl font-semibold">
                                Start a conversation
                            </h2>
                            <p className="text-muted-foreground">
                                Ask {agent.agent_name} anything. I'm here to
                                help!
                            </p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'flex gap-3',
                                    message.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start',
                                )}
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Bot className="h-5 w-5 text-primary" />
                                    </div>
                                )}
                                <Card
                                    className={cn(
                                        'max-w-[80%] px-4 py-3',
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted',
                                    )}
                                >
                                    <p className="text-sm whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </Card>
                                {message.role === 'user' && (
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                                        <User className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {isStreaming &&
                        messages[messages.length - 1]?.role !== 'assistant' && (
                            <div className="flex justify-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <Bot className="h-5 w-5 text-primary" />
                                </div>
                                <Card className="bg-muted px-4 py-3">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </Card>
                            </div>
                        )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-4">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto flex max-w-3xl gap-2"
                >
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message ${agent.agent_name}...`}
                        disabled={isStreaming}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isStreaming}
                    >
                        {isStreaming ? (
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
