import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { getUsers } from "~/api/user";
import UserTable from "./UserTable";



const LIMIT = 10;

const LEVEL_OPTIONS = ["ADMIN", "SUPER_ADMIN", "STAFF"];

export default function UserDashboard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [level, setLevel] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getUsers()
      .then((res) => {
        if (!active) return;
        const raw = res?.users ?? res?.data ?? [];
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
        (u) =>
          String(u.fullname ?? "").toLowerCase().includes(q) ||
          String(u.username ?? "").toLowerCase().includes(q) ||
          String(u.phoneNumber ?? "").toLowerCase().includes(q)
      );
    }

    if (level) {
      list = list.filter((u) => String(u.level ?? "").toUpperCase() === level);
    }

    return list;
  }, [data, debouncedSearch, level]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * LIMIT, safePage * LIMIT);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * LIMIT + 1;
  const to = Math.min(safePage * LIMIT, filtered.length);

  // Statistik level
  const countByLevel = (lvl: string) =>
    data.filter((u) => String(u.level ?? "").toUpperCase() === lvl).length;

  const hasFilter = Boolean(debouncedSearch || level);

  const clearFilters = () => {
    setSearch("");
    setLevel("");
    setPage(1);
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
  const labelCls = "mb-1 block text-xs font-medium text-slate-500";

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen User</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola user admin &amp; staff — akun, level, dan area.
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
            to="/admin/user/create"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={16} /> Tambah User
          </Link>
        </div>
      </div>

      {/* ===== Ringkasan level ===== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <span className="rounded-lg bg-slate-100 p-2.5">
            <Users className="text-slate-600" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Total User</p>
            <p className="text-xl font-bold">{data.length.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <span className="rounded-lg bg-blue-600 p-2.5">
            <ShieldCheck className="text-white" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Admin</p>
            <p className="text-xl font-bold text-blue-700">
              {countByLevel("ADMIN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50 p-4">
          <span className="rounded-lg bg-violet-600 p-2.5">
            <ShieldCheck className="text-white" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Super Admin</p>
            <p className="text-xl font-bold text-violet-700">
              {countByLevel("SUPER_ADMIN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <span className="rounded-lg bg-slate-200 p-2.5">
            <UserCog className="text-slate-600" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Staff</p>
            <p className="text-xl font-bold">{countByLevel("STAFF")}</p>
          </div>
        </div>
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
            <label className={labelCls}>Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={inputCls}
            >
              <option value="">Semua Level</option>
              {LEVEL_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilter && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400">
              {filtered.length} hasil dari {data.length} user
            </p>
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
      <UserTable
        loading={loading}
        data={pageItems}
        startIndex={(safePage - 1) * LIMIT}
      />

      {/* ===== Pagination ===== */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Menampilkan {from}–{to} dari {filtered.length} user
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
