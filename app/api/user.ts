// ============================================================
// API USER
// Backend:
//   GET  /user           → { users: [...] }  (tanpa pagination)
//   POST /user           → create ({ username, fullname, password, level?, areaIds?, address?, phoneNumber? })
//   PATCH /user/:id      → update ({ password?, areaIds?, phoneNumber?, address?, level? })
//   POST /user/register  → create alternatif (sama dengan POST /user)
// ============================================================

const API = import.meta.env.VITE_API_URL;

export interface UserItem {
  id: string;
  username: string;
  fullname: string;
  address?: string | null;
  phoneNumber?: string | null;
  level: string;
  createdAt?: string;
  updatedAt?: string;
  areas?: { id: string; name?: string }[] | null;
  _count?: { areas?: number };
}

export interface AreaItem {
  id: string;
  name: string;
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

/** GET /user — semua user (backend tanpa pagination) */
export async function getUsers() {
  const res = await fetch(`${API}/users`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data User");
  }

  return res.json(); // { users: [...] }
}

/** POST /user — buat user baru */
export async function createUser(data: {
  username: string;
  fullname: string;
  password: string;
  level?: string;
  address?: string;
  phoneNumber?: string;
  areaIds?: string[];
}) {
  const res = await fetch(`${API}/users`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result.message || "Gagal membuat user.");
  }

  return result; // { message, data }
}

/**
 * PATCH /user/:id — update user.
 * Hanya kirim field yang ingin diubah; password kosong = tidak diganti.
 */
export async function updateUser(
  id: string,
  data: {
    password?: string;
    areaIds?: string[];
    phoneNumber?: string;
    address?: string;
    level?: string;
  },
) {
  // Jangan kirim password kosong
  const payload: any = { ...data };
  if (!payload.password) delete payload.password;

  const res = await fetch(`${API}/users/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result.message || "Gagal memperbarui user.");
  }

  return result; // { message, data }
}

/**
 * Ambil daftar AREA untuk pilihan di form — SEMUA area (loop semua halaman).
 * Coba beberapa kandidat path — kalau semua gagal, kembalikan [].
 */
export async function getAreas(
  params: { search?: string; pageSize?: number } = {},
): Promise<AreaItem[]> {
  const candidates = ["/areas", "/areas/all"];
  const pageSize = params.pageSize ?? 200;

  for (const path of candidates) {
    try {
      const collected = await fetchAllAreaPages(path, pageSize);
      // Kalau ada data yang berhasil dikumpulkan, pakai kandidat ini
      if (collected.length > 0) return collected;
    } catch (err) {
      console.warn(`[user] getAreas gagal di ${path}:`, err);
    }
  }

  console.warn("[user] Gagal memuat daftar area — semua kandidat path gagal.");
  return [];
}

/** Loop semua halaman endpoint area sampai semua data terkumpul */
async function fetchAllAreaPages(
  path: string,
  pageSize: number,
): Promise<AreaItem[]> {
  const all: AreaItem[] = [];
  let page = 1;

  while (true) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(
      `${API}${path}${sep}page=${page}&limit=${pageSize}`,
      { credentials: "include" },
    );

    if (!res.ok) break;

    const result = await safeJson(res);
    const batch = extractAreaArray(result);

    if (batch.length === 0) break;

    all.push(...batch);

    const total = Number(result?.pagination?.total ?? result?.total ?? 0);
    const totalPages = Number(
      result?.pagination?.totalPages ?? result?.totalPages ?? 0,
    );

    // Berhenti kalau: batch lebih kecil dari ukuran halaman,
    // semua data sudah terkumpul, atau sudah di halaman terakhir.
    if (
      batch.length < pageSize ||
      (total > 0 && all.length >= total) ||
      (totalPages > 0 && page >= totalPages)
    ) {
      break;
    }

    page += 1;
  }

  return all;
}

/** Ekstrak array area dari berbagai bentuk response backend */
function extractAreaArray(result: any): AreaItem[] {
  let raw = result?.data ?? result?.areas ?? result?.result ?? result;

  // Bentuk bersarang: { data: { items/rows/list/areas: [...] } }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    raw = raw.items ?? raw.rows ?? raw.list ?? raw.areas ?? raw.data ?? [];
  }

  if (!Array.isArray(raw)) return [];

  return raw.map((a: any) => ({
    id: a.id,
    name: a.name ?? a.nama ?? a.areaName ?? a.area ?? "Area",
  }));
}
