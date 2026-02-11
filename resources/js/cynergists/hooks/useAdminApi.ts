import { callAdminApi } from '@/lib/admin-api';
import { useCallback, useState } from 'react';

/**
 * Legacy admin API hook for partner-related functionality.
 * Note: Admin dashboard now uses Filament. This hook only exists
 * for partner portal features that still need backend API access.
 */
export function useAdminApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const callApi = useCallback(
        async <T>(
            operation: string,
            params?: Record<string, unknown>,
            body?: unknown,
        ): Promise<T> => {
            setLoading(true);
            setError(null);

            try {
                const result = await callAdminApi<T>(operation, params, body);
                return result;
            } catch (err) {
                const error =
                    err instanceof Error ? err : new Error('Unknown error');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        callApi,
        loading,
        error,
    };
}
