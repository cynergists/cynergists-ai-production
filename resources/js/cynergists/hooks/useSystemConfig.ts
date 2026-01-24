import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error: fetchError } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", key)
        .single();

      if (fetchError) throw fetchError;
      
      // Parse JSONB value - handle various formats
      const rawValue = data?.value;
      if (rawValue === null || rawValue === undefined) {
        setValue(null);
      } else if (rawValue === "true") {
        setValue(true);
      } else if (rawValue === "false") {
        setValue(false);
      } else if (typeof rawValue === "number") {
        setValue(rawValue);
      } else if (typeof rawValue === "string") {
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
      const { data, error: fetchError } = await supabase
        .from("system_config")
        .select("key, value, description, updated_at");

      if (fetchError) throw fetchError;

      const configMap: Record<string, boolean> = {};
      data?.forEach((config) => {
        const val = config.value;
        if (val === true || val === "true") {
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

  const updateConfig = async (key: string, value: boolean | string | number) => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from("system_config")
        .update({ 
          value: JSON.stringify(value),
          updated_at: new Date().toISOString()
        })
        .eq("key", key);

      if (error) throw error;
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
      // Get unresolved count
      const { count: totalCount } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .is("resolved_at", null);

      // Get critical count
      const { count: critical } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .is("resolved_at", null)
        .eq("severity", "critical");

      setCount(totalCount || 0);
      setCriticalCount(critical || 0);
    } catch (err) {
      console.error("Failed to fetch notification counts:", err);
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
