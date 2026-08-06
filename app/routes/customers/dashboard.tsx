import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { getAllCustomers, getCustomers } from "~/api/customers";
import CustomerTable from "./CustomerTable";



const LIMIT = 10;

const STATUS_OPTIONS = ["ACTIVE", "PENDING", "SUSPENDED", "INACTIVE", "DISCONNECTED"];

export default function CustomerDashboard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // Semua customer untuk statistik & filter status (sekali + saat refresh)
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Muat statistik (semua data)
  useEffect(() => {
    let active = true;
    setStatsLoading(true);

    getAllCustomers()
      .then((list) => {
        if (active) setAllCustomers(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("[customer] statistik gagal:", err);
        setAllCustomers([]);
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  // Debounce pencarian
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Ganti filter → halaman 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  // Muat list:
  // - Tanpa filter status → pagination server (getCustomers)
  // - Dengan filter status → ambil SEMUA, filter client, potong per halaman
  const statusActive = Boolean(status);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const fetchData = statusActive
      ? getAllCustomers({ search: debouncedSearch }).then((list) => {
        const arr = Array.isArray(list) ? list : [];
        const filteredList = arr.filter(
          (c) => String(c.status ?? "").toUpperCase() === status
        );
        return { list: filteredList, total: filteredList.length };
      })
      : getCustomers({ page, limit: LIMIT, search: debouncedSearch }).then(
        (res) => {
          const raw = res?.data ?? [];
          return {
            list: Array.isArray(raw) ? raw : [],
            total: Number(res?.pagination?.total ?? 0),
          };
        }
      );

    fetchData
      .then(({ list, total }) => {
        if (!active) return;
        setData(list);
        setTotal(total);
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
  }, [page, debouncedSearch, status, statusActive, reloadKey]);

  // Potong per halaman saat filter status aktif (semua data sudah difilter)
  const items = statusActive
    ? data.slice((page - 1) * LIMIT, page * LIMIT)
    : data;

  // Statistik status (dari semua data)
  const countByStatus = (s: string) =>
    allCustomers.filter(
      (c) => String(c.status ?? "").toUpperCase() === s
    ).length;

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * LIMIT + 1;
  const to = Math.min(safePage * LIMIT, total);

  const hasFilter = Boolean(debouncedSearch || status);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";
  const labelCls = "mb-1 block text-xs font-medium text-slate-500";

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola pelanggan internet — data, paket, dan status.
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
            to="/admin/customer/create"
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            <Plus size={16} /> Tambah Customer
          </Link>
        </div>
      </div>

      {/* ===== Kartu ringkasan (klik → filter tabel) ===== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total — klik → semua */}
        <button
          onClick={() => {
            setStatus("");
            setPage(1);
          }}
          title="Tampilkan semua customer"
          className={`block w-full cursor-pointer rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${status === ""
            ? "border-slate-700 bg-slate-50 ring-2 ring-slate-300"
            : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Customer</p>
            <span className="rounded-lg bg-slate-100 p-2">
              <Users className="text-slate-600" size={18} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {statsLoading ? "…" : allCustomers.length.toLocaleString("id-ID")}
          </p>
        </button>

        {/* Aktif */}
        <button
          onClick={() => {
            setStatus("ACTIVE");
            setPage(1);
          }}
          title="Tampilkan customer aktif"
          className={`block w-full cursor-pointer rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${status === "ACTIVE"
            ? "border-green-600 bg-green-50 ring-2 ring-green-300"
            : "border-green-100 bg-white hover:bg-green-50"
            }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Aktif</p>
            <span className="rounded-lg bg-green-600 p-2">
              <Users className="text-white" size={18} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {statsLoading ? "…" : countByStatus("ACTIVE").toLocaleString("id-ID")}
          </p>
        </button>

        {/* Pending */}
        <button
          onClick={() => {
            setStatus("PENDING");
            setPage(1);
          }}
          title="Tampilkan customer pending"
          className={`block w-full cursor-pointer rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${status === "PENDING"
            ? "border-amber-600 bg-amber-50 ring-2 ring-amber-300"
            : "border-amber-100 bg-white hover:bg-amber-50"
            }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Pending</p>
            <span className="rounded-lg bg-amber-600 p-2">
              <Users className="text-white" size={18} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {statsLoading ? "…" : countByStatus("PENDING").toLocaleString("id-ID")}
          </p>
        </button>

        {/* Suspended */}
        <button
          onClick={() => {
            setStatus("SUSPENDED");
            setPage(1);
          }}
          title="Tampilkan customer suspended"
          className={`block w-full cursor-pointer rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${status === "SUSPENDED"
            ? "border-red-600 bg-red-50 ring-2 ring-red-300"
            : "border-red-100 bg-white hover:bg-red-50"
            }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Suspended</p>
            <span className="rounded-lg bg-red-600 p-2">
              <Users className="text-white" size={18} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {statsLoading ? "…" : countByStatus("SUSPENDED").toLocaleString("id-ID")}
          </p>
        </button>
      </div>

      {/* ===== Filter ===== */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                placeholder="Nama / username / no. HP..."
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

          <div>
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputCls}
            >
              <option value="">Semua Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilter && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400">Filter aktif</p>
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Hapus Filter
            </button>
          </div>
        )}
      </div>

      {/* ===== Tabel / Kartu ===== */}
      <CustomerTable
        loading={loading}
        data={items}
        startIndex={(safePage - 1) * LIMIT}
      />

      {/* ===== Pagination ===== */}
      {!loading && total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Menampilkan {from}–{to} dari {total} customer
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
