// ============================================================
// API BUKU KAS
// ============================================================

const API = import.meta.env.VITE_API_URL;

export interface BukuKasItem {
  id: string;
  userId: string;
  tanggal: string;
  totalMasuk: number;
  totalKeluar: number;
  saldoAkhir: number;
  deskripsi?: string | null;
  keterangan?: string | null;
  createdAt?: string;
  user?: { id: string; fullname?: string; username?: string } | null;
  pendapatan?: Array<{
    id: string;
    total?: number;
    totalMasuk?: number;
    deskripsi?: string | null;
    createdAt?: string;
    payment?: {
      method?: string;
      gateway?: string;
      customer?: { fullname?: string; username?: string } | null;
    } | null;
  }> | null;
  pengeluaran?: Array<{
    id: string;
    total?: number;
    totalKeluar?: number;
    kategori?: string;
    deskripsi?: string | null;
    createdAt?: string;
    user?: { fullname?: string } | null;
  }> | null;
}

export interface BukuKasSummary {
  totalMasuk: number;
  totalKeluar: number;
  saldoAkhir: number;
}

async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return {
      message: `Server error (${res.status})`,
    };
  }
}

async function fetchFirstOk(
  paths: string[],
  init?: RequestInit,
): Promise<{ result: any; path: string }> {
  let lastErr: Error | null = null;

  for (const path of paths) {
    try {
      const res = await fetch(`${API}${path}`, {
        credentials: "include",
        ...init,
      });

      const result = await safeJson(res);

      if (res.status === 404) {
        lastErr = new Error(`Endpoint ${path} tidak ditemukan.`);
        continue;
      }

      if (!res.ok) {
        throw new Error(
          result?.message || `Gagal mengambil Buku Kas (HTTP ${res.status}).`,
        );
      }

      return { result, path };
    } catch (err) {
      lastErr =
        err instanceof Error ? err : new Error("Gagal menghubungi server.");
    }
  }

  throw lastErr ?? new Error("Gagal mengambil data Buku Kas.");
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function queryFor(params: {
  bulan?: number | string;
  tahun?: number | string;
}) {
  const query = new URLSearchParams();

  const year = Number(params.tahun);
  const month = Number(params.bulan);

  if (Number.isInteger(year) && year >= 2020 && year <= 2100) {
    if (Number.isInteger(month) && month >= 1 && month <= 12) {
      const monthText = String(month).padStart(2, "0");
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

      query.set("startDate", `${year}-${monthText}-01`);
      query.set(
        "endDate",
        `${year}-${monthText}-${String(lastDay).padStart(2, "0")}`,
      );
    } else {
      query.set("startDate", `${year}-01-01`);
      query.set("endDate", `${year}-12-31`);
    }
  }

  const queryText = query.toString();
  return queryText ? `?${queryText}` : "";
}

export async function getBukuKas(params: {
  page: number;
  limit: number;
  bulan?: number | string;
  tahun?: number | string;
}) {
  const query = queryFor({
    bulan: params.bulan,
    tahun: params.tahun,
  });

  const { result } = await fetchFirstOk([
    `/bukukas${query}`,
    `/buku-kas${query}`,
  ]);

  const payload = result?.data;

  const raw = Array.isArray(payload)
    ? payload
    : (payload?.data ?? result?.items ?? []);

  const list: BukuKasItem[] = Array.isArray(raw) ? raw : [];

  // Backend saat ini mengirim seluruh data tanpa pagination.
  // Pagination dilakukan di frontend.
  const start = (params.page - 1) * params.limit;
  const end = params.page * params.limit;

  return {
    ...result,
    data: list.slice(start, end),
    total: list.length,
    page: params.page,
    limit: params.limit,
  };
}

export async function getBukuKasSummary(
  params: {
    bulan?: number | string;
    tahun?: number | string;
  } = {},
): Promise<BukuKasSummary> {
  const query = queryFor(params);

  // Menggunakan endpoint daftar karena endpoint /summary/total backend
  // belum memakai checkUserToken dan filter userId.
  const { result } = await fetchFirstOk([
    `/bukukas${query}`,
    `/buku-kas${query}`,
  ]);

  const payload = result?.data;

  const raw = Array.isArray(payload)
    ? payload
    : (payload?.data ?? result?.items ?? []);

  const records: BukuKasItem[] = Array.isArray(raw) ? raw : [];

  return {
    totalMasuk: records.reduce(
      (sum, item) => sum + numberValue(item.totalMasuk),
      0,
    ),
    totalKeluar: records.reduce(
      (sum, item) => sum + numberValue(item.totalKeluar),
      0,
    ),
    // Backend mengurutkan tanggal desc, sehingga data pertama
    // merupakan saldo akhir periode.
    saldoAkhir: numberValue(records[0]?.saldoAkhir),
  };
}

export async function getBukuKasId(id: string) {
  const { result } = await fetchFirstOk([`/bukukas/${id}`, `/buku-kas/${id}`]);

  return result?.data ?? result ?? null;
}
