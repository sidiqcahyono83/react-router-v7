import { TrendingUp } from "lucide-react";
import { formatTanggal } from "~/types/toIdr";

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

function SumberBadge({ manual }: { manual: boolean }) {
  return manual ? (
    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      Pemasangan Baru
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
      Dari Pembayaran
    </span>
  );
}

interface Props {
  loading: boolean;
  data: any[];
  /** Nomor awal untuk kolom # (misal (page-1)*limit) */
  startIndex?: number;
  hasFilter?: boolean;
  onClearFilter?: () => void;
}

export default function PendapatanTable({
  loading,
  data,
  startIndex = 0,
  hasFilter = false,
  onClearFilter,
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

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b bg-green-200">
            <tr className="text-left text-sm font-semibold text-slate-600">
              <th className="px-5 py-4">#</th>
              <th className="px-5 py-4">Deskripsi</th>
              <th className="px-5 py-4">Sumber</th>
              <th className="px-5 py-4">Invoice / Customer</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Dicatat Oleh</th>
              <th className="px-5 py-4">Tanggal</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center">
                  <TrendingUp
                    className="mx-auto mb-4 text-slate-300"
                    size={48}
                  />
                  <h3 className="text-lg font-semibold">
                    Data Pendapatan Kosong
                  </h3>
                  <p className="mt-2 text-slate-500">
                    {hasFilter
                      ? "Tidak ada data yang cocok dengan filter."
                      : "Belum ada pendapatan yang dicatat."}
                  </p>
                  {hasFilter && onClearFilter && (
                    <button
                      onClick={onClearFilter}
                      className="mt-4 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Hapus Filter
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              data.map((p, index) => {
                const manual = !p.paymentId;

                return (
                  <tr
                    key={p.id}
                    className="border-b transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium">
                      {startIndex + index + 1}
                    </td>

                    <td className="max-w-xs px-5 py-4">
                      <p className="truncate font-semibold">
                        {p.deskripsi || "-"}
                      </p>
                      {p.payment?.invoice?.invoiceNumber && (
                        <p className="text-xs text-slate-400">
                          {p.payment.invoice.invoiceNumber}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <SumberBadge manual={manual} />
                      {!manual && p.payment?.method && (
                        <p className="mt-1 text-xs text-slate-400">
                          {p.payment.method}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {p.payment?.customer?.fullname ?? "-"}
                      </p>
                      {p.payment?.customer?.username && (
                        <p className="text-sm text-slate-500">
                          {p.payment.customer.username}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 font-bold text-green-700">
                      {rupiah(Number(p.total) || 0)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {p.user?.fullname ?? p.user?.username ?? "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatTanggal(p.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
