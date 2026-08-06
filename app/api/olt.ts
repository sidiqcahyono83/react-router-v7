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

export interface OltPayloadInput {
  name: string;
  username: string;
  serial: string;
  password: string;
  customerIds: string[];
}

export async function createOlt(data: OltPayloadInput) {
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
    throw new Error(result.message ?? "Gagal menambahkan OLT");
  }

  return result;
}

// ============================================================
// API OLT
// Backend (mount: /olt/:olt):
//   GET /olt/:olt/              → semua ONU (ontinfo_table)
//   GET /olt/:olt/onu/:name     → filter by ont_name
//   GET /olt/:olt/onu/sn/:sn    → filter by ont_sn
//   GET /olt/:olt/port/:port    → data port (1-8)
//   GET /olt/:olt/daftar        → daftar OLT terdaftar
//   Dukungan: ?refresh=1 (bypass cache)
// ============================================================

/** Daftar OLT cadangan (dipakai kalau endpoint /daftar gagal) */
export const OLT_FALLBACK = [
  "sruweng",
  "manggal",
  "pagutan",
  "jonggol",
  "sruweng2",
];

export interface OltInfo {
  key: string;
  baseUrl?: string;
}

export interface OntItem {
  ont_name?: string;
  ont_sn?: string;
  [key: string]: unknown;
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

/** GET /olt/:olt/daftar — daftar OLT terdaftar (route ini bebas OLT) */
export async function getOltDaftar(): Promise<OltInfo[]> {
  try {
    const res = await fetch(`${API}/olt/sruweng/daftar`, {
      credentials: "include",
    });

    if (res.ok) {
      const result = await safeJson(res);
      const raw = result?.data ?? [];

      if (Array.isArray(raw)) {
        return raw.map((o: any) => ({
          key: o.key ?? o.name ?? String(o),
          baseUrl: o.baseUrl,
        }));
      }
    }
  } catch (err) {
    console.warn("[olt] getOltDaftar gagal, pakai fallback:", err);
  }

  return OLT_FALLBACK.map((key) => ({ key }));
}

/** GET /olt/:olt/ — semua ONU */
export async function getOltAll(olt: string, refresh = false) {
  const q = refresh ? "?refresh=1" : "";

  // ⭐ JANGAN tambah "/" setelah nama OLT:
  //   /olt/sruweng      → 200 OK
  //   /olt/sruweng/     → 404 (Hono tidak match route root dengan trailing slash)
  const res = await fetch(`${API}/olt/${encodeURIComponent(olt)}${q}`, {
    credentials: "include",
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(
      result?.message ?? `Gagal mengambil data OLT (${res.status})`,
    );
  }

  return result; // { success, total, data, cached, fetchedAt }
}

/** GET /olt/:olt/port/:port — data port */
export async function getOltPort(olt: string, port: number, refresh = false) {
  const q = refresh ? "?refresh=1" : "";
  const res = await fetch(
    `${API}/olt/${encodeURIComponent(olt)}/port/${port}${q}`,
    { credentials: "include" },
  );

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(
      result?.message ?? `Gagal mengambil data port (${res.status})`,
    );
  }

  return result; // { success, data, cached, fetchedAt }
}

/** Bantu hitung umur data dari fetchedAt (ms) */
export function ageLabel(fetchedAt?: number | string | null) {
  if (!fetchedAt) return "";

  const ts =
    typeof fetchedAt === "string" ? new Date(fetchedAt).getTime() : fetchedAt;
  if (Number.isNaN(ts)) return "";

  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));

  if (diffSec < 5) return "baru saja";
  if (diffSec < 60) return `${diffSec} detik lalu`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min} menit lalu`;
  return `${Math.floor(min / 60)} jam lalu`;
}

/** POST /olt/:olt/onu/:id/name — ganti nama & deskripsi ONT */
export async function updateOntName(
  olt: string,
  identifier: number | string,
  data: { ont_name: string; ont_description?: string },
) {
  const res = await fetch(
    `${API}/olt/${encodeURIComponent(olt)}/onu/${identifier}/name`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result?.message ?? `Gagal mengedit ONT (${res.status})`);
  }

  return result; // { success, message, data }
}
