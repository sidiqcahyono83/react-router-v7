import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
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
import { getPendapatan, type PendapatanItem } from "~/api/pendapatan";
import { formatTanggal } from "~/types/toIdr";

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

function SumberBadge({ manual }: { manual: boolean }) {
  return manual ? (
    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      Pemasangan Baru
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
      Dari Pembayaran
    </span>
  );
}

export default function PendapatanDashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");
  const [metode, setMetode] = useState("");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PendapatanItem[]>([]);
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
        const raw = res?.data ?? [];
        setData(Array.isArray(raw) ? raw : []);
        setTotal(Number(res?.pagination?.total ?? 0));
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
  const pageTotal = data.reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  const inputCls =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";
  const labelCls = "mb-1 block text-xs font-medium text-slate-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pendapatan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola pemasukan — dari pembayaran invoice maupun pemasangan baru.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <Link
            to="/admin/pendapatan/create"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            <Plus size={16} /> Tambah Pendapatan
          </Link>
        </div>
      </div>

      {/* Ringkasan */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
            <span className="rounded-lg bg-green-600 p-2.5">
              <TrendingUp className="text-white" size={20} />
            </span>
            <div>
              <p className="text-sm text-slate-500">
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
            <div>
              <p className="text-sm text-slate-500">Jumlah transaksi</p>
              <p className="text-xl font-bold">{total.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {/* Search */}
          <div className="relative lg:col-span-2">
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
                className={`${inputCls} w-full pl-9 pr-8`}
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
              className={`${inputCls} w-full`}
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
              className={`${inputCls} w-full`}
            />
          </div>

          {/* Metode */}
          <div>
            <label className={labelCls}>Metode</label>
            <select
              value={metode}
              onChange={(e) => setMetode(e.target.value)}
              className={`${inputCls} w-full`}
            >
              <option value="">Semua</option>
              {METODE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Rentang tanggal */}
          <div>
            <label className={labelCls}>
              <CalendarDays size={11} className="mr-1 inline" />
              Rentang Tanggal
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={tanggalAwal}
                onChange={(e) => setTanggalAwal(e.target.value)}
                className={`${inputCls} w-full`}
              />
              <span className="text-slate-400">–</span>
              <input
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className={`${inputCls} w-full`}
              />
            </div>
          </div>
        </div>

        {hasFilter && (
          <div className="mt-3 flex items-center justify-between">
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

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="animate-pulse space-y-4 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-200" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="p-10 text-center">
              <TrendingUp className="mx-auto mb-4 text-slate-300" size={48} />
              <h3 className="text-lg font-semibold">Data Pendapatan Kosong</h3>
              <p className="mt-2 text-slate-500">
                {hasFilter
                  ? "Tidak ada data yang cocok dengan filter."
                  : "Belum ada pendapatan yang dicatat."}
              </p>
              {hasFilter && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Hapus Filter
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="border-b bg-green-200">
                <tr className="text-left text-sm font-semibold text-slate-600">
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Deskripsi</th>
                  <th className="px-5 py-4">Sumber</th>
                  <th className="px-5 py-4">Invoice / Customer</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Dicatat Oleh</th>
                  <th className="px-5 py-4">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p, index) => {
                  const manual = !p.paymentId;

                  return (
                    <tr
                      key={p.id}
                      className="border-b transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium">
                        {(page - 1) * LIMIT + index + 1}
                      </td>

                      <td className="max-w-xs px-5 py-4">
                        <p className="truncate font-semibold">
                          {p.deskripsi || "-"}
                        </p>
                        {p.payment?.invoice?.invoiceNumber && (
                          <p className="text-xs text-slate-400">
                            {p.payment.invoice.invoiceNumber}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <SumberBadge manual={manual} />
                        {!manual && p.payment?.method && (
                          <p className="mt-1 text-xs text-slate-400">
                            {p.payment.method}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {p.payment?.customer?.fullname ?? "-"}
                        </p>
                        {p.payment?.customer?.username && (
                          <p className="text-sm text-slate-500">
                            {p.payment.customer.username}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 font-bold text-green-700">
                        {rupiah(Number(p.total) || 0)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {p.user?.fullname ?? p.user?.username ?? "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatTanggal(p.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {total === 0
              ? "Tidak ada data"
              : `Menampilkan ${from}–${to} dari ${total} pendapatan`}
          </p>

          <div className="flex items-center gap-2">
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
