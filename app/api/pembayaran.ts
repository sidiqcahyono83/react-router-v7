const API = import.meta.env.VITE_API_URL;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function getPembayarans({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const res = await fetch(
    `${API}/pembayaran?page=${page}&limit=${limit}&search=${search}`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Gagal mengambil pembayaran");

  return res.json();
}

export async function getPembayaranById(id: string) {
  const res = await fetch(`${API}/pembayaran/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Data tidak ditemukan");
  }

  return res.json();
}

export async function createPembayaran(formData: FormData) {
  const res = await fetch(`${API}/pembayaran`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
}

export async function updatePembayaran(id: string, formData: FormData) {
  const res = await fetch(`${API}/pembayaran/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
}

export async function deletePembayaran(id: string) {
  const res = await fetch(`${API}/pembayaran/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return res.json();
}
