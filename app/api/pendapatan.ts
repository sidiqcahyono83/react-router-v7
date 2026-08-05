// ============================================================
// API PENDAPATAN
// Backend:
//   GET  /pendapatan?page&limit&search&bulan&tahun&metode&tanggalAwal&tanggalAkhir
//   GET  /pendapatan/all
//   GET  /pendapatan/:id
//   POST /pendapatan           (dari payment SUCCESS: { paymentId, deskripsi? })
//   POST /pendapatan/manual    (pemasangan baru / income langsung: { total, deskripsi? })
//   PATCH /pendapatan/:id      (perlu route di backend — belum ada di kode backend kamu)
// ============================================================

const API = import.meta.env.VITE_API_URL;

export interface PendapatanItem {
  id: string;
  paymentId: string | null;
  userId: string | null;
  total: number;
  deskripsi: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: { id: string; fullname: string; username?: string } | null;
  payment?: {
    id: string;
    method?: string;
    gateway?: string;
    status?: string;
    invoice?: {
      id: string;
      invoiceNumber: string;
      total?: number;
      bulan?: number;
      tahun?: number;
    } | null;
    customer?: {
      id: string;
      fullname: string;
      username?: string;
      phoneNumber?: string;
    } | null;
  } | null;
}

export async function getPendapatan(params: {
  page: number;
  limit: number;
  search?: string;
  bulan?: number | string;
  tahun?: number | string;
  metode?: string;
  tanggalAwal?: string;
  tanggalAkhir?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  if (params.bulan) query.set("bulan", String(params.bulan));
  if (params.tahun) query.set("tahun", String(params.tahun));
  if (params.metode) query.set("metode", params.metode);
  if (params.tanggalAwal) query.set("tanggalAwal", params.tanggalAwal);
  if (params.tanggalAkhir) query.set("tanggalAkhir", params.tanggalAkhir);

  const res = await fetch(`${API}/pendapatan?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data Pendapatan");
  }

  return res.json();
}

/** Ambil SEMUA pendapatan (loop semua halaman) */
export async function getAllPendapatan(
  params: {
    search?: string;
    pageSize?: number;
  } = {},
) {
  const pageSize = params.pageSize ?? 200;
  const all: any[] = [];
  let page = 1;

  while (true) {
    const res = await getPendapatan({
      page,
      limit: pageSize,
      search: params.search ?? "",
    });

    const raw = res?.data ?? [];
    const batch = Array.isArray(raw) ? raw : [];
    all.push(...batch);

    const total = Number(res?.pagination?.total ?? 0);
    const totalPages = Number(res?.pagination?.totalPages ?? 1);

    if (batch.length === 0 || page >= totalPages || all.length >= total) {
      break;
    }

    page += 1;
  }

  return all;
}

export async function getPendapatanId(id: string) {
  const res = await fetch(`${API}/pendapatan/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil Pendapatan");
  }

  return res.json();
}

export async function updatePendapatan(id: string, data: any) {
  const res = await fetch(`${API}/pendapatan/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Gagal mengupdate Pendapatan.");
  }

  return result.data ?? result;
}

/** POST /pendapatan — catat pendapatan dari payment yang SUCCESS */
export async function createPendapatan(data: {
  paymentId: string;
  deskripsi?: string;
}) {
  const res = await fetch(`${API}/pendapatan`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Gagal mencatat Pendapatan.");
  }

  return result;
}

/** POST /pendapatan/manual — pendapatan manual (pemasangan baru, income langsung) */
export async function createPendapatanManual(data: {
  total: number;
  deskripsi?: string;
}) {
  const res = await fetch(`${API}/pendapatan/manual`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Gagal mencatat Pendapatan manual.");
  }

  return result;
}
