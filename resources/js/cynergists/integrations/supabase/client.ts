/**
 * MySQL/Laravel API Client
 * This replaces Supabase with Laravel API endpoints
 */
import type { Database } from './types';

type SupabaseQueryResult = { data: unknown; error: null | Error };

type SupabaseQuery = {
    select: (columns?: string) => SupabaseQuery;
    eq: (column: string, value: any) => SupabaseQuery;
    neq: (column: string, value: any) => SupabaseQuery;
    in: (column: string, values: any[]) => SupabaseQuery;
    order: (column: string, options?: any) => SupabaseQuery;
    limit: (count: number) => SupabaseQuery;
    range: (from: number, to: number) => SupabaseQuery;
    insert: (data: any) => SupabaseQuery;
    upsert: (data: any) => SupabaseQuery;
    update: (data: any) => SupabaseQuery;
    delete: () => SupabaseQuery;
    single: () => SupabaseQuery;
    maybeSingle: () => SupabaseQuery;
    then: (resolve: (value: SupabaseQueryResult) => void) => Promise<void>;
};

type SupabaseClient = {
    auth: {
        getUser: () => Promise<{ data: { user: null }; error: null }>;
        getSession: () => Promise<{ data: { session: null }; error: null }>;
        onAuthStateChange: () => {
            data: { subscription: { unsubscribe: () => void } };
        };
        signOut: () => Promise<{ error: null }>;
        signInWithPassword: () => Promise<{
            data: { session: null };
            error: null;
        }>;
        signUp: () => Promise<{ data: { user: null }; error: null }>;
        resetPasswordForEmail: () => Promise<{ error: null }>;
        signInWithOtp?: () => Promise<{ error: null }>;
        updateUser?: () => Promise<{ error: null }>;
    };
    from: (table: string) => SupabaseQuery;
    rpc: (fn: string, params?: any) => Promise<{ data: unknown[]; error: null }>;
    functions: {
        invoke: (fn: string, options?: any) => Promise<{ data: unknown; error: null }>;
    };
    storage?: {
        from: (bucket: string) => {
            upload: (path: string, file: any, options?: any) => Promise<{ data: null; error: null }>;
            getPublicUrl: (path: string) => { data: { publicUrl: string } };
        };
    };
};

/**
 * Creates a no-op query that returns empty data
 * All Supabase queries now return empty results - use Laravel API instead
 */
const createFallbackQuery = (table: string): SupabaseQuery => {
    console.warn(`Supabase query to '${table}' - use Laravel API instead`);
    
    const query = {
        select: () => query,
        eq: () => query,
        neq: () => query,
        in: () => query,
        order: () => query,
        limit: () => query,
        range: () => query,
        insert: () => query,
        upsert: () => query,
        update: () => query,
        delete: () => query,
        single: () => query,
        maybeSingle: () => query,
        then: (resolve: (value: SupabaseQueryResult) => void) =>
            Promise.resolve(resolve({ data: [], error: null })),
    };

    return query;
};

/**
 * Fallback client that prevents Supabase usage
 * All data should come from Laravel API endpoints
 */
const fallbackClient: SupabaseClient = {
    auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => {} } },
        }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({
            data: { session: null },
            error: null,
        }),
        signUp: async () => ({ data: { user: null }, error: null }),
        resetPasswordForEmail: async () => ({ error: null }),
        signInWithOtp: async () => ({ error: null }),
        updateUser: async () => ({ error: null }),
    },
    from: (table: string) => createFallbackQuery(table),
    rpc: async () => ({ data: [], error: null }),
    functions: {
        invoke: async () => ({ data: null, error: null }),
    },
    storage: {
        from: () => ({
            upload: async () => ({ data: null, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
    },
};

/**
 * @deprecated Use Laravel API endpoints via apiClient from '@/lib/api-client'
 * This Supabase client is a no-op fallback that returns empty data
 */
export const supabase = fallbackClient as unknown as SupabaseClient & {
    __database?: Database;
};
