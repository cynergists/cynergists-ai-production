import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "./useProductsQueries";

// Extended product type with category info
export interface ProductWithCategory extends Product {
  categories: { name: string } | null;
}

/**
 * Fetch products that are visible on the public website (active only)
 * Hidden, test, and draft products are NOT shown in public product listings
 */
export function useActiveProducts() {
  return useQuery({
    queryKey: ["public", "products", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("product_status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single product by slug - allows active, hidden, and test products
 * (for direct link access and checkout)
 * Draft products cannot be accessed via direct link
 */
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["public", "products", "slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .neq("product_status", "draft") // Exclude draft, allow active/hidden/test
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single product by SKU - allows active, hidden, and test products
 * (for direct link access and checkout)
 * Draft products cannot be accessed via direct link
 */
export function useProductBySku(sku: string) {
  return useQuery({
    queryKey: ["public", "products", "sku", sku],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("product_sku", sku)
        .neq("product_status", "draft") // Exclude draft, allow active/hidden/test
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!sku,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single product by ID - allows active, hidden, and test products
 * (for direct link access and checkout)
 * Draft products cannot be accessed via direct link
 */
export function useProductById(id: string) {
  return useQuery({
    queryKey: ["public", "products", "id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .neq("product_status", "draft") // Exclude draft, allow active/hidden/test
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch active products by category name
 * Used for dynamically populating page sections based on product category
 */
export function useProductsByCategory(categoryName: string) {
  return useQuery({
    queryKey: ["public", "products", "category", categoryName],
    queryFn: async () => {
      // First get the category ID
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("name", categoryName)
        .single();

      if (categoryError || !category) {
        return [];
      }

      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("category_id", category.id)
        .eq("product_status", "active")
        .order("product_name", { ascending: true });

      if (error) throw error;
      return data as ProductWithCategory[];
    },
    enabled: !!categoryName,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch active products from multiple categories
 * Used for sections like "Additional Products" that show Software + AI Agent
 */
export function useProductsByCategories(categoryNames: string[]) {
  return useQuery({
    queryKey: ["public", "products", "categories", categoryNames],
    queryFn: async () => {
      // Get all category IDs
      const { data: categories, error: categoryError } = await supabase
        .from("categories")
        .select("id, name")
        .in("name", categoryNames);

      if (categoryError || !categories || categories.length === 0) {
        return [];
      }

      const categoryIds = categories.map(c => c.id);

      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .in("category_id", categoryIds)
        .eq("product_status", "active")
        .order("product_name", { ascending: true });

      if (error) throw error;
      return data as ProductWithCategory[];
    },
    enabled: categoryNames.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
