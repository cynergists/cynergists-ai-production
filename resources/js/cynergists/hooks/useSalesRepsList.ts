import { callAdminApi } from '@/lib/admin-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface SalesRep {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    title: string | null;
    commission_rate: number;
    total_clients: number;
    monthly_revenue: number;
    hire_date: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface SalesRepsSummary {
    total: number;
    active: number;
    totalClients: number;
    totalRevenue: number;
}

interface SalesRepsQueryParams {
    page: number;
    limit: number;
    sortColumn: string;
    sortDirection: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, string>;
}

interface SalesRepsResponse {
    salesReps: SalesRep[];
    total: number;
    totalPages: number;
    summary: SalesRepsSummary;
}

// callAdminApi helper is shared

export function useSalesReps(params: SalesRepsQueryParams) {
    const offset = (params.page - 1) * params.limit;

    return useQuery({
        queryKey: ['admin', 'salesReps', params],
        queryFn: () =>
            callAdminApi<SalesRepsResponse>('get_sales_reps', {
                limit: params.limit.toString(),
                offset: offset.toString(),
                sortColumn: params.sortColumn,
                sortDirection: params.sortDirection,
                search: params.search || '',
                status: params.filters?.status || '',
            }),
    });
}

export function useCreateSalesRep() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (rep: Partial<SalesRep>) =>
            callAdminApi<SalesRep>('create_sales_rep', {}, rep),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'salesReps'] });
        },
    });
}

export function useUpdateSalesRep() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<SalesRep> & { id: string }) =>
            callAdminApi<SalesRep>('update_sales_rep', { id }, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'salesReps'] });
        },
    });
}

export function useDeleteSalesRep() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            callAdminApi<{ success: boolean }>('delete_sales_rep', { id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'salesReps'] });
        },
    });
}
