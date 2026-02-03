type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: BodyInit | null;
};

type ApiError = {
  message: string;
  status: number;
};

const getCsrfToken = (): string | null => {
  if (typeof document === "undefined") return null;
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? null;
};

const buildHeaders = (body: BodyInit | null | undefined): HeadersInit => {
  const headers: Record<string, string> = {
    "X-Requested-With": "XMLHttpRequest",
  };

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers["X-CSRF-TOKEN"] = csrfToken;
  }

  // Only set Content-Type for JSON, not for FormData (browser will set it with boundary)
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
};

const request = async <T>(url: string, options: ApiOptions = {}): Promise<T> => {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: buildHeaders(options.body),
    body: options.body ?? null,
    credentials: "same-origin",
  });

  if (!response.ok) {
    const message = response.statusText || "Request failed";
    const error: ApiError = { message, status: response.status };
    throw error;
  }

  return parseResponse<T>(response);
};

export const apiClient = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { 
      method: "POST", 
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : null) 
    }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : null }),
  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : null }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
