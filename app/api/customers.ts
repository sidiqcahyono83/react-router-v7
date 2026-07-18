const API = import.meta.env.VITE_API_URL;

export async function getCustomers(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  const res = await fetch(`${API}/customers?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data customer");
  }

  return res.json();
}

export async function getCustomerId(id: string) {
  const res = await fetch(`${API}/customers/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil customer");
  }

  return res.json();
}

export async function updateCustomer(id: string, data: any) {
  const res = await fetch(`${API}/customers/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message);
  }

  return result;
}
