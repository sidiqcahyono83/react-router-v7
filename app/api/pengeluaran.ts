// ============================================================
// API PENGELUARAN
// Backend:
//   GET    /pengeluaran              → { success, data } semua data (include user, bukuKas)
//   GET    /pengeluaran/:id          → detail
//   POST   /pengeluaran              → buat ({ totalKeluar, kategori, deskripsi?, tanggal? })
//   POST   /pengeluaran/pengeluaran  → alternatif create (jika route yang pertama dipakai)
//   PUT    /pengeluaran/:id          → update (Buku Kas disesuaikan otomatis)
//   DELETE /pengeluaran/:id          → hapus (Buku Kas disesuaikan otomatis)
// ============================================================

const API = import.meta.env.VITE_API_URL;

export interface PengeluaranItem {
  id: string;
  userId: string;
  totalKeluar: number;
  deskripsi?: string | null;
  kategori: string;
  tanggal: string;
  bukuKasId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: { id: string; fullname?: string; username?: string } | null;
  bukuKas?: {
    id: string;
    tanggal?: string;
    totalMasuk?: number;
    totalKeluar?: number;
    saldoAkhir?: number;
  } | null;
}

/** Parsing JSON yang aman — kalau body bukan JSON, kembalikan pesan readable */
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

/** GET /pengeluaran — semua pengeluaran (backend tanpa pagination) */
export async function getPengeluaran() {
  const res = await fetch(`${API}/pengeluaran`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data Pengeluaran");
  }

  return res.json(); // { success, data: [...] }
}

/** GET /pengeluaran/:id */
export async function getPengeluaranId(id: string) {
  const res = await fetch(`${API}/pengeluaran/${id}`, {
    credentials: "include",
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result.message || "Gagal mengambil Pengeluaran");
  }

  return result; // { success, data }
}

/**
 * POST /pengeluaran — buat pengeluaran ({ totalKeluar, kategori, deskripsi?, tanggal? })
 * Kalau 404 → fallback ke POST /pengeluaran/pengeluaran (route alternatif di backend).
 */
export async function createPengeluaran(data: {
  totalKeluar: number;
  kategori: string;
  deskripsi?: string;
  tanggal?: string; // ISO string, opsional
}) {
  const body = JSON.stringify(data);

  const res = await fetch(`${API}/pengeluaran`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  const result = await safeJson(res);

  if (res.ok) {
    return result;
  }

  if (res.status === 404) {
    // Fallback: route alternatif
    console.warn(
      "[pengeluaran] 404 di POST /pengeluaran — coba /pengeluaran/pengeluaran",
    );
    const res2 = await fetch(`${API}/pengeluaran/pengeluaran`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const result2 = await safeJson(res2);

    if (res2.ok) {
      return result2;
    }

    throw new Error(result2.message || "Gagal mencatat pengeluaran.");
  }

  // 400/500 — saldo tidak mencukupi, kategori wajib, dll.
  console.error("[pengeluaran] error", res.status, result);
  throw new Error(result.message || "Gagal mencatat pengeluaran.");
}

/** PUT /pengeluaran/:id — update (Buku Kas disesuaikan otomatis oleh backend) */
export async function updatePengeluaran(
  id: string,
  data: { totalKeluar?: number; kategori?: string; deskripsi?: string },
) {
  const res = await fetch(`${API}/pengeluaran/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result.message || "Gagal memperbarui pengeluaran.");
  }

  return result;
}

/** DELETE /pengeluaran/:id — hapus (Buku Kas disesuaikan otomatis) */
export async function deletePengeluaran(id: string) {
  const res = await fetch(`${API}/pengeluaran/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result.message || "Gagal menghapus pengeluaran.");
  }

  return result;
}
