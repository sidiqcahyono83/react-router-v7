import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  RefreshCcw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import {
  getPppNotSync,
  getSyncCheck,
  syncPpp,
  type PppNotSyncItem,
  type SyncCheckItem,
} from "../../api/sync";

type Tab = "customer" | "ppp";

export default function SyncDashboard() {
  // ---------- State data ----------
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [check, setCheck] = useState<{
    summary: {
      total_customer: number;
      sinkron: number;
      tidak_sinkron: number;
      total_ppp_secret: number;
    };
    data: SyncCheckItem[];
  } | null>(null);

  const [loadingPpp, setLoadingPpp] = useState(true);
  const [pppNotSync, setPppNotSync] = useState<{
    summary: { total_ppp_secret: number; tidak_sinkron: number };
    data: PppNotSyncItem[];
  } | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<Tab>("customer");
  const [search, setSearch] = useState("");

  // ---------- State aksi sinkronisasi ----------
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncError, setSyncError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // Muat data
  useEffect(() => {
    let active = true;

    setLoadingCheck(true);
    getSyncCheck()
      .then((res) => {
        if (active) setCheck(res);
      })
      .catch((err) => console.error("[sync] check gagal:", err))
      .finally(() => {
        if (active) setLoadingCheck(false);
      });

    setLoadingPpp(true);
    getPppNotSync()
      .then((res) => {
        if (active) setPppNotSync(res);
      })
      .catch((err) => console.error("[sync] ppp gagal:", err))
      .finally(() => {
        if (active) setLoadingPpp(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  // Filter client-side
  const filteredCustomers = (check?.data ?? []).filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.username.toLowerCase().includes(q) ||
      c.fullname.toLowerCase().includes(q)
    );
  });

  const filteredPpp = (pppNotSync?.data ?? []).filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.profile.toLowerCase().includes(q)
    );
  });

  const notSyncCustomers = (check?.data ?? []).filter((c) => !c.sync);

  const toggleSelect = (username: string) => {
    setSelected((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  const doSync = async (usernames?: string[]) => {
    const targetLabel = usernames
      ? `${usernames.length} customer terpilih`
      : "semua customer yang belum sinkron";

    if (
      !window.confirm(
        `Buat PPP Secret untuk ${targetLabel} di Mikrotik? Lanjutkan?`
      )
    )
      return;

    setSyncing(true);
    setSyncError("");
    setSyncResult(null);

    try {
      const res = await syncPpp(usernames);
      setSyncResult(res);
      setSelected([]);
      // Muat ulang data biar status terbaru
      setTimeout(() => setReloadKey((k) => k + 1), 1500);
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : "Gagal sinkronisasi."
      );
    } finally {
      setSyncing(false);
    }
  };

  const summary = check?.summary;
  const pppSummary = pppNotSync?.summary;

  const inputCls =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sinkronisasi PPP Secret</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cocokkan <b>name PPP Secret</b> Mikrotik dengan{" "}
            <b>username customer</b>.
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
            onClick={() => doSync()}
            disabled={syncing || notSyncCustomers.length === 0}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {syncing ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Menyinkronkan...
              </>
            ) : (
              <>
                <RefreshCcw size={16} /> Sinkronkan Semua
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===== Kartu ringkasan ===== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <span className="rounded-lg bg-slate-100 p-2.5">
            <Users className="text-slate-600" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Total Customer</p>
            <p className="text-xl font-bold">
              {loadingCheck
                ? "…"
                : (summary?.total_customer ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
          <span className="rounded-lg bg-green-600 p-2.5">
            <CheckCircle2 className="text-white" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Sinkron</p>
            <p className="text-xl font-bold text-green-700">
              {loadingCheck ? "…" : (summary?.sinkron ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <span className="rounded-lg bg-red-600 p-2.5">
            <XCircle className="text-white" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Customer Belum Sinkron</p>
            <p className="text-xl font-bold text-red-600">
              {loadingCheck
                ? "…"
                : (summary?.tidak_sinkron ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
          <span className="rounded-lg bg-amber-600 p-2.5">
            <AlertTriangle className="text-white" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">PPP Tanpa Customer</p>
            <p className="text-xl font-bold text-amber-700">
              {loadingPpp
                ? "…"
                : (pppSummary?.tidak_sinkron ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Hasil sinkronisasi ===== */}
      {syncResult && (
        <div
          className={`rounded-xl border p-4 text-sm ${syncResult?.summary?.gagal > 0
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-green-200 bg-green-50 text-green-800"
            }`}
        >
          <p className="font-semibold">{syncResult?.message}</p>
          {syncResult?.summary && (
            <p className="mt-1">
              Target: {syncResult.summary.total_target} · Berhasil:{" "}
              <b>{syncResult.summary.berhasil}</b> · Gagal:{" "}
              <b>{syncResult.summary.gagal}</b>
            </p>
          )}
          {Array.isArray(syncResult?.data) && syncResult.data.length > 0 && (
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {syncResult.data.map((r: any) => (
                <li key={r.username} className="flex items-center gap-2">
                  {r.success ? (
                    <CheckCircle2 size={14} className="text-green-600" />
                  ) : (
                    <XCircle size={14} className="text-red-600" />
                  )}
                  <span className="font-medium">{r.username}</span>
                  <span className="text-xs text-slate-500">{r.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {syncError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {syncError}
        </div>
      )}

      {/* ===== Tab ===== */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab("customer")}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${tab === "customer"
            ? "border-green-600 bg-green-600 text-white"
            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
        >
          Customer Belum Sinkron ({notSyncCustomers.length})
        </button>

        <button
          onClick={() => setTab("ppp")}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${tab === "ppp"
            ? "border-amber-600 bg-amber-600 text-white"
            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
        >
          PPP Tanpa Customer ({pppNotSync?.data?.length ?? 0})
        </button>
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
          placeholder={
            tab === "customer"
              ? "Cari username / nama customer..."
              : "Cari nama PPP secret / profile..."
          }
          className={`${inputCls} w-full max-w-sm pl-9 pr-3`}
        />
      </div>

      {/* ===== Konten tab ===== */}
      {tab === "customer" ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            {loadingCheck ? (
              <div className="animate-pulse space-y-4 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-slate-200" />
                ))}
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle2 className="mx-auto mb-4 text-green-400" size={48} />
                <h3 className="text-lg font-semibold">Semua Sinkron</h3>
                <p className="mt-2 text-slate-500">
                  Tidak ada customer yang belum sinkron dengan PPP Secret.
                </p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="border-b bg-green-200">
                  <tr className="text-left text-sm font-semibold text-slate-600">
                    <th className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={
                          filteredCustomers.filter((c) => !c.sync).length > 0 &&
                          filteredCustomers
                            .filter((c) => !c.sync)
                            .every((c) => selected.includes(c.username))
                        }
                        onChange={(e) => {
                          const unsync = filteredCustomers.filter((c) => !c.sync);
                          if (e.target.checked) {
                            setSelected((prev) => [
                              ...new Set([...prev, ...unsync.map((c) => c.username)]),
                            ]);
                          } else {
                            const names = new Set(unsync.map((c) => c.username));
                            setSelected((prev) =>
                              prev.filter((u) => !names.has(u))
                            );
                          }
                        }}
                      />
                    </th>
                    <th className="px-5 py-4">Username</th>
                    <th className="px-5 py-4">Nama</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((c) => {
                    const isSelected = selected.includes(c.username);

                    return (
                      <tr
                        key={c.customer_id}
                        className={`border-b transition ${c.sync ? "bg-green-50/50" : "hover:bg-slate-50"
                          }`}
                      >
                        <td className="px-5 py-4">
                          {!c.sync && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(c.username)}
                            />
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {c.username}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {c.fullname}
                        </td>

                        <td className="px-5 py-4">
                          {c.sync ? (
                            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                              ✅ Sinkron
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                              ⚠️ Tidak Sinkron
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {!c.sync && (
                            <button
                              onClick={() => doSync([c.username])}
                              disabled={syncing}
                              className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                            >
                              <RefreshCcw size={13} /> Sinkronkan
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Aksi batch untuk yang terpilih */}
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <p className="text-sm text-slate-600">
                <b>{selected.length}</b> customer terpilih
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected([])}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => doSync(selected)}
                  disabled={syncing}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {syncing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={14} />
                  )}
                  Sinkronkan Terpilih
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            {loadingPpp ? (
              <div className="animate-pulse space-y-4 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-slate-200" />
                ))}
              </div>
            ) : filteredPpp.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle2 className="mx-auto mb-4 text-green-400" size={48} />
                <h3 className="text-lg font-semibold">Semua PPP Punya Customer</h3>
                <p className="mt-2 text-slate-500">
                  Tidak ada PPP Secret yang tanpa customer.
                </p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="border-b bg-amber-200">
                  <tr className="text-left text-sm font-semibold text-slate-600">
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Nama PPP</th>
                    <th className="px-5 py-4">Profile</th>
                    <th className="px-5 py-4">Disabled</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPpp.map((p, i) => (
                    <tr
                      key={p.ppp_id}
                      className="border-b transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium">{i + 1}</td>
                      <td className="px-5 py-4 font-semibold">{p.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {p.profile || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {p.disabled ? "Ya" : "Tidak"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          Tidak Sinkron
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
