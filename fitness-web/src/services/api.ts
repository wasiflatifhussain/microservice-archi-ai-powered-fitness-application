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

  // Debug logging for API calls
  console.log("=== API REQUEST DEBUG ===");
  console.log("URL:", `${base}${path}`);
  console.log("Method:", method);
  console.log("Has token:", !!token);
  console.log(
    "Token preview:",
    token ? token.substring(0, 50) + "..." : "No token"
  );
  console.log("Request body:", body);

  const requestHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  console.log("Request headers:", requestHeaders);

  const res = await fetch(`${base}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log("Response status:", res.status);
  console.log("Response headers:", Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
    const text = await res.text();
    console.error("API Error Response:", text);
    throw new Error(`API Error: ${res.status} ${res.statusText} - ${text}`);
  }

  // 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  const responseData = await res.json();
  console.log("Response data:", responseData);
  return responseData as T;
}
