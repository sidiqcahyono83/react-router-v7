import { Link } from "react-router";
import { Eye, Pencil, Wifi, ShieldAlert, User } from "lucide-react";
import { formatIDR } from "~/types/toIdr";

interface Props {
  loading: boolean;
  data: any[];
}

export default function ModemTable({ loading, data }: Props) {
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

        <h3 className="text-lg font-semibold">Data Modem Kosong</h3>

        <p className="mt-2 text-slate-500">Belum ada Modem yang ditambahkan.</p>
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
              <th className="px-5 py-4">Modem</th>
              <th className="px-5 py-4">Serial</th>
              <th className="px-5 py-4">Aksi</th>
            </tr>
          </thead>
          {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
          <tbody>
            {data.map((modem, index) => (
              <tr
                key={modem.id}
                className="border-b transition hover:bg-slate-50"
              >
                <td className="px-5 py-4 font-medium">{index + 1}</td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">{modem.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">{modem.serial}</p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-baseline gap-2">
                    <Link
                      to={`/admin/modem/${modem.id}`}
                      className="rounded-lg border p-2 text-blue-600 transition hover:bg-blue-50"
                    >
                      <Eye size={18} />
                    </Link>

                    <Link
                      to={`/admin/modem/${modem.id}/edit`}
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
