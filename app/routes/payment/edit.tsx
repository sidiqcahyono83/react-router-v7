import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { getPaymentId, updatePayment } from "~/api/payment";


const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

const STATUS_OPTIONS = [
  "PENDING",
  "WAITING_VERIFICATION",
  "SUCCESS",
  "REJECTED",
  "FAILED",
];

const METHOD_OPTIONS = [
  "CASH",
  "BANK_TRANSFER",
  "QRIS",
  "VA_BCA",
  "VIRTUAL_ACCOUNT",
  "MIDTRANS",
];

/** Ubah tanggal (ISO) jadi yyyy-mm-dd untuk input type=date */
function toDateInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function EditPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Form
  const [status, setStatus] = useState("PENDING");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [paidAt, setPaidAt] = useState("");
  const [transferAt, setTransferAt] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    getPaymentId(id)
      .then((p) => {
        setPayment(p ?? null);

        if (p) {
          setStatus(String(p.status ?? "PENDING").toUpperCase());
          setAmount(String(Number(p.amount) || ""));
          setMethod(String(p.method ?? "CASH").toUpperCase());
          setPaidAt(toDateInput(p.paidAt));
          setTransferAt(toDateInput(p.transferAt));
        }
      })
      .catch((err) =>
        setLoadError(
          err instanceof Error ? err.message : "Gagal memuat payment.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!payment) return;

    const nominal = Number(amount);

    if (!nominal || nominal <= 0) {
      setError("Jumlah pembayaran wajib diisi dan lebih dari 0.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await updatePayment(payment.id, {
        status,
        amount: nominal,
        method,
        paidAt: paidAt ? new Date(`${paidAt}T00:00:00`).toISOString() : null,
        transferAt: transferAt
          ? new Date(`${transferAt}T00:00:00`).toISOString()
          : null,
      });

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan payment.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";
  const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">Payment Tidak Ditemukan</h3>
        <p className="mt-2 text-slate-500">
          {loadError || "Data payment tidak tersedia."}
        </p>
        <Link
          to="/admin/payment"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
        >
          <ArrowLeft size={16} /> Kembali ke Pembayaran
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/payment"
          className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
          title="Kembali ke Pembayaran"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Edit Payment</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            {payment.invoice?.invoiceNumber ?? payment.id}
            <PaymentStatusBadge status={payment.status} />
          </p>
        </div>
      </div>

      {/* Info ringkas */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-slate-500">Customer</p>
            <p className="mt-0.5 font-semibold">
              {payment.customer?.fullname ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Invoice</p>
            <p className="mt-0.5 font-semibold">
              {payment.invoice?.invoiceNumber ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Gateway</p>
            <p className="mt-0.5 font-semibold">{payment.gateway ?? "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Jumlah</p>
            <p className="mt-0.5 font-bold text-green-700">
              {rupiah(Number(payment.amount) || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
      >
        {/* Status */}
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputCls}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <PaymentStatusBadge status={status} />
          </div>
        </div>

        {/* Jumlah & metode */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>
              Jumlah <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputCls}
            />
            {amount && Number(amount) > 0 && (
              <p className="mt-1 text-sm font-semibold text-green-700">
                = {rupiah(Number(amount))}
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>Metode</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={inputCls}
            >
              {METHOD_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tanggal */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Tanggal Dibayar (paidAt)</label>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className={`${inputCls} scheme-light`}
            />
          </div>

          <div>
            <label className={labelCls}>Tanggal Transfer (transferAt)</label>
            <input
              type="date"
              value={transferAt}
              onChange={(e) => setTransferAt(e.target.value)}
              className={`${inputCls} scheme-light`}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 size={16} /> Payment berhasil diperbarui.
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/payment")}
              className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Lihat Pembayaran
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Save size={18} /> Simpan Perubahan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
