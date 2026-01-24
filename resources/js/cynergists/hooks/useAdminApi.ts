import { useState, useCallback } from "react";
import { callAdminApi } from "@/lib/admin-api";

export function useAdminApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async <T>(
    action: string,
    params?: Record<string, string>,
    body?: unknown
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      return await callAdminApi<T>(action, params, body);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callApi, loading, error };
}
