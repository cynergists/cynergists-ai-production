import { callAdminApi } from '@/lib/admin-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Cache times in milliseconds
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

// uses shared callAdminApi helper

// Plans

// Plans
export interface Plan {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    description: string | null;
    price: number;
    billing_period: string;
    url: string | null;
    features: string[];
    status: 'draft' | 'active' | 'hidden' | 'test';
    display_order: number;
    image_url: string | null;
    category_id: string | null;
    type: string | null;
    created_at: string;
}

export function usePlans() {
    return useQuery({
        queryKey: ['admin', 'plans'],
        queryFn: () => callAdminApi<Plan[]>('get_plans'),
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
}

export function useCreatePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (planData: Omit<Plan, 'id' | 'created_at'>) =>
            callAdminApi<Plan>('create_plan', undefined, planData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
        },
    });
}

export function useUpdatePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...planData }: { id: string } & Partial<Plan>) =>
            callAdminApi<Plan>('update_plan', { id }, planData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
        },
    });
}

export function useDeletePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            callAdminApi<{ success: boolean }>('delete_plan', { id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
        },
    });
}

// Notes
export interface AdminNote {
    id: string;
    title: string;
    content: string | null;
    note_type: string | null;
    created_at: string;
    updated_at: string;
}

export function useAdminNotes() {
    return useQuery({
        queryKey: ['admin', 'notes'],
        queryFn: () => callAdminApi<AdminNote[]>('get_notes'),
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
}

export function useCreateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (noteData: {
            title: string;
            content?: string;
            note_type?: string;
        }) => callAdminApi<AdminNote>('create_note', undefined, noteData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] });
        },
    });
}

export function useUpdateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            ...noteData
        }: {
            id: string;
            title?: string;
            content?: string;
            note_type?: string;
        }) => callAdminApi<AdminNote>('update_note', { id }, noteData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] });
        },
    });
}

export function useDeleteNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            callAdminApi<{ success: boolean }>('delete_note', { id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] });
        },
    });
}

// Agreements
export interface Agreement {
    id: string;
    title: string;
    client_name: string;
    client_email: string;
    client_company: string | null;
    plan_name: string;
    plan_price: number;
    status: string;
    created_at: string;
    signed_at: string | null;
    expires_at: string | null;
    token: string;
}

export function useAgreements() {
    return useQuery({
        queryKey: ['admin', 'agreements'],
        queryFn: () => callAdminApi<Agreement[]>('get_agreements'),
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
}

// Analytics/Tracking
export interface SessionData {
    id: string;
    session_id: string;
    ip_address: string | null;
    user_agent: string | null;
    referrer: string | null;
    landing_page: string | null;
    created_at: string;
}

export interface PageViewData {
    id: string;
    session_id: string;
    page_path: string;
    page_title: string | null;
    time_on_page: number | null;
    created_at: string;
}

export interface PlanInteraction {
    id: string;
    session_id: string;
    plan_name: string;
    interaction_type: string;
    page_path: string | null;
    created_at: string;
}

export function useSessionTracking() {
    return useQuery({
        queryKey: ['admin', 'sessions'],
        queryFn: () => callAdminApi<SessionData[]>('get_sessions'),
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
}

export function usePageViews() {
    return useQuery({
        queryKey: ['admin', 'page-views'],
        queryFn: () => callAdminApi<PageViewData[]>('get_page_views'),
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
}

export function usePlanInteractions() {
    return useQuery({
        queryKey: ['admin', 'plan-interactions'],
        queryFn: () => callAdminApi<PlanInteraction[]>('get_plan_interactions'),
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
}

// Email History
export interface PolicyEmailRecord {
    id: string;
    template_id: string;
    document_type: string;
    sent_by: string | null;
    recipients_count: number;
    sent_at: string;
    status: string;
    document_templates?: {
        title: string;
    };
}

export function usePolicyEmailHistory() {
    return useQuery({
        queryKey: ['admin', 'email-history'],
        queryFn: () => callAdminApi<PolicyEmailRecord[]>('get_email_history'),
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
}

// Document Templates
export interface DocumentTemplate {
    id: string;
    title: string;
    content: string;
    version: number;
    document_type: string;
    is_active?: boolean;
    updated_at?: string;
}

export function useDocumentTemplate(documentType: string) {
    return useQuery({
        queryKey: ['admin', 'document-template', documentType],
        queryFn: () =>
            callAdminApi<DocumentTemplate>('get_active_template', {
                document_type: documentType,
            }),
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
}

export function useUpdateDocumentTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, content }: { id: string; content: string }) =>
            callAdminApi<DocumentTemplate>(
                'update_document_template',
                { id },
                { content },
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'document-template'],
            });
        },
    });
}

export function useCreateDocumentTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateData: {
            title: string;
            content: string;
            document_type: string;
        }) =>
            callAdminApi<DocumentTemplate>(
                'create_document_template',
                undefined,
                templateData,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'document-template'],
            });
        },
    });
}

// Clients with caching
export interface ClientQueryParams {
    page: number;
    limit: number;
    sortColumn: string;
    sortDirection: 'asc' | 'desc';
    search: string;
    filters: Record<string, string>;
}

export interface ClientsSummary {
    totalActiveAmount: number;
    activeMonthlyCount: number;
    activeMonthlyAmount: number;
    activeAnnualCount: number;
    activeAnnualAmount: number;
    activeOneTimeCount: number;
    activeOneTimeAmount: number;
    terminatedMonthlyCount: number;
    terminatedAnnualCount: number;
    terminatedOneTimeCount: number;
    terminatedTotalCount: number;
    retentionMonthlyPercent: number;
    retentionAnnualPercent: number;
    retentionTotalPercent: number;
}

export interface ClientsResponse {
    clients: Client[];
    total: number;
    activeCount: number;
    totalPages: number;
    summary: ClientsSummary | null;
}

export interface Client {
    id: string;
    square_customer_id: string | null;
    square_subscription_id: string | null;
    ghl_contact_id: string | null;
    name: string;
    first_name: string | null;
    last_name: string | null;
    nick_name: string | null;
    name_updated_at: string | null;
    name_updated_by: string | null;
    email: string | null;
    email_updated_at: string | null;
    email_updated_by: string | null;
    phone: string | null;
    phone_updated_at: string | null;
    phone_updated_by: string | null;
    company: string | null;
    company_updated_at: string | null;
    company_updated_by: string | null;
    sales_rep: string | null;
    sales_rep_updated_at: string | null;
    sales_rep_updated_by: string | null;
    partner_name: string | null;
    partner_name_updated_at: string | null;
    partner_name_updated_by: string | null;
    tags: string[];
    tags_updated_at: string | null;
    tags_updated_by: string | null;
    status: string | null;
    payment_type: string | null;
    payment_amount: number | null;
    last_payment_date: string | null;
    next_payment_due_date: string | null;
    square_plan_name: string | null;
    square_synced_at: string | null;
    last_activity: string | null;
    last_activity_updated_at: string | null;
    last_activity_updated_by: string | null;
    last_contact: string | null;
    last_contact_updated_at: string | null;
    last_contact_updated_by: string | null;
    next_meeting: string | null;
    next_meeting_updated_at: string | null;
    next_meeting_updated_by: string | null;
    ghl_synced_at: string | null;
    created_at: string;
    updated_at: string;
}

export function useClients(params: ClientQueryParams) {
    return useQuery({
        queryKey: ['admin', 'clients', params],
        queryFn: async () => {
            const session = await getSession();

            const queryParams = new URLSearchParams({
                page: params.page.toString(),
                limit: params.limit.toString(),
                sortColumn: params.sortColumn,
                sortDirection: params.sortDirection,
                search: params.search,
                filters: JSON.stringify(params.filters),
                includeSummary: 'true',
            });

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-clients?${queryParams}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch clients');
            }

            return response.json() as Promise<ClientsResponse>;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes for clients (more dynamic data)
        gcTime: CACHE_TIME,
    });
}

// Admin Settings
export interface AdminSettings {
    theme: string;
    notification_email: string;
    email_on_agreement_signed: boolean;
    email_on_plan_click: boolean;
    email_on_new_session: boolean;
}

export function useAdminSettings() {
    return useQuery({
        queryKey: ['admin', 'settings'],
        queryFn: async () => {
            return callAdminApi<AdminSettings>('get_admin_settings');
        },
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
    });
}

export function useSaveAdminSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings: AdminSettings) => {
            return callAdminApi<AdminSettings>(
                'save_admin_settings',
                undefined,
                settings,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
        },
    });
}
