import { useEffect, useMemo, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
  Mic,
  Trash2,
  MessageSquare,
  LayoutDashboard,
  Target,
  Users,
  Activity,
  Headphones,
  CircleCheck,
  Calendar,
  Sparkles,
  Search,
} from "lucide-react";
import { usePortalContext } from "@/contexts/PortalContext";
import { apiClient } from "@/lib/api-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<"chat" | "dashboard" | "campaigns" | "connections" | "messages" | "activity">("chat");
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [supportCategory, setSupportCategory] = useState("general");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [agentSearchQuery, setAgentSearchQuery] = useState("");

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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    if (!agentSearchQuery.trim()) return agents;

    const query = agentSearchQuery.toLowerCase();
    return agents.filter(
      (agent) =>
        agent.agent_name.toLowerCase().includes(query) ||
        agent.agent_type.toLowerCase().includes(query)
    );
  }, [agents, agentSearchQuery]);

  const totalPages = Math.ceil(filteredAgents.length / AGENTS_PER_PAGE);

  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * AGENTS_PER_PAGE;
    return filteredAgents.slice(startIndex, startIndex + AGENTS_PER_PAGE);
  }, [filteredAgents, currentPage]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [agentSearchQuery]);

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


  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage.mutate(input.trim());
    setInput("");
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this chat?")) {
      setMessages([]);
      toast.success("Chat cleared");
    }
  };

  const submitSupportRequest = useMutation({
    mutationFn: async () => {
      if (!supportSubject.trim() || !supportMessage.trim()) {
        throw new Error("Please fill in all required fields");
      }

      return apiClient.post<{ success: boolean; message: string }>("/api/portal/support", {
        category: supportCategory,
        subject: supportSubject,
        message: supportMessage,
      });
    },
    onSuccess: (response) => {
      toast.success(response.message || "Support request submitted successfully");
      setSupportDialogOpen(false);
      setSupportCategory("general");
      setSupportSubject("");
      setSupportMessage("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit support request");
    },
  });

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSupportRequest.mutate();
  };

  // Mock setup progress data - replace with real data from API
  const setupProgress = {
    completed: 1,
    total: 3,
    steps: [
      { id: "linkedin", label: "Connect LinkedIn", completed: true },
      { id: "booking", label: "Add Booking Link", completed: false },
      { id: "campaign", label: "Create Campaign", completed: false },
    ],
  };

  // Mock activity data - replace with real data from API
  const todayActivity = {
    connectionsRequested: 0,
    connectionsMade: 0,
    messagesSent: 0,
    meetingsScheduled: 0,
  };

  return (
    <div className="flex flex-col min-h-0 bg-background">
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-3 lg:p-6 gap-4 lg:gap-6 overflow-hidden">
        {/* Agents list */}
        <div className="hidden lg:flex w-80 shrink-0 flex-col min-h-0">
          <div className="bg-card border border-primary/20 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden">
            <h2 className="text-base font-semibold text-foreground mb-1">Your AI Agents</h2>
            <p className="text-xs text-muted-foreground mb-3">Select an agent to interact with</p>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search agents..."
                value={agentSearchQuery}
                onChange={(e) => setAgentSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-background border-primary/15 focus:border-primary/40"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
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
              <div className="space-y-2">
                {paginatedAgents.map((agent, index) => {
                  const isFeatured = index === 0; // First agent is featured
                  const isSelected = selectedAgentId === agent.id;

                  return (
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
                        "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all",
                        isSelected && "bg-primary/10 border-2 border-primary/40 shadow-[0_0_20px_rgba(136,203,21,0.15)]",
                        !isSelected && "border-2 border-transparent hover:bg-accent"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-lg overflow-hidden shrink-0",
                        isSelected && "ring-2 ring-accent-purple/50 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                      )}>
                        {agent.avatar_url ? (
                          <img
                            src={agent.avatar_url}
                            alt={agent.agent_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10">
                            <Bot className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm">{agent.agent_name}</h3>
                        <p className="text-xs text-muted-foreground">{agent.agent_type}</p>
                        {isFeatured && (
                          <div className="flex items-center gap-1 mt-1">
                            <Sparkles className="w-3 h-3 text-accent-purple" />
                            <span className="text-xs text-accent-purple font-medium">Featured</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            </div>
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
        <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-primary/20 bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-9 h-9 rounded-lg overflow-hidden shrink-0",
                selectedAgentId && "ring-2 ring-accent-purple/50 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
              )}>
                {agentDetails?.avatar_url ? (
                  <img
                    src={agentDetails.avatar_url}
                    alt={agentDetails.agent_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {agentDetails?.agent_name ?? "Select an agent"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {agentDetails?.agent_type ?? "Ready when you are"}
                </p>
              </div>
            </div>
            {selectedAgentId && agentDetails?.is_active && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/30">
                <CircleCheck className="w-3 h-3" />
                Connected
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Setup Progress */}
            {selectedAgentId && (
              <div className="space-y-1.5 mx-4 mt-3 mb-2 p-3 bg-muted/30 border border-primary/10 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Setup Progress</span>
                  <span className="text-xs text-muted-foreground">
                    {setupProgress.completed}/{setupProgress.total}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(setupProgress.completed / setupProgress.total) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {setupProgress.steps.map((step) => (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center gap-1 text-xs py-0.5 px-1.5 rounded-md",
                        step.completed
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {step.completed ? (
                        <CircleCheck className="h-3 w-3 text-green-500" />
                      ) : step.id === "booking" ? (
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Target className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="truncate text-[11px]">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
              {selectedAgentId ? (
                <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
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
                      {message.role === "assistant" && agentDetails?.avatar_url && (
                        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-accent-purple/40">
                          <img
                            src={agentDetails.avatar_url}
                            alt={agentDetails.agent_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5">
                        <Card
                          className={cn(
                            "max-w-[380px] rounded-xl px-3 py-2 text-foreground",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-surface-2 border border-primary/10 rounded-bl-sm"
                          )}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                        </Card>
                        <span className="text-[10px] text-muted-foreground/60 px-1 text-left">
                          {new Date().toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
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
              <div className="py-12 text-center text-sm text-muted-foreground">
                Pick an agent on the left to begin.
              </div>
            )}
            </ScrollArea>
          </div>

          <div className="px-4 pt-3 pb-3 bg-card rounded-xl">
            <form onSubmit={handleSend}>
              <div className="flex gap-2 items-end">
                <Textarea
                  value={input}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                  placeholder={
                    selectedAgentId
                      ? "Type your message..."
                      : "Select an agent to chat"
                  }
                  disabled={!selectedAgentId || isStreaming}
                  className="flex-1 min-h-[40px] max-h-[100px] bg-background border-primary/15 text-sm px-3 py-2 rounded-lg focus:border-primary/40 focus:ring-primary/20 resize-none"
                  rows={1}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as unknown as React.FormEvent);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={!selectedAgentId || !input.trim() || isStreaming}
                  className="h-10 w-10 rounded-lg shrink-0 bg-primary hover:bg-primary-hover shadow-glow-primary"
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs gap-1.5 rounded-button border-border-strong hover:bg-primary/10 hover:border-primary/40"
                disabled={!selectedAgentId}
              >
                <Mic className="w-3 h-3" />
                Voice Mode
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs gap-1.5 rounded-button border-border-strong hover:bg-primary/10 hover:border-primary/40"
                onClick={handleClearChat}
                disabled={!selectedAgentId || messages.length === 0}
              >
                <Trash2 className="w-3 h-3" />
                Clear Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Links & Activity */}
        <div className="hidden lg:flex w-[300px] shrink-0 flex-col gap-6 min-h-0 transition-all duration-300">
          {/* Quick Links */}
          <div className="bg-card border border-primary/20 rounded-2xl p-5 flex flex-col">
            <h2 className="text-lg font-semibold text-foreground mb-4 shrink-0">Quick Links</h2>
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveView("chat")}
                className={cn(
                  "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
                  activeView === "chat"
                    ? "text-primary border-l-primary bg-primary/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
                )}
              >
                <MessageSquare className="w-5 h-5 shrink-0" />
                Chat
              </button>
              <button
                onClick={() => setActiveView("dashboard")}
                className={cn(
                  "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
                  activeView === "dashboard"
                    ? "text-primary border-l-primary bg-primary/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
                )}
              >
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveView("campaigns")}
                className={cn(
                  "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
                  activeView === "campaigns"
                    ? "text-primary border-l-primary bg-primary/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
                )}
              >
                <Target className="w-5 h-5 shrink-0" />
                Campaigns
              </button>
              <button
                onClick={() => setActiveView("connections")}
                className={cn(
                  "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
                  activeView === "connections"
                    ? "text-primary border-l-primary bg-primary/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
                )}
              >
                <Users className="w-5 h-5 shrink-0" />
                Connections
              </button>
              <button
                onClick={() => setActiveView("messages")}
                className={cn(
                  "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
                  activeView === "messages"
                    ? "text-primary border-l-primary bg-primary/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
                )}
              >
                <MessageSquare className="w-5 h-5 shrink-0" />
                Messages
              </button>
              <button
                onClick={() => setActiveView("activity")}
                className={cn(
                  "flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3",
                  activeView === "activity"
                    ? "text-primary border-l-primary bg-primary/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
                )}
              >
                <Activity className="w-5 h-5 shrink-0" />
                Activity Log
              </button>
              <button
                onClick={() => router.visit("/portal/seo-engine")}
                className="flex items-center gap-3 text-left text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 border-l-3 text-foreground/70 hover:text-foreground hover:bg-muted/50 border-l-transparent"
              >
                <Sparkles className="w-5 h-5 shrink-0" />
                Carbon
              </button>
            </nav>
          </div>

          {/* Today's Activity */}
          <div className="bg-card border border-primary/20 rounded-2xl p-5 flex-1 flex flex-col overflow-hidden min-h-0">
            <h2 className="text-lg font-semibold text-foreground mb-4 shrink-0">Today&apos;s Activity</h2>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Connections Requested</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">{todayActivity.connectionsRequested}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CircleCheck className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Connections Made</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">{todayActivity.connectionsMade}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Messages Sent</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">{todayActivity.messagesSent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Meetings Scheduled</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">{todayActivity.meetingsScheduled}</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-primary/20 shrink-0">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-sm"
                onClick={() => setSupportDialogOpen(true)}
              >
                <Headphones className="w-4 h-4" />
                Get Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Support Dialog */}
      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              Get Support
            </DialogTitle>
            <DialogDescription>
              Need help? We&apos;re here for you. Describe your issue below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSupportSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="support-category">Category</Label>
              <Select value={supportCategory} onValueChange={setSupportCategory}>
                <SelectTrigger id="support-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Question</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing & Account</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="support-subject"
                placeholder="Brief summary of your request..."
                maxLength={200}
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="support-message"
                placeholder="Tell us how we can help..."
                rows={6}
                className="resize-none"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSupportDialogOpen(false)}
                disabled={submitSupportRequest.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitSupportRequest.isPending || !supportSubject.trim() || !supportMessage.trim()}
              >
                {submitSupportRequest.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
