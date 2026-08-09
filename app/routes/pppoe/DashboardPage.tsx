import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import {
  getAllPppSecrets,
  getCustomersMonitoring,
  getPppActive,
} from "~/api/pppoe";

/* ============================================================
   Monitoring PPPoE Mikrotik ⇄ Customer
   Sumber data: SEMUA PPP Secret (online/offline/disabled) dari
   Mikrotik, disinkronkan dengan customer berdasarkan username.
============================================================ */

type RowStatus = "online" | "offline" | "disabled";

type FilterType = "all" | "online" | "offline" | "disabled";

interface NetworkRow {
  id: string;
  name: string; // username PPP secret
  profile: string;
  disabled: boolean;
  online: boolean;
  status: RowStatus;
  // Data customer hasil sinkron (null = tidak sinkron)
  customer?: {
    id: string;
    fullname?: string;
    status?: string;
    area?: { name?: string };
    paket?: { name?: string };
  } | null;
}

/* ============================================================
   HELPERS
============================================================ */

/** Ambil nama area dari data customer — tahan berbagai bentuk field */
const getAreaName = (customer: any): string | undefined => {
  const a = customer?.area ?? customer?.Area ?? customer?.wilayah;
  if (!a) return customer?.areaName ?? undefined;
  if (typeof a === "string") return a;
  return a?.name ?? a?.nama ?? a?.areaName ?? undefined;
};

const fmtUptime = (u?: string) => {
  if (!u) return "-";
  if (u.includes(":")) return u;
  const sec = Number(u);
  if (Number.isNaN(sec)) return u;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}j ${m}m`;
};

const STATUS_STYLE: Record<string, string> = {
  online: "bg-green-100 text-green-700",
  offline: "bg-orange-100 text-orange-700",
  disabled: "bg-red-100 text-red-600",
};

function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    online: "ONLINE",
    offline: "OFFLINE",
    disabled: "DISABLE",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${STATUS_STYLE[status] ?? "bg-gray-200 text-gray-700"
        }`}
    >
      {status === "online" && <Wifi size={12} />}
      {status === "offline" && <WifiOff size={12} />}
      {status === "disabled" && <Ban size={12} />}
      {label[status] ?? status.toUpperCase()}
    </span>
  );
}

const CARD_STYLE: Record<string, { box: string; active: string; idle: string }> = {
  all: {
    box: "bg-slate-100 text-slate-600",
    active: "border-slate-700 bg-slate-50 ring-2 ring-slate-300",
    idle: "border-slate-200 bg-white hover:bg-slate-50",
  },
  online: {
    box: "bg-green-600 text-white",
    active: "border-green-600 bg-green-50 ring-2 ring-green-300",
    idle: "border-green-200 bg-white hover:bg-green-50",
  },
  offline: {
    box: "bg-orange-500 text-white",
    active: "border-orange-500 bg-orange-50 ring-2 ring-orange-300",
    idle: "border-orange-200 bg-white hover:bg-orange-50",
  },
  disabled: {
    box: "bg-red-600 text-white",
    active: "border-red-600 bg-red-50 ring-2 ring-red-300",
    idle: "border-red-200 bg-white hover:bg-red-50",
  },
};

/* ============================================================
   HALAMAN
============================================================ */

export default function DashboardPppoePage() {
  const [rows, setRows] = useState<NetworkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. SEMUA PPP Secret dari Mikrotik (online + offline + disabled)
      const [secrets, activeList, custList] = await Promise.all([
        getAllPppSecrets(),
        getPppActive(),
        getCustomersMonitoring(),
      ]);

      // Nama session aktif → untuk menentukan status online
      const activeNames = new Set(
        activeList.map((p: any) => String(p?.name ?? "")),
      );

      // Customer map: username → data customer
      const custMap = new Map<string, any>();
      (Array.isArray(custList) ? custList : []).forEach((c: any) => {
        custMap.set(String(c?.username ?? ""), c);
      });

      // Gabungkan: HANYA PPPoE user yang tersinkron dengan customer
      // (username secret = username customer). Yang tidak sinkron TIDAK tampil.
      const merged: NetworkRow[] = (Array.isArray(secrets) ? secrets : [])
        .map((s: any, i: number) => {
          const name = String(s?.name ?? "");
          const customer = custMap.get(name) ?? null;

          return {
            id: s[".id"] ?? `${name}-${i}`,
            name,
            profile: String(s?.profile ?? ""),
            disabled: s?.disabled === true || s?.disabled === "true",
            online: activeNames.has(name),
            status: (s?.disabled === true || s?.disabled === "true"
              ? "disabled"
              : activeNames.has(name)
                ? "online"
                : "offline") as RowStatus,
            customer,
          };
        })
        .filter((r) => r.customer); // ⭐ HANYA yang sinkron

      setRows(merged);
    } catch (err) {
      console.error("Gagal memuat data monitoring", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =========================
     STATISTIK
  ========================== */

  const total = rows.length;
  const online = rows.filter((r) => r.status === "online").length;
  const offline = rows.filter((r) => r.status === "offline").length;
  const disabled = rows.filter((r) => r.status === "disabled").length;

  /* =========================
     FILTER STATUS
  ========================== */

  const rowsForArea = useMemo(
    () =>
      rows.filter((r) => {
        if (filter === "online") return r.status === "online";
        if (filter === "offline") return r.status === "offline";
        if (filter === "disabled") return r.status === "disabled";
        return true;
      }),
    [rows, filter],
  );

  /* =========================
     HITUNG AREA (dari customer yang sinkron)
  ========================== */

  const areaCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const r of rowsForArea) {
      const name = getAreaName(r.customer) || "Tanpa Area";
      acc[name] = (acc[name] || 0) + 1;
    }
    return acc;
  }, [rowsForArea]);

  const areas = ["all", ...Object.keys(areaCounts)];

  /* =========================
     FILTER TABEL (status + area + pencarian)
  ========================== */

  const filteredRows = rows.filter((r) => {
    const matchArea =
      areaFilter === "all" || (getAreaName(r.customer) ?? "Tanpa Area") === areaFilter;
    if (!matchArea) return false;

    if (filter === "online") return r.status === "online";
    if (filter === "offline") return r.status === "offline";
    if (filter === "disabled") return r.status === "disabled";

    const q = search.trim().toLowerCase();
    if (q) {
      return (
        r.name.toLowerCase().includes(q) ||
        String(r.customer?.fullname ?? "").toLowerCase().includes(q) ||
        r.profile.toLowerCase().includes(q)
      );
    }

    return true;
  });

  /* =========================
     KARTU STATISTIK
  ========================== */

  const cards = [
    { key: "all" as FilterType, title: "Total Sinkron", value: total, icon: <Users size={20} /> },
    { key: "online" as FilterType, title: "Online", value: online, icon: <Wifi size={20} /> },
    { key: "offline" as FilterType, title: "Offline (Nonaktif)", value: offline, icon: <WifiOff size={20} /> },
    { key: "disabled" as FilterType, title: "Disable", value: disabled, icon: <Ban size={20} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
        <Loader2 className="animate-spin" size={20} />
        Memuat monitoring PPPoE...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Monitoring PPPoE (Mikrotik ⇄ Customer)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hanya menampilkan user PPPoE Mikrotik yang sudah tersinkron dengan
            customer — status online, offline (nonaktif), dan disable.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={loadData}
            className="ml-3 font-semibold underline underline-offset-2"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Kartu statistik (klik → filter) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const active = filter === card.key;
          const style = CARD_STYLE[card.key];

          return (
            <button
              key={card.key}
              onClick={() => {
                setFilter(card.key);
                setAreaFilter("all");
              }}
              className={`block w-full cursor-pointer rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${active ? style.active : style.idle
                }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{card.title}</p>
                <span className={`rounded-lg p-2 ${style.box}`}>
                  {card.icon}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">
                {card.value.toLocaleString("id-ID")}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filter status */}
      {/* <div className="flex flex-wrap gap-2 justify-center">
        {cards.map((card) => {
          const style = CARD_STYLE[card.key];
          return (
            <button
              key={card.key}
              onClick={() => {
                setFilter(card.key);
                setAreaFilter("all");
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${filter === card.key ? style.active : style.idle
                }`}
            >
              {card.title} ({card.value})
            </button>
          );
        })}
      </div> */}

      {/* Filter area + pencarian */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Select Area ({rowsForArea.length})</option>
          {areas
            .filter((a) => a !== "all")
            .map((a) => (
              <option key={a} value={a}>
                {a} ({areaCounts[a]})
              </option>
            ))}
        </select>

        <div className="relative sm:w-72">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari username / customer / profile..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />
        </div>
      </div>

      {/* ===== MOBILE: kartu ===== */}
      <div className="space-y-3 sm:hidden">
        {filteredRows.map((r, i) => (
          <div
            key={r.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-blue-600">
                  {r.customer?.fullname ?? r.name}
                </p>
                <p className="text-xs text-slate-400">@{r.name}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <p className="truncate">📍 {getAreaName(r.customer) || "-"}</p>
              <p className="truncate">📦 {r.customer?.paket?.name || "-"}</p>
              <p className="truncate">Profile: {r.profile || "-"}</p>
              <p className="truncate">
                Status Cust: {r.customer?.status ?? "-"}
              </p>
            </div>
          </div>
        ))}

        {filteredRows.length === 0 && (
          <p className="py-6 text-center text-gray-500">Data tidak ditemukan</p>
        )}
      </div>

      {/* ===== TABEL (sm ke atas) ===== */}
      <div className="hidden overflow-x-auto rounded-lg shadow sm:block">
        <table className="w-full bg-white border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-3 py-2">No</th>
              <th className="px-3 py-2">Username PPP</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Area</th>
              <th className="px-3 py-2">Paket</th>
              <th className="px-3 py-2">Profile</th>
              <th className="px-3 py-2">Status Customer</th>
              <th className="px-3 py-2">Status Jaringan</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={r.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="px-3 py-2">{i + 1}</td>

                <td className="px-3 py-2 font-semibold">{r.name}</td>

                <td className="px-3 py-2">
                  <span className="font-semibold text-blue-600">
                    {r.customer?.fullname ?? "-"}
                  </span>
                </td>

                <td className="px-3 py-2">{getAreaName(r.customer) || "-"}</td>

                <td className="px-3 py-2">{r.customer?.paket?.name || "-"}</td>

                <td className="px-3 py-2">{r.profile || "-"}</td>

                <td className="px-3 py-2">{r.customer?.status ?? "-"}</td>

                <td className="px-3 py-2">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 && (
          <p className="py-6 text-center text-gray-500">Data tidak ditemukan</p>
        )}
      </div>

      {/* Info kecil */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <MapPin size={12} />
        Status jaringan: ONLINE (session aktif) · OFFLINE (nonaktif, secret
        aktif tapi tidak online) · DISABLE (secret dinonaktifkan) — hanya user
        yang tersinkron dengan customer
      </p>
    </div>
  );
}
