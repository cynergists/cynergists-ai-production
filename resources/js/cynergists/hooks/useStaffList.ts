import { apiClient } from '@/lib/api-client';
import type { Database } from '@/integrations/supabase/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type StaffInsert = Database['public']['Tables']['staff']['Insert'];
type StaffUpdate = Database['public']['Tables']['staff']['Update'];

export type StaffType = 'operational' | 'sales_rep' | 'contractor' | 'intern';
export type EmploymentType =
    | 'full_time'
    | 'part_time'
    | 'contractor'
    | 'intern';
export type PayType = 'hourly' | 'salary' | 'commission_only';
export type CommissionType = 'percentage' | 'flat_fee' | 'tiered';

export interface StaffMember {
    id: string;
    name: string;
    first_name: string | null;
    last_name: string | null;
    title: string | null;
    status: 'active' | 'inactive';
    staff_type: StaffType;

    // Employment
    start_date: string | null;
    end_date: string | null;
    department: string | null;
    manager_id: string | null;
    employment_type: EmploymentType | null;
    termination_reason: string | null;
    termination_notes: string | null;

    // Contact
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    timezone: string | null;

    // Pay - General
    pay_type: PayType | null;
    hourly_pay: number | null;
    hours_per_week: number | null;
    expected_hours_week: number | null;
    monthly_pay: number | null;
    salary: number | null;

    // Pay - Sales Rep specific
    commission_type: CommissionType | null;
    commission_percent: number | null;
    quota: number | null;
    commission_status: string | null;
    total_clients: number | null;
    monthly_revenue: number | null;

    // Banking
    account_type: string | null;
    bank_name: string | null;
    account_number: string | null;
    routing_number: string | null;

    // Performance
    kpis: Record<string, unknown>[] | null;
    performance_status: string | null;
    last_review_date: string | null;
    next_review_date: string | null;
    training_completed: Record<string, unknown>[] | null;

    // System
    portal_user_linked: boolean | null;
    primary_user_email: string | null;
    notes: string | null;

    created_at: string;
    updated_at: string;
}

export interface StaffHours {
    id: string;
    staff_id: string;
    period_start: string;
    period_end: string;
    hours_worked: number;
}

export function useStaffList(staffType?: StaffType | 'all') {
    return useQuery({
        queryKey: ['staff', staffType],
        queryFn: async () => {
            let query = supabase
                .from('staff')
                .select('*')
                .order('name', { ascending: true });

            if (staffType && staffType !== 'all') {
                query = query.eq('staff_type', staffType);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as StaffMember[];
        },
    });
}

export function useStaffHours(staffId: string | null) {
    return useQuery({
        queryKey: ['staff-hours', staffId],
        queryFn: async () => {
            if (!staffId) return [];

            const { data, error } = await supabase
                .from('staff_hours')
                .select('*')
                .eq('staff_id', staffId)
                .order('period_start', { ascending: false });

            if (error) throw error;
            return data as StaffHours[];
        },
        enabled: !!staffId,
    });
}

export function useCreateStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (staffData: StaffInsert) => {
            const { data, error } = await supabase
                .from('staff')
                .insert(staffData)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        },
    });
}

export function useUpdateStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: StaffUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('staff')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        },
    });
}

export function useDeleteStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('staff')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        },
    });
}
