const API = import.meta.env.VITE_API_URL;

// ============================================================
// INVOICE
// ============================================================

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
  status?: string; // filter status (PAID, UNPAID, EXPIRED, dst.)
  bulan?: number;
  tahun?: number;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  // hanya kirim param kalau ada
  if (params.status) query.set("status", params.status);
  if (params.bulan) query.set("bulan", String(params.bulan));
  if (params.tahun) query.set("tahun", String(params.tahun));

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
  // Backend: route-nya POST /invoice/generate (bukan /invoice)
  const res = await fetch(`${API}/invoice/generate`, {
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

// ============================================================
// PAYMENT
// ============================================================

/** Nilai enum PaymentMethod di backend (Prisma) */
export const PAYMENT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "QRIS",
  "VA_BCA",
  "MIDTRANS",
  "E_WALLET",
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];

/** Nilai enum PaymentStatus di backend (Prisma) */
export const PAYMENT_STATUSES = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REJECTED",
  "WAITING_VERIFICATION",
] as const;

export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];

export interface PaymentAttachment {
  id: string;
  paymentId?: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  extension: string;
  size: number;
  path?: string;
  url: string; // relatif, contoh: /uploads/payment/xxx.png
}

export interface PaymentVerification {
  id: string;
  paymentId?: string;
  verifiedById?: string;
  status: string; // APPROVED | REJECTED
  note?: string | null;
  createdAt?: string;
}

export interface PaymentItem {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: string;
  gateway: string;
  status: string;
  paidAt?: string | null;
  transferAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  customer?: { id: string; fullname: string; username?: string } | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
    total?: number;
    status?: string;
  } | null;
  createdBy?: { id: string; fullname?: string } | null;
  attachments?: PaymentAttachment[] | null;
  verification?: PaymentVerification[] | null;
}

/** GET /payment — daftar pembayaran (pagination + search) */
export async function getPayments(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  const res = await fetch(`${API}/payment?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data Pembayaran");
  }

  return res.json();
}

/** GET /payment/all — semua pembayaran tanpa pagination */
export async function getPaymentAll() {
  const res = await fetch(`${API}/payment/all`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil semua pembayaran");
  }

  return res.json();
}

/**
 * POST /payment/manual/attachment — buat pembayaran manual (multipart/form-data).
 *
 * - CASH       → langsung SUCCESS, invoice lunas, tercatat di Buku Kas
 * - Selain itu → WAITING_VERIFICATION + wajib upload file bukti transfer
 *
 * Catatan: jangan set header Content-Type sendiri, biarkan browser
 * yang mengisi multipart boundary secara otomatis.
 */
export async function createPaymentManual(data: {
  invoiceId: string;
  method: string;
  file?: File | null;
}) {
  const form = new FormData();
  form.append("invoiceId", data.invoiceId);
  form.append("method", data.method);
  if (data.file) {
    form.append("file", data.file);
  }

  const res = await fetch(`${API}/payment/manual/attachment`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const result = await res.json();

  if (!res.ok) {
    // Log detail error supaya penyebab 400 (dari validasi backend) kelihatan di console
    console.error("[payment/manual/attachment] error", res.status, result);
    throw new Error(result.message ?? "Gagal membuat pembayaran.");
  }

  return result;
}

/**
 * PATCH /payment/:id/verify — verifikasi pembayaran transfer.
 * APPROVED → payment SUCCESS + invoice PAID + masuk Buku Kas.
 * REJECTED → payment REJECTED.
 */
export async function verifyPayment(
  id: string,
  data: { status: "APPROVED" | "REJECTED"; note?: string },
) {
  const res = await fetch(`${API}/payment/${id}/verify`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message ?? "Gagal verifikasi pembayaran.");
  }

  return result;
}

/** POST /payment/gateway — inisiasi payment gateway (contoh: MIDTRANS) */
export async function createPaymentGateway(data: {
  invoiceId: string;
  method: string;
}) {
  const res = await fetch(`${API}/payment/gateway`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message ?? "Gagal inisiasi payment gateway.");
  }

  return result;
}

/** Helper: URL absolut untuk attachment (url dari backend bersifat relatif) */
export function attachmentUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url;
  return `${API}${url}`;
}
