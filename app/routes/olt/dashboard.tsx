import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Database,
  Loader2,
  RefreshCw,
  Router,
  Search,
  Server,
  X,
} from "lucide-react";
import {
  ageLabel,
  getOltAll,
  getOltDaftar,
  getOltPort,
  OLT_FALLBACK,
  type OltInfo,
} from "~/api/olt";
import OltTable from "./OltTable";

const AUTO_REFRESH_MS = 30_000; // 30 detik

type View = "all" | "port";

export default function OltDashboard() {
  // Daftar OLT & pilihan
  const [oltList, setOltList] = useState<OltInfo[]>(
    OLT_FALLBACK.map((key) => ({ key }))
  );
  const [olt, setOlt] = useState("sruweng");

  // View
  const [view, setView] = useState<View>("all");
  const [port, setPort] = useState(1);

  // Data & state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [portData, setPortData] = useState<any>(null);
  const [cached, setCached] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Muat daftar OLT sekali
  useEffect(() => {
    getOltDaftar()
      .then((list) => {
        setOltList(list);
        // Pastikan pilihan masih valid
        setOlt((prev) =>
          list.some((o) => o.key === prev) ? prev : (list[0]?.key ?? "sruweng")
        );
      })
      .catch(() => {
        /* fallback sudah di set */
      });
  }, []);

  // Fungsi muat data
  const load = (force = false) => {
    setLoading(true);
    setError("");

    if (view === "all") {
      getOltAll(olt, force)
        .then((res) => {
          const raw = res?.data ?? [];
          setData(Array.isArray(raw) ? raw : []);
          setCached(Boolean(res?.cached));
          setFetchedAt(Number(res?.fetchedAt) || null);
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Gagal memuat data OLT.")
        )
        .finally(() => setLoading(false));
    } else {
      getOltPort(olt, port, force)
        .then((res) => {
          setPortData(res?.data ?? null);
          setCached(Boolean(res?.cached));
          setFetchedAt(Number(res?.fetchedAt) || null);
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Gagal memuat data port.")
        )
        .finally(() => setLoading(false));
    }
  };

  // Muat saat OLT / view / port / reload berubah
  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [olt, view, port, reloadKey]);

  // Auto-refresh berkala (pakai cache backend, tanpa force)
  useEffect(() => {
    if (!autoRefresh) return;

    const t = setInterval(() => {
      load(false);
    }, AUTO_REFRESH_MS);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, olt, view, port]);

  // Filter pencarian (client-side) untuk view "all"
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return data;

    return data.filter(
      (ont) =>
        String(ont.ont_name ?? "").toLowerCase().includes(q) ||
        String(ont.ont_sn ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  // Statistik status (kalau field status ada)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ont of data) {
      const s = String(ont.ont_status ?? ont.status ?? "").toLowerCase();
      if (!s || s === "-") continue;
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  }, [data]);

  const isPortArray = Array.isArray(portData);

  // Normalisasi response port: { data: { data: { port_id, resource: [...] } } }
  // → ambil array resource-nya (daftar ONU pada port)
  const portResource = Array.isArray(portData?.data?.resource)
    ? (portData.data.resource as any[])
    : null;

  const inputCls =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoring OLT</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau ONU di semua OLT secara real-time.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Auto refresh toggle */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${autoRefresh
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-slate-300 bg-white text-slate-500"
              }`}
            title="Muat ulang otomatis tiap 30 detik"
          >
            <RefreshCw
              size={15}
              className={autoRefresh ? "animate-spin animation-duration-[3s]" : ""}
            />
            {autoRefresh ? "Auto: 30 dtk" : "Auto: Mati"}
          </button>

          {/* Refresh paksa */}
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* ===== Pemilih OLT + status data ===== */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
          {/* Pilih OLT */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Server size={13} /> Pilih OLT
            </label>
            <select
              value={olt}
              onChange={(e) => setOlt(e.target.value)}
              className={`${inputCls} w-full`}
            >
              {oltList.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.key}
                </option>
              ))}
            </select>
          </div>

          {/* Tampilan: Semua / Port */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Tampilan
            </label>
            <div className="flex gap-1.5">
              <button
                onClick={() => setView("all")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${view === "all"
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                Semua ONU
              </button>

              <button
                onClick={() => setView("port")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${view === "port"
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                Per Port
              </button>
            </div>
          </div>

          {/* Pilih port (kalau view port) */}
          {view === "port" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Nomor Port (1–8)
              </label>
              <select
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className={`${inputCls} w-full`}
              >
                {Array.from({ length: 8 }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>
                    Port {p}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Info data */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {cached ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
              <Database size={12} /> Dari cache
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 font-medium text-green-700">
              <Router size={12} /> Live dari OLT
            </span>
          )}

          {fetchedAt && (
            <span className="text-slate-400">
              Diambil {ageLabel(fetchedAt)}
            </span>
          )}
        </div>
      </div>

      {/* ===== Error ===== */}
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </p>
          <button
            onClick={() => load(true)}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* ===== Ringkasan ===== */}
      {!loading && view === "all" && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
            <span className="rounded-lg bg-green-600 p-2.5">
              <Router className="text-white" size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Total ONU</p>
              <p className="text-xl font-bold text-green-700">
                {data.length.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {Object.entries(statusCounts).slice(0, 3).map(([s, n]) => (
            <div
              key={s}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <span className="rounded-lg bg-slate-100 p-2.5">
                <Database className="text-slate-600" size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm capitalize text-slate-500">
                  {s}
                </p>
                <p className="text-xl font-bold">{n.toLocaleString("id-ID")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Pencarian (view all) ===== */}
      {view === "all" && !loading && data.length > 0 && (
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama ONT / serial number..."
            className={`${inputCls} w-full max-w-sm pl-9 pr-8`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {/* ===== Konten ===== */}
      {view === "all" ? (
        <OltTable loading={loading} data={filtered} />
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
          ) : error ? null : portResource ? (
            <>
              {/* Header: Port X — OLT · N ONU */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
                <h3 className="text-lg font-semibold">
                  Port {port} — {olt}
                </h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  {portResource.length} ONU
                </span>
              </div>

              {/* Tabel ONU pada port tersebut */}
              <OltTable loading={false} data={portResource} />
            </>
          ) : isPortArray ? (
            <OltTable loading={false} data={portData as any[]} />
          ) : portData && typeof portData === "object" ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">
                Data Port {port} — {olt}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(portData).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="text-xs text-slate-400">{k}</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
                      {typeof v === "object"
                        ? JSON.stringify(v)
                        : String(v ?? "-")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Router className="mx-auto mb-4 text-slate-300" size={48} />
              <h3 className="text-lg font-semibold">Tidak Ada Data Port</h3>
              <p className="mt-2 text-slate-500">
                Data port {port} pada {olt} kosong.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
