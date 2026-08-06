import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import PaymentTable from "./PaymentTable";
import { getAllPayments, getPayments } from "~/api/payment";

const LIMIT = 10; // baris per halaman di tabel
// Backend GET /payment belum mendukung query ?status=, jadi saat filter
// status aktif kita ambil SEMUA data lalu filter di sisi client.

const STATUS_CHIPS: { label: string; query: string }[] = [
  { label: "Semua", query: "" },
  { label: "Menunggu Verifikasi", query: "WAITING_VERIFICATION" },
  { label: "Berhasil", query: "SUCCESS" },
  { label: "Pending", query: "PENDING" },
  { label: "Ditolak", query: "REJECTED" },
];

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

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

  // ---------- Statistik kartu (jumlah & nominal per status) ----------
  const [stats, setStats] = useState({
    all: 0,
    waiting: 0,
    success: 0,
    pending: 0,
    rejected: 0,
    allNominal: 0,
    waitingNominal: 0,
    successNominal: 0,
    pendingNominal: 0,
    rejectedNominal: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Hitung statistik dari SEMUA pembayaran
  useEffect(() => {
    let active = true;
    setStatsLoading(true);

    getAllPayments({ pageSize: 500 })
      .then((list) => {
        if (!active) return;

        const arr = Array.isArray(list) ? list : [];

        const pick = (s: string) =>
          arr.filter(
            (p: any) => String(p.status ?? "").toUpperCase() === s
          );
        const sum = (items: any[]) =>
          items.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        const waiting = pick("WAITING_VERIFICATION");
        const success = pick("SUCCESS");
        const pending = pick("PENDING");
        const rejected = pick("REJECTED");

        setStats({
          all: arr.length,
          waiting: waiting.length,
          success: success.length,
          pending: pending.length,
          rejected: rejected.length,
          allNominal: sum(arr),
          waitingNominal: sum(waiting),
          successNominal: sum(success),
          pendingNominal: sum(pending),
          rejectedNominal: sum(rejected),
        });
      })
      .catch((err) => {
        if (!active) return;
        console.error("[payment] gagal memuat statistik:", err);
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

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

    // Tanpa filter status  -> pagination normal dari server
    // Dengan filter status -> ambil semua lalu filter di client
    const fetchData = statusActive
      ? getAllPayments({ search: debouncedSearch }).then((list) => ({
        list,
        total: list.length,
      }))
      : getPayments({
        page,
        limit: LIMIT,
        search: debouncedSearch,
      }).then((res) => {
        const raw = res?.data ?? [];
        const list: any[] = Array.isArray(raw) ? raw : [];
        return {
          list,
          total: Number(res?.pagination?.total ?? list.length),
        };
      });

    fetchData
      .then(({ list, total }) => {
        if (!active) return;

        const filtered = statusActive
          ? list.filter(
            (p: any) => String(p.status ?? "").toUpperCase() === status
          )
          : list;

        setAll(filtered);
        setTotal(statusActive ? filtered.length : total);
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

  // ---------- Kartu statistik ----------
  const cards = [
    {
      query: "",
      title: "Total Pembayaran",
      count: stats.all,
      nominal: stats.allNominal,
      icon: (
        <span className="rounded-lg bg-emerald-100 p-2.5">
          <FileText className="text-emerald-600" size={20} />
        </span>
      ),
      activeCls: "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200",
      idleCls: "border-emerald-200 bg-white hover:bg-emerald-50",
    },
    {
      query: "WAITING_VERIFICATION",
      title: "Menunggu Verifikasi",
      count: stats.waiting,
      nominal: stats.waitingNominal,
      icon: (
        <span className="rounded-lg bg-blue-100 p-2.5">
          <ShieldCheck className="text-blue-600" size={20} />
        </span>
      ),
      activeCls: "border-blue-600 bg-blue-50 ring-2 ring-blue-200",
      idleCls: "border-blue-200 bg-white hover:bg-blue-50",
    },
    {
      query: "SUCCESS",
      title: "Berhasil",
      count: stats.success,
      nominal: stats.successNominal,
      icon: (
        <span className="rounded-lg bg-green-100 p-2.5">
          <CheckCircle2 className="text-green-600" size={20} />
        </span>
      ),
      activeCls: "border-green-600 bg-green-50 ring-2 ring-green-200",
      idleCls: "border-green-200 bg-white hover:bg-green-50",
    },
    {
      query: "PENDING",
      title: "Pending",
      count: stats.pending,
      nominal: stats.pendingNominal,
      icon: (
        <span className="rounded-lg bg-amber-100 p-2.5">
          <Clock className="text-amber-600" size={20} />
        </span>
      ),
      activeCls: "border-amber-600 bg-amber-50 ring-2 ring-amber-200",
      idleCls: "border-amber-200 bg-white hover:bg-amber-50",
    },
    {
      query: "REJECTED",
      title: "Ditolak",
      count: stats.rejected,
      nominal: stats.rejectedNominal,
      icon: (
        <span className="rounded-lg bg-red-100 p-2.5">
          <XCircle className="text-red-600" size={20} />
        </span>
      ),
      activeCls: "border-red-600 bg-red-50 ring-2 ring-red-200",
      idleCls: "border-red-200 bg-white hover:bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pembayaran</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola pembayaran invoice (cash &amp; transfer).
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button
            onClick={() => navigate("/admin/payment/verify")}
            className="flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
          >
            <ShieldCheck size={16} /> Verifikasi
          </button>

          <button
            onClick={() => navigate("/admin/payment/create")}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            <Plus size={16} /> Buat Pembayaran
          </button>
        </div>
      </div>

      {/* ===== Kartu statistik ===== */}
      {statsLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="mt-4 h-7 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {cards.map((card) => {
            const active =
              card.query === "" ? status === "" : status === card.query;

            return (
              <button
                key={card.title}
                onClick={() => setStatus(card.query)}
                title={`Lihat daftar: ${card.title}`}
                className={`block w-full cursor-pointer rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${active ? card.activeCls : card.idleCls
                  }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{card.title}</p>
                  {card.icon}
                </div>

                <h2 className="mt-2 text-2xl font-bold text-slate-800">
                  {card.count.toLocaleString("id-ID")}
                </h2>

                <p className="mt-1 truncate text-xs font-medium text-slate-500">
                  {rupiah(card.nominal)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* ===== Chip filter status ===== */}
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

      {/* ===== Pencarian ===== */}
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

      {/* ===== Tabel ===== */}
      <PaymentTable
        loading={loading}
        data={items}
        onVerify={() => navigate("/admin/payment/verify")}
      />

      {/* ===== Pagination ===== */}
      {!loading && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {total === 0
              ? "Tidak ada data"
              : `Menampilkan ${from}–${to} dari ${total} pembayaran`}
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
