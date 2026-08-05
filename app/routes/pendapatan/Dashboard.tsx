import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { getPendapatan } from "~/api/pendapatan";
import PendapatanTable from "./PendapatanTable";

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

const METODE_OPTIONS = [
  "CASH",
  "BANK_TRANSFER",
  "QRIS",
  "VA_BCA",
  "VIRTUAL_ACCOUNT",
  "MIDTRANS",
];

// ---------- Helper rentang tanggal ----------
const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fmtTanggal = (v: string) => {
  if (!v) return "…";
  const d = new Date(`${v}T00:00:00`);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const PRESETS: { key: string; label: string }[] = [
  { key: "today", label: "Hari Ini" },
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
  { key: "month", label: "Bulan Ini" },
  { key: "year", label: "Tahun Ini" },
];

const presetRange = (key: string): [string, string] | null => {
  const today = new Date();
  let start: Date;

  switch (key) {
    case "today":
      start = today;
      break;
    case "7d":
      start = new Date(today);
      start.setDate(start.getDate() - 6);
      break;
    case "30d":
      start = new Date(today);
      start.setDate(start.getDate() - 29);
      break;
    case "month":
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case "year":
      start = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      return null;
  }

  return [toYMD(start), toYMD(today)];
};

export default function PendapatanDashboard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");
  const [metode, setMetode] = useState("");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // Debounce pencarian
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Ganti filter → kembali ke halaman 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, bulan, tahun, metode, tanggalAwal, tanggalAkhir]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getPendapatan({
      page,
      limit: LIMIT,
      search: debouncedSearch,
      bulan: bulan || undefined,
      tahun: tahun || undefined,
      metode: metode || undefined,
      tanggalAwal: tanggalAwal || undefined,
      tanggalAkhir: tanggalAkhir || undefined,
    })
      .then((res) => {
        if (!active) return;

        // Tahan 2 bentuk response: array mentah atau { data, pagination }
        const arr = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        setData(arr);
        setTotal(
          Array.isArray(res)
            ? arr.length
            : Number(res?.pagination?.total ?? arr.length)
        );
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
  }, [page, debouncedSearch, bulan, tahun, metode, tanggalAwal, tanggalAkhir, reloadKey]);

  const hasFilter = Boolean(
    debouncedSearch || bulan || tahun || metode || tanggalAwal || tanggalAkhir
  );

  // Aksi preset rentang tanggal
  const applyPreset = (key: string) => {
    const r = presetRange(key);
    if (!r) return;
    setTanggalAwal(r[0]);
    setTanggalAkhir(r[1]);
    setPage(1);
  };

  const isPresetActive = (key: string) => {
    const r = presetRange(key);
    return !!r && r[0] === tanggalAwal && r[1] === tanggalAkhir;
  };

  const resetRange = () => {
    setTanggalAwal("");
    setTanggalAkhir("");
    setPage(1);
  };

  const invalidRange =
    Boolean(tanggalAwal && tanggalAkhir) && tanggalAwal > tanggalAkhir;

  const hasRange = Boolean(tanggalAwal || tanggalAkhir);

  const clearFilters = () => {
    setSearch("");
    setBulan("");
    setTahun("");
    setMetode("");
    setTanggalAwal("");
    setTanggalAkhir("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  // Total nilai pendapatan pada halaman ini (client-side)
  const pageTotal = data.reduce(
    (sum, p) => sum + (Number(p.total) || 0),
    0
  );

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";
  const labelCls = "mb-1 block text-xs font-medium text-slate-500";

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pendapatan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola pemasukan — dari pembayaran invoice maupun pemasangan baru.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <Link
            to="/admin/pendapatan/create"
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            <Plus size={16} /> Tambah Pendapatan
          </Link>
        </div>
      </div>

      {/* ===== Ringkasan ===== */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
            <span className="rounded-lg bg-green-600 p-2.5">
              <TrendingUp className="text-white" size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-500">
                Total pendapatan halaman ini ({data.length} data)
              </p>
              <p className="text-xl font-bold text-green-700">
                {rupiah(pageTotal)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="rounded-lg bg-slate-100 p-2.5">
              <Wallet className="text-slate-600" size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Jumlah transaksi</p>
              <p className="text-xl font-bold">{total.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Filter (responsif) ===== */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search — selebar 2 kolom */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className={labelCls}>Cari</label>
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Deskripsi / nama customer..."
                className={`${inputCls} pl-9 pr-8`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Bulan */}
          <div>
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

          {/* Tahun */}
          <div>
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

          {/* Metode */}
          <div>
            <label className={labelCls}>Metode</label>
            <select
              value={metode}
              onChange={(e) => setMetode(e.target.value)}
              className={inputCls}
            >
              <option value="">Semua</option>
              {METODE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Rentang tanggal — selebar penuh di baris kedua */}
          <div className="sm:col-span-2 lg:col-span-5">
            <div
              className={`rounded-xl border p-4 transition ${hasRange
                ? "border-green-300 bg-gradient-to-br from-green-50 via-white to-emerald-50"
                : "border-slate-200 bg-slate-50/60"
                }`}
            >
              {/* Label + preset cepat */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <CalendarDays
                    size={13}
                    className={hasRange ? "text-green-600" : "text-slate-400"}
                  />
                  Rentang Tanggal
                </label>

                <div className="flex flex-wrap items-center gap-1">
                  {PRESETS.map((p) => {
                    const active = isPresetActive(p.key);

                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => applyPreset(p.key)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${active
                          ? "bg-green-600 text-white shadow-sm"
                          : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-green-50 hover:text-green-700 hover:ring-green-300"
                          }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}

                  {hasRange && (
                    <button
                      type="button"
                      onClick={resetRange}
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium text-red-500 ring-1 ring-red-200 transition hover:bg-red-50"
                    >
                      ✕ Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Input tanggal awal – akhir */}
              <div className="mt-3 grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
                <div className="relative">
                  <CalendarDays
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                  />
                  <input
                    type="date"
                    value={tanggalAwal}
                    onChange={(e) => setTanggalAwal(e.target.value)}
                    className={`${inputCls} pl-9 [color-scheme:light]`}
                  />
                </div>

                {/* Penghubung */}
                <div className="hidden items-center justify-center sm:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <ArrowRight size={14} />
                  </span>
                </div>
                <p className="text-center text-xs font-medium text-slate-400 sm:hidden">
                  sampai
                </p>

                <div className="relative">
                  <CalendarDays
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                  />
                  <input
                    type="date"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                    className={`${inputCls} pl-9 [color-scheme:light]`}
                  />
                </div>
              </div>

              {/* Info rentang / validasi */}
              {hasRange && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {invalidRange ? (
                    <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
                      ⚠️ Tanggal awal lebih besar dari tanggal akhir
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <CalendarDays size={12} />
                      {fmtTanggal(tanggalAwal)} — {fmtTanggal(tanggalAkhir)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {hasFilter && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400">Filter aktif</p>
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Hapus Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* ===== Tabel / Kartu (responsif) ===== */}
      <PendapatanTable
        loading={loading}
        data={data}
        startIndex={(page - 1) * LIMIT}
        hasFilter={hasFilter}
        onClearFilter={clearFilters}
      />

      {/* ===== Pagination ===== */}
      {!loading && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {total === 0
              ? "Tidak ada data"
              : `Menampilkan ${from}–${to} dari ${total} pendapatan`}
          </p>

          <div className="flex items-center justify-center gap-2 sm:justify-end">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>

            <span className="rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
