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

export async function createCustomer(data: any) {
  const res = await fetch(`${API}/customers`, {
    method: "POST",
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

export async function searchCustomers(keyword: string) {
  const query = new URLSearchParams({
    page: "1",
    limit: "10",
    search: keyword,
  });

  const res = await fetch(`${API}/customers?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil customer");
  }

  const result = await res.json();

  return result.data;
}

//Create withPPPoE
export async function registerCustomer(data: any) {
  const res = await fetch(`${API}/customers/register`, {
    method: "POST",
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
