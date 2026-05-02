// Auth tokens are stored in httpOnly cookies — the browser sends them
// automatically on every same-origin request.  No token management here.

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(path);
  } catch {
    return null;
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T | null> {
  try {
    return await apiFetch<T>(path, {
      method: "POST",
      body:   JSON.stringify(body),
    });
  } catch (err) {
    console.error(`apiPost ${path}:`, err);
    return null;
  }
}

export async function apiDelete<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(path, { method: "DELETE" });
  } catch {
    return null;
  }
}
