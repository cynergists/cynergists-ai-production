import { useState, useRef, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, ArrowLeft, Loader2, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AgentChat({ agentId }: { agentId: string }) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
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
          toast.error("Agent not found");
          router.visit("/portal/agents");
          return null;
        }

        if (!response.agent.is_active) {
          toast.error("This agent is no longer active");
          router.visit("/portal/agents");
          return null;
        }

        return response.agent;
      } catch (error) {
        console.error("Error fetching agent:", error);
        toast.error("Agent not found");
        router.visit("/portal/agents");
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
        console.error("Error loading conversation:", error);
        return null;
      }
    },
    enabled: !!agentId,
  });

  // Load messages from conversation
  useEffect(() => {
    if (conversation?.messages) {
      try {
        const parsed = typeof conversation.messages === 'string' 
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

      const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
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
      queryClient.invalidateQueries({ queryKey: ['agent-details', agentId] });
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
    setInput("");
  };

  if (agentLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/portal/agents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold">{agent.agent_name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{agent.agent_type}</p>
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
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-muted-foreground">
                Ask {agent.agent_name} anything. I'm here to help!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                <Card
                  className={cn(
                    "px-4 py-3 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>
                {message.role === "user" && (
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3 justify-start">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <Card className="px-4 py-3 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${agent.agent_name}...`}
            disabled={isStreaming}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isStreaming}>
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
