// ============================================================
// Halaman publik: CUSTOMER membayar tagihan via Midtrans Snap
//
// PENTING (env frontend / .env):
//   Vite HANYA mengekspos variabel berawalan VITE_ ke browser.
//   Var "MIDTRANS_CLIENT_KEY" (tanpa VITE_) TIDAK akan terbaca di sini.
//
//   .env frontend untuk PRODUCTION (live):
//     VITE_MIDTRANS_CLIENT_KEY="Mid-client-xxxxxxxx"   ← TANPA prefix "SB-"
//     VITE_MIDTRANS_ENV="production"
//
//   .env frontend untuk SANDBOX (test):
//     VITE_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxx"
//     VITE_MIDTRANS_ENV="sandbox"
//
// ⚠️ KENAPA MASIH MODE TEST/SANDBOX?
//   Mode Midtrans ditentukan di DUA sisi — keduanya harus production:
//     1. FRONTEND → VITE_MIDTRANS_CLIENT_KEY (client key) — file ini
//     2. BACKEND  → SERVER KEY saat membuat Snap token
//   Kalau backend masih pakai server key sandbox, transaksi TETAP sandbox
//   meski frontend sudah production. Indikator mode aktif (dari backend)
//   ditampilkan di kartu pembayaran halaman ini.
//
//   Ingat: .env di-inline saat BUILD. Setelah ubah .env WAJIB build ulang
//   (bun run build) lalu restart — restart saja tidak cukup.
//
// Alur:
//   klik Bayar → POST /payments/charge { invoiceId }
//   → dapat { token, redirect_url, payment }
//   → buka popup Snap (kalau client key ada), fallback redirect_url
// ============================================================

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  AlertTriangle,
  BadgeCheck,
  CreditCard,
  ExternalLink,
  FlaskConical,
  Loader2,
  Lock,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { chargePaymentGateway } from "~/api/payment";
import { getInvoiceId } from "~/api/invoice";
import {
  envFromRedirectUrl,
  explainMidtransError,
  loadSnapScript,
  midtransEnvMismatch,
  payWithSnap,
  resolveMidtransEnv,
} from "~/lib/midtrans";
import PaymentStatusBadge from "./payment/PaymentStatusBadge";

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

const CLIENT_KEY = String(
  import.meta.env.VITE_MIDTRANS_CLIENT_KEY ?? "",
).trim();

/** Mode yang dipakai FRONTEND (ditentukan dari prefix client key). */
const FRONTEND_ENV = resolveMidtransEnv(CLIENT_KEY);

/** Peringatan kalau VITE_MIDTRANS_ENV bentrok dengan client key. */
const ENV_MISMATCH = midtransEnvMismatch(CLIENT_KEY);

interface ChargeResult {
  message?: string;
  token?: string;
  redirect_url?: string;
  payment?: {
    id: string;
    orderId?: string;
    amount?: number;
    status?: string;
    gateway?: string;
    method?: string;
    createdAt?: string;
  } | null;
}

export default function BayarInvoice() {
  const { invoiceId } = useParams();

  // Info invoice (opsional — kalau endpoint butuh login admin dan customer
  // tidak login, info ini di-skip dan halaman tetap bisa dipakai membayar)
  const [invoice, setInvoice] = useState<any>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(true);

  // Alur charge
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [charge, setCharge] = useState<ChargeResult | null>(null);
  const [snapMsg, setSnapMsg] = useState("");
  // Penjelasan teknis untuk error konfigurasi Midtrans (mis. 401 key salah)
  const [errorHint, setErrorHint] = useState("");

  useEffect(() => {
    if (!invoiceId) return;

    let active = true;
    setLoadingInvoice(true);

    getInvoiceId(invoiceId)
      .then((res) => {
        if (active) setInvoice(res?.data ?? res ?? null);
      })
      .catch(() => {
        // 401 (butuh login admin) / 404 — info invoice tidak wajib,
        // jangan blokir halaman pembayaran.
        if (active) setInvoice(null);
      })
      .finally(() => {
        if (active) setLoadingInvoice(false);
      });

    return () => {
      active = false;
    };
  }, [invoiceId]);

  const payment = charge?.payment ?? null;
  const isPaid =
    String(invoice?.status ?? "").toUpperCase() === "PAID";

  // ------------------------------------------------------------
  // Deteksi mode Midtrans yang BENAR-BENAR dipakai.
  //
  // redirect_url dari backend adalah sumber kebenaran: URL-nya
  // mengandung "sandbox.midtrans.com" kalau server key masih sandbox.
  // Kalau charge belum dijalankan, pakai tebakan dari client key frontend.
  // ------------------------------------------------------------
  const backendEnv = envFromRedirectUrl(charge?.redirect_url);
  const activeEnv = backendEnv ?? FRONTEND_ENV;
  const isSandbox = activeEnv === "sandbox";

  // Backend & frontend beda mode → token Snap pasti ditolak.
  const envConflict =
    backendEnv !== null && backendEnv !== FRONTEND_ENV
      ? `Frontend memakai client key ${FRONTEND_ENV}, tapi backend membuat transaksi ${backendEnv}. Samakan keduanya (client key & server key) agar pembayaran berjalan.`
      : "";

  const handlePay = async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError("");
    setSnapMsg("");
    setErrorHint("");

    try {
      // 1. Minta Snap token ke backend: POST /payments/charge
      const res: ChargeResult = await chargePaymentGateway(invoiceId);
      setCharge(res);

      // 2. Kalau client key tersedia → buka popup Snap
      if (CLIENT_KEY && res.token) {
        try {
          await loadSnapScript(CLIENT_KEY);

          payWithSnap(res.token, {
            onSuccess: () =>
              setSnapMsg(
                "Pembayaran berhasil! Terima kasih, tagihan Anda sudah lunas. ✅"
              ),
            onPending: () =>
              setSnapMsg(
                "Pembayaran menunggu konfirmasi. Silakan selesaikan pembayaran Anda."
              ),
            onError: () =>
              setSnapMsg("Terjadi kesalahan saat memproses pembayaran."),
            onClose: () =>
              setSnapMsg(
                "Popup ditutup. Anda bisa membayar lagi kapan saja."
              ),
          });
          return;
        } catch (snapErr) {
          console.error("[snap] gagal memuat:", snapErr);
          // lanjut ke fallback redirect_url
        }
      } else if (!CLIENT_KEY) {
        console.warn(
          "[bayar] VITE_MIDTRANS_CLIENT_KEY belum di-set — pakai redirect_url."
        );
      }

      // Diagnostik mode: kalau backend balas URL sandbox, server key
      // di backend masih sandbox — ini penyebab paling umum "masih test".
      const beEnv = envFromRedirectUrl(res.redirect_url);

      if (beEnv) {
        console.info(
          `[bayar] mode backend: ${beEnv} | mode frontend: ${FRONTEND_ENV}`
        );

        if (beEnv === "sandbox") {
          console.warn(
            "[bayar] Backend membuat transaksi SANDBOX. Ganti MIDTRANS_SERVER_KEY " +
            "di backend ke server key production (tanpa prefix SB-) dan set " +
            "isProduction=true, lalu restart backend."
          );
        }
      }

      // 3. Fallback: buka halaman pembayaran Midtrans di tab baru
      if (res.redirect_url) {
        window.open(res.redirect_url, "_blank");
        setSnapMsg(
          "Halaman pembayaran Midtrans dibuka di tab baru. Selesaikan pembayaran di sana."
        );
      } else {
        setSnapMsg(
          "Pembayaran sudah dibuat (menunggu pembayaran). Silakan selesaikan sesuai metode yang dipilih."
        );
      }
    } catch (err) {
      const raw =
        err instanceof Error
          ? err.message
          : "Gagal memproses pembayaran. Silakan coba lagi.";

      const hint = explainMidtransError(raw);

      if (hint) {
        // Error konfigurasi — customer tidak perlu lihat detail teknisnya.
        setError(
          "Pembayaran online sedang tidak tersedia karena masalah konfigurasi. Silakan hubungi admin."
        );
        setErrorHint(hint);
        console.error("[bayar] Midtrans 401 — kredensial backend ditolak.\n" + hint);
        console.error("[bayar] pesan asli:", raw);
      } else {
        setError(raw);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Header */}
          <div className="bg-green-600 p-6 text-center text-white">
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <Wallet size={28} />
            </span>
            <h1 className="text-xl font-bold">Bayar Tagihan Internet</h1>
            <p className="mt-1 text-sm text-green-100">
              Pembayaran aman melalui Midtrans
            </p>
          </div>

          {/* Banner mode SANDBOX — uang tidak benar-benar berpindah */}
          {isSandbox && (
            <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-100 px-4 py-3 text-left">
              <FlaskConical
                size={16}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <div className="text-xs text-amber-800">
                <p className="font-bold">MODE UJI COBA (Sandbox)</p>
                <p className="mt-0.5">
                  Transaksi ini <strong>tidak nyata</strong> — tidak ada uang
                  yang berpindah. Untuk pembayaran sungguhan, pakai{" "}
                  <em>client key</em> dan <em>server key</em> production.
                </p>
              </div>
            </div>
          )}

          {/* Konfigurasi env bentrok */}
          {(ENV_MISMATCH || envConflict) && (
            <div className="flex items-start gap-2 border-b border-red-200 bg-red-100 px-4 py-3 text-left">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-red-600"
              />
              <div className="text-xs text-red-800">
                <p className="font-bold">Konfigurasi Midtrans tidak konsisten</p>
                <p className="mt-0.5">{envConflict || ENV_MISMATCH}</p>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="space-y-4 p-6">
            {/* Loading info invoice */}
            {loadingInvoice ? (
              <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            ) : (
              <>
                {/* Tagihan sudah lunas */}
                {invoice && isPaid ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                    <BadgeCheck
                      size={40}
                      className="mx-auto mb-2 text-green-600"
                    />
                    <p className="font-bold text-green-800">
                      Tagihan ini sudah LUNAS
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Terima kasih! Tidak perlu membayar lagi.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Info invoice (kalau bisa dimuat) */}
                    {invoice && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">
                          {invoice.invoiceNumber} · Periode {invoice.bulan}/
                          {invoice.tahun}
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {invoice.customer?.fullname ?? "Customer"}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            Total Tagihan
                          </span>
                          <span className="text-xl font-bold text-green-700">
                            {rupiah(Number(invoice.total) || 0)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Detail pembayaran hasil charge */}
                    {payment && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            Total Tagihan
                          </span>
                          <span className="text-xl font-bold text-green-700">
                            {rupiah(Number(payment.amount) || 0)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Metode</span>
                          <span className="font-medium">
                            {payment.method ?? "VIRTUAL_ACCOUNT"} ·{" "}
                            {payment.gateway ?? "MIDTRANS"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Status</span>
                          <PaymentStatusBadge status={payment.status} />
                        </div>

                        {/* Mode transaksi menurut BACKEND (redirect_url) */}
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Mode</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isSandbox
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                              }`}
                          >
                            {isSandbox ? "Sandbox (uji coba)" : "Production"}
                          </span>
                        </div>

                        {payment.orderId && (
                          <p className="mt-3 truncate text-xs text-slate-400">
                            Order ID: {payment.orderId}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <p>{error}</p>

                        {/* Detail teknis — disembunyikan di balik <details>
                            supaya tidak membingungkan customer, tapi tetap
                            bisa dibaca admin saat troubleshooting. */}
                        {errorHint && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs font-semibold text-red-800">
                              Detail teknis (untuk admin)
                            </summary>
                            <pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap wrap-break-word rounded-lg bg-red-100 p-2.5 font-sans text-xs leading-relaxed text-red-900">
                              {errorHint}
                            </pre>
                          </details>
                        )}

                        <button
                          onClick={handlePay}
                          disabled={loading}
                          className="mt-2 inline-flex items-center gap-1.5 font-semibold text-red-800 underline underline-offset-2"
                        >
                          <RefreshCw size={13} /> Coba Lagi
                        </button>
                      </div>
                    )}

                    {/* Pesan snap */}
                    {snapMsg && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                        {snapMsg}
                      </div>
                    )}

                    {/* Tombol bayar */}
                    <button
                      onClick={handlePay}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />{" "}
                          Menyiapkan pembayaran...
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} /> Bayar Sekarang
                        </>
                      )}
                    </button>

                    {charge?.redirect_url && (
                      <a
                        href={charge.redirect_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                      >
                        <ExternalLink size={16} /> Buka Halaman Midtrans
                      </a>
                    )}

                    <p className="text-center text-xs text-slate-400">
                      Metode: Virtual Account (BCA/BNI/BRI/Mandiri), QRIS,
                      Kartu Kredit &amp; lainnya.
                    </p>
                  </>
                )}
              </>
            )}

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
              <Lock size={12} />
              Transaksi diproses langsung oleh Midtrans. Data pembayaran Anda
              aman.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Punya pertanyaan?{" "}
          <Link to="/" className="font-medium text-green-700 hover:underline">
            Hubungi kami
          </Link>
        </p>
      </div>
    </div>
  );
}
