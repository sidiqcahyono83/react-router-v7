const API = import.meta.env.VITE_API_URL;

export async function getAllOlt() {
  const res = await fetch(`${API}/olts/all`, {
    credentials: "include",
  });

  return res.json();
}

export async function getInvoice(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string; // tambahan: filter status (PAID, UNPAID, EXPIRED, dst.)
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  // hanya kirim ?status= kalau ada, supaya list "Semua" tidak ikut terfilter
  if (params.status) {
    query.set("status", params.status);
  }

  const res = await fetch(`${API}/invoice?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data Invoice");
  }

  return res.json();
}

export async function getInvoiceId(id: string) {
  const res = await fetch(`${API}/invoice/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil Invoice");
  }

  return res.json();
}

export interface OltPayload {
  invoiceNumber: string;
  customerId: string | null;
  periode: Date | null;
  bulan: number | null;
  tahun: number | null;
  subtotal: number | null;
  diskon: number | null;
  total: number | null;
  dueDate: Date | null;
  status: string | null;
  paidAt?: Date | null;
}

export async function updateInvoice(id: string, data: OltPayload) {
  const res = await fetch(`${API}/invoices/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Gagal mengupdate Invoice.");
  }

  return result.data ?? result;
}

export interface OltPayloadInput {
  bulan: number;
  tahun: number;
  dueDate: Date;
}

export async function generateInvoice(data: OltPayloadInput) {
  const res = await fetch(`${API}/invoice`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message ?? "Gagal generate Invoice");
  }

  return result;
}

export async function getInvoiceDashboard() {
  const res = await fetch(`${API}/invoice/dashboard`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil dashboard invoice");
  }

  return res.json();
}
