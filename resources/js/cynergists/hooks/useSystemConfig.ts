import { apiClient } from '@/lib/api-client';
import { useCallback, useEffect, useState } from 'react';

interface SystemConfigValue {
    key: string;
    value: boolean | string | number;
    description: string | null;
    updated_at: string;
}

export function useSystemConfig(key: string) {
    const [value, setValue] = useState<boolean | string | number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiClient.get<{ key: string; value: unknown }>(
                `/api/system-config/${key}`,
            );

            // Parse JSONB value - handle various formats
            const rawValue = data?.value;
            if (rawValue === null || rawValue === undefined) {
                setValue(null);
            } else if (rawValue === 'true') {
                setValue(true);
            } else if (rawValue === 'false') {
                setValue(false);
            } else if (typeof rawValue === 'number') {
                setValue(rawValue);
            } else if (typeof rawValue === 'string') {
                setValue(rawValue);
            } else {
                // For objects or arrays, try to extract a simple value
                setValue(null);
            }
        } catch (err) {
            setError(err as Error);
            setValue(null);
        } finally {
            setLoading(false);
        }
    }, [key]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return { value, loading, error, refetch: fetchConfig };
}

export function useSystemConfigs() {
    const [configs, setConfigs] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchConfigs = useCallback(async () => {
        try {
            setLoading(true);
            const data =
                await apiClient.get<SystemConfigValue[]>('/api/system-config');

            const configMap: Record<string, boolean> = {};
            data?.forEach((config) => {
                const val = config.value;
                if (val === true || val === 'true') {
                    configMap[config.key] = true;
                } else {
                    configMap[config.key] = false;
                }
            });

            setConfigs(configMap);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    return { configs, loading, error, refetch: fetchConfigs };
}

export function useUpdateSystemConfig() {
    const [updating, setUpdating] = useState(false);

    const updateConfig = async (
        key: string,
        value: boolean | string | number,
    ) => {
        try {
            setUpdating(true);
            await apiClient.put(`/api/system-config/${key}`, { value });
            return { success: true };
        } catch (err) {
            return { success: false, error: err as Error };
        } finally {
            setUpdating(false);
        }
    };

    return { updateConfig, updating };
}

export function useNotificationCount() {
    const [count, setCount] = useState(0);
    const [criticalCount, setCriticalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchCounts = useCallback(async () => {
        try {
            const data = await apiClient.get<{
                count: number;
                criticalCount: number;
            }>('/api/notifications/counts');
            setCount(data.count || 0);
            setCriticalCount(data.criticalCount || 0);
        } catch (err) {
            console.error('Failed to fetch notification counts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCounts();
        // Refresh every 30 seconds
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, [fetchCounts]);

    return { count, criticalCount, loading, refetch: fetchCounts };
}
