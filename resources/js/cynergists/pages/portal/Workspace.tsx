import { getAgentComponents } from '@/agent_components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { usePortalContext } from '@/contexts/PortalContext';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Activity,
    Bot,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Globe,
    Headphones,
    LayoutDashboard,
    Loader2,
    MessageSquare,
    Mic,
    Paperclip,
    Search,
    Send,
    Sparkles,
    Target,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AgentAccess {
    id: string;
    agent_type: string;
    agent_name: string;
    job_title?: string | null;
    is_beta?: boolean;
    configuration: Record<string, unknown> | null;
    is_active: boolean;
    usage_count: number | null;
    usage_limit: number | null;
    last_used_at: string | null;
    avatar_url: string | null;
    redirect_url?: string | null;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const AGENTS_PER_PAGE = 5;

export default function PortalWorkspace() {
    const { user } = usePortalContext();
    const queryClient = useQueryClient();
    const { props } = usePage<{ agentId?: string }>();
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
        props.agentId ?? null,
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeView, setActiveView] = useState<
        | 'chat'
        | 'dashboard'
        | 'campaigns'
        | 'connections'
        | 'messages'
        | 'activity'
        | 'add-site'
    >('chat');
    const [supportDialogOpen, setSupportDialogOpen] = useState(false);
    const [supportCategory, setSupportCategory] = useState('agent_issue');
    const [supportAgentName, setSupportAgentName] = useState('');
    const [supportSubject, setSupportSubject] = useState('');
    const [supportMessage, setSupportMessage] = useState('');
    const [agentSearchQuery, setAgentSearchQuery] = useState('');
    const [mobileAgentSheetOpen, setMobileAgentSheetOpen] = useState(false);
    const [addSiteDialogOpen, setAddSiteDialogOpen] = useState(false);
    const [newSiteName, setNewSiteName] = useState('');
    const [newSiteUrl, setNewSiteUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setSelectedAgentId(props.agentId ?? null);
    }, [props.agentId]);

    const { data: agents, isLoading: agentsLoading } = useQuery({
        queryKey: ['portal-agents', user?.id],
        queryFn: async () => {
            const response = await apiClient.get<{ agents: AgentAccess[] }>(
                '/api/portal/agents',
            );
            return response.agents;
        },
        enabled: Boolean(user?.id),
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        staleTime: 0,
    });

    const { data: availableAgentNames } = useQuery({
        queryKey: ['support-agent-names'],
        queryFn: async () => {
            const response = await apiClient.get<{ agents: string[] }>(
                '/api/portal/support/agent-names',
            );
            return response.agents;
        },
        enabled: supportCategory === 'agent_issue',
        staleTime: 5 * 60 * 1000,
    });

    // Auto-select first agent (Cynessa) if no agent is selected
    useEffect(() => {
        if (!selectedAgentId && agents && agents.length > 0) {
            setSelectedAgentId(agents[0].id);
        }
    }, [agents, selectedAgentId]);

    const filteredAgents = useMemo(() => {
        if (!agents) return [];
        if (!agentSearchQuery.trim()) return agents;

        const query = agentSearchQuery.toLowerCase();
        return agents.filter(
            (agent) =>
                agent.agent_name.toLowerCase().includes(query) ||
                agent.agent_type.toLowerCase().includes(query) ||
                (agent.job_title?.toLowerCase().includes(query) ?? false),
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
        queryKey: ['agent-details', selectedAgentId],
        queryFn: async () => {
            if (!selectedAgentId) return null;
            const response = await apiClient.get<{ agent: AgentAccess | null }>(
                `/api/portal/agents/${selectedAgentId}`,
            );
            return response.agent;
        },
        enabled: Boolean(selectedAgentId),
    });

    const { data: conversation } = useQuery({
        queryKey: ['agent-conversation', selectedAgentId],
        queryFn: async () => {
            if (!selectedAgentId) return null;
            const response = await apiClient.get<{
                conversation: {
                    id: string;
                    messages: Message[] | string;
                } | null;
            }>(`/api/portal/agents/${selectedAgentId}/conversation`);
            return response.conversation;
        },
        enabled: Boolean(selectedAgentId),
    });

    // Get agent-specific components dynamically
    const agentComponents = useMemo(() => {
        if (!agentDetails?.agent_name) {
            return null;
        }
        return getAgentComponents(agentDetails.agent_name.toLowerCase());
    }, [agentDetails?.agent_name]);

    useEffect(() => {
        if (!conversation?.messages) {
            setMessages([]);
            return;
        }

        try {
            const parsed =
                typeof conversation.messages === 'string'
                    ? JSON.parse(conversation.messages)
                    : conversation.messages;
            setMessages(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
            console.error('Error parsing messages:', error);
            setMessages([]);
        }
    }, [conversation]);

    // Auto-start conversation with Cynessa
    useEffect(() => {
        if (
            selectedAgentId &&
            agentDetails?.agent_name?.toLowerCase() === 'cynessa' &&
            messages.length === 0 &&
            !isStreaming &&
            !sendMessage.isPending
        ) {
            // Small delay to ensure UI is ready
            const timer = setTimeout(() => {
                sendMessage.mutate('Hi');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [
        selectedAgentId,
        agentDetails?.agent_name,
        messages.length,
        isStreaming,
    ]);

    // Handle add-site view change
    useEffect(() => {
        if (activeView === 'add-site') {
            setAddSiteDialogOpen(true);
            setActiveView('chat'); // Reset view
        }
    }, [activeView]);

    useEffect(() => {
        if (scrollRef.current) {
            // For ScrollArea component, we need to access the viewport div
            const viewport = scrollRef.current.querySelector(
                '[data-radix-scroll-area-viewport]',
            );
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            } else {
                // Fallback to direct scrolling if viewport not found
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [messages, isStreaming]);

    const sendMessage = useMutation({
        mutationFn: async (messageText: string) => {
            if (!selectedAgentId) throw new Error('Select an agent to chat');

            const newMessages: Message[] = [
                ...messages,
                { role: 'user', content: messageText },
            ];
            setMessages(newMessages);
            setIsStreaming(true);

            return apiClient.post<{
                success: boolean;
                assistantMessage: string;
                messages: Message[];
            }>(`/api/portal/agents/${selectedAgentId}/message`, {
                message: messageText,
            });
        },
        onSuccess: (response) => {
            setIsStreaming(false);
            setMessages(Array.isArray(response.messages) ? response.messages : []);
            queryClient.invalidateQueries({
                queryKey: ['agent-details', selectedAgentId],
            });
            queryClient.invalidateQueries({
                queryKey: ['portal-stats', user?.id],
            });
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
        setInput('');
    };

    const uploadFile = useMutation({
        mutationFn: async (file: File) => {
            if (!selectedAgentId) throw new Error('Select an agent first');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'brand_asset');

            setIsUploading(true);

            return apiClient.post<{
                success: boolean;
                file: {
                    filename: string;
                    path: string;
                    url: string;
                    type: string;
                };
                message: string | null;
                messages?: Message[];
            }>(`/api/portal/agents/${selectedAgentId}/files`, formData);
        },
        onSuccess: (response) => {
            setIsUploading(false);
            toast.success(`File uploaded: ${response.file.filename}`);

            // Update conversation with full message history if provided
            if (Array.isArray(response.messages)) {
                setMessages(response.messages);
            } else if (response.message) {
                // Fallback: just add assistant message
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: response.message || '' },
                ]);
            }

            queryClient.invalidateQueries({
                queryKey: ['agent-details', selectedAgentId],
            });
            queryClient.invalidateQueries({
                queryKey: ['conversation', selectedAgentId],
            });
            queryClient.invalidateQueries({
                queryKey: ['portal-stats', user?.id],
            });
        },
        onError: (error: Error) => {
            setIsUploading(false);
            toast.error(`Upload failed: ${error.message}`);
        },
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file size (50MB max)
            if (file.size > 50 * 1024 * 1024) {
                toast.error('File size must not exceed 50MB');
                return;
            }
            uploadFile.mutate(file);
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submitSupportRequest = useMutation({
        mutationFn: async () => {
            if (!supportSubject.trim() || !supportMessage.trim()) {
                throw new Error('Please fill in all required fields');
            }

            return apiClient.post<{ success: boolean; message: string }>(
                '/api/portal/support',
                {
                    category: supportCategory,
                    agent_name: supportCategory === 'agent_issue' ? supportAgentName : null,
                    subject: supportSubject,
                    message: supportMessage,
                },
            );
        },
        onSuccess: (response) => {
            toast.success(
                response.message || 'Support request submitted successfully',
            );
            setSupportDialogOpen(false);
            setSupportCategory('agent_issue');
            setSupportAgentName('');
            setSupportSubject('');
            setSupportMessage('');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to submit support request');
        },
    });

    const handleCategoryChange = (value: string) => {
        setSupportCategory(value);
        if (value !== 'agent_issue') {
            setSupportAgentName('');
        }
    };

    const handleSupportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitSupportRequest.mutate();
    };

    const addSite = useMutation({
        mutationFn: async () => {
            if (!newSiteName.trim() || !newSiteUrl.trim()) {
                throw new Error('Please enter both site name and URL');
            }

            return apiClient.post<{ success: boolean; site: any }>(
                '/api/portal/seo/sites',
                {
                    name: newSiteName,
                    url: newSiteUrl,
                },
            );
        },
        onSuccess: (response) => {
            toast.success('Site added successfully');
            setAddSiteDialogOpen(false);
            setNewSiteName('');
            setNewSiteUrl('');
            queryClient.invalidateQueries({
                queryKey: ['agent-details', selectedAgentId],
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add site');
        },
    });

    const handleAddSite = (e: React.FormEvent) => {
        e.preventDefault();
        addSite.mutate();
    };

    // Fetch portal stats including onboarding progress
    const { data: portalStats } = useQuery({
        queryKey: ['portal-stats', user?.id],
        queryFn: async () => {
            const response = await apiClient.get<{
                agentCount: number;
                conversationCount: number;
                totalMessages: number;
                recentAgents: any[];
                onboardingProgress: {
                    completed: boolean;
                    percentComplete: number;
                    steps: Array<{
                        id: string;
                        label: string;
                        completed: boolean;
                    }>;
                };
            }>('/api/portal/stats');
            return response;
        },
        enabled: Boolean(user?.id),
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        staleTime: 0,
        // Poll every 2 seconds when talking to Cynessa to catch onboarding updates
        refetchInterval: (query) => {
            return agentDetails?.agent_name?.toLowerCase() === 'cynessa' &&
                !query.state.data?.onboardingProgress?.completed
                ? 2000
                : false;
        },
    });

    // Use real onboarding progress or fallback to empty state
    const setupProgress = portalStats?.onboardingProgress
        ? {
              completed: (portalStats.onboardingProgress.steps ?? []).filter(
                  (s) => s.completed,
              ).length,
              total: (portalStats.onboardingProgress.steps ?? []).length,
              steps: portalStats.onboardingProgress.steps ?? [],
          }
        : {
              completed: 0,
              total: 3,
              steps: [
                  {
                      id: 'company_info',
                      label: 'Company Information',
                      completed: false,
                  },
                  {
                      id: 'brand_assets',
                      label: 'Brand Assets',
                      completed: false,
                  },
                  {
                      id: 'team_intro',
                      label: 'Team Introductions',
                      completed: false,
                  },
              ],
          };

    // Carbon SEO stats from agent details
    const seoStats = agentDetails?.seo_data
        ? {
              healthScore: agentDetails.seo_data.seo_stats.health_score ?? null,
              totalSites: agentDetails.seo_data.seo_stats.total_sites || 0,
              activeAudits: agentDetails.seo_data.seo_stats.active_audits || 0,
              metrics: agentDetails.seo_data.seo_stats.metrics || [],
          }
        : {
              healthScore: null,
              totalSites: 0,
              activeAudits: 0,
              metrics: [],
          };

    // Mock activity data - replace with real data from API
    const todayActivity = {
        connectionsRequested: 0,
        connectionsMade: 0,
        messagesSent: 0,
        meetingsScheduled: 0,
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-3 lg:flex-row lg:gap-6 lg:p-6">
                {/* Agents list */}
                <div className="hidden min-h-0 w-80 shrink-0 flex-col lg:flex">
                    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-4">
                        <h2 className="mb-1 text-base font-semibold text-foreground">
                            Your AI Agents
                        </h2>
                        <p className="mb-3 text-xs text-muted-foreground">
                            Select an agent to interact with
                        </p>

                        {/* Search Input */}
                        <div className="relative mb-3">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search agents..."
                                value={agentSearchQuery}
                                onChange={(e) =>
                                    setAgentSearchQuery(e.target.value)
                                }
                                className="h-9 border-primary/15 bg-background pl-9 text-sm focus:border-primary/40"
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
                                        const isSelected =
                                            selectedAgentId === agent.id;

                                        return (
                                            <button
                                                key={agent.id}
                                                type="button"
                                                onClick={() => {
                                                    if (agent.redirect_url) {
                                                        window.location.href =
                                                            agent.redirect_url;
                                                    } else {
                                                        setSelectedAgentId(
                                                            agent.id,
                                                        );
                                                        router.visit(
                                                            `/portal/agents/${agent.id}/chat`,
                                                            {
                                                                preserveState: true,
                                                                preserveScroll: true,
                                                            },
                                                        );
                                                    }
                                                }}
                                                className={cn(
                                                    'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all',
                                                    isSelected &&
                                                        'border-2 border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(136,203,21,0.15)]',
                                                    !isSelected &&
                                                        'border-2 border-transparent hover:bg-accent',
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'h-12 w-12 shrink-0 overflow-hidden rounded-lg',
                                                        isSelected &&
                                                            'shadow-[0_0_12px_rgba(139,92,246,0.3)] ring-2 ring-accent-purple/50',
                                                    )}
                                                >
                                                    {agent.avatar_url ? (
                                                        <img
                                                            src={
                                                                agent.avatar_url
                                                            }
                                                            alt={
                                                                agent.agent_name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                                            <Bot className="h-6 w-6 text-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-semibold text-foreground">
                                                            {agent.agent_name}
                                                        </h3>
                                                        {agent.is_beta && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                                            >
                                                                BETA
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {agent.job_title || agent.agent_type}
                                                    </p>
                                                    {isFeatured && (
                                                        <div className="mt-1 flex items-center gap-1">
                                                            <Sparkles className="h-3 w-3 text-accent-purple" />
                                                            <span className="text-xs font-medium text-accent-purple">
                                                                Featured
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="shrink-0 border-t border-primary/20 pt-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 text-sm"
                                onClick={() => setSupportDialogOpen(true)}
                            >
                                <Headphones className="h-4 w-4" />
                                Get Support
                            </Button>
                        </div>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-border px-4 py-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1),
                                    )
                                }
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
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="h-8 px-2"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile agent picker bar */}
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-primary/20 bg-card px-3 py-2 lg:hidden"
                    onClick={() => setMobileAgentSheetOpen(true)}
                >
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                        {agentDetails?.avatar_url ? (
                            <img
                                src={agentDetails.avatar_url}
                                alt={agentDetails.agent_name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                <Bot className="h-4 w-4 text-primary" />
                            </div>
                        )}
                    </div>
                    <span className="flex-1 truncate text-left text-sm font-medium text-foreground">
                        {agentDetails?.agent_name ?? 'Select an agent'}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>

                {/* Mobile agent picker Sheet */}
                <Sheet
                    open={mobileAgentSheetOpen}
                    onOpenChange={setMobileAgentSheetOpen}
                >
                    <SheetContent side="left" className="w-80 p-0">
                        <SheetHeader className="px-4 pt-4">
                            <SheetTitle>Your AI Agents</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
                            <div className="relative mb-3">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search agents..."
                                    value={agentSearchQuery}
                                    onChange={(e) =>
                                        setAgentSearchQuery(e.target.value)
                                    }
                                    className="h-9 border-primary/15 bg-background pl-9 text-sm focus:border-primary/40"
                                />
                            </div>
                            <div className="flex-1 space-y-2 overflow-y-auto">
                                {paginatedAgents.map((agent) => {
                                    const isSelected =
                                        selectedAgentId === agent.id;
                                    return (
                                        <button
                                            key={agent.id}
                                            type="button"
                                            onClick={() => {
                                                if (agent.redirect_url) {
                                                    window.location.href =
                                                        agent.redirect_url;
                                                } else {
                                                    setSelectedAgentId(
                                                        agent.id,
                                                    );
                                                    router.visit(
                                                        `/portal/agents/${agent.id}/chat`,
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }
                                                setMobileAgentSheetOpen(false);
                                            }}
                                            className={cn(
                                                'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all',
                                                isSelected &&
                                                    'border-2 border-primary/40 bg-primary/10',
                                                !isSelected &&
                                                    'border-2 border-transparent hover:bg-accent',
                                            )}
                                        >
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                                                {agent.avatar_url ? (
                                                    <img
                                                        src={agent.avatar_url}
                                                        alt={agent.agent_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                                        <Bot className="h-5 w-5 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    {agent.agent_name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {agent.job_title ||
                                                        agent.agent_type}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="shrink-0 border-t border-primary/20 pt-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 text-sm"
                                    onClick={() => {
                                        setMobileAgentSheetOpen(false);
                                        setSupportDialogOpen(true);
                                    }}
                                >
                                    <Headphones className="h-4 w-4" />
                                    Get Support
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Chat */}
                <div
                    className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card"
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (selectedAgentId) setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(false);
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (file && selectedAgentId) {
                            uploadFile.mutate(file);
                        }
                    }}
                >
                    {isDragging && (
                        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/10">
                            <div className="text-center">
                                <Paperclip className="mx-auto h-8 w-8 text-primary" />
                                <p className="mt-2 text-sm font-medium text-primary">
                                    Drop file to attach
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between border-b border-primary/20 px-4 py-2">
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    'h-9 w-9 shrink-0 overflow-hidden rounded-lg',
                                    selectedAgentId &&
                                        'shadow-[0_0_12px_rgba(139,92,246,0.3)] ring-2 ring-accent-purple/50',
                                )}
                            >
                                {agentDetails?.avatar_url ? (
                                    <img
                                        src={agentDetails.avatar_url}
                                        alt={agentDetails.agent_name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                        <Bot className="h-5 w-5 text-primary" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    {agentDetails?.agent_name ??
                                        'Select an agent'}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {agentDetails?.agent_type ??
                                        'Ready when you are'}
                                </p>
                            </div>
                        </div>
                        {/* Removed "Connected" status per spec - unclear and confusing */}
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col">
                        {/* Agent-Specific View Component (non-chat views) */}
                        {agentComponents?.ViewComponent &&
                        activeView !== 'chat' ? (
                            <agentComponents.ViewComponent
                                activeView={activeView}
                                setActiveView={setActiveView}
                                agentDetails={agentDetails}
                            />
                        ) : (
                            <>
                        {/* Agent-Specific Chat Component */}
                        {agentComponents?.ChatComponent ? (
                            <agentComponents.ChatComponent
                                messages={messages}
                                input={input}
                                setInput={setInput}
                                isStreaming={isStreaming}
                                isUploading={isUploading}
                                agentDetails={agentDetails}
                                fileInputRef={fileInputRef}
                                scrollRef={scrollRef}
                                onSend={handleSend}
                                onFileSelect={handleFileSelect}
                                onFileClick={() =>
                                    fileInputRef.current?.click()
                                }
                                selectedAgentId={selectedAgentId}
                                onMessageReceived={(message) => {
                                    setMessages((prev) => [...prev, message]);
                                    setTimeout(() => {
                                        scrollRef.current?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'end',
                                        });
                                    }, 100);
                                }}
                            />
                        ) : (
                            <>
                                {/* Fallback Generic Chat UI */}
                                <ScrollArea
                                    className="min-h-0 flex-1 px-4 py-3"
                                    ref={scrollRef}
                                >
                                    {selectedAgentId ? (
                                        <div className="space-y-3">
                                            {messages.length === 0 ? (
                                                <div className="animate-in py-8 text-center text-sm text-muted-foreground duration-300 fade-in">
                                                    Start the conversation with{' '}
                                                    {agentDetails?.agent_name ??
                                                        'your agent'}
                                                    .
                                                </div>
                                            ) : (
                                                messages.map(
                                                    (message, index) => (
                                                        <div
                                                            key={`${message.role}-${index}`}
                                                            className={cn(
                                                                'flex animate-in gap-3 duration-300 fade-in slide-in-from-bottom-2',
                                                                message.role ===
                                                                    'user'
                                                                    ? 'justify-end'
                                                                    : 'justify-start',
                                                            )}
                                                            style={{
                                                                animationDelay: `${index * 50}ms`,
                                                            }}
                                                        >
                                                            {message.role ===
                                                                'assistant' &&
                                                                agentDetails?.avatar_url && (
                                                                    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-2 ring-accent-purple/40">
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
                                                            <div className="flex flex-col gap-0.5">
                                                                <Card
                                                                    className={cn(
                                                                        'max-w-[380px] rounded-xl px-3 py-2 text-foreground transition-all duration-200 hover:shadow-md',
                                                                        message.role ===
                                                                            'user'
                                                                            ? 'rounded-br-sm bg-primary text-primary-foreground'
                                                                            : 'rounded-bl-sm border border-primary/10 bg-surface-2',
                                                                    )}
                                                                >
                                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                        {
                                                                            message.content
                                                                        }
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
                                                    ),
                                                )
                                            )}
                                            {isStreaming && (
                                                <div className="flex animate-in items-center gap-2 text-sm text-muted-foreground duration-300 fade-in">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Thinking...
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="animate-in py-12 text-center text-sm text-muted-foreground duration-500 fade-in">
                                            Pick an agent on the left to begin.
                                        </div>
                                    )}
                                </ScrollArea>

                                <div className="rounded-xl bg-card px-4 pt-3 pb-3">
                                    <form onSubmit={handleSend}>
                                        <div className="flex items-end gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileSelect}
                                                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.svg,.webp,.mp4,.mov,.avi"
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                disabled={
                                                    !selectedAgentId ||
                                                    isUploading
                                                }
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
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
                                                ) =>
                                                    setInput(event.target.value)
                                                }
                                                placeholder={
                                                    selectedAgentId
                                                        ? 'Type your message...'
                                                        : 'Select an agent to chat'
                                                }
                                                disabled={
                                                    !selectedAgentId ||
                                                    isStreaming
                                                }
                                                className="max-h-[100px] min-h-[40px] flex-1 resize-none rounded-lg border-primary/15 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:ring-primary/20"
                                                rows={1}
                                                onKeyDown={(
                                                    e: React.KeyboardEvent<HTMLTextAreaElement>,
                                                ) => {
                                                    if (
                                                        e.key === 'Enter' &&
                                                        !e.shiftKey
                                                    ) {
                                                        e.preventDefault();
                                                        handleSend(
                                                            e as unknown as React.FormEvent,
                                                        );
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="submit"
                                                disabled={
                                                    !selectedAgentId ||
                                                    !input.trim() ||
                                                    isStreaming
                                                }
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
                                            className="h-7 gap-1.5 rounded-button border-border-strong px-3 text-xs hover:border-primary/40 hover:bg-primary/10"
                                            disabled={!selectedAgentId}
                                        >
                                            <Mic className="h-3 w-3" />
                                            Voice Mode
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 gap-1.5 rounded-button border-border-strong px-3 text-xs hover:border-primary/40 hover:bg-primary/10"
                                            disabled={
                                                !selectedAgentId || isUploading
                                            }
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
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
                        )}
                            </>
                        )}
                    </div>
                </div>

                {/* Agent-Specific Sidebar (Quick Links & Activity or Custom Content) */}
                {agentComponents?.SidebarComponent ? (
                    <agentComponents.SidebarComponent
                        activeView={activeView}
                        setActiveView={setActiveView}
                        todayActivity={todayActivity}
                        agentDetails={agentDetails}
                        seoStats={seoStats}
                        setupProgress={setupProgress}
                    />
                ) : (
                    <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
                        {/* Quick Links */}
                        <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                            <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                                Quick Links
                            </h2>
                            <nav className="flex flex-col space-y-2">
                                <button
                                    onClick={() => setActiveView('chat')}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                                        activeView === 'chat'
                                            ? 'border-l-primary bg-primary/10 text-primary'
                                            : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                                    )}
                                >
                                    <MessageSquare className="h-5 w-5 shrink-0" />
                                    Chat
                                </button>
                                <button
                                    onClick={() => setActiveView('dashboard')}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                                        activeView === 'dashboard'
                                            ? 'border-l-primary bg-primary/10 text-primary'
                                            : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                                    )}
                                >
                                    <LayoutDashboard className="h-5 w-5 shrink-0" />
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setActiveView('campaigns')}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                                        activeView === 'campaigns'
                                            ? 'border-l-primary bg-primary/10 text-primary'
                                            : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                                    )}
                                >
                                    <Target className="h-5 w-5 shrink-0" />
                                    Campaigns
                                </button>
                                <button
                                    onClick={() => setActiveView('connections')}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                                        activeView === 'connections'
                                            ? 'border-l-primary bg-primary/10 text-primary'
                                            : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                                    )}
                                >
                                    <Users className="h-5 w-5 shrink-0" />
                                    Connections
                                </button>
                                <button
                                    onClick={() => setActiveView('messages')}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                                        activeView === 'messages'
                                            ? 'border-l-primary bg-primary/10 text-primary'
                                            : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                                    )}
                                >
                                    <MessageSquare className="h-5 w-5 shrink-0" />
                                    Messages
                                </button>
                                <button
                                    onClick={() => setActiveView('activity')}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                                        activeView === 'activity'
                                            ? 'border-l-primary bg-primary/10 text-primary'
                                            : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                                    )}
                                >
                                    <Activity className="h-5 w-5 shrink-0" />
                                    Activity Log
                                </button>
                            </nav>
                        </div>

                        {/* Today's Activity */}
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                            <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                                Today&apos;s Activity
                            </h2>
                            <div className="flex-1 overflow-y-auto">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <Users className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-sm text-foreground">
                                                Connections Requested
                                            </span>
                                        </div>
                                        <span className="text-lg font-semibold text-foreground">
                                            {todayActivity.connectionsRequested}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <CircleCheck className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-sm text-foreground">
                                                Connections Made
                                            </span>
                                        </div>
                                        <span className="text-lg font-semibold text-foreground">
                                            {todayActivity.connectionsMade}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <MessageSquare className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-sm text-foreground">
                                                Messages Sent
                                            </span>
                                        </div>
                                        <span className="text-lg font-semibold text-foreground">
                                            {todayActivity.messagesSent}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <Calendar className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-sm text-foreground">
                                                Meetings Scheduled
                                            </span>
                                        </div>
                                        <span className="text-lg font-semibold text-foreground">
                                            {todayActivity.meetingsScheduled}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Support Dialog */}
            <Dialog
                open={supportDialogOpen}
                onOpenChange={setSupportDialogOpen}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Headphones className="h-5 w-5 text-primary" />
                            Get Support
                        </DialogTitle>
                        <DialogDescription>
                            Need help? We&apos;re here for you. Describe your
                            issue below.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleSupportSubmit}
                        className="mt-4 space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="support-category">Category</Label>
                            <Select
                                value={supportCategory}
                                onValueChange={handleCategoryChange}
                            >
                                <SelectTrigger id="support-category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="agent_issue">
                                        Agent Issue
                                    </SelectItem>
                                    <SelectItem value="billing">
                                        Billing & Account
                                    </SelectItem>
                                    <SelectItem value="feature_request">
                                        Feature Request
                                    </SelectItem>
                                    <SelectItem value="general">
                                        General Question
                                    </SelectItem>
                                    <SelectItem value="portal_issue">
                                        Portal Issue
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {supportCategory === 'agent_issue' && (
                            <div className="space-y-2">
                                <Label htmlFor="support-agent-name">
                                    AI Agent{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={supportAgentName}
                                    onValueChange={setSupportAgentName}
                                >
                                    <SelectTrigger id="support-agent-name">
                                        <SelectValue placeholder="Select an agent..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableAgentNames?.map((name) => (
                                            <SelectItem
                                                key={name}
                                                value={name}
                                            >
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="support-subject">
                                Subject{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="support-subject"
                                placeholder="Brief summary of your request..."
                                maxLength={200}
                                value={supportSubject}
                                onChange={(e) =>
                                    setSupportSubject(e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="support-message">
                                Message{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="support-message"
                                placeholder="Tell us how we can help..."
                                rows={6}
                                className="resize-none"
                                value={supportMessage}
                                onChange={(e) =>
                                    setSupportMessage(e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
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
                                disabled={
                                    submitSupportRequest.isPending ||
                                    !supportSubject.trim() ||
                                    !supportMessage.trim() ||
                                    (supportCategory === 'agent_issue' &&
                                        !supportAgentName)
                                }
                            >
                                {submitSupportRequest.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Request'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Site Dialog */}
            <Dialog
                open={addSiteDialogOpen}
                onOpenChange={setAddSiteDialogOpen}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-green-600" />
                            Add New Site
                        </DialogTitle>
                        <DialogDescription>
                            Add a website to monitor for SEO performance and insights.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleAddSite}
                        className="mt-4 space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="site-name">
                                Site Name{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="site-name"
                                type="text"
                                placeholder="My Awesome Website"
                                value={newSiteName}
                                onChange={(e) =>
                                    setNewSiteName(e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="site-url">
                                Website URL{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="site-url"
                                type="url"
                                placeholder="https://example.com"
                                value={newSiteUrl}
                                onChange={(e) =>
                                    setNewSiteUrl(e.target.value)
                                }
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the full URL including https://
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddSiteDialogOpen(false)}
                                disabled={addSite.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    addSite.isPending ||
                                    !newSiteName.trim() ||
                                    !newSiteUrl.trim()
                                }
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {addSite.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    'Add Site'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
