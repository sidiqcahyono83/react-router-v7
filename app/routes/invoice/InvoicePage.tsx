import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { getInvoice } from "~/api/invoice";
import InvoiceTable from "./InvoiceTable";



const LIMIT = 10;

const STATUS_LABEL: Record<string, string> = {
  ALL: "Semua",
  PAID: "Lunas",
  UNPAID: "Belum Dibayar",
  PENDING: "Pending",
  EXPIRED: "Expired / Jatuh Tempo",
  CANCELLED: "Dibatalkan",
};

export default function InvoicePage() {
  // status dibaca dari URL, contoh: /admin/invoice?status=PAID
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get("status") ?? "").toUpperCase();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  // debounce pencarian (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ganti filter / kata kunci -> kembali ke halaman 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  useEffect(() => {
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
        // filter manual di sisi client untuk halaman ini (tidak memaksa,
        // kalau backend sudah memfilter, hasilnya tetap sama).
        if (status && status !== "ALL") {
          list = list.filter(
            (inv) => String(inv.status ?? "").toUpperCase() === status
          );
        }

        const meta = res?.meta ?? res?.pagination ?? {};
        setInvoices(list);
        setTotal(Number(meta?.total ?? raw.total ?? list.length));
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
  }, [page, debouncedSearch, status]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  const clearStatus = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("status");
    setSearchParams(next);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold">Data Invoice</h1>
            {status && status !== "ALL" && (
              <p className="mt-1 text-sm text-slate-500">
                Menampilkan invoice berstatus{" "}
                <span className="font-semibold">
                  {STATUS_LABEL[status] ?? status}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chip filter status aktif (klik X untuk hapus filter) */}
          {status && status !== "ALL" && (
            <button
              onClick={clearStatus}
              className="flex items-center gap-1.5 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-100"
            >
              {STATUS_LABEL[status] ?? status}
              <X size={14} />
            </button>
          )}

          {/* Pencarian */}
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
      </div>

      {/* Tabel */}
      <InvoiceTable loading={loading} data={invoices} />

      {/* Pagination */}
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

  );
}
