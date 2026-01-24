import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Session doesn't exist locally, sign out and redirect
        await supabase.auth.signOut();
        window.location.href = "/signin";
        throw new Error("Not authenticated");
      }

      const queryParams = new URLSearchParams({ action, ...params });
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data?${queryParams}`;

      const options: RequestInit = {
        method: body ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        // If unauthorized, clear session and redirect to login
        if (response.status === 401 || response.status === 403) {
          await supabase.auth.signOut();
          window.location.href = "/signin";
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error(data.error || "Request failed");
      }

      return data as T;
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
