import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });
  await throwIfResNotOk(res);
  const contentType = res.headers.get('Content-Type') || '';
  return contentType.includes('application/json') ? await res.json() : await res.text();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// HTTP method wrapper functions
export const api = {
  get: (url: string) => apiRequest("GET", url),
  post: (url: string, data?: unknown) => apiRequest("POST", url, data),
  patch: (url: string, data?: unknown) => apiRequest("PATCH", url, data),
  delete: (url: string) => apiRequest("DELETE", url),
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - optimized for workspace switching
      gcTime: 10 * 60 * 1000, // 10 minutes - keep data longer for cross-workspace navigation
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors, but retry on network issues
        if (error?.message?.includes('4')) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
