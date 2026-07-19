import type { string } from "zod";

const API = import.meta.env.VITE_API_URL;

export async function getOdp(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  const res = await fetch(`${API}/odps?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data odp");
  }

  return res.json();
}

export async function getOdpId(id: string) {
  const res = await fetch(`${API}/odps/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil odp");
  }

  return res.json();
}

export interface UpdateOdpPayload {
  name: string;
  rasio?: string | null;
  pasiveSpliter?: string | null;
  areaId?: string | null;
  customerIds?: string[];
}
export async function updateOdp(id: string, data: UpdateOdpPayload) {
  const res = await fetch(`${API}/odps/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Gagal mengupdate ODP.");
  }

  return result.data ?? result;
}

export async function createOdp(data: {
  name: string;
  rasio: string;
  pasiveSpliter: string;
  areaId: string;
}) {
  const res = await fetch(`${API}/odps`, {
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

export async function getAllOdp() {
  const res = await fetch(`${API}/odps/all`, {
    credentials: "include",
  });

  return res.json();
}
