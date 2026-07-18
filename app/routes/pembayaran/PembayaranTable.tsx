import { Link } from "react-router";
import { Eye, Pencil, Wifi, ShieldAlert, User } from "lucide-react";
import { formatBulanTahun, formatIDR } from "~/types/toIdr";
import { formatDate } from "date-fns/format";

interface Props {
  loading: boolean;
  data: any[];
}

export default function PembayaranTable({ loading, data }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <User className="mx-auto mb-4 text-slate-400" size={48} />

        <h3 className="text-lg font-semibold">Data Customer Kosong</h3>

        <p className="mt-2 text-slate-500">
          Belum ada customer yang ditambahkan.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Link
          to="/admin/pembayaran/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Tambah Pembayaran
        </Link>
        <table className="min-w-full">
          <thead className="border-b bg-green-200">
            <tr className="text-left text-sm font-semibold text-slate-600">
              <th className="px-5 py-4">#</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Paket</th>
              <th className="px-5 py-4">Area</th>
              <th className="px-5 py-4">Periode</th>
              <th className="px-5 py-4">Metode</th>
              <th className="px-5 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
          <tbody>
            {data.map((pembayaran, index) => (
              <tr
                key={pembayaran.id}
                className="border-b transition hover:bg-slate-50"
              >
                <td className="px-5 py-4 font-medium">{index + 1}</td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                      {pembayaran.customer.fullname?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {pembayaran.customer.fullname}
                      </p>

                      <p className="text-sm text-slate-500">
                        @{pembayaran.user.username}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold">
                      {formatIDR(pembayaran.totalBayar)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatIDR(pembayaran.customer.paket.harga)}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4">{pembayaran.customer.area?.name}</td>
                <td className="px-5 py-4">
                  {formatBulanTahun(pembayaran.periode)}
                </td>
                <td className="px-5 py-4">{pembayaran.metode}</td>

                <td className="px-5 py-4">
                  <div className="flex justify-center gap-2">
                    <Link
                      to={`/admin/pembayaran/${pembayaran.id}`}
                      className="rounded-lg border p-2 text-blue-600 transition hover:bg-blue-50"
                    >
                      <Eye size={18} />
                    </Link>

                    <Link
                      to={`/admin/pembayaran/${pembayaran.id}/edit`}
                      className="rounded-lg border p-2 text-amber-600 transition hover:bg-amber-50"
                    >
                      <Pencil size={18} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
