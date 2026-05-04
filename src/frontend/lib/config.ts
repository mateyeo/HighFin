export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Drop-in replacement for fetch() that always targets the backend service. */
export function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${APP_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
