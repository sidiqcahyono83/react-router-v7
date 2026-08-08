// ============================================================
// API PAYMENT + helper invoice untuk form pembayaran
// File ini diimpor oleh halaman payment:
//   import { ... } from "~/api/payment";
// ============================================================

const API = import.meta.env.VITE_API_URL;

// ------------------------------------------------------------
// INVOICE (untuk pemilihan invoice di form pembayaran)
// ------------------------------------------------------------

export async function getInvoice(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  bulan?: number;
  tahun?: number;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

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

/**
 * Ambil SEMUA invoice (loop semua halaman sampai total tercapai).
 * Dipakai untuk pilihan invoice di form pembayaran supaya tidak dibatasi 200.
 */
export async function getAllInvoices(
  params: { search?: string; status?: string; pageSize?: number } = {},
) {
  const pageSize = params.pageSize ?? 200; // ukuran per-request, bukan batas total
  const all: any[] = [];
  let page = 1;

  while (true) {
    const res = await getInvoice({
      page,
      limit: pageSize,
      search: params.search ?? "",
      status: params.status,
    });

    const raw = res?.data ?? [];
    const batch = Array.isArray(raw) ? raw : [];
    all.push(...batch);

    const total = Number(res?.pagination?.total ?? 0);
    const totalPages = Number(res?.pagination?.totalPages ?? 1);

    // Berhenti kalau: halaman kosong, sudah di halaman terakhir,
    // atau semua data sudah terkumpul.
    if (batch.length === 0 || page >= totalPages || all.length >= total) {
      break;
    }

    page += 1;
  }

  return all;
}

// ------------------------------------------------------------
// PAYMENT — konstanta & tipe
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// PAYMENT — fungsi API
// ------------------------------------------------------------

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
 * Ambil SEMUA pembayaran (loop semua halaman sampai total tercapai).
 */
export async function getAllPayments(
  params: { search?: string; pageSize?: number } = {},
) {
  const pageSize = params.pageSize ?? 200;
  const all: any[] = [];
  let page = 1;

  while (true) {
    const res = await getPayments({
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

  return all;
}

/**
 * POST /payment — pembayaran CASH manual (JSON, TANPA file).
 * Langsung SUCCESS: invoice -> PAID, tercatat Pendapatan & Buku Kas,
 * status customer diaktifkan.
 */
export async function createPaymentCash(data: {
  invoiceId: string;
  method: string; // "CASH"
}) {
  const res = await fetch(`${API}/payment`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    // Log detail error supaya penyebab 400 kelihatan di console
    console.error("[payment] error", res.status, result);
    throw new Error(result.message ?? "Gagal membuat pembayaran.");
  }

  return result;
}

/**
 * POST /payment/manual/attachment — pembayaran TRANSFER MANUAL
 * (multipart/form-data + file bukti transfer).
 *
 * Jika route /manual/attachment tidak ada di server (404), otomatis
 * fallback ke alur 2 langkah yang pasti didukung backend:
 *   1. POST /payment              → buat payment status PENDING (JSON)
 *   2. POST /payment/:id/attachment → upload bukti → WAITING_VERIFICATION
 *
 * Catatan: jangan set header Content-Type sendiri, biarkan browser
 * yang mengisi multipart boundary secara otomatis.
 */
export async function createPaymentManual(data: {
  invoiceId: string;
  method: string; // "BANK_TRANSFER" dkk
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

  if (res.ok) {
    return result;
  }

  // 404 → route /manual/attachment tidak ada di server → fallback 2 langkah
  if (res.status === 404) {
    console.warn(
      "[payment/manual/attachment] 404 — fallback ke POST /payment → POST /payment/:id/attachment",
    );
    return createPaymentTransfer(data);
  }

  // 400/500 dll → tampilkan pesan asli dari server
  console.error("[payment/manual/attachment] error", res.status, result);
  throw new Error(result.message ?? "Gagal membuat pembayaran.");
}

/**
 * Alur 2 langkah untuk transfer manual (menggunakan route yang
 * pasti ada di backend):
 *   1. POST /payment                → payment status PENDING (JSON)
 *   2. POST /payment/:id/attachment → upload bukti → WAITING_VERIFICATION
 *
 * Kalau ternyata sudah ada payment PENDING/WAITING_VERIFICATION untuk
 * invoice yang sama (misal percobaan sebelumnya), bukti transfer
 * langsung dilampirkan ke payment yang sudah ada itu.
 */
export async function createPaymentTransfer(data: {
  invoiceId: string;
  method: string; // "BANK_TRANSFER" dkk
  file?: File | null;
}) {
  // Langkah 1: buat payment PENDING
  const res = await fetch(`${API}/payment`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invoiceId: data.invoiceId, method: data.method }),
  });

  const result = await res.json();

  if (!res.ok) {
    // "Masih ada pembayaran yang diproses" → cari payment yang sudah ada
    // lalu lampirkan bukti transfer ke payment itu.
    if (/diproses/i.test(result?.message ?? "")) {
      const existing = await findPendingPayment(data.invoiceId);
      if (existing) {
        await uploadPaymentAttachment(existing.id, data.file ?? null);
        return {
          success: true,
          message:
            "Bukti transfer dilampirkan ke pembayaran yang sudah ada & menunggu verifikasi.",
          data: existing,
        };
      }
    }

    console.error("[payment] error", res.status, result);
    throw new Error(result.message ?? "Gagal membuat pembayaran.");
  }

  const payment = result?.data ?? result;
  const paymentId = payment?.id;

  if (!paymentId) {
    throw new Error("Payment berhasil dibuat tetapi ID tidak ditemukan.");
  }

  // Langkah 2: upload bukti transfer
  await uploadPaymentAttachment(paymentId, data.file ?? null);

  return {
    success: true,
    message: "Pembayaran transfer berhasil dibuat & menunggu verifikasi.",
    data: payment,
  };
}

/** Cari payment PENDING/WAITING_VERIFICATION untuk sebuah invoice */
async function findPendingPayment(invoiceId: string) {
  const list = await getAllPayments({ pageSize: 500 });
  return list.find(
    (p: any) =>
      p.invoiceId === invoiceId &&
      ["PENDING", "WAITING_VERIFICATION"].includes(
        String(p.status ?? "").toUpperCase(),
      ),
  );
}

/** Upload bukti transfer ke sebuah payment (multipart) */
async function uploadPaymentAttachment(paymentId: string, file: File | null) {
  const form = new FormData();
  if (file) form.append("file", file);

  const res = await fetch(`${API}/payment/${paymentId}/attachment`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const result = await res.json();

  if (!res.ok) {
    console.error("[payment/:id/attachment] error", res.status, result);
    throw new Error(result.message ?? "Gagal mengupload bukti transfer.");
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

// ------------------------------------------------------------
// ------------------------------------------------------------
// PAYMENT GATEWAY MIDTRANS (customer / tagihan)
// Endpoint: POST /payments/charge (dipanggil dari halaman publik /bayar/:id)
// ------------------------------------------------------------

// Kandidat path — route gateway bisa di-mount dengan prefix yang
// berbeda-beda di backend (mis. /payment-gateway, /payment, /gateway).
// Fungsi ini mencoba satu per satu sampai ketemu yang bukan 404.
const CHARGE_CANDIDATES = [
  // Dipakai di index.ts backend: app.route("/paymentGetway", webhookRoute)
  "/paymentGetway/payments/charge",
  // Kandidat lain (kalau suatu saat mount path-nya diubah)
  "/payments/charge",
  "/payment-gateway/payments/charge",
  "/payment/payments/charge",
  "/gateway/payments/charge",
  "/midtrans/payments/charge",
  "/api/payments/charge",
];

/** Parsing JSON yang aman — kalau body bukan JSON (mis. teks "Not Found"), kembalikan pesan readable */
async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    return {
      message: `Server error (${res.status}): ${
        text.trim().slice(0, 150) || "(body kosong — endpoint tidak ditemukan)"
      }`,
    };
  }
}

/** POST /payments/charge — buat transaksi Midtrans Snap untuk sebuah invoice */
export async function chargePaymentGateway(invoiceId: string) {
  let lastError: Error | null = null;

  for (const path of CHARGE_CANDIDATES) {
    try {
      const res = await fetch(`${API}${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoiceId }),
      });

      const result = await safeJson(res);

      if (res.ok) {
        return result; // { message, token, redirect_url, payment }
      }

      if (res.status === 404) {
        // Path ini tidak ada → coba kandidat berikutnya
        console.warn(`[payments/charge] 404 di ${path}`);
        lastError = new Error(
          `Endpoint ${path} tidak ditemukan (404). Periksa mounting route gateway di backend.`,
        );
        continue;
      }

      // 400/500 dll → tampilkan pesan asli (plus detail error dari backend)
      console.error("[payments/charge] error", res.status, result);
      const detail = result?.error ? ` (${result.error})` : "";
      throw new Error(
        `${result?.message ?? "Gagal membuat pembayaran gateway."}${detail}`,
      );
    } catch (err) {
      // Kegagalan fetch/parse → simpan dan lanjut ke kandidat berikutnya
      lastError =
        err instanceof Error ? err : new Error("Gagal menghubungi server.");
    }
  }

  throw (
    lastError ??
    new Error(
      "Gagal membuat pembayaran gateway. Pastikan route /payments/charge terdaftar di backend.",
    )
  );
}

/** Helper: link publik untuk customer membayar tagihan */
export function paymentLink(invoiceId: string) {
  return `${window.location.origin}/bayar/${invoiceId}`;
}

export async function getPaymentId(id: string) {
  try {
    const res = await fetch(`${API}/payment/${id}`, {
      credentials: "include",
    });

    if (res.ok) {
      const result = await safeJson(res);
      return result?.data ?? result ?? null;
    }

    if (res.status !== 404) {
      const result = await safeJson(res);
      throw new Error(result?.message ?? "Gagal mengambil payment.");
    }
  } catch (err) {
    // Kalau error karena 404 → lanjut fallback; selain itu rethrow
    if (err instanceof Error && !err.message.includes("404")) {
      throw err;
    }
  }

  // Fallback: cari dari semua payment
  const list = await getAllPayments({ pageSize: 500 });
  const found = list.find((p: any) => p.id === id);
  if (!found) {
    throw new Error("Payment tidak ditemukan.");
  }
  return found;
}

/**
 * PATCH /payment/:id — update payment (status, jumlah, metode, tanggal).
 * ⚠️ Butuh route PATCH /payment/:id di backend (kalau 404, pesan jelas).
 */
export async function updatePayment(
  id: string,
  data: {
    status?: string;
    amount?: number;
    method?: string;
    paidAt?: string | null;
    transferAt?: string | null;
  },
) {
  const res = await fetch(`${API}/payment/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await safeJson(res);

  if (!res.ok) {
    console.error("[payment/:id] error", res.status, result);
    throw new Error(
      result?.message ??
        `Gagal update payment (${res.status}). Pastikan backend punya route PATCH /payment/:id.`,
    );
  }

  return result?.data ?? result;
}
