type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const base = import.meta.env.VITE_API_BASE_URL as string;

export async function api<T>(
  path: string,
  opts: {
    method?: HttpMethod;
    body?: unknown;
    token?: string;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = "GET", body, token, headers } = opts;
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
