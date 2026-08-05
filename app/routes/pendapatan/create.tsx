import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Hammer,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";
import {
  createPendapatan,
  createPendapatanManual,
} from "~/api/pendapatan";
import { getAllPayments } from "~/api/payment";

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

type Tab = "manual" | "payment";

interface PaymentOption {
  id: string;
  amount?: number;
  method?: string;
  status?: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    total?: number;
  } | null;
  customer?: { fullname?: string; username?: string } | null;
}

export default function CreatePendapatan() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("manual");

  // Tab manual (pemasangan baru / income langsung)
  const [total, setTotal] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  // Tab dari pembayaran
  const [payments, setPayments] = useState<PaymentOption[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [deskripsiPayment, setDeskripsiPayment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ message: string } | null>(null);

  // Muat daftar payment SUCCESS (untuk tab "Dari Pembayaran")
  const loadPayments = () => {
    setLoadingPayments(true);

    getAllPayments({ pageSize: 500 })
      .then((list) => {
        const success = (list as any[]).filter(
          (p) => String(p.status ?? "").toUpperCase() === "SUCCESS"
        ) as PaymentOption[];

        setPayments(success);
        setPaymentId((prev) => prev || success[0]?.id || "");
      })
      .catch((err) => {
        console.error(err);
        setPayments([]);
      })
      .finally(() => setLoadingPayments(false));
  };

  useEffect(() => {
    if (tab === "payment") loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      if (tab === "manual") {
        const nominal = Number(total);

        if (!nominal || nominal <= 0) {
          throw new Error("Total nominal wajib diisi dan lebih dari 0.");
        }

        // POST /pendapatan/manual — pemasangan baru / income langsung
        const res = await createPendapatanManual({
          total: nominal,
          deskripsi: deskripsi.trim() || undefined,
        });

        setResult({
          message:
            res?.message ??
            `Pendapatan ${rupiah(nominal)} berhasil dicatat.`,
        });
      } else {
        if (!paymentId) {
          throw new Error("Pilih pembayaran terlebih dahulu.");
        }

        // POST /pendapatan — catat dari payment yang SUCCESS
        const res = await createPendapatan({
          paymentId,
          deskripsi: deskripsiPayment.trim() || undefined,
        });

        setResult({
          message: res?.message ?? "Pendapatan dari pembayaran berhasil dicatat.",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencatat pendapatan.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError("");
    setTotal("");
    setDeskripsi("");
    setDeskripsiPayment("");
    if (tab === "payment") loadPayments();
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";
  const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

  const selectedPayment = payments.find((p) => p.id === paymentId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/pendapatan"
          className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
          title="Kembali ke Pendapatan"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Tambah Pendapatan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Catat pemasukan — otomatis masuk Buku Kas.
          </p>
        </div>
      </div>

      {/* Tab */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${tab === "manual"
            ? "border-green-600 bg-green-50 ring-2 ring-green-200"
            : "border-slate-300 bg-white hover:border-green-300"
            }`}
        >
          <span className="rounded-lg bg-emerald-100 p-2.5">
            <Hammer className="text-emerald-600" size={20} />
          </span>
          <span>
            <span className="block font-semibold text-slate-800">
              Pemasangan Baru / Lainnya
            </span>
            <span className="block text-xs text-slate-500">
              Income langsung — mis. biaya pemasangan baru, jasa, dll.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("payment")}
          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${tab === "payment"
            ? "border-green-600 bg-green-50 ring-2 ring-green-200"
            : "border-slate-300 bg-white hover:border-green-300"
            }`}
        >
          <span className="rounded-lg bg-blue-100 p-2.5">
            <CreditCard className="text-blue-600" size={20} />
          </span>
          <span>
            <span className="block font-semibold text-slate-800">
              Dari Pembayaran
            </span>
            <span className="block text-xs text-slate-500">
              Catat pendapatan dari payment yang sudah SUCCESS.
            </span>
          </span>
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
      >
        {tab === "manual" ? (
          <>
            <div>
              <label className={labelCls}>
                Total Nominal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="cth: 350000"
                className={inputCls}
              />
              {total && Number(total) > 0 && (
                <p className="mt-1 text-sm font-semibold text-green-700">
                  = {rupiah(Number(total))}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>Deskripsi</label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={3}
                placeholder='cth: "Pemasangan Baru - Bpk Ahmad, Jl. Merdeka No. 12"'
                className={inputCls}
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
              <Wallet size={16} className="mt-0.5 shrink-0" />
              <p>
                Pendapatan ini akan tercatat di <b>Buku Kas</b> hari ini
                (totalMasuk & saldo bertambah) atas nama user yang login.
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Pilih Pembayaran SUCCESS <span className="text-red-500">*</span>
                </label>

                <button
                  type="button"
                  onClick={loadPayments}
                  disabled={loadingPayments}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-green-700 disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={loadingPayments ? "animate-spin" : ""}
                  />
                  Muat ulang
                </button>
              </div>

              {loadingPayments ? (
                <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-400">
                  <Loader2 size={15} className="animate-spin" /> Memuat
                  pembayaran...
                </div>
              ) : payments.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  Tidak ada pembayaran berstatus SUCCESS.{" "}
                  <Link
                    to="/admin/payment"
                    className="font-semibold underline"
                  >
                    Lihat pembayaran
                  </Link>
                </div>
              ) : (
                <select
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  className={inputCls}
                >
                  {payments.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.invoice?.invoiceNumber ?? "Payment"} —{" "}
                      {p.customer?.fullname ?? "-"} ·{" "}
                      {rupiah(Number(p.amount) || 0)} ({p.method})
                    </option>
                  ))}
                </select>
              )}

              {selectedPayment && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold">
                    {selectedPayment.invoice?.invoiceNumber ?? "-"}
                  </p>
                  <p className="text-slate-500">
                    {selectedPayment.customer?.fullname ?? "-"} ·{" "}
                    {selectedPayment.method ?? "-"}
                  </p>
                  <p className="mt-1 font-bold text-green-700">
                    {rupiah(Number(selectedPayment.amount) || 0)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Deskripsi (opsional)</label>
              <input
                value={deskripsiPayment}
                onChange={(e) => setDeskripsiPayment(e.target.value)}
                placeholder='cth: "Pendapatan dari Invoice #INV-001"'
                className={inputCls}
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
              <CreditCard size={16} className="mt-0.5 shrink-0" />
              <p>
                Hanya payment <b>SUCCESS</b> yang bisa dicatat, dan satu
                payment hanya bisa dicatat <b>satu kali</b> (1-to-1).
              </p>
            </div>
          </>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 size={16} /> {result.message}
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/pendapatan")}
              className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Lihat Pendapatan
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (tab === "payment" && payments.length === 0)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Menyimpan...
            </>
          ) : (
            "Simpan Pendapatan"
          )}
        </button>

        {result && (
          <button
            type="button"
            onClick={resetForm}
            className="w-full rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
          >
            Tambah Lagi
          </button>
        )}
      </form>
    </div>
  );
}
