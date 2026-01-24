import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
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
      return apiClient.get<Product[]>("/api/public/products");
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
      return apiClient.get<Product>(`/api/public/products/slug/${slug}`);
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
      return apiClient.get<Product>(`/api/public/products/sku/${sku}`);
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
      return apiClient.get<Product>(`/api/public/products/id/${id}`);
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
      return apiClient.get<ProductWithCategory[]>(
        `/api/public/products/category/${categoryName}`,
      );
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
      return apiClient.post<ProductWithCategory[]>(
        "/api/public/products/categories",
        { names: categoryNames },
      );
    },
    enabled: categoryNames.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
