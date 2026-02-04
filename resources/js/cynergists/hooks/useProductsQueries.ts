import { callAdminApi } from '@/lib/admin-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Product {
    id: string;
    created_at: string;
    updated_at: string;
    // Core Product Fields
    product_name: string;
    short_description: string | null;
    full_description: string | null;
    price: number;
    billing_type:
        | 'one_time'
        | 'monthly_subscription'
        | 'annual_subscription'
        | 'subscription_with_minimum_commitment'
        | 'usage_based';
    delivery_method:
        | 'instant_download'
        | 'email_delivery'
        | 'account_access'
        | 'platform_access'
        | 'onboarding_call_required';
    access_duration:
        | 'lifetime_access'
        | 'x_months_access'
        | 'active_subscription_only'
        | 'access_ends_upon_cancellation';
    whats_included: string | null;
    who_this_is_for: string | null;
    who_this_is_not_for: string | null;
    prerequisites: string | null;
    estimated_time_to_value:
        | 'immediate'
        | 'one_two_weeks'
        | 'thirty_days'
        | 'after_onboarding';
    support_level:
        | 'no_support'
        | 'email_support'
        | 'office_hours'
        | 'slack_chat_support'
        | 'dedicated_support';
    // Legal Fields
    refund_policy: 'no_refunds' | 'refund_within_x_days' | 'conditional_refund';
    license_type:
        | 'personal_use_only'
        | 'internal_business_use'
        | 'commercial_use'
        | 'resale_prohibited';
    term_length:
        | 'month_to_month'
        | 'three_month_minimum'
        | 'six_month_minimum'
        | 'fixed_term';
    cancellation_policy: string | null;
    disclaimers: string | null;
    data_ai_disclaimer: string | null;
    // Operational Fields
    product_sku: string | null;
    slug: string | null;
    url: string | null;
    product_status: 'draft' | 'active' | 'hidden' | 'test';
    version_date: string | null;
    tags: string[];
    internal_notes: string | null;
    image_url: string | null;
    category_id: string | null;
    type: string | null;
    // Specialist Pricing Fields
    hourly_rate: number | null;
    part_time_price: number | null;
}

// Make all fields optional except product_name and price for inserts (database has defaults)
export type ProductInsert = Pick<Product, 'product_name' | 'price'> &
    Partial<
        Omit<
            Product,
            'id' | 'created_at' | 'updated_at' | 'product_name' | 'price'
        >
    >;

// callAdminApi helper is shared

export function useProducts() {
    return useQuery({
        queryKey: ['admin', 'products'],
        queryFn: () => callAdminApi<Product[]>('get_products'),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (product: ProductInsert) =>
            callAdminApi<Product>('create_product', undefined, product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...updates }: Partial<Product> & { id: string }) =>
            callAdminApi<Product>('update_product', { id }, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            callAdminApi<{ success: boolean }>('delete_product', { id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
        },
    });
}
