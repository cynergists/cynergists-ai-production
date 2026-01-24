import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserType = "client" | "partner" | "employee" | "sales_rep" | "admin" | "super_admin";
export type AccessLevel = "admin" | "manager" | "standard" | "limited";
export type UserStatus = "active" | "inactive" | "suspended";
export type TwoFactorStatus = "disabled" | "enabled" | "required";

export interface AdminUser {
  id: string;
  user_id: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  company_name: string | null;
  title: string | null;
  status: UserStatus;
  timezone: string | null;
  nick_name: string | null;
  roles: string[];
  user_type: UserType;
  access_level: AccessLevel;
  primary_company_id: string | null;
  primary_company_name: string;
  two_factor_status: TwoFactorStatus;
  last_login: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Client fields
  subscription_status: string | null;
  contract_signed: boolean;
  contract_signed_date: string | null;
  // Partner fields
  commission_rate: number | null;
  agreement_status: string | null;
  total_revenue_influenced: number;
  // Sales Rep fields
  commission_structure: string | null;
  revenue_attributed: number;
  hire_date: string | null;
  rep_status: string | null;
  // Employee fields
  start_date: string | null;
  employment_type: string | null;
}

export interface AdminUserFormData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  user_type?: UserType;
  primary_company_id?: string | null;
  access_level?: AccessLevel;
  status?: UserStatus;
  two_factor_status?: TwoFactorStatus;
  company_name?: string;
  title?: string;
  // Client fields
  subscription_status?: string;
  contract_signed?: boolean;
  contract_signed_date?: string | null;
  // Partner fields
  commission_rate?: number | null;
  agreement_status?: string;
  total_revenue_influenced?: number;
  // Sales Rep fields
  commission_structure?: string;
  revenue_attributed?: number;
  hire_date?: string | null;
  rep_status?: string;
  // Employee fields
  start_date?: string | null;
  employment_type?: string;
}

interface UseAdminUsersParams {
  page?: number;
  limit?: number;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  role?: string;
  userType?: UserType;
}

interface AdminUsersResponse {
  adminUsers: AdminUser[];
  total: number;
  totalPages: number;
}

interface Company {
  id: string;
  name: string;
}

interface LoginHistoryEntry {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export function useAdminUsers({
  page = 1,
  limit = 25,
  sortColumn = "created_at",
  sortDirection = "desc",
  search = "",
  role = "",
  userType,
}: UseAdminUsersParams = {}) {
  return useQuery({
    queryKey: ["admin", "admin-users", page, limit, sortColumn, sortDirection, search, role, userType],
    queryFn: async (): Promise<AdminUsersResponse> => {
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        action: "get_admin_users",
        limit: limit.toString(),
        offset: offset.toString(),
        sortColumn,
        sortDirection,
        search,
        role,
      });
      
      if (userType) {
        params.set("userType", userType);
      }

      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch users");
      }

      return response.json();
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...userData }: AdminUserFormData & { id: string }) => {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data?action=update_admin_user&id=${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to update user" }));
        throw new Error(error.error || "Failed to update user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "admin-users"] });
      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ["admin", "companies"],
    queryFn: async (): Promise<Company[]> => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data?action=get_companies`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch companies");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserLoginHistory(userId: string | null) {
  return useQuery({
    queryKey: ["admin", "login-history", userId],
    queryFn: async (): Promise<LoginHistoryEntry[]> => {
      if (!userId) return [];
      
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data?action=get_user_login_history&userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch login history");
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
