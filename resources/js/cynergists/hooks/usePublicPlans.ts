import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  billing_period: string;
  features: string[];
  status: "draft" | "active" | "hidden" | "test";
  display_order: number;
  image_url: string | null;
  tagline: string | null;
  hours: string | null;
  is_popular: boolean;
  cta_text: string | null;
}

/**
 * Fetch plans that are visible on the public pricing page (active only)
 * Hidden, test, and draft plans are NOT shown on the pricing page grid
 */
export function useActivePlans() {
  return useQuery({
    queryKey: ["public", "plans", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as PublicPlan[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single plan by slug - allows active, hidden, and test plans
 * (for direct link access and checkout)
 * Draft plans cannot be accessed via direct link
 */
export function usePlanBySlug(slug: string) {
  return useQuery({
    queryKey: ["public", "plans", "slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("slug", slug)
        .neq("status", "draft") // Exclude draft, allow active/hidden/test
        .single();

      if (error) throw error;
      return data as PublicPlan;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}