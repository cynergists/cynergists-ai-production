import { supabase } from '@cy/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface WebhookEvent {
    id: string;
    provider: string;
    event_type: string;
    external_event_id: string | null;
    idempotency_key: string;
    payload_json: any;
    received_at: string;
    processed_at: string | null;
    status: string;
    error_message: string | null;
    replay_count: number;
    created_at: string;
}

interface AttributionEvent {
    id: string;
    partner_id: string | null;
    partner_slug: string | null;
    event_type: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    landing_page_url: string | null;
    referrer_url: string | null;
    cookie_present: boolean;
    local_storage_present: boolean;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

interface HealthStats {
    failedWebhooks24h: number;
    attributionEvents24h: number;
    commissionsCreated24h: number;
    payoutsCreated24h: number;
    commissionsClawedBack24h: number;
}

// Get TEST_MODE status
export function useTestMode() {
    return useQuery({
        queryKey: ['test-mode'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_test_mode');
            if (error) throw error;
            return data as boolean;
        },
    });
}

// Set TEST_MODE status
export function useSetTestMode() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (enabled: boolean) => {
            const { data, error } = await supabase.rpc('set_test_mode', {
                enabled,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test-mode'] });
            toast.success('TEST_MODE updated');
        },
        onError: (error) => {
            toast.error('Failed to update TEST_MODE: ' + error.message);
        },
    });
}

// Fetch webhook events
export function useWebhookEvents(filters?: {
    status?: string;
    provider?: string;
    limit?: number;
}) {
    return useQuery({
        queryKey: ['webhook-events', filters],
        queryFn: async () => {
            let query = supabase
                .from('webhook_events')
                .select('*')
                .order('received_at', { ascending: false })
                .limit(filters?.limit || 50);

            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.provider) {
                query = query.eq('provider', filters.provider);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as WebhookEvent[];
        },
    });
}

// Fetch attribution events
export function useAttributionEvents(filters?: {
    event_type?: string;
    partner_slug?: string;
    limit?: number;
}) {
    return useQuery({
        queryKey: ['attribution-events', filters],
        queryFn: async () => {
            let query = supabase
                .from('attribution_events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(filters?.limit || 50);

            if (filters?.event_type) {
                query = query.eq('event_type', filters.event_type);
            }
            if (filters?.partner_slug) {
                query = query.ilike(
                    'partner_slug',
                    `%${filters.partner_slug}%`,
                );
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as AttributionEvent[];
        },
    });
}

// Fetch health stats (24h metrics)
export function useHealthStats() {
    return useQuery({
        queryKey: ['debug-health-stats'],
        queryFn: async () => {
            const last24h = new Date(
                Date.now() - 24 * 60 * 60 * 1000,
            ).toISOString();

            // Failed webhooks in last 24h
            const { count: failedWebhooks } = await supabase
                .from('webhook_events')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'failed')
                .gte('received_at', last24h);

            // Attribution events in last 24h
            const { count: attributionEvents } = await supabase
                .from('attribution_events')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', last24h);

            // Commissions created in last 24h
            const { count: commissionsCreated } = await supabase
                .from('partner_commissions')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', last24h);

            // Payouts created in last 24h
            const { count: payoutsCreated } = await supabase
                .from('partner_payouts')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', last24h);

            // Commissions clawed back in last 24h
            const { count: commissionsClawedBack } = await supabase
                .from('partner_commissions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'clawed_back' as any)
                .gte('updated_at', last24h);

            return {
                failedWebhooks24h: failedWebhooks || 0,
                attributionEvents24h: attributionEvents || 0,
                commissionsCreated24h: commissionsCreated || 0,
                payoutsCreated24h: payoutsCreated || 0,
                commissionsClawedBack24h: commissionsClawedBack || 0,
            } as HealthStats;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });
}

// Replay a failed webhook
export function useReplayWebhook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (webhookEventId: string) => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await supabase.functions.invoke('replay-webhook', {
                body: { webhookEventId },
            });

            if (response.error) throw response.error;
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webhook-events'] });
            queryClient.invalidateQueries({ queryKey: ['debug-health-stats'] });
            toast.success('Webhook replayed successfully');
        },
        onError: (error) => {
            toast.error('Failed to replay webhook: ' + error.message);
        },
    });
}

// Generate a test event
export function useGenerateTestEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            eventType,
            partnerSlug,
        }: {
            eventType: 'attribution' | 'payment' | 'refund';
            partnerSlug?: string;
        }) => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await supabase.functions.invoke(
                'generate-test-event',
                {
                    body: { eventType, partnerSlug },
                },
            );

            if (response.error) throw response.error;
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['webhook-events'] });
            queryClient.invalidateQueries({ queryKey: ['attribution-events'] });
            queryClient.invalidateQueries({ queryKey: ['debug-health-stats'] });
            toast.success(`Test ${data.result?.type} generated`);
        },
        onError: (error) => {
            toast.error('Failed to generate test event: ' + error.message);
        },
    });
}
