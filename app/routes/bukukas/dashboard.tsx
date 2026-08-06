import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  PiggyBank,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getBukuKas, getBukuKasSummary } from "~/api/bukuKas";
import BukuKasList from "./BukuKasList";

const LIMIT = 10;

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

export default function BukuKasDashboard() {
  const now = new Date();

  const [bulan, setBulan] = useState(String(now.getMonth() + 1));
  const [tahun, setTahun] = useState(String(now.getFullYear()));

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // Summary (seluruh periode, dari endpoint /summary/total)
  const [summary, setSummary] = useState({
    totalMasuk: 0,
    totalKeluar: 0,
    saldoAkhir: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadSummary = () => {
    setSummaryLoading(true);

    getBukuKasSummary()
      .then(setSummary)
      .catch((err) => {
        console.error(err);
        setSummary({ totalMasuk: 0, totalKeluar: 0, saldoAkhir: 0 });
      })
      .finally(() => setSummaryLoading(false));
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  // Ganti filter → kembali ke halaman 1
  useEffect(() => {
    setPage(1);
  }, [bulan, tahun]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getBukuKas({
      page,
      limit: LIMIT,
      bulan: bulan || undefined,
      tahun: tahun || undefined,
    })
      .then((res) => {
        if (!active) return;
        const raw = res?.data ?? [];
        setData(Array.isArray(raw) ? raw : []);
        setTotal(Number(res?.total ?? 0));
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setData([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, bulan, tahun, reloadKey]);

  const hasFilter = Boolean(bulan || tahun);

  const clearFilters = () => {
    setBulan("");
    setTahun("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * LIMIT + 1;
  const to = Math.min(safePage * LIMIT, total);

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";
  const labelCls = "mb-1 block text-xs font-medium text-slate-500";

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buku Kas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Rekapitulasi mutasi kas harian — pemasukan &amp; pengeluaran.
          </p>
        </div>

        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* ===== Kartu ringkasan ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Saldo akhir */}
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-linear-to-br from-green-600 to-emerald-600 p-5 text-white shadow-sm">
          <span className="rounded-lg bg-white/20 p-2.5">
            <PiggyBank size={22} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-green-100">Saldo Akhir</p>
            {summaryLoading ? (
              <div className="mt-1 h-7 w-28 animate-pulse rounded bg-white/30" />
            ) : (
              <p className="truncate text-xl font-bold">
                {rupiah(summary.saldoAkhir)}
              </p>
            )}
          </div>
        </div>

        {/* Total masuk */}
        <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-5 shadow-sm">
          <span className="rounded-lg bg-green-600 p-2.5">
            <TrendingUp className="text-white" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Total Pemasukan</p>
            <p className="text-xl font-bold text-green-700">
              {rupiah(summary.totalMasuk)}
            </p>
          </div>
        </div>

        {/* Total keluar */}
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-5 shadow-sm">
          <span className="rounded-lg bg-red-600 p-2.5">
            <TrendingDown className="text-white" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Total Pengeluaran</p>
            <p className="text-xl font-bold text-red-700">
              -{rupiah(summary.totalKeluar)}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Filter bulan/tahun ===== */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-48">
            <label className={labelCls}>Bulan</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className={inputCls}
            >
              <option value="">Semua Bulan</option>
              {BULAN_NAMES.map((nama, i) => (
                <option key={i + 1} value={i + 1}>
                  {nama}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-36">
            <label className={labelCls}>Tahun</label>
            <input
              type="number"
              min={2020}
              max={2100}
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              placeholder="cth: 2026"
              className={inputCls}
            />
          </div>

          <button
            onClick={() => {
              setBulan(String(now.getMonth() + 1));
              setTahun(String(now.getFullYear()));
              setPage(1);
            }}
            className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Bulan Ini
          </button>

          {hasFilter && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Hapus Filter
            </button>
          )}
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <Wallet size={13} />
          Menampilkan mutasi kas{" "}
          {bulan && tahun
            ? `${BULAN_NAMES[Number(bulan) - 1]} ${tahun}`
            : "semua periode"}
        </p>
      </div>

      {/* ===== Daftar mutasi harian ===== */}
      <BukuKasList loading={loading} data={data} />

      {/* ===== Pagination ===== */}
      {!loading && total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Menampilkan {from}–{to} dari {total} hari
          </p>

          <div className="flex items-center justify-center gap-2 sm:justify-end">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>

            <span className="rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700">
              {safePage} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Legenda kecil */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Plus size={12} />
          </span>
          Pemasukan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Minus size={12} />
          </span>
          Pengeluaran
        </span>
      </div>
    </div>

  );
}
