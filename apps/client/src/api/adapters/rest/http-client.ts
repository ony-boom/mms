// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function http<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return (await response.json()) as T;
}

export { http };
