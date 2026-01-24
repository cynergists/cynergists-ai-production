import { apiClient } from "@/lib/api-client";

export async function callAdminApi<T>(
  action: string,
  params?: Record<string, string>,
  body?: unknown
): Promise<T> {
  const searchParams = new URLSearchParams({ action, ...params });
  const url = `/api/admin-data?${searchParams.toString()}`;

  if (body) {
    return apiClient.post<T>(url, body);
  }

  return apiClient.get<T>(url);
}
