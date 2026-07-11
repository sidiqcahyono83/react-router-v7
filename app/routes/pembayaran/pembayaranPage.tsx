// app/routes/pembayaran/PembayaranPage.tsx

import { Link } from "react-router";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { formatIDR } from "~/type/toIdr";
import type { Route } from "./+types/pembayaran";

export default function PembayaranPage({ loaderData }: Route.ComponentProps) {
  const { pembayarans } = loaderData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Pembayaran</h1>

        <Link
          to="/pembayaran/create"
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Tambah Pembayaran
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Paket</th>
              <th className="p-3 text-left">Area</th>
              <th className="p-3 text-left">Periode</th>
              <th className="p-3 text-left">Metode</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-left">Petugas</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {pembayarans.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium">{item.customer.fullname}</div>
                  <div className="text-sm text-gray-500">
                    {item.customer.username}
                  </div>
                </td>

                <td className="p-3">{item.customer.paket.name}</td>

                <td className="p-3">{item.customer.area.name}</td>

                <td className="p-3">
                  {format(new Date(item.periode), "MMMM yyyy", { locale: id })}
                </td>

                <td className="p-3">{item.metode}</td>

                <td className="p-3 text-right font-semibold">
                  {formatIDR(item.totalBayar)}
                </td>

                <td className="p-3">{item.user.fullname}</td>

                <td className="p-3 text-center">
                  <Link
                    to={`/pembayaran/${item.id}`}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}

            {pembayarans.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  Belum ada data pembayaran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
