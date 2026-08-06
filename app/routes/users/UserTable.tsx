import { Pencil, Users } from "lucide-react";
import { Link } from "react-router";

const LEVEL_STYLE: Record<string, string> = {
  SUPER_ADMIN: "border-violet-200 bg-violet-50 text-violet-700",
  ADMIN: "border-blue-200 bg-blue-50 text-blue-700",
  STAFF: "border-slate-200 bg-slate-100 text-slate-600",
};

export function LevelBadge({ level }: { level?: string }) {
  const l = String(level ?? "").toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[l] ?? "border-slate-200 bg-slate-100 text-slate-600"
        }`}
    >
      {l || "-"}
    </span>
  );
}

interface Props {
  loading: boolean;
  data: any[];
  /** Nomor awal untuk kolom # (misal (page-1)*limit) */
  startIndex?: number;
}

export default function UserTable({ loading, data, startIndex = 0 }: Props) {
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
        <Users className="mx-auto mb-4 text-slate-300" size={48} />
        <h3 className="text-lg font-semibold">Data User Kosong</h3>
        <p className="mt-2 text-slate-500">
          Belum ada user yang terdaftar.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ===== MOBILE: kartu ===== */}
      <div className="space-y-3 sm:hidden">
        {data.map((u, index) => (
          <div
            key={u.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">
                  {u.fullname}
                </p>
                <p className="text-xs text-slate-400">@{u.username}</p>
              </div>
              <LevelBadge level={u.level} />
            </div>

            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>📞 {u.phoneNumber || "-"}</p>
              <p className="truncate">📍 {u.address || "-"}</p>
              <p>
                🗺️{" "}
                {(u.areas ?? []).map((a: any) => a.name).join(", ") || "-"}
              </p>
            </div>

            <div className="mt-3 flex justify-end border-t border-slate-100 pt-2">
              <Link
                to={`/admin/user/create/${u.id}`}
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
            <thead className="border-b bg-blue-100">
              <tr className="text-left text-sm font-semibold text-slate-600">
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Nama</th>
                <th className="px-5 py-4">Username</th>
                <th className="px-5 py-4">No. HP</th>
                <th className="px-5 py-4">Alamat</th>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">Area</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.map((u, index) => (
                <tr
                  key={u.id}
                  className="border-b transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold">{u.fullname}</p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    @{u.username}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {u.phoneNumber || "-"}
                  </td>

                  <td className="max-w-50 px-5 py-4">
                    <p className="truncate text-sm text-slate-600">
                      {u.address || "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <LevelBadge level={u.level} />
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {(u.areas ?? []).map((a: any) => a.name).join(", ") || "-"}
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      to={`/admin/user/create/${u.id}`}
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
