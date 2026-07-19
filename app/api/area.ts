const API = import.meta.env.VITE_API_URL;

export async function getAreas(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  const res = await fetch(`${API}/areas?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data area");
  }

  return res.json();
}

export async function getAreaId(id: string) {
  const res = await fetch(`${API}/areas/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil area");
  }

  return res.json();
}

export async function updateArea(id: string, data: any) {
  const res = await fetch(`${API}/areas/${id}`, {
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

export async function createArea(data: { name: string }) {
  const res = await fetch(`${API}/areas`, {
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

export async function getAllArea() {
  const res = await fetch(`${API}/areas/all`, {
    credentials: "include",
  });

  return res.json();
}
