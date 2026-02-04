import { apiClient } from './api-client';

/**
 * Legacy admin API wrapper for partner-related functionality.
 * Note: Admin dashboard now uses Filament. This file only exists
 * for partner portal features that still need backend API access.
 */
export async function callAdminApi<T>(
    operation: string,
    params?: Record<string, unknown>,
    body?: unknown,
): Promise<T> {
    const queryParams = new URLSearchParams({
        operation,
        ...(params && Object.fromEntries(
            Object.entries(params).map(([k, v]) => [k, String(v)])
        )),
    });

    const url = `/api/admin-data?${queryParams.toString()}`;

    if (body) {
        return apiClient.post<T>(url, body);
    }

    return apiClient.get<T>(url);
}
