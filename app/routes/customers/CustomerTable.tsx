import { Pencil, UserRound } from "lucide-react";
import { Link } from "react-router";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "border-green-200 bg-green-100 text-green-700",
  SUSPENDED: "border-amber-200 bg-amber-100 text-amber-700",
  PENDING: "border-blue-200 bg-blue-100 text-blue-700",
  INACTIVE: "border-slate-200 bg-slate-100 text-slate-600",
  DISCONNECTED: "border-red-200 bg-red-100 text-red-600",
};

export function CustomerStatusBadge({ status }: { status?: string | null }) {
  const s = String(status ?? "").toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[s] ?? "border-slate-200 bg-slate-100 text-slate-600"
        }`}
    >
      {s || "-"}
    </span>
  );
}

interface Props {
  loading: boolean;
  data: any[];
  startIndex?: number;
}

export default function CustomerTable({ loading, data, startIndex = 0 }: Props) {
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
        <UserRound className="mx-auto mb-4 text-slate-300" size={48} />
        <h3 className="text-lg font-semibold">Data Customer Kosong</h3>
        <p className="mt-2 text-slate-500">
          Belum ada customer yang terdaftar.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ===== MOBILE: kartu ===== */}
      <div className="space-y-3 sm:hidden">
        {data.map((c, index) => (
          <div
            key={c.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">
                  {c.fullname || "-"}
                </p>
                <p className="text-xs text-slate-400">@{c.username}</p>
              </div>
              <CustomerStatusBadge status={c.status} />
            </div>

            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>📞 {c.phoneNumber || "-"}</p>
              <p className="truncate">📍 {c.address || "-"}</p>
              <p>
                📦 {c.paket?.nama ?? c.paket?.name ?? "-"}
                {c.paket?.harga ? ` · Rp ${Number(c.paket.harga).toLocaleString("id-ID")}` : ""}
              </p>
            </div>

            <div className="mt-3 flex justify-end border-t border-slate-100 pt-2">
              <Link
                to={`/admin/customer/create/${c.id}`}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-amber-600 transition hover:bg-amber-50"
              >
                <Pencil size={13} /> Edit
              </Link>
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
                <th className="px-5 py-4">Nama</th>
                <th className="px-5 py-4">Username</th>
                <th className="px-5 py-4">No. HP</th>
                <th className="px-5 py-4">Alamat</th>
                <th className="px-5 py-4">Paket</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.map((c, index) => (
                <tr
                  key={c.id}
                  className="border-b transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold">{c.fullname || "-"}</p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    @{c.username}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {c.phoneNumber || "-"}
                  </td>

                  <td className="max-w-50 px-5 py-4">
                    <p className="truncate text-sm text-slate-600">
                      {c.address || "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {c.paket?.nama ?? c.paket?.name ?? "-"}
                  </td>

                  <td className="px-5 py-4">
                    <CustomerStatusBadge status={c.status} />
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      to={`/admin/customer/create/${c.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-amber-600 transition hover:bg-amber-50"
                    >
                      <Pencil size={13} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
