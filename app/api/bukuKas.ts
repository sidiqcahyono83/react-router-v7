// ============================================================
// API BUKU KAS
// Backend:
//   GET /buku-kas?page&limit&bulan&tahun   → { success, total, page, limit, data }
//   GET /buku-kas/:id                      → detail
//   GET /buku-kas/summary/total            → { success, totalMasuk, totalKeluar, saldoAkhir }
//   GET /buku-kas/ (per user, startDate/endDate) — alternatif
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
    totalKeluar?: number;
    kategori?: string;
    deskripsi?: string | null;
    createdAt?: string;
    user?: { fullname?: string } | null;
  }> | null;
}

/** Parsing JSON yang aman */
async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    return {
      message: `Server error (${res.status}): ${
        text.trim().slice(0, 150) || "(body kosong)"
      }`,
    };
  }
}

/**
 * Coba beberapa kandidat path sampai dapat yang bukan 404.
 * Backend bisa di-mount sebagai /buku-kas atau /bukukas.
 */
async function fetchFirstOk(
  paths: string[],
  init?: RequestInit,
): Promise<{ res: Response; result: any; path: string }> {
  let lastErr: Error | null = null;

  for (const path of paths) {
    try {
      const res = await fetch(`${API}${path}`, {
        credentials: "include",
        ...init,
      });

      const result = await safeJson(res);

      if (!res.ok && res.status === 404) {
        console.warn(`[bukukas] 404 di ${path}`);
        lastErr = new Error(`Endpoint ${path} tidak ditemukan (404).`);
        continue;
      }

      return { res, result, path };
    } catch (err) {
      lastErr =
        err instanceof Error ? err : new Error("Gagal menghubungi server.");
    }
  }

  throw (
    lastErr ??
    new Error(
      "Gagal mengambil data Buku Kas. Pastikan route /buku-kas terdaftar di backend.",
    )
  );
}

/** GET /buku-kas — list dengan pagination + filter bulan/tahun */
export async function getBukuKas(params: {
  page: number;
  limit: number;
  bulan?: number | string;
  tahun?: number | string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.bulan) query.set("bulan", String(params.bulan));
  if (params.tahun) query.set("tahun", String(params.tahun));

  const { result } = await fetchFirstOk([`/bukukas?${query}`], {
    credentials: "include",
  });

  // Bentuk response: { success, total, page, limit, data }
  // (total di root, bukan pagination.total)
  const raw = result?.data ?? [];
  const list = Array.isArray(raw) ? raw : [];

  return {
    ...result,
    data: list,
    total: Number(result?.total ?? result?.pagination?.total ?? list.length),
    page: Number(result?.page ?? result?.pagination?.page ?? params.page),
    limit: Number(result?.limit ?? result?.pagination?.limit ?? params.limit),
  };
}

/** GET /buku-kas/summary/total — total masuk, keluar, saldo akhir */
export async function getBukuKasSummary() {
  const { result } = await fetchFirstOk(["/bukukas/summary/total"], {
    credentials: "include",
  });

  return {
    totalMasuk: Number(result?.totalMasuk ?? 0),
    totalKeluar: Number(result?.totalKeluar ?? 0),
    saldoAkhir: Number(result?.saldoAkhir ?? 0),
  };
}

/** GET /buku-kas/:id — detail satu hari */
export async function getBukuKasId(id: string) {
  const { result } = await fetchFirstOk([`/bukukas/${id}`, `/bukukas/${id}`], {
    credentials: "include",
  });

  return result?.data ?? result ?? null;
}
