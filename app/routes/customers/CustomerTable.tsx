import { Link } from "react-router";
import { Eye, Pencil, Wifi, ShieldAlert, User } from "lucide-react";

interface Props {
  loading: boolean;
  data: any[];
}

export default function CustomerTable({ loading, data }: Props) {
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
        <table className="min-w-full">
          <thead className="border-b bg-green-200">
            <tr className="text-left text-sm font-semibold text-slate-600">
              <th className="px-5 py-4">#</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Paket</th>
              <th className="px-5 py-4">Area</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((customer, index) => (
              <tr
                key={customer.id}
                className="border-b transition hover:bg-slate-50"
              >
                <td className="px-5 py-4 font-medium">{index + 1}</td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                      {customer.fullname?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold">{customer.fullname}</p>

                      <p className="text-sm text-slate-500">
                        @{customer.username}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {customer.paket?.name}
                  </span>
                </td>

                <td className="px-5 py-4">{customer.area?.name}</td>

                <td className="px-5 py-4">
                  {customer.status === "aktif" ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      <Wifi size={16} />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                      <ShieldAlert size={16} />
                      Isolir
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-center gap-2">
                    <Link
                      to={`/admin/customers/${customer.id}`}
                      className="rounded-lg border p-2 text-blue-600 transition hover:bg-blue-50"
                    >
                      <Eye size={18} />
                    </Link>

                    <Link
                      to={`/admin/customers/${customer.id}/edit`}
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
