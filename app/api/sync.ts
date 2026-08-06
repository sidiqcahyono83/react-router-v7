// ============================================================
// API SINKRONISASI PPP SECRET vs CUSTOMER
// Backend:
//   GET  /sync/syncCheck        → summary + data customer (sinkron/tidak)
//   GET  /sync/secret/notSync   → PPP Secret tanpa customer
//   POST /sync/sync             → buat PPP Secret utk customer belum sinkron
// ============================================================

const API = import.meta.env.VITE_API_URL;

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

export interface SyncCheckItem {
  customer_id: string;
  username: string;
  fullname: string;
  sync: boolean;
  status: "sinkron" | "tidak sinkron";
}

export interface PppNotSyncItem {
  ppp_id: string;
  name: string;
  profile: string;
  disabled: boolean;
  status: "tidak sinkron";
}

/** GET /sync/syncCheck */
export async function getSyncCheck() {
  const res = await fetch(`${API}/sync/syncCheck`, {
    credentials: "include",
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result?.message ?? "Gagal cek sinkronisasi.");
  }

  return result; // { success, summary, data }
}

/** GET /sync/secret/notSync */
export async function getPppNotSync() {
  const res = await fetch(`${API}/sync/secret/notSync`, {
    credentials: "include",
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result?.message ?? "Gagal mengambil PPP tidak sinkron.");
  }

  return result; // { success, summary, data }
}

/** POST /sync/sync — buat PPP Secret (opsional: usernames tertentu) */
export async function syncPpp(usernames?: string[]) {
  const res = await fetch(`${API}/sync/sync`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(usernames ? { usernames } : {}),
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result?.message ?? "Gagal sinkronisasi.");
  }

  return result; // { success, message, summary, data }
}
