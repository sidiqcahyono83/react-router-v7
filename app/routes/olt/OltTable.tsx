import { Pencil, Router, SearchX } from "lucide-react";

// ============================================================
// OltTable — tabel ONU dengan format data OLT ZTE
// Kolom khusus:
//   Status       → rstate: 1 = Aktif (hijau), 2 = Offline (merah)
//   Receive Power→ receive_power (dBm)
//   Uptime       → dihitung dari last_u_time (dalam jam)
//   Last Down    → last_d_time (tanggal + jam)
//   Down Cause   → last_d_cause
// ============================================================

// Parse tanggal format ZTE: "2026/07/29 19:20:16"
function parseZteDate(s?: unknown): Date | null {
  if (typeof s !== "string" || !s) return null;
  const m = s.match(
    /^(\d{4})\/(\d{2})\/(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/
  );
  if (!m) return null;
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6])
  );
  return Number.isNaN(d.getTime()) ? null : d;
}

// Tanggal + jam format Indonesia: "29 Jul 2026, 19:20"
function fmtDateTime(v?: unknown): string {
  const d = parseZteDate(v);
  if (!d) return "-";
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Uptime dari last_u_time → "X j Y mnt" / "X hr Y j"
function fmtUptime(v?: unknown): string {
  const d = parseZteDate(v);
  if (!d) return "-";
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "-";
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  if (h >= 24) {
    const days = Math.floor(h / 24);
    const remH = h % 24;
    return `${days} hr ${remH} j`;
  }
  return `${h} j ${m} mnt`;
}

// Receive power → "-14.49 dBm"
function fmtPower(v?: unknown): string {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return `${n.toFixed(2)} dBm`;
}

// Status badge: rstate 1 = Aktif, 2 = Offline
function statusInfo(v?: unknown) {
  const s = String(v ?? "").trim();

  if (s === "1") {
    return {
      label: "Aktif",
      cls: "border-green-200 bg-green-100 text-green-700",
    };
  }
  if (s === "2" || s === "0") {
    return {
      label: "Offline",
      cls: "border-red-200 bg-red-100 text-red-700",
    };
  }
  return {
    label: s || "-",
    cls: "border-slate-200 bg-slate-100 text-slate-600",
  };
}

function StatusBadge({ value }: { value?: unknown }) {
  const info = statusInfo(value);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${info.cls}`}
    >
      {info.label}
    </span>
  );
}

// Kolom tambahan (di luar yang sudah dikelola khusus)
const PREFERRED_EXTRA = [
  "dev_type",
  "identifier",
  "ont_description",
  "parent",
  "state",
  "cstate",
  "mstate",
  "ont_status",
  "ont_signal",
  "ont_distance",
];

interface Props {
  loading: boolean;
  data: any[];
  startIndex?: number;
  /** Kalau diisi, tiap baris menampilkan tombol edit nama ONT */
  onEdit?: (ont: any) => void;
}

export default function OltTable({
  loading,
  data,
  startIndex = 0,
  onEdit,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <SearchX className="mx-auto mb-4 text-slate-300" size={48} />
        <h3 className="text-lg font-semibold">Tidak Ada ONU</h3>
        <p className="mt-2 text-slate-500">
          Tidak ada data ONU yang ditemukan.
        </p>
      </div>
    );
  }

  const first = data[0] ?? {};

  // Deteksi field yang tersedia
  const hasRstate = "rstate" in first;
  const hasState = !hasRstate && "state" in first;
  const hasPower = "receive_power" in first || "ont_rxpower" in first;
  const hasLastU = "last_u_time" in first;
  const hasLastD = "last_d_time" in first;
  const hasCause = "last_d_cause" in first;

  const powerKey = "receive_power" in first ? "receive_power" : "ont_rxpower";
  const statusKey = hasRstate ? "rstate" : hasState ? "state" : null;

  // Kolom tambahan dinamis (sisa field yang belum dipakai khusus), maks 2
  const used = new Set([
    "ont_name",
    "ont_sn",
    powerKey,
    statusKey ?? "",
    "last_u_time",
    "last_d_time",
    "last_d_cause",
  ]);
  const keys = Object.keys(first).filter((k) => !used.has(k));
  const extraKeys = [
    ...PREFERRED_EXTRA.filter((k) => keys.includes(k)),
    ...keys.filter((k) => !PREFERRED_EXTRA.includes(k)),
  ].slice(0, 2);

  const fmt = (v: unknown) => {
    if (v === null || v === undefined || v === "") return "-";
    return String(v);
  };

  return (
    <>
      {/* ===== MOBILE: kartu ===== */}
      <div className="space-y-3 sm:hidden">
        {data.map((ont, index) => (
          <div
            key={`${ont.ont_sn ?? ont.ont_name ?? index}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">
                  {ont.ont_name || "-"}
                </p>
                <p className="truncate text-xs text-slate-400">
                  SN: {ont.ont_sn || "-"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-xs font-semibold text-slate-400">
                  #{startIndex + index + 1}
                </span>
                {statusKey && <StatusBadge value={ont[statusKey]} />}
                {onEdit && (
                  <button
                    onClick={() => onEdit(ont)}
                    className="rounded-lg border p-1 text-amber-600 transition hover:bg-amber-50"
                    title="Edit nama ONT"
                  >
                    <Pencil size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
              {hasPower && (
                <div>
                  <p className="text-slate-400">Receive Power</p>
                  <p className="font-medium text-slate-700">
                    {fmtPower(ont[powerKey])}
                  </p>
                </div>
              )}
              {hasLastU && (
                <div>
                  <p className="text-slate-400">Uptime</p>
                  <p className="font-medium text-green-700">
                    {fmtUptime(ont.last_u_time)}
                  </p>
                </div>
              )}
              {hasLastD && (
                <div>
                  <p className="text-slate-400">Last Down</p>
                  <p className="font-medium text-slate-700">
                    {fmtDateTime(ont.last_d_time)}
                  </p>
                </div>
              )}
              {hasCause && (
                <div>
                  <p className="text-slate-400">Down Cause</p>
                  <p className="truncate font-medium text-slate-700">
                    {fmt(ont.last_d_cause)}
                  </p>
                </div>
              )}
              {extraKeys.map((k) => (
                <div key={k}>
                  <p className="text-slate-400">{k}</p>
                  <p className="truncate font-medium text-slate-700">
                    {fmt(ont[k])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== DESKTOP / TABLET: tabel ===== */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b bg-green-200">
              <tr className="text-left text-sm font-semibold text-slate-600">
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Nama ONT</th>
                <th className="px-5 py-4">Serial Number</th>

                {statusKey && <th className="px-5 py-4">Status</th>}
                {hasPower && <th className="px-5 py-4">Receive Power</th>}
                {hasLastU && <th className="px-5 py-4">Uptime</th>}
                {hasLastD && <th className="px-5 py-4">Last Down</th>}
                {hasCause && <th className="px-5 py-4">Down Cause</th>}

                {extraKeys.map((k) => (
                  <th key={k} className="px-5 py-4">
                    {k}
                  </th>
                ))}

                {onEdit && <th className="px-5 py-4">Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {data.map((ont, index) => (
                <tr
                  key={`${ont.ont_sn ?? ont.ont_name ?? index}`}
                  className="border-b transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold">{ont.ont_name || "-"}</p>
                  </td>

                  <td className="px-5 py-4 font-mono text-sm text-slate-600">
                    {ont.ont_sn || "-"}
                  </td>

                  {statusKey && (
                    <td className="px-5 py-4">
                      <StatusBadge value={ont[statusKey]} />
                    </td>
                  )}

                  {hasPower && (
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {fmtPower(ont[powerKey])}
                    </td>
                  )}

                  {hasLastU && (
                    <td className="px-5 py-4 text-sm font-medium text-green-700">
                      {fmtUptime(ont.last_u_time)}
                    </td>
                  )}

                  {hasLastD && (
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {fmtDateTime(ont.last_d_time)}
                    </td>
                  )}

                  {hasCause && (
                    <td className="max-w-50 px-5 py-4">
                      <p className="truncate text-sm text-slate-600">
                        {fmt(ont.last_d_cause)}
                      </p>
                    </td>
                  )}

                  {extraKeys.map((k) => (
                    <td key={k} className="px-5 py-4 text-sm text-slate-600">
                      {fmt(ont[k])}
                    </td>
                  ))}

                  {onEdit && (
                    <td className="px-5 py-4">
                      <button
                        onClick={() => onEdit(ont)}
                        className="rounded-lg border p-2 text-amber-600 transition hover:bg-amber-50"
                        title="Edit nama ONT"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
