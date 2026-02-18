import { apiClient } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Category {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return data as Category[];
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => {
            const { data, error } = await supabase
                .from('categories')
                .insert({ name })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const { data, error } = await supabase
                .from('categories')
                .update({ name })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}
