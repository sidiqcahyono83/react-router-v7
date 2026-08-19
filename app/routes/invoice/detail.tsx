import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Ban,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  Pencil,
  Phone,
  RefreshCw,
  Send,
  Wallet,
  X,
} from "lucide-react";
import { cancelInvoice, expireInvoice, getInvoiceId } from "~/api/invoice";
import { formatTanggal, formatTanggalIndonesia } from "~/types/toIdr";
import {
  buildWhatsAppUrl,
  formatPhoneDisplay,
  normalizePhoneId,
} from "~/lib/whatsapp";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** "8/2026" -> "Agustus 2026" */
const labelPeriode = (bulan?: number | string, tahun?: number | string) => {
  const b = Number(bulan);
  const nama = b >= 1 && b <= 12 ? NAMA_BULAN[b - 1] : bulan;

  return `${nama ?? "-"} ${tahun ?? ""}`.trim();
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  SUCCESS: "Berhasil",
  PENDING: "Pending",
  WAITING_VERIFICATION: "Menunggu Verifikasi",
  REJECTED: "Ditolak",
};

function PaymentStatusText({ status }: { status?: string }) {
  const s = String(status ?? "").toUpperCase();
  const color =
    s === "SUCCESS"
      ? "text-green-600"
      : s === "REJECTED"
        ? "text-red-600"
        : s === "WAITING_VERIFICATION"
          ? "text-blue-600"
          : "text-amber-600";

  return <span className={`font-medium ${color}`}>{PAYMENT_STATUS_LABEL[s] ?? status ?? "-"}</span>;
}

export default function InvoiceDetail() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"" | "cancel" | "expire">("");

  // State modal "Kirim Tagihan"
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (import.meta.env.VITE_APP_URL ?? "");

  const paymentLink = invoice ? `${origin}/bayar/${invoice.id}` : "";

  // Nomor WhatsApp customer (dinormalisasi ke format 62xxx)
  const customerPhoneRaw = invoice?.customer?.phoneNumber ?? "";
  const customerPhone = normalizePhoneId(customerPhoneRaw);
  const hasPhone = customerPhone !== "";

  const copyToClipboard = (value: string, onDone: (v: boolean) => void) => {
    if (!value) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        onDone(true);
        setTimeout(() => onDone(false), 2000);
      })
      .catch(() => setError("Gagal menyalin ke clipboard."));
  };

  const copyLink = () => copyToClipboard(paymentLink, setCopied);

  /**
   * Pesan tagihan. Ditulis dengan newline biasa ("\n") —
   * encoding URL-nya ditangani oleh buildWhatsAppUrl().
   * *teks* = bold di WhatsApp.
   */
  const waText = invoice
    ? [
      `Halo *${invoice.customer?.fullname ?? "Pelanggan"}*,`,
      "",
      "Berikut rincian tagihan internet Anda:",
      "",
      `🧾 No. Invoice : ${invoice.invoiceNumber}`,
      `📅 Periode     : ${labelPeriode(invoice.bulan, invoice.tahun)}`,
      invoice.customer?.paket?.nama || invoice.customer?.paket?.name
        ? `📶 Paket       : ${invoice.customer.paket.nama ?? invoice.customer.paket.name}`
        : null,
      `💰 Total       : ${rupiah(Number(invoice.total) || 0)}`,
      invoice.dueDate
        ? `⏰ Jatuh Tempo : ${formatTanggalIndonesia(invoice.dueDate)}`
        : null,
      "",
      "Silakan lakukan pembayaran melalui link berikut:",
      paymentLink,
      "",
      "Pembayaran dapat dilakukan via Virtual Account, QRIS, e-wallet, dan metode lainnya.",
      "Abaikan pesan ini jika Anda sudah membayar. Terima kasih 🙏",
    ]
      .filter((baris) => baris !== null)
      .join("\n")
    : "";

  const waUrl = buildWhatsAppUrl(waText, customerPhoneRaw);

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError("");

    getInvoiceId(id)
      .then((res) => setInvoice(res?.data ?? res ?? null))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat invoice.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    if (!invoice) return;
    if (!window.confirm(`Yakin membatalkan invoice ${invoice.invoiceNumber}?`))
      return;

    setBusy("cancel");
    setError("");
    try {
      await cancelInvoice(invoice.id);
      load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal membatalkan invoice."
      );
    } finally {
      setBusy("");
    }
  };

  const handleExpire = async () => {
    if (!invoice) return;
    if (
      !window.confirm(
        `Tandai invoice ${invoice.invoiceNumber} sebagai EXPIRED (jatuh tempo)?`
      )
    )
      return;

    setBusy("expire");
    setError("");
    try {
      await expireInvoice(invoice.id);
      load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengubah invoice menjadi EXPIRED."
      );
    } finally {
      setBusy("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">Invoice Tidak Ditemukan</h3>
        <p className="mt-2 text-slate-500">
          {error || "Data invoice tidak tersedia atau sudah dihapus."}
        </p>
        <Link
          to="/admin/invoice"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Invoice
        </Link>
      </div>
    );
  }

  const status = String(invoice.status ?? "").toUpperCase();
  const canCancel = ["UNPAID", "PENDING", "PARTIAL", "EXPIRED"].includes(status);
  const canExpire = ["UNPAID", "PENDING", "PARTIAL"].includes(status);
  const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
  const customer = invoice.customer ?? {};
  const paket = customer.paket ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/invoice"
            className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
            title="Kembali ke Dashboard Invoice"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Dibuat {formatTanggal(invoice.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <Link
            to={`/admin/invoice/${invoice.id}/edit`}
            className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
          >
            <Pencil size={16} /> Edit
          </Link>

          {status === "UNPAID" && (
            <Link
              to={`/admin/payment/create/${invoice.id}`}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              <Wallet size={16} /> Buat Pembayaran
            </Link>
          )}

          {status !== "PAID" && status !== "CANCELLED" && (
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              <Send size={16} /> Kirim Tagihan
            </button>
          )}

          {canExpire && (
            <button
              onClick={handleExpire}
              disabled={busy !== ""}
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "expire" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Clock3 size={16} />
              )}
              Tandai Expired
            </button>
          )}

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={busy !== ""}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "cancel" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Ban size={16} />
              )}
              Batalkan
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Kolom kiri: info invoice + rincian tagihan */}
        <div className="space-y-4 lg:col-span-2">
          {/* Informasi Invoice */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Informasi Invoice</h2>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-slate-500">Nomor Invoice</p>
                <p className="mt-0.5 font-semibold">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-slate-500">Periode</p>
                <p className="mt-0.5 font-semibold">
                  {labelPeriode(invoice.bulan, invoice.tahun)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Jatuh Tempo</p>
                <p className="mt-0.5 font-semibold">
                  {formatTanggal(invoice.dueDate)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <p className="mt-0.5">
                  <InvoiceStatusBadge status={invoice.status} />
                </p>
              </div>
              <div>
                <p className="text-slate-500">Dibayar Pada</p>
                <p className="mt-0.5 font-semibold">
                  {invoice.paidAt ? formatTanggal(invoice.paidAt) : "-"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Customer ID</p>
                <p className="mt-0.5 font-semibold">{invoice.customerId}</p>
              </div>
            </div>
          </div>

          {/* Rincian Tagihan */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Rincian Tagihan</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{rupiah(Number(invoice.subtotal) || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Diskon</span>
                <span className="font-medium text-red-600">
                  -{rupiah(Number(invoice.diskon) || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pajak</span>
                <span className="font-medium">{rupiah(Number(invoice.pajak) || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-green-700">
                  {rupiah(Number(invoice.total) || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom kanan: customer + pembayaran */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Customer</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Nama</p>
                <p className="mt-0.5 font-semibold">{customer.fullname ?? "-"}</p>
              </div>
              <div>
                <p className="text-slate-500">Username</p>
                <p className="mt-0.5 font-medium">{customer.username ?? "-"}</p>
              </div>
              <div>
                <p className="text-slate-500">No. HP</p>
                {hasPhone ? (
                  <a
                    href={buildWhatsAppUrl(waText, customerPhoneRaw)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-green-700 hover:underline"
                  >
                    <MessageCircle size={14} />
                    {formatPhoneDisplay(customerPhoneRaw)}
                  </a>
                ) : (
                  <p className="mt-0.5 font-medium">
                    {customer.phoneNumber || "-"}
                  </p>
                )}
              </div>
              <div>
                <p className="text-slate-500">Status Customer</p>
                <p className="mt-0.5 font-medium">{customer.status ?? "-"}</p>
              </div>
              {paket && (
                <div>
                  <p className="text-slate-500">Paket</p>
                  <p className="mt-0.5 font-medium">
                    {paket.nama ?? paket.name ?? "-"}
                    {paket.harga ? ` · ${rupiah(Number(paket.harga))}` : ""}
                  </p>
                </div>
              )}
              {customer.area && (
                <div>
                  <p className="text-slate-500">Area</p>
                  <p className="mt-0.5 font-medium">
                    {customer.area.nama ?? customer.area.name ?? "-"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Riwayat Pembayaran */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Pembayaran ({payments.length})
            </h2>

            {payments.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada pembayaran untuk invoice ini.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {payments.map((p: any) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-semibold">{p.method ?? "-"}</p>
                      <p className="text-xs text-slate-400">
                        {p.gateway} · {formatTanggal(p.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{rupiah(Number(p.amount) || 0)}</p>
                      <PaymentStatusText status={p.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Kirim Tagihan */}
      {showShare && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowShare(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Kirim Tagihan</h2>
              <button
                onClick={() => setShowShare(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Kirim tagihan langsung ke WhatsApp customer. Customer bisa
              membayar sendiri melalui Midtrans (Virtual Account, QRIS, dll).
            </p>

            {/* Nomor tujuan */}
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <Phone size={16} className="mt-0.5 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Nomor Tujuan</p>
                {hasPhone ? (
                  <p className="mt-0.5 text-sm font-semibold text-slate-700">
                    {formatPhoneDisplay(customerPhoneRaw)}
                    <span className="ml-2 font-normal text-slate-400">
                      ({customer.fullname ?? "-"})
                    </span>
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm font-medium text-amber-600">
                    Customer belum punya nomor HP yang valid — WhatsApp akan
                    terbuka tanpa tujuan, pilih kontak secara manual.
                  </p>
                )}
              </div>
            </div>

            {/* Preview pesan */}
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Preview Pesan</p>
              <pre className="mt-1 max-h-52 overflow-y-auto whitespace-pre-wrap wrap-break-word font-sans text-xs leading-relaxed text-slate-600">
                {waText}
              </pre>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowShare(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                <MessageCircle size={16} />
                {hasPhone
                  ? `Kirim ke ${formatPhoneDisplay(customerPhoneRaw)}`
                  : "Kirim via WhatsApp"}
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  {copied ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                  {copied ? "Tersalin!" : "Salin Link"}
                </button>

                <button
                  onClick={() => copyToClipboard(waText, setCopiedText)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  {copiedText ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                  {copiedText ? "Tersalin!" : "Salin Pesan"}
                </button>
              </div>

              <a
                href={paymentLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
              >
                <ExternalLink size={16} /> Buka Link Pembayaran
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
