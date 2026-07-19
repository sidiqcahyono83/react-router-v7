const API = import.meta.env.VITE_API_URL;

export async function getPakets(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  const res = await fetch(`${API}/pakets?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data paket");
  }

  return res.json();
}

export async function getPaketId(id: string) {
  const res = await fetch(`${API}/pakets/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil paket");
  }

  return res.json();
}

export async function updatePaket(id: string, data: any) {
  const res = await fetch(`${API}/pakets/${id}`, {
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

export async function createPaket(data: { name: string; harga: number }) {
  const res = await fetch(`${API}/pakets`, {
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
