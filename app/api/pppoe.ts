const API = import.meta.env.VITE_API_URL;

export async function createPppoe(data: {
  username: string;
  password: string;
  profile: string;
}) {
  const res = await fetch(`${API}/pppoe/createppp`, {
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

// export async function getDashboardSummary() {
//   const res = await fetch(`${API}/pppoedashboard`, {
//     credentials: "include",
//   });

//   if (!res.ok) {
//     throw new Error("Gagal mengambil dashboard PPPoE");
//   }

//   return res.json();
// }

// export async function getDashboard(params: {
//   page: number;
//   limit: number;
//   type: "secret" | "active" | "inactive" | "disabled" | "nonActiveNonDisabled";
// }) {
//   const query = new URLSearchParams({
//     page: String(params.page),
//     limit: String(params.limit),
//     type: params.type,
//   });

//   const res = await fetch(`${API}/pppoedashboard/dashboard?${query}`, {
//     credentials: "include",
//   });

//   if (!res.ok) {
//     throw new Error("Gagal mengambil dashboard PPPoE");
//   }

//   return res.json();
// }

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

export async function getDashboard(params: {
  page: number;
  limit: number;
  type: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    type: params.type,
  });

  const res = await fetch(`${API}/pppoedashboard/dashboard?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data PPPoE");
  }

  return res.json(); // { data, pagination }
}

export async function getDashboardSummary() {
  const res = await fetch(`${API}/pppoe/summary`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil summary PPPoE");
  }

  return res.json(); // { summary }
}

/**
 * POST /pppoe/sync — sinkronkan username PPPoE dengan customer.
 * Response diharapkan berisi data customer + wilayah:
 *   { success, message, data: { fullname, area: { name } / wilayah } }
 */
export async function syncPppoe(username: string) {
  const res = await fetch(`${API}/pppoe/sync`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result?.message ?? `Gagal sinkron (${res.status})`);
  }

  return result;
}

/**
 * POST /pppoe/toggle — aktifkan / nonaktifkan akun PPPoE.
 *   disabled: true  → nonaktifkan
 *   disabled: false → aktifkan
 */
export async function togglePppoe(username: string, disabled: boolean) {
  const res = await fetch(`${API}/pppoe/toggle`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, disabled }),
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result?.message ?? `Gagal ubah status (${res.status})`);
  }

  return result;
}

export async function getCustomersMonitoring() {
  let res = await fetch(`${API}/customers/all`, { credentials: "include" });

  if (!res.ok) {
    res = await fetch(`${API}/customers`, { credentials: "include" });
  }

  if (!res.ok) {
    throw new Error("Gagal mengambil data customer");
  }

  const json = await res.json().catch(() => ({}));
  const raw = Array.isArray(json)
    ? json
    : (json?.data ?? json?.customers ?? []);
  return Array.isArray(raw) ? raw : [];
}

/** Ambil daftar PPP aktif dari Mikrotik → { active_ppp: [...] } */
export async function getPppActive() {
  const candidates = ["/pppoe/active"];

  for (const path of candidates) {
    try {
      const res = await fetch(`${API}${path}`, { credentials: "include" });

      if (!res.ok) continue; // 404/500 → coba kandidat berikutnya

      const json = await res.json().catch(() => ({}));

      // Bentuk umum: { active_ppp: [...] } atau { data: [...] } atau array
      const raw = Array.isArray(json)
        ? json
        : (json?.active_ppp ?? json?.data ?? json?.result ?? []);

      if (Array.isArray(raw) && raw.length > 0) {
        return raw;
      }
    } catch {
      // lanjut kandidat berikutnya
    }
  }

  console.warn(
    "[pppoe] getPppActive: semua kandidat path gagal (404) — pakai []",
  );
  return [];
}

export async function getAllPppSecrets(params: { pageSize?: number } = {}) {
  const pageSize = params.pageSize ?? 200;
  const all: any[] = [];
  let page = 1;

  while (true) {
    const res = await getDashboard({ page, limit: pageSize, type: "secret" });

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
