import { apiClient } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApexCampaign {
    id: string;
    name: string;
    campaign_type: string;
    status: string;
    job_titles: string[];
    locations: string[];
    keywords: string[];
    industries: string[];
    connection_message: string | null;
    follow_up_message_1: string | null;
    follow_up_message_2: string | null;
    follow_up_message_3: string | null;
    follow_up_delay_days_1: number | null;
    follow_up_delay_days_2: number | null;
    follow_up_delay_days_3: number | null;
    booking_method: string | null;
    calendar_link: string | null;
    phone_number: string | null;
    daily_connection_limit: number;
    daily_message_limit: number;
    connections_sent: number;
    connections_accepted: number;
    messages_sent: number;
    replies_received: number;
    meetings_booked: number;
    started_at: string | null;
    paused_at: string | null;
    completed_at: string | null;
    created_at: string;
    campaign_prospects_count?: number;
    pending_actions_count?: number;
    acceptance_rate?: number;
    reply_rate?: number;
}

interface CampaignFormData {
    name: string;
    campaign_type: 'connection' | 'message' | 'follow_up';
    job_titles: string[];
    locations: string[];
    keywords: string[];
    industries: string[];
    connection_message: string;
    follow_up_message_1: string;
    follow_up_message_2: string;
    follow_up_message_3: string;
    follow_up_delay_days_1: number | null;
    follow_up_delay_days_2: number | null;
    follow_up_delay_days_3: number | null;
    booking_method: string;
    calendar_link: string;
    phone_number: string;
    daily_connection_limit: number | null;
    daily_message_limit: number | null;
}

interface ApexProspect {
    id: string;
    linkedin_profile_url: string | null;
    first_name: string;
    last_name: string;
    full_name: string;
    headline: string | null;
    company: string | null;
    job_title: string | null;
    location: string | null;
    email: string | null;
    avatar_url: string | null;
    connection_status: string;
    source: string | null;
    created_at: string;
}

interface ApexPendingAction {
    id: string;
    action_type: string;
    status: string;
    message_content: string | null;
    expires_at: string | null;
    approved_at: string | null;
    executed_at: string | null;
    created_at: string;
    campaign?: { id: string; name: string };
    prospect?: { id: string; full_name: string; first_name: string; last_name: string };
}

interface ApexActivityLog {
    id: string;
    activity_type: string;
    description: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    campaign?: { id: string; name: string } | null;
    prospect?: { id: string; full_name: string; first_name: string; last_name: string } | null;
}

interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useApexCampaigns() {
    return useQuery({
        queryKey: ['apex-campaigns'],
        queryFn: () =>
            apiClient.get<{ campaigns: ApexCampaign[] }>('/api/apex/campaigns'),
    });
}

export function useApexProspects(params: {
    page?: number;
    search?: string;
    connectionStatus?: string;
}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.search) searchParams.set('search', params.search);
    if (params.connectionStatus)
        searchParams.set('connection_status', params.connectionStatus);

    const queryString = searchParams.toString();

    return useQuery({
        queryKey: ['apex-prospects', params],
        queryFn: () =>
            apiClient.get<PaginatedResponse<ApexProspect>>(
                `/api/apex/prospects${queryString ? `?${queryString}` : ''}`,
            ),
    });
}

export function useApexPendingActions() {
    return useQuery({
        queryKey: ['apex-pending-actions'],
        queryFn: () =>
            apiClient.get<{ actions: ApexPendingAction[]; total: number }>(
                '/api/apex/pending-actions',
            ),
    });
}

export function useApexActivityLogs(params: {
    page?: number;
    activityType?: string;
}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.activityType)
        searchParams.set('activity_type', params.activityType);

    const queryString = searchParams.toString();

    return useQuery({
        queryKey: ['apex-activity-logs', params],
        queryFn: () =>
            apiClient.get<PaginatedResponse<ApexActivityLog>>(
                `/api/apex/activity-logs${queryString ? `?${queryString}` : ''}`,
            ),
    });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useApprovePendingAction(agentId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (actionId: string) =>
            apiClient.post(`/api/apex/pending-actions/${actionId}/approve`, {
                agent_id: agentId,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-pending-actions'] });
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('Action approved');
        },
        onError: () => toast.error('Failed to approve action'),
    });
}

export function useDenyPendingAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (actionId: string) =>
            apiClient.post(`/api/apex/pending-actions/${actionId}/deny`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-pending-actions'] });
            toast.success('Action denied');
        },
        onError: () => toast.error('Failed to deny action'),
    });
}

export function useApproveAllPendingActions(agentId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiClient.post('/api/apex/pending-actions/approve-all', {
                agent_id: agentId,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-pending-actions'] });
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('All actions approved');
        },
        onError: () => toast.error('Failed to approve all actions'),
    });
}

export function useDenyAllPendingActions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiClient.post('/api/apex/pending-actions/deny-all'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-pending-actions'] });
            toast.success('All actions denied');
        },
        onError: () => toast.error('Failed to deny all actions'),
    });
}

export function useStartCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (campaignId: string) =>
            apiClient.post(`/api/apex/campaigns/${campaignId}/start`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('Campaign started');
        },
        onError: () => toast.error('Failed to start campaign'),
    });
}

export function usePauseCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (campaignId: string) =>
            apiClient.post(`/api/apex/campaigns/${campaignId}/pause`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('Campaign paused');
        },
        onError: () => toast.error('Failed to pause campaign'),
    });
}

export function useCompleteCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (campaignId: string) =>
            apiClient.post(`/api/apex/campaigns/${campaignId}/complete`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('Campaign completed');
        },
        onError: () => toast.error('Failed to complete campaign'),
    });
}

export function useCreateCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CampaignFormData) =>
            apiClient.post<{ campaign: ApexCampaign }>(
                '/api/apex/campaigns',
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('Campaign created');
        },
        onError: () => toast.error('Failed to create campaign'),
    });
}

export function useUpdateCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            campaignId,
            data,
        }: {
            campaignId: string;
            data: Partial<CampaignFormData>;
        }) =>
            apiClient.put<{ campaign: ApexCampaign }>(
                `/api/apex/campaigns/${campaignId}`,
                data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('Campaign updated');
        },
        onError: () => toast.error('Failed to update campaign'),
    });
}

export function useDeleteCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (campaignId: string) =>
            apiClient.delete(`/api/apex/campaigns/${campaignId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('Campaign deleted');
        },
        onError: () => toast.error('Failed to delete campaign'),
    });
}

// ─── LinkedIn Chat Hooks ─────────────────────────────────────────────────────

interface LinkedInChat {
    id: string;
    name: string | null;
    picture_url: string | null;
    profile_url: string | null;
    occupation: string | null;
    timestamp: string;
    unread_count: number;
    content_type: string | null;
    read_only: boolean;
    subject: string | null;
}

interface LinkedInMessage {
    id: string;
    chat_id: string;
    sender_id: string | null;
    text: string;
    timestamp: string;
    is_sender: boolean;
    attachments: Array<{ url: string; type: string }>;
}

export function useLinkedInChats(agentId: string | null) {
    return useQuery({
        queryKey: ['linkedin-chats', agentId],
        queryFn: () =>
            apiClient.get<{ chats: LinkedInChat[] }>(
                `/api/apex/linkedin/chats?agent_id=${agentId}`,
            ),
        enabled: !!agentId,
        refetchInterval: 30000,
    });
}

export function useLinkedInChatMessages(
    chatId: string | null,
    agentId: string | null,
) {
    return useQuery({
        queryKey: ['linkedin-chat-messages', chatId, agentId],
        queryFn: () =>
            apiClient.get<{ messages: LinkedInMessage[] }>(
                `/api/apex/linkedin/chats/${chatId}/messages?agent_id=${agentId}`,
            ),
        enabled: !!chatId && !!agentId,
        refetchInterval: 10000,
    });
}

export function useSendLinkedInMessage(agentId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chatId, text }: { chatId: string; text: string }) =>
            apiClient.post(`/api/apex/linkedin/chats/${chatId}/messages`, {
                agent_id: agentId,
                text,
            }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['linkedin-chat-messages', variables.chatId],
            });
            queryClient.invalidateQueries({ queryKey: ['linkedin-chats'] });
        },
        onError: () => toast.error('Failed to send message'),
    });
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

export type {
    ApexActivityLog,
    ApexCampaign,
    ApexPendingAction,
    ApexProspect,
    CampaignFormData,
    LinkedInChat,
    LinkedInMessage,
    PaginatedResponse,
};
