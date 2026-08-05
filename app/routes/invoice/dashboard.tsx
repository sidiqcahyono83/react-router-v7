import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { getInvoice, getInvoiceDashboard } from "~/api/invoice";
import DashboardCard from "./CardInvoice";
import InvoiceTable from "./InvoiceTable";



const LIMIT = 10;

const STATUS_LABEL: Record<string, string> = {
  PAID: "Lunas",
  UNPAID: "Belum Dibayar",
  PENDING: "Pending",
  PARTIAL: "Dibayar Sebagian",
  EXPIRED: "Expired / Jatuh Tempo",
  CANCELLED: "Dibatalkan",
};

interface Stats {
  totalInvoice: number;
  totalPaid: number;
  totalUnpaid: number;
  totalExpired: number;
  totalRevenue: number;
  revenueOutstanding: number;
}

const EMPTY_STATS: Stats = {
  totalInvoice: 0,
  totalPaid: 0,
  totalUnpaid: 0,
  totalExpired: 0,
  totalRevenue: 0,
  revenueOutstanding: 0,
};

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

export default function InvoiceDashboard() {
  // Filter status dibaca dari URL: /invoice?status=PAID
  const [searchParams, setSearchParams] = useSearchParams();
  const statusRaw = (searchParams.get("status") ?? "").toUpperCase();
  const status = statusRaw === "ALL" ? "" : statusRaw;

  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  // ---------- Statistik kartu ----------
  const loadStats = () => {
    setStatsLoading(true);

    getInvoiceDashboard()
      .then((res) => {
        // Bentuk response backend:
        // { data: { invoice: { total, bulanIni }, status: { paid, unpaid, partial,
        //   expired, cancelled, overdue, dueToday, dueNext7Days },
        //   nominal: { total, paid, outstanding } } }
        const d = res?.data ?? {};
        const invoiceCount = d.invoice ?? {};
        const statusCount = d.status ?? {};
        const nominal = d.nominal ?? {};

        setStats({
          totalInvoice: Number(invoiceCount.total ?? 0),
          totalPaid: Number(statusCount.paid ?? 0),
          totalUnpaid: Number(statusCount.unpaid ?? 0),
          totalExpired: Number(statusCount.expired ?? 0),
          // jumlah nilai SEMUA invoice
          totalRevenue: Number(nominal.total ?? 0),
          // jumlah nilai invoice yang belum dibayar (unpaid + partial)
          revenueOutstanding: Number(nominal.outstanding ?? 0),
        });
      })
      .catch(() => console.error("Gagal memuat dashboard invoice"))
      .finally(() => setStatsLoading(false));
  };

  // ---------- Daftar invoice ----------
  const loadInvoices = () => {
    let active = true;
    setLoading(true);

    getInvoice({ page, limit: LIMIT, search: debouncedSearch, status })
      .then((res) => {
        if (!active) return;

        const raw = res?.data ?? res ?? {};
        let list: any[] = Array.isArray(raw)
          ? raw
          : raw.items ?? raw.invoices ?? raw.rows ?? [];

        // Safety net: kalau backend belum mendukung query ?status=,
        // filter manual di sisi client.
        if (status) {
          list = list.filter(
            (inv) => String(inv.status ?? "").toUpperCase() === status
          );
        }

        const meta = res?.pagination ?? res?.meta ?? {};
        setInvoices(list);
        setTotal(Number(meta?.total ?? list.length));
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setInvoices([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  };

  // Debounce pencarian (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Ganti filter / kata kunci -> kembali ke halaman 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  // Ambil data saat page / pencarian / status berubah
  useEffect(() => {
    const cleanup = loadInvoices();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Aksi kartu ----------
  const handleCardClick = (query: string) => {
    const next = new URLSearchParams(searchParams);
    if (query) {
      next.set("status", query);
    } else {
      next.delete("status");
    }
    setSearchParams(next);
    setPage(1);

    document
      .getElementById("invoice-list")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearStatus = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("status");
    setSearchParams(next);
    setPage(1);
  };

  const refreshAll = () => {
    loadStats();
    loadInvoices();
  };

  const cards = [
    {
      query: "",
      title: "Total Invoice",
      value: stats.totalInvoice.toLocaleString("id-ID"),
      icon: (
        <span className="rounded-lg bg-emerald-100 p-2.5">
          <FileText className="text-emerald-600" size={20} />
        </span>
      ),
    },
    {
      query: "PAID",
      title: "Lunas",
      value: stats.totalPaid.toLocaleString("id-ID"),
      icon: (
        <span className="rounded-lg bg-green-100 p-2.5">
          <CheckCircle2 className="text-green-600" size={20} />
        </span>
      ),
    },
    {
      query: "UNPAID",
      title: "Belum Dibayar",
      value: stats.totalUnpaid.toLocaleString("id-ID"),
      icon: (
        <span className="rounded-lg bg-amber-100 p-2.5">
          <Clock className="text-amber-600" size={20} />
        </span>
      ),
    },
    {
      query: "EXPIRED",
      title: "Expired / Jatuh Tempo",
      value: stats.totalExpired.toLocaleString("id-ID"),
      icon: (
        <span className="rounded-lg bg-red-100 p-2.5">
          <AlertTriangle className="text-red-600" size={20} />
        </span>
      ),
    },
    {
      query: "",
      title: "Total Nilai Invoice",
      value: rupiah(stats.totalRevenue),
      icon: (
        <span className="rounded-lg bg-blue-100 p-2.5">
          <Wallet className="text-blue-600" size={20} />
        </span>
      ),
    },
    {
      query: "UNPAID",
      title: "Tagihan Belum Terbayar",
      value: rupiah(stats.revenueOutstanding),
      icon: (
        <span className="rounded-lg bg-indigo-100 p-2.5">
          <Banknote className="text-indigo-600" size={20} />
        </span>
      ),
    },
  ];

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  // Jumlah nilai invoice yang sedang tampil di daftar (client-side)
  const listTotal = invoices.reduce(
    (sum, inv) => sum + (Number(inv.total) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Invoice</h1>
          <p className="mt-1 text-sm text-slate-500">
            Klik salah satu kartu untuk memfilter daftar invoice di bawah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <Link
            to="/invoice/create"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            <Plus size={16} /> Generate Invoice
          </Link>
        </div>
      </div>

      {/* Kartu statistik */}
      {statsLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-7 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const isActive =
              card.query === "" ? status === "" : status === card.query;

            return (
              <button
                key={card.title}
                onClick={() => handleCardClick(card.query)}
                title={`Lihat daftar: ${card.title}`}
                className={`block w-full cursor-pointer rounded-xl text-left transition hover:-translate-y-0.5 hover:shadow-lg ${isActive ? "ring-2 ring-green-500" : ""
                  }`}
              >
                <DashboardCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Daftar invoice */}
      <div id="invoice-list" className="scroll-mt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Daftar Invoice</h2>

            {status && (
              <button
                onClick={clearStatus}
                className="flex items-center gap-1.5 rounded-full border border-green-300 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 transition hover:bg-green-100"
              >
                {STATUS_LABEL[status] ?? status}
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari invoice / customer..."
              className="w-64 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>
        </div>

        {/* Jumlah nilai invoice yang tampil */}
        {!loading && invoices.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm">
            <Wallet size={16} className="text-green-600" />
            <span className="text-slate-600">
              Total nilai {invoices.length} invoice yang tampil:
            </span>
            <span className="font-bold text-green-700">{rupiah(listTotal)}</span>
          </div>
        )}

        <InvoiceTable loading={loading} data={invoices} />

        {!loading && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {total === 0
                ? "Tidak ada data"
                : `Menampilkan ${from}–${to} dari ${total} invoice`}
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
    </div>
  );
}
