import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

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
      return apiClient.get<PublicPlan[]>("/api/public/plans");
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
      return apiClient.get<PublicPlan>(`/api/public/plans/${slug}`);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}