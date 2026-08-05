import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { chargePaymentGateway } from "~/api/payment";
import { loadSnapScript, payWithSnap } from "~/lib/midtrans";
import PaymentStatusBadge from "./payment/PaymentStatusBadge";
const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [charge, setCharge] = useState<ChargeResult | null>(null);
  const [snapMsg, setSnapMsg] = useState("");

  const payment = charge?.payment ?? null;

  const handlePay = async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError("");
    setSnapMsg("");

    try {
      // 1. Minta Snap token ke backend: POST /payments/charge
      const res: ChargeResult = await chargePaymentGateway(invoiceId);
      setCharge(res);

      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY as
        | string
        | undefined;

      // 2. Buka popup Snap (kalau client key tersedia), kalau tidak → redirect
      if (clientKey && res.token) {
        try {
          await loadSnapScript(clientKey);

          payWithSnap(res.token, {
            onSuccess: () =>
              setSnapMsg(
                "Pembayaran berhasil! Terima kasih, tagihan Anda sudah lunas. ✅"
              ),
            onPending: () =>
              setSnapMsg(
                "Pembayaran sedang menunggu konfirmasi. Silakan selesaikan pembayaran Anda."
              ),
            onError: () =>
              setSnapMsg("Terjadi kesalahan saat memproses pembayaran."),
            onClose: () =>
              setSnapMsg(
                "Popup pembayaran ditutup. Anda bisa membayar lagi kapan saja."
              ),
          });
        } catch (err) {
          // Snap gagal dimuat → fallback buka halaman Midtrans di tab baru
          console.error(err);
          if (res.redirect_url) window.open(res.redirect_url, "_blank");
        }
      } else if (res.redirect_url) {
        window.open(res.redirect_url, "_blank");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memproses pembayaran. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Kartu tagihan */}
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

          {/* Body */}
          <div className="space-y-4 p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
                {invoiceId && (
                  <button
                    onClick={handlePay}
                    className="ml-2 inline-flex items-center gap-1 font-semibold underline underline-offset-2"
                  >
                    <RefreshCw size={13} /> Coba Lagi
                  </button>
                )}
              </div>
            )}

            {snapMsg && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                {snapMsg}
              </div>
            )}

            {/* Detail tagihan (setelah charge) */}
            {payment && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Total Tagihan</span>
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
                  <PaymentStatusBadge status={payment.status ?? ""} />
                </div>

                {payment.orderId && (
                  <p className="mt-3 truncate text-xs text-slate-400">
                    Order ID: {payment.orderId}
                  </p>
                )}
              </div>
            )}

            {/* Tombol bayar */}
            {!payment ? (
              <button
                onClick={handlePay}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Menyiapkan
                    pembayaran...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} /> Bayar Sekarang
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CreditCard size={18} />
                  )}
                  {loading ? "Menyiapkan..." : "Buka Pembayaran"}
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
              </>
            )}

            {/* Keamanan */}
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
              <Lock size={12} />
              Transaksi diproses langsung oleh Midtrans. Data pembayaran Anda
              aman.
            </p>
          </div>
        </div>

        {/* Kembali */}
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
