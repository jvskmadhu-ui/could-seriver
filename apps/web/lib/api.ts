const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: BodyInit | null;
  json?: unknown;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || (options.json ? "POST" : "GET"),
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "Request failed");
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return response as T;
  }
  return response.json() as Promise<T>;
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("cloud-sevier-token");
}

export function setSession(token: string) {
  window.localStorage.setItem("cloud-sevier-token", token);
}

export function clearSession() {
  window.localStorage.removeItem("cloud-sevier-token");
}
