import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { getPayments } from "~/api/payment";
import PaymentTable from "./PaymentTable";

const LIMIT = 10; // baris per halaman di tabel
// Backend GET /payment belum mendukung query ?status=, jadi saat filter
// status aktif kita ambil lebih banyak data lalu filter di sisi client.
const FETCH_LIMIT = 200;

const STATUS_CHIPS: { label: string; query: string }[] = [
  { label: "Semua", query: "" },
  { label: "Menunggu Verifikasi", query: "WAITING_VERIFICATION" },
  { label: "Berhasil", query: "SUCCESS" },
  { label: "Pending", query: "PENDING" },
  { label: "Ditolak", query: "REJECTED" },
];

export default function PaymentDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusRaw = (searchParams.get("status") ?? "").toUpperCase();
  const status = statusRaw === "ALL" ? "" : statusRaw;
  const statusActive = Boolean(status);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // Debounce pencarian (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Ganti filter / kata kunci -> kembali ke halaman 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getPayments({
      page: statusActive ? 1 : page,
      limit: statusActive ? FETCH_LIMIT : LIMIT,
      search: debouncedSearch,
    })
      .then((res) => {
        if (!active) return;

        const raw = res?.data ?? [];
        const list: any[] = Array.isArray(raw) ? raw : [];

        const filtered = statusActive
          ? list.filter(
            (p: any) => String(p.status ?? "").toUpperCase() === status
          )
          : list;

        setAll(filtered);
        setTotal(
          statusActive
            ? filtered.length
            : Number(res?.pagination?.total ?? filtered.length)
        );
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setAll([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, status, statusActive, reloadKey]);

  // Baris yang tampil (dipotong per halaman saat filter status aktif)
  const items = statusActive
    ? all.slice((page - 1) * LIMIT, page * LIMIT)
    : all;

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  const setStatus = (q: string) => {
    const next = new URLSearchParams(searchParams);
    if (q) next.set("status", q);
    else next.delete("status");
    setSearchParams(next);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pembayaran</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola pembayaran invoice (cash &amp; transfer).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button
            onClick={() => navigate("/payment/verify")}
            className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
          >
            <ShieldCheck size={16} /> Verifikasi
          </button>

          <button
            onClick={() => navigate("/admin/payment/create")}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            <Plus size={16} /> Buat Pembayaran
          </button>
        </div>
      </div>

      {/* Chip filter status */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_CHIPS.map((chip) => {
          const active =
            chip.query === "" ? status === "" : status === chip.query;

          return (
            <button
              key={chip.label}
              onClick={() => setStatus(chip.query)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${active
                ? "border-green-600 bg-green-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Pencarian */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama customer / nomor invoice..."
          className="w-full max-w-sm rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
        />
      </div>

      {/* Tabel */}
      <PaymentTable
        loading={loading}
        data={items}
        onVerify={() => navigate("/payment/verify")}
      />

      {/* Pagination */}
      {!loading && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {total === 0
              ? "Tidak ada data"
              : `Menampilkan ${from}–${to} dari ${total} pembayaran`}
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
