import { Pencil, TrendingDown, Trash2 } from "lucide-react";
import { formatTanggal } from "~/types/toIdr";

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

// Warna badge kategori — dipilih stabil berdasarkan hash string kategori
const BADGE_COLORS = [
  "border-blue-200 bg-blue-50 text-blue-700",
  "border-violet-200 bg-violet-50 text-violet-700",
  "border-amber-200 bg-amber-50 text-amber-700",
  "border-cyan-200 bg-cyan-50 text-cyan-700",
  "border-pink-200 bg-pink-50 text-pink-700",
  "border-indigo-200 bg-indigo-50 text-indigo-700",
];

function kategoriColor(kategori: string): string {
  let h = 0;
  for (let i = 0; i < kategori.length; i++) {
    h = (h * 31 + kategori.charCodeAt(i)) >>> 0;
  }
  return BADGE_COLORS[h % BADGE_COLORS.length];
}

function KategoriBadge({ kategori }: { kategori: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${kategoriColor(
        kategori
      )}`}
    >
      {kategori || "-"}
    </span>
  );
}

interface Props {
  loading: boolean;
  data: any[];
  /** Nomor awal untuk kolom # (misal (page-1)*limit) */
  startIndex?: number;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

export default function PengeluaranTable({
  loading,
  data,
  startIndex = 0,
  onEdit,
  onDelete,
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
        <TrendingDown className="mx-auto mb-4 text-slate-300" size={48} />
        <h3 className="text-lg font-semibold">Data Pengeluaran Kosong</h3>
        <p className="mt-2 text-slate-500">
          Belum ada pengeluaran yang dicatat.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ===== MOBILE: kartu (di bawah layar sm) ===== */}
      <div className="space-y-3 sm:hidden">
        {data.map((p, index) => (
          <div
            key={p.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-400">
                #{startIndex + index + 1}
              </span>
              <div className="flex items-center gap-1.5">
                {onEdit && (
                  <button
                    onClick={() => onEdit(p)}
                    className="rounded-lg border p-1.5 text-amber-600 transition hover:bg-amber-50"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(p)}
                    className="rounded-lg border p-1.5 text-red-600 transition hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <KategoriBadge kategori={p.kategori} />
            </div>

            <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-800">
              {p.deskripsi || "-"}
            </p>

            <p className="mt-2 text-lg font-bold text-red-600">
              -{rupiah(Number(p.totalKeluar) || 0)}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
              <span className="text-slate-500">
                {p.user?.fullname ?? p.user?.username ?? "-"}
              </span>
              <span className="text-slate-400">
                {formatTanggal(p.tanggal)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== DESKTOP / TABLET: tabel (sm ke atas) ===== */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b bg-red-100">
              <tr className="text-left text-sm font-semibold text-slate-600">
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Kategori</th>
                <th className="px-5 py-4">Deskripsi</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Dicatat Oleh</th>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.map((p, index) => (
                <tr
                  key={p.id}
                  className="border-b transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium">{startIndex + index + 1}</td>

                  <td className="px-5 py-4">
                    <KategoriBadge kategori={p.kategori} />
                  </td>

                  <td className="max-w-xs px-5 py-4">
                    <p className="truncate font-semibold">
                      {p.deskripsi || "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-bold text-red-600">
                    -{rupiah(Number(p.totalKeluar) || 0)}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {p.user?.fullname ?? p.user?.username ?? "-"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatTanggal(p.tanggal)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(p)}
                          className="rounded-lg border p-2 text-amber-600 transition hover:bg-amber-50"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(p)}
                          className="rounded-lg border p-2 text-red-600 transition hover:bg-red-50"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
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
