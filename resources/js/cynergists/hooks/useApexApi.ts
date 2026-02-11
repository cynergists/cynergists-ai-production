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

export function useApexSync(enabled: boolean) {
    return useQuery({
        queryKey: ['apex-sync'],
        queryFn: () => apiClient.post('/api/apex/sync'),
        enabled,
        refetchInterval: enabled ? 5 * 60 * 1000 : false,
        refetchOnWindowFocus: false,
    });
}

export function useApexCampaigns() {
    return useQuery({
        queryKey: ['apex-campaigns'],
        queryFn: () =>
            apiClient.get<{ campaigns: ApexCampaign[] }>('/api/apex/campaigns'),
        refetchInterval: (query) => {
            const hasActive = query.state.data?.campaigns?.some(
                (c) => c.status === 'active',
            );
            return hasActive ? 5000 : false;
        },
    });
}

interface CampaignStats {
    total_prospects: number;
    queued: number;
    connection_sent: number;
    connected: number;
    replied: number;
    meetings_scheduled: number;
    connections_sent: number;
    connections_accepted: number;
    messages_sent: number;
    replies_received: number;
    meetings_booked: number;
    acceptance_rate: number;
    reply_rate: number;
}

export function useApexCampaignStats(campaignId: string | null, enabled = true) {
    return useQuery({
        queryKey: ['apex-campaign-stats', campaignId],
        queryFn: () =>
            apiClient.get<{ stats: CampaignStats }>(
                `/api/apex/campaigns/${campaignId}/stats`,
            ),
        enabled: !!campaignId && enabled,
        refetchInterval: 5000,
    });
}

export function useApexCampaignActivity(
    campaignId: string | null,
    enabled = true,
) {
    return useQuery({
        queryKey: ['apex-campaign-activity', campaignId],
        queryFn: () =>
            apiClient.get<PaginatedResponse<ApexActivityLog>>(
                `/api/apex/activity-logs?campaign_id=${campaignId}&per_page=10`,
            ),
        enabled: !!campaignId && enabled,
        refetchInterval: enabled ? 5000 : false,
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
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
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
        onMutate: async (actionId: string) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['apex-pending-actions'] });
            
            // Snapshot previous value
            const previousData = queryClient.getQueryData(['apex-pending-actions']);
            
            // Optimistically update by removing the action
            queryClient.setQueryData(['apex-pending-actions'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    actions: old.actions.filter((a: any) => a.id !== actionId),
                    total: old.total - 1,
                };
            });
            
            return { previousData };
        },
        onSuccess: () => {
            // Don't immediately invalidate pending-actions to avoid race condition with DB commit
            // The optimistic update handles the UI, query will be refreshed on navigation
            // Still invalidate campaigns to update stats
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('Action approved');
        },
        onError: (_error, _actionId, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(['apex-pending-actions'], context.previousData);
            }
            toast.error('Failed to approve action');
        },
    });
}

export function useDenyPendingAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (actionId: string) =>
            apiClient.post(`/api/apex/pending-actions/${actionId}/deny`),
        onMutate: async (actionId: string) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['apex-pending-actions'] });
            
            // Snapshot previous value
            const previousData = queryClient.getQueryData(['apex-pending-actions']);
            
            // Optimistically update by removing the action
            queryClient.setQueryData(['apex-pending-actions'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    actions: old.actions.filter((a: any) => a.id !== actionId),
                    total: old.total - 1,
                };
            });
            
            return { previousData };
        },
        onSuccess: () => {
            // Don't immediately invalidate to avoid race condition with DB commit
            // The optimistic update handles the UI, query will be refreshed on navigation
            toast.success('Action denied');
        },
        onError: (_error, _actionId, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(['apex-pending-actions'], context.previousData);
            }
            toast.error('Failed to deny action');
        },
    });
}

export function useApproveAllPendingActions(agentId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiClient.post('/api/apex/pending-actions/approve-all', {
                agent_id: agentId,
            }),
        onMutate: async () => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['apex-pending-actions'] });
            
            // Snapshot previous value
            const previousData = queryClient.getQueryData(['apex-pending-actions']);
            
            // Optimistically clear all actions
            queryClient.setQueryData(['apex-pending-actions'], (old: any) => {
                if (!old) return old;
                return {
                    actions: [],
                    total: 0,
                };
            });
            
            return { previousData };
        },
        onSuccess: () => {
            // Invalidate campaigns to update stats
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('All actions approved');
        },
        onError: (_error, _variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(['apex-pending-actions'], context.previousData);
            }
            toast.error('Failed to approve all actions');
        },
    });
}

export function useDenyAllPendingActions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiClient.post('/api/apex/pending-actions/deny-all'),
        onMutate: async () => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['apex-pending-actions'] });
            
            // Snapshot previous value
            const previousData = queryClient.getQueryData(['apex-pending-actions']);
            
            // Optimistically clear all actions
            queryClient.setQueryData(['apex-pending-actions'], (old: any) => {
                if (!old) return old;
                return {
                    actions: [],
                    total: 0,
                };
            });
            
            return { previousData };
        },
        onSuccess: () => {
            toast.success('All actions denied');
        },
        onError: (_error, _variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(['apex-pending-actions'], context.previousData);
            }
            toast.error('Failed to deny all actions');
        },
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

export function useRestartCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (campaignId: string) =>
            apiClient.post(`/api/apex/campaigns/${campaignId}/restart`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apex-campaigns'] });
            toast.success('Campaign restarted');
        },
        onError: () => toast.error('Failed to restart campaign'),
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
            toast.success('Campaign created and started — discovering prospects now');
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

// ─── LinkedIn Account Hooks ──────────────────────────────────────────────────

interface LinkedInAccount {
    id: string;
    unipile_account_id: string;
    linkedin_profile_id: string | null;
    linkedin_profile_url: string | null;
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
    status: 'active' | 'pending' | 'disconnected';
    last_synced_at: string | null;
    created_at: string;
}

export function useApexLinkedInAccounts() {
    return useQuery({
        queryKey: ['apex-linkedin-accounts'],
        queryFn: () =>
            apiClient.get<{ accounts: LinkedInAccount[] }>(
                '/api/apex/linkedin',
            ),
    });
}

export function useDisconnectLinkedIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            accountId,
            agentId,
        }: {
            accountId: string;
            agentId: string;
        }) =>
            apiClient.delete(
                `/api/apex/linkedin/${accountId}?agent_id=${agentId}`,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['apex-linkedin-accounts'],
            });
            queryClient.invalidateQueries({ queryKey: ['agent-details'] });
            toast.success('LinkedIn account disconnected');
        },
        onError: () => toast.error('Failed to disconnect LinkedIn account'),
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
    CampaignStats,
    LinkedInAccount,
    LinkedInChat,
    LinkedInMessage,
    PaginatedResponse,
};
