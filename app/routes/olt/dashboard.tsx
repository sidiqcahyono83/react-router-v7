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
  updateOntName,
  type OltInfo,
} from "~/api/olt";
import OltTable from "./OltTable";

const AUTO_REFRESH_MS = 10_000; // 30 detik

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

  // Modal edit nama ONT
  const [editingOnt, setEditingOnt] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editDone, setEditDone] = useState(false);

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

  // ===== Filter status ONU (rstate: 1 = Aktif, 2/0 = Offline) =====
  type StatusFilter = "all" | "aktif" | "offline";

  const getStatusKey = (ont: any): string | null => {
    const v = ont?.rstate ?? ont?.state;
    if (v === undefined || v === null || v === "") return null;
    return String(v).trim();
  };

  const isAktif = (ont: any) => getStatusKey(ont) === "1";
  const isOffline = (ont: any) => {
    const k = getStatusKey(ont);
    return k === "2" || k === "0";
  };

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Statistik status: Aktif / Offline / Tak Dikenal
  const statusCounts = useMemo(() => {
    let aktif = 0;
    let offline = 0;
    let unknown = 0;

    for (const ont of data) {
      if (isAktif(ont)) aktif += 1;
      else if (isOffline(ont)) offline += 1;
      else unknown += 1;
    }

    return { aktif, offline, unknown };
  }, [data]);

  // Filter pencarian + status (client-side) untuk view "all"
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = data;

    if (q) {
      list = list.filter(
        (ont) =>
          String(ont.ont_name ?? "").toLowerCase().includes(q) ||
          String(ont.ont_sn ?? "").toLowerCase().includes(q)
      );
    }

    if (statusFilter === "aktif") {
      list = list.filter(isAktif);
    } else if (statusFilter === "offline") {
      list = list.filter(isOffline);
    }

    return list;
  }, [data, search, statusFilter]);

  const isPortArray = Array.isArray(portData);

  // Normalisasi response port: { data: { data: { port_id, resource: [...] } } }
  // → ambil array resource-nya (daftar ONU pada port)
  const portResource = Array.isArray(portData?.data?.resource)
    ? (portData.data.resource as any[])
    : null;

  const inputCls =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";

  const openEdit = (ont: any) => {
    setEditingOnt(ont);
    setEditName(String(ont?.ont_name ?? ""));
    setEditDesc(String(ont?.ont_description ?? ""));
    setEditError("");
    setEditDone(false);
  };

  const saveEdit = async () => {
    if (!editingOnt) return;
    if (!editName.trim()) {
      setEditError("Nama ONT wajib diisi.");
      return;
    }

    setEditSaving(true);
    setEditError("");
    setEditDone(false);

    try {
      const identifier = editingOnt?.identifier ?? editingOnt?.ont_id;

      if (identifier === undefined || identifier === null) {
        throw new Error("identifier ONT tidak ditemukan di data.");
      }

      await updateOntName(olt, identifier, {
        ont_name: editName.trim(),
        ont_description: editDesc.trim() || undefined,
      });

      // Sukses: tampilkan pesan, lalu tutup modal & refresh
      setEditDone(true);

      // Refresh 1: cepat (setelah 1.5 dtk)
      setTimeout(() => {
        setEditingOnt(null);
        load(true);
      }, 1500);

      // Refresh 2: OLT butuh beberapa detik untuk update ontinfo_table
      setTimeout(() => load(true), 6000);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Gagal mengedit ONT.");
    } finally {
      setEditSaving(false);
    }
  };

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
            {autoRefresh ? "Auto: 10 dtk" : "Auto: Mati"}
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

          {/* Kartu Aktif */}
          <button
            onClick={() => setStatusFilter("aktif")}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${statusFilter === "aktif"
              ? "border-green-500 bg-green-100 ring-2 ring-green-300"
              : "border-green-200 bg-white hover:bg-green-50"
              }`}
          >
            <span className="rounded-lg bg-green-500 p-2.5">
              <Router className="text-white" size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Aktif</p>
              <p className="text-xl font-bold text-green-700">
                {statusCounts.aktif.toLocaleString("id-ID")}
              </p>
            </div>
          </button>

          {/* Kartu Offline */}
          <button
            onClick={() => setStatusFilter("offline")}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${statusFilter === "offline"
              ? "border-red-500 bg-red-100 ring-2 ring-red-300"
              : "border-red-200 bg-white hover:bg-red-50"
              }`}
          >
            <span className="rounded-lg bg-red-500 p-2.5">
              <AlertTriangle className="text-white" size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Offline</p>
              <p className="text-xl font-bold text-red-600">
                {statusCounts.offline.toLocaleString("id-ID")}
              </p>
            </div>
          </button>

          {/* Kartu Tak Dikenal (kalau ada) */}
          {statusCounts.unknown > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <span className="rounded-lg bg-slate-100 p-2.5">
                <Database className="text-slate-600" size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">Tanpa Status</p>
                <p className="text-xl font-bold">
                  {statusCounts.unknown.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== Filter status + pencarian (view all) ===== */}
      {view === "all" && !loading && data.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          {/* Chip filter status */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${statusFilter === "all"
                ? "border-slate-700 bg-slate-700 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
            >
              Semua ({data.length})
            </button>

            <button
              onClick={() => setStatusFilter("aktif")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${statusFilter === "aktif"
                ? "border-green-600 bg-green-600 text-white"
                : "border-green-300 bg-white text-green-700 hover:bg-green-50"
                }`}
            >
              🟢 Aktif ({statusCounts.aktif})
            </button>

            <button
              onClick={() => setStatusFilter("offline")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${statusFilter === "offline"
                ? "border-red-600 bg-red-600 text-white"
                : "border-red-300 bg-white text-red-600 hover:bg-red-50"
                }`}
            >
              🔴 Offline ({statusCounts.offline})
            </button>
          </div>

          {/* Pencarian */}
          <div className="relative sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama ONT / serial number..."
              className={`${inputCls} w-full pl-9 pr-8`}
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
        </div>
      )}

      {/* ===== Konten ===== */}
      {view === "all" ? (
        <OltTable loading={loading} data={filtered} onEdit={openEdit} />
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
      {/* ===== Modal edit nama ONT ===== */}
      {editingOnt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditingOnt(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Nama ONT</h2>
              <button
                onClick={() => setEditingOnt(null)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              OLT: <b>{olt}</b> · SN: <b>{editingOnt.ont_sn || "-"}</b> · ID:{" "}
              <b>{editingOnt.identifier ?? editingOnt.ont_id ?? "-"}</b>
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nama ONT <span className="text-red-500">*</span>
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="cth: Muflih-skt"
                  className={`${inputCls} w-full px-3 py-2.5`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Deskripsi (ont_description)
                </label>
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="cth: 1"
                  className={`${inputCls} w-full px-3 py-2.5`}
                />
              </div>

              {editError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {editError}
                </div>
              )}

              {editDone && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  ✅ Nama berhasil diubah di OLT. Memperbarui data...
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingOnt(null)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  onClick={saveEdit}
                  disabled={editSaving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
