import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";
import { deletePengeluaran, getPengeluaran } from "~/api/pengeluaran";
import PengeluaranTable from "./PengeluaranTable";

const LIMIT = 10;

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

// ---------- Helper rentang tanggal ----------
const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

export default function PengeluaranDashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Ambil SEMUA pengeluaran (backend tanpa pagination) lalu filter client-side
  useEffect(() => {
    let active = true;
    setLoading(true);

    getPengeluaran()
      .then((res) => {
        if (!active) return;
        const raw = res?.data ?? [];
        setData(Array.isArray(raw) ? raw : []);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  // Filter client-side
  const filtered = useMemo(() => {
    let list = data;
    const q = debouncedSearch.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (p) =>
          String(p.deskripsi ?? "").toLowerCase().includes(q) ||
          String(p.kategori ?? "").toLowerCase().includes(q)
      );
    }

    if (kategori) {
      list = list.filter((p) => p.kategori === kategori);
    }

    const tgl = (p: any) => String(p.tanggal ?? "").slice(0, 10);
    if (tanggalAwal) list = list.filter((p) => tgl(p) >= tanggalAwal);
    if (tanggalAkhir) list = list.filter((p) => tgl(p) <= tanggalAkhir);

    return list;
  }, [data, debouncedSearch, kategori, tanggalAwal, tanggalAkhir]);

  // Daftar kategori unik untuk filter dropdown
  const kategoriOptions = useMemo(
    () => [...new Set(data.map((p) => p.kategori).filter(Boolean))] as string[],
    [data]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * LIMIT, safePage * LIMIT);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * LIMIT + 1;
  const to = Math.min(safePage * LIMIT, filtered.length);

  const totalPengeluaran = filtered.reduce(
    (sum, p) => sum + (Number(p.totalKeluar) || 0),
    0
  );

  const hasFilter = Boolean(
    debouncedSearch || kategori || tanggalAwal || tanggalAkhir
  );

  const clearFilters = () => {
    setSearch("");
    setKategori("");
    setTanggalAwal("");
    setTanggalAkhir("");
    setPage(1);
  };

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

  const invalidRange =
    Boolean(tanggalAwal && tanggalAkhir) && tanggalAwal > tanggalAkhir;

  const handleDelete = (item: any) => {
    if (
      !window.confirm(
        `Yakin menghapus pengeluaran "${item.deskripsi || item.kategori}" sebesar ${rupiah(
          Number(item.totalKeluar) || 0
        )}? Buku Kas akan disesuaikan otomatis.`
      )
    )
      return;

    deletePengeluaran(item.id)
      .then(() => setReloadKey((k) => k + 1))
      .catch((err) =>
        alert(err instanceof Error ? err.message : "Gagal menghapus.")
      );
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200";
  const labelCls = "mb-1 block text-xs font-medium text-slate-500";

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengeluaran</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola pengeluaran operasional — otomatis tercatat di Buku Kas.
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
            to="/admin/pengeluaran/create"
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Plus size={16} /> Tambah Pengeluaran
          </Link>
        </div>
      </div>

      {/* ===== Ringkasan ===== */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <span className="rounded-lg bg-red-600 p-2.5">
              <TrendingDown className="text-white" size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-500">
                Total pengeluaran (hasil filter)
              </p>
              <p className="text-xl font-bold text-red-700">
                {rupiah(totalPengeluaran)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="rounded-lg bg-slate-100 p-2.5">
              <Wallet className="text-slate-600" size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Jumlah transaksi</p>
              <p className="text-xl font-bold">
                {filtered.length.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Filter ===== */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
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
                placeholder="Deskripsi / kategori..."
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

          {/* Kategori */}
          <div>
            <label className={labelCls}>Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className={inputCls}
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Rentang tanggal (preset) */}
          <div>
            <label className={labelCls}>Rentang Tanggal</label>
            <div className="flex flex-wrap gap-1">
              {PRESETS.map((p) => {
                const active = isPresetActive(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => applyPreset(p.key)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${active
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-red-50 hover:text-red-600 hover:ring-red-300"
                      }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Input tanggal manual (baris kedua) */}
        <div className="mt-3 grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr] sm:max-w-xl">
          <div className="relative">
            <CalendarDays
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-500"
            />
            <input
              type="date"
              value={tanggalAwal}
              onChange={(e) => setTanggalAwal(e.target.value)}
              className={`${inputCls} pl-9 [scheme:light]`}
            />
          </div>

          <div className="hidden items-center justify-center sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
              <ArrowRight size={14} />
            </span>
          </div>
          <p className="text-center text-xs font-medium text-slate-400 sm:hidden">
            sampai
          </p>

          <div className="relative">
            <CalendarDays
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-500"
            />
            <input
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              className={`${inputCls} pl-9 [scheme:light]`}
            />
          </div>
        </div>

        {invalidRange && (
          <p className="mt-2 text-xs font-medium text-red-600">
            ⚠️ Tanggal awal lebih besar dari tanggal akhir
          </p>
        )}

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

      {/* ===== Tabel / Kartu ===== */}
      <PengeluaranTable
        loading={loading}
        data={pageItems}
        startIndex={(safePage - 1) * LIMIT}
        onEdit={(item) => navigate(`/admin/pengeluaran/create/${item.id}`)}
        onDelete={handleDelete}
      />

      {/* ===== Pagination ===== */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Menampilkan {from}–{to} dari {filtered.length} pengeluaran
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
    </div>
  );
}
