export const BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_DEFAULT_REST_API_URL ?? "http://localhost:3000")
  : window.location.origin; // production served from same domain

async function http<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // 👈 allow cookies/session
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return (await response.json()) as Promise<T>;
}

export { http };
