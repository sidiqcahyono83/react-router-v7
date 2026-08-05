import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { generateInvoice } from "~/api/invoice";


const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

const BULAN_NAMES = [
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

interface GenerateResult {
  jumlah: number;
  totalNilai: number;
}

export default function CreateInvoice() {
  const navigate = useNavigate();

  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [dueDate, setDueDate] = useState(() => {
    // Default jatuh tempo: 7 hari dari sekarang
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!bulan || !tahun || !dueDate) {
      setError("Bulan, tahun, dan tanggal jatuh tempo wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Param yang dikirim ke backend:
      // { bulan: 8, tahun: 2026, dueDate: Date }
      const res = await generateInvoice({
        bulan,
        tahun,
        // Pakai T00:00:00 agar tanggal tidak bergeser oleh timezone
        dueDate: new Date(`${dueDate}T00:00:00`),
      });

      // Response: { success, data: [invoice, ...], pagination }
      // sebelum (error 7006)


      // sesudah (aman)
      interface GeneratedInvoice {
        total?: number | null;
      }

      const raw = Array.isArray(res?.data) ? res.data : [];
      const list = raw as GeneratedInvoice[]; // diketik eksplisit

      list.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0)
      // Jumlahkan nilai (field total) dari semua invoice yang berhasil dibuat
      setResult({
        jumlah: list.length,
        totalNilai: list.reduce(
          (sum, inv) => sum + (Number(inv.total) || 0),
          0
        ),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal generate invoice."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/invoice"
          className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
          title="Kembali ke Dashboard Invoice"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Generate Invoice</h1>
          <p className="mt-1 text-sm text-slate-500">
            Buat invoice otomatis untuk semua customer aktif pada periode
            tertentu.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Bulan */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Bulan
            </label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
            >
              {BULAN_NAMES.map((nama, i) => (
                <option key={i + 1} value={i + 1}>
                  {nama} ({i + 1})
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tahun
            </label>
            <input
              type="number"
              min={2020}
              max={2100}
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>

          {/* Due date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Jatuh Tempo (dueDate)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>
        </div>

        {/* Pratinjau param yang akan dikirim */}
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <CalendarDays size={14} /> Param yang akan dikirim
          </p>
          <pre className="overflow-x-auto text-sm text-slate-700">
            {JSON.stringify(
              {
                bulan,
                tahun,
                dueDate: dueDate ? `${dueDate}T00:00:00` : null,
              },
              null,
              2
            )}
          </pre>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Mengenerate...
            </>
          ) : (
            "Generate Invoice"
          )}
        </button>
      </form>

      {/* Hasil */}
      {result && (
        <div className="space-y-4 rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-green-600 p-2">
              <CheckCircle2 className="text-white" size={22} />
            </span>
            <div>
              <h2 className="font-bold text-green-800">
                Berhasil membuat {result.jumlah} invoice
              </h2>
              <p className="text-sm text-green-700">
                Periode {BULAN_NAMES[bulan - 1]} {tahun}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Jumlah Invoice</p>
              <p className="mt-1 text-2xl font-bold">
                {result.jumlah.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <Wallet size={14} className="text-green-600" />
                Total Nilai Invoice
              </p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                {rupiah(result.totalNilai)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setResult(null)}
              className="flex items-center gap-2 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
            >
              <RefreshCw size={16} /> Generate Lagi
            </button>

            <button
              onClick={() => navigate("/invoice")}
              className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Lihat Daftar Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
