import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface ClarityData {
  configured: boolean;
  totalSessions?: number;
  sessionChange?: string;
  sessionChangeType?: "positive" | "negative" | "neutral";
  deadClicks?: number;
  rageClicks?: number;
  avgScrollDepth?: number;
  deviceBreakdown?: Record<string, number>;
}

export function useClarityAnalytics(dateRange: DateRange | undefined) {
  const query = useQuery({
    queryKey: ["clarity-analytics", dateRange?.from, dateRange?.to],
    queryFn: async (): Promise<ClarityData> => {
      const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
      const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

      const { data, error } = await supabase.functions.invoke("microsoft-clarity", {
        body: { startDate, endDate },
      });

      if (error) {
        console.error("Clarity analytics error:", error);
        throw error;
      }

      return data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    retry: false,
  });

  // Check if the service is configured based on the response
  const isConfigured = query.data?.configured !== false;

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isConfigured,
    refetch: query.refetch,
  };
}
