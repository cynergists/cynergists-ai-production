import type { Database } from './types';

type SupabaseQueryResult = { data: unknown; error: null };

type SupabaseQuery = {
    select: () => SupabaseQuery;
    eq: () => SupabaseQuery;
    neq: () => SupabaseQuery;
    in: () => SupabaseQuery;
    order: () => SupabaseQuery;
    limit: () => SupabaseQuery;
    range: () => SupabaseQuery;
    insert: () => SupabaseQuery;
    upsert: () => SupabaseQuery;
    update: () => SupabaseQuery;
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
    from: () => SupabaseQuery;
    rpc: () => Promise<{ data: unknown[]; error: null }>;
    functions: {
        invoke: () => Promise<{ data: unknown; error: null }>;
    };
    storage?: {
        from: () => {
            upload: () => Promise<{ data: null; error: null }>;
            getPublicUrl: () => { data: { publicUrl: string } };
        };
    };
};

const createFallbackQuery = (): SupabaseQuery => {
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
            Promise.resolve(resolve({ data: null, error: null })),
    };

    return query;
};

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
    from: () => createFallbackQuery(),
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

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = fallbackClient as unknown as SupabaseClient & {
    __database?: Database;
};
