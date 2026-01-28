import { useEffect, useMemo, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, ChevronLeft, ChevronRight, Loader2, Send, Settings2 } from "lucide-react";
import { usePortalContext } from "@/contexts/PortalContext";
import { apiClient } from "@/lib/api-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AgentAccess {
  id: string;
  agent_type: string;
  agent_name: string;
  configuration: Record<string, unknown> | null;
  is_active: boolean;
  usage_count: number | null;
  usage_limit: number | null;
  last_used_at: string | null;
  avatar_url: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AGENTS_PER_PAGE = 5;

export default function PortalWorkspace() {
  const { user } = usePortalContext();
  const queryClient = useQueryClient();
  const { props } = usePage<{ agentId?: string }>();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
    props.agentId ?? null
  );
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [configText, setConfigText] = useState("");
  const [configBaseline, setConfigBaseline] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedAgentId(props.agentId ?? null);
  }, [props.agentId]);

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["portal-agents", user?.id],
    queryFn: async () => {
      const response = await apiClient.get<{ agents: AgentAccess[] }>("/api/portal/agents");
      return response.agents;
    },
    enabled: Boolean(user?.id),
  });

  const filteredAgents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return agents ?? [];
    return (agents ?? []).filter((agent) =>
      `${agent.agent_name} ${agent.agent_type}`.toLowerCase().includes(term)
    );
  }, [agents, search]);

  const totalPages = Math.ceil(filteredAgents.length / AGENTS_PER_PAGE);

  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * AGENTS_PER_PAGE;
    return filteredAgents.slice(startIndex, startIndex + AGENTS_PER_PAGE);
  }, [filteredAgents, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: agentDetails, isLoading: agentLoading } = useQuery({
    queryKey: ["agent-details", selectedAgentId],
    queryFn: async () => {
      if (!selectedAgentId) return null;
      const response = await apiClient.get<{ agent: AgentAccess | null }>(
        `/api/portal/agents/${selectedAgentId}`
      );
      return response.agent;
    },
    enabled: Boolean(selectedAgentId),
  });

  const { data: conversation } = useQuery({
    queryKey: ["agent-conversation", selectedAgentId],
    queryFn: async () => {
      if (!selectedAgentId) return null;
      const response = await apiClient.get<{
        conversation: { id: string; messages: Message[] | string } | null;
      }>(`/api/portal/agents/${selectedAgentId}/conversation`);
      return response.conversation;
    },
    enabled: Boolean(selectedAgentId),
  });

  useEffect(() => {
    if (!conversation?.messages) {
      setMessages([]);
      return;
    }

    try {
      const parsed =
        typeof conversation.messages === "string"
          ? JSON.parse(conversation.messages)
          : conversation.messages;
      setMessages(parsed);
    } catch (error) {
      console.error("Error parsing messages:", error);
      setMessages([]);
    }
  }, [conversation]);

  useEffect(() => {
    if (!agentDetails) {
      setConfigText("");
      setConfigBaseline("");
      setConfigError(null);
      return;
    }

    const nextConfig = JSON.stringify(agentDetails.configuration ?? {}, null, 2);
    setConfigText(nextConfig);
    setConfigBaseline(nextConfig);
    setConfigError(null);
  }, [agentDetails]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      if (!selectedAgentId) throw new Error("Select an agent to chat");

      const newMessages: Message[] = [...messages, { role: "user", content: messageText }];
      setMessages(newMessages);
      setIsStreaming(true);

      return apiClient.post<{
        success: boolean;
        assistantMessage: string;
        messages: Message[];
      }>(`/api/portal/agents/${selectedAgentId}/message`, { message: messageText });
    },
    onSuccess: (response) => {
      setIsStreaming(false);
      setMessages(response.messages);
      queryClient.invalidateQueries({ queryKey: ["agent-details", selectedAgentId] });
    },
    onError: (error: Error) => {
      setIsStreaming(false);
      toast.error(error.message);
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  const saveConfig = useMutation({
    mutationFn: async () => {
      if (!selectedAgentId) throw new Error("Select an agent to update configuration");

      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(configText || "{}");
      } catch (error) {
        throw new Error("Configuration must be valid JSON.");
      }

      return apiClient.put<{ success: boolean; agent: AgentAccess }>(
        `/api/portal/agents/${selectedAgentId}/configuration`,
        { configuration: payload }
      );
    },
    onSuccess: (response) => {
      const nextConfig = JSON.stringify(response.agent.configuration ?? {}, null, 2);
      setConfigText(nextConfig);
      setConfigBaseline(nextConfig);
      setConfigError(null);
      toast.success("Configuration saved.");
      queryClient.invalidateQueries({ queryKey: ["agent-details", selectedAgentId] });
    },
    onError: (error: Error) => {
      setConfigError(error.message);
      toast.error(error.message);
    },
  });

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage.mutate(input.trim());
    setInput("");
  };

  const hasConfigChanges = configText !== configBaseline;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full gap-4 p-6">
        {/* Agents list */}
        <div className="flex w-[280px] flex-col gap-4 rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <p className="text-sm font-semibold text-foreground">Agents</p>
            <p className="text-xs text-muted-foreground">Select an agent to chat.</p>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search agents"
              className="mt-3"
            />
          </div>
          <div className="min-h-[340px] flex-1 overflow-hidden px-2">
            {agentsLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading agents...
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                No agents found.
              </div>
            ) : (
              <div className="space-y-2 px-2">
                {paginatedAgents.map((agent) => (
                                  <button
                                    key={agent.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedAgentId(agent.id);
                                      router.visit(`/portal/agents/${agent.id}/chat`, {
                                        preserveState: true,
                                        preserveScroll: true,
                                      });
                                    }}
                                    className={cn(
                                      "flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition-colors",
                                      selectedAgentId === agent.id
                                        ? "border-primary/40 bg-primary/10"
                                        : "hover:bg-accent"
                                    )}
                                  >
                                    {agent.avatar_url ? (
                                      <img
                                        src={agent.avatar_url}
                                        alt={agent.agent_name}
                                        className="h-9 w-9 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                        <Bot className="h-4 w-4 text-primary" />
                                      </div>
                                    )}
                                    <div className="flex min-w-0 flex-1 flex-col">
                                      <span className="text-sm font-medium text-foreground truncate">
                                        {agent.agent_name}
                                      </span>
                                      <span className="text-xs text-muted-foreground capitalize truncate">
                                        {agent.agent_type}
                                      </span>
                                    </div>
                                  </button>
                ))}
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            {agentDetails?.avatar_url ? (
              <img
                src={agentDetails.avatar_url}
                alt={agentDetails.agent_name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {agentDetails?.agent_name ?? "Select an agent"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {agentDetails?.agent_type ?? "Ready when you are"}
              </p>
            </div>
            {(agentLoading || agentsLoading) && (
              <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
            {selectedAgentId ? (
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Start the conversation with {agentDetails?.agent_name ?? "your agent"}.
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <Card
                        className={cn(
                          "max-w-[75%] px-4 py-3 text-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </Card>
                    </div>
                  ))
                )}
                {isStreaming && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Pick an agent on the left to begin.
              </div>
            )}
          </ScrollArea>

          <div className="border-t border-border p-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  selectedAgentId
                    ? `Message ${agentDetails?.agent_name ?? "agent"}`
                    : "Select an agent to chat"
                }
                disabled={!selectedAgentId || isStreaming}
              />
              <Button type="submit" disabled={!selectedAgentId || !input.trim() || isStreaming}>
                {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>

        {/* Config */}
        <div className="flex w-[320px] flex-col gap-4 rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Configuration</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Edit configuration JSON for the selected agent.
            </p>
          </div>
          <div className="flex-1 px-4 pb-4">
            {selectedAgentId ? (
              <div className="flex h-full flex-col gap-3">
                <Textarea
                  value={configText}
                  onChange={(event) => {
                    setConfigText(event.target.value);
                    setConfigError(null);
                  }}
                  className="min-h-[320px] flex-1 font-mono text-xs"
                  placeholder={`{\n  "key": "value"\n}`}
                />
                {configError && (
                  <p className="text-xs text-destructive">{configError}</p>
                )}
                <Button
                  onClick={() => saveConfig.mutate()}
                  disabled={!hasConfigChanges || saveConfig.isPending}
                >
                  {saveConfig.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select an agent to edit settings.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
