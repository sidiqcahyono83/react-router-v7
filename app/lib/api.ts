export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}${path}`,
    {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Request gagal");
  }

  return data;
}
