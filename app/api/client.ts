const API_URL = import.meta.env.VITE_API_URL;

export async function api<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  console.log("API Request:", `${API_URL}${url}`);

  const response = await fetch(`${API_URL}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  console.log("Status:", response.status);
  console.log("Response:", data);

  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status}`);
  }

  return data;
}
