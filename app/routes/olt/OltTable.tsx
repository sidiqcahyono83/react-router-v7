import { Router, SearchX } from "lucide-react";

// Prioritas kolom tambahan (di luar ont_name & ont_sn) —
// kalau field-field ini ada di data, tampilkan lebih dulu
const PREFERRED_EXTRA = [
  "ont_status",
  "status",
  "ont_rxpower",
  "ont_txpower",
  "ont_signal",
  "ont_distance",
  "ont_online",
  "state",
  "online_status",
];

interface Props {
  loading: boolean;
  data: any[];
  startIndex?: number;
}

export default function OltTable({ loading, data, startIndex = 0 }: Props) {
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

  // Kolom tambahan dinamis: ambil dari baris pertama,
  // prioritaskan field yang menarik, maksimal 3.
  const first = data[0] ?? {};
  const keys = Object.keys(first).filter(
    (k) => k !== "ont_name" && k !== "ont_sn"
  );

  const extraKeys = [
    ...PREFERRED_EXTRA.filter((k) => keys.includes(k)),
    ...keys.filter((k) => !PREFERRED_EXTRA.includes(k)),
  ].slice(0, 3);

  const fmt = (v: unknown) => {
    if (v === null || v === undefined || v === "") return "-";
    return String(v);
  };

  const statusClass = (v: unknown) => {
    const s = String(v ?? "").toLowerCase();
    if (["online", "on", "active", "1", "connected"].includes(s))
      return "text-green-600";
    if (["offline", "off", "inactive", "0", "disconnected"].includes(s))
      return "text-red-600";
    return "text-slate-600";
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
              <span className="shrink-0 text-xs font-semibold text-slate-400">
                #{startIndex + index + 1}
              </span>
            </div>

            {extraKeys.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                {extraKeys.map((k) => (
                  <div key={k}>
                    <p className="text-slate-400">{k}</p>
                    <p
                      className={`truncate font-medium ${statusClass(ont[k])}`}
                    >
                      {fmt(ont[k])}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
                {extraKeys.map((k) => (
                  <th key={k} className="px-5 py-4">
                    {k}
                  </th>
                ))}
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

                  {extraKeys.map((k) => (
                    <td
                      key={k}
                      className={`px-5 py-4 text-sm ${statusClass(ont[k])}`}
                    >
                      {fmt(ont[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
