const API = import.meta.env.VITE_API_URL;

export async function getAllOlt() {
  const res = await fetch(`${API}/olts/all`, {
    credentials: "include",
  });

  return res.json();
}

export async function getOlt(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  const res = await fetch(`${API}/olts?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data OLT");
  }

  return res.json();
}

export async function getOltId(id: string) {
  const res = await fetch(`${API}/olts/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil OLT");
  }

  return res.json();
}

export interface OltPayload {
  name: string;
  username: string | null;
  serial?: string | null;
  password?: string | null;
  customerIds?: string[];
}

export async function updateOlt(id: string, data: OltPayload) {
  const res = await fetch(`${API}/olts/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Gagal mengupdate OLT.");
  }

  return result.data ?? result;
}

export async function createOlt(data: OltPayload) {
  const res = await fetch(`${API}/olts`, {
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
