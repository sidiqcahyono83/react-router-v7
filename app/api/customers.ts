// ============================================================
// API CUSTOMER
// Backend:
//   GET  /customers?page&limit&search   → pagination + search
//   GET  /customers/all                 → semua (array)
//   GET  /customers/:id                 → detail
//   POST /customers                     → create
//   PATCH /customers/:id                → update
//   POST /customers/register            → create + PPPoE (register)
// ============================================================

const API = import.meta.env.VITE_API_URL;

export interface CustomerItem {
  id: string;
  username: string;
  fullname: string;
  phoneNumber?: string | null;
  address?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  paket?: { id: string; nama?: string; name?: string; harga?: number } | null;
  area?: { id: string; nama?: string; name?: string } | null;
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

export async function getCustomers(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  const res = await fetch(`${API}/customers?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data customer");
  }

  return res.json(); // { success?, data, pagination? }
}

export async function getCustomersAll() {
  const res = await fetch(`${API}/customers/all`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data customer");
  }

  return res.json();
}

/** Ambil SEMUA customer (fallback: /all → loop pagination) */
export async function getAllCustomers(
  params: { search?: string; pageSize?: number } = {},
) {
  // Coba /all dulu
  try {
    const raw = await getCustomersAll();
    const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.customers ?? []);
    if (Array.isArray(list) && list.length > 0) return list as CustomerItem[];
  } catch (err) {
    console.warn("[customer] /all gagal, fallback pagination:", err);
  }

  // Fallback: loop pagination
  const pageSize = params.pageSize ?? 200;
  const all: any[] = [];
  let page = 1;

  while (true) {
    const res = await getCustomers({
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

  return all as CustomerItem[];
}

export async function getCustomerId(id: string) {
  const res = await fetch(`${API}/customers/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil customer");
  }

  return res.json();
}

export async function updateCustomer(id: string, data: any) {
  const res = await fetch(`${API}/customers/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result.message || "Gagal mengupdate customer.");
  }

  return result;
}

export async function createCustomer(data: any) {
  const res = await fetch(`${API}/customers`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result.message || "Gagal membuat customer.");
  }

  return result;
}

/** POST /customers/register — create + PPPoE sekaligus */
export async function registerCustomer(data: any) {
  const res = await fetch(`${API}/customers/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await safeJson(res);

  if (!res.ok) {
    throw new Error(result.message || "Gagal register customer.");
  }

  return result;
}

export async function searchCustomers(keyword: string) {
  const query = new URLSearchParams({
    page: "1",
    limit: "10",
    search: keyword,
  });

  const res = await fetch(`${API}/customers?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil customer");
  }

  const result = await res.json();

  return result?.data ?? [];
}
