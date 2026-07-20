import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { Users, Pencil } from "lucide-react";

import { getOltId } from "~/api/olt";

export default function OltDetail() {
  const { id } = useParams();

  const [olt, setOlt] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getOltId(id).then(setOlt);
    }
  }, [id]);

  if (!olt) {
    return <div className="rounded-xl bg-white p-6 shadow">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h1 className="text-3xl font-bold">{olt.name}</h1>

          <p className="mt-2 text-slate-500">
            Detail Optical Distribution Point
          </p>
        </div>

        <Link
          to={`/admin/olt/${olt.id}/edit`}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white"
        >
          <Pencil size={18} />
          Edit
        </Link>
      </div>

      {/* Informasi */}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold">Informasi OLT</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Nama</p>

              <p className="font-semibold">{olt.name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Username</p>

              <p className="font-semibold">{olt.username ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Serial</p>

              <p className="font-semibold">{olt.serial ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Customer</p>

              <p className="font-semibold text-blue-600">
                {olt._count.customer}
              </p>
            </div>
          </div>
        </div>

        {/* Statistik */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-4">
              <Users className="text-blue-600" />
            </div>

            <div>
              <p className="text-slate-500">Customer Terhubung</p>

              <h2 className="text-4xl font-bold">{olt._count.customer}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Customer */}

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Daftar Customer</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">No HP</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {olt.customer.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Belum ada customer.
                  </td>
                </tr>
              ) : (
                olt.customer.map((customer: any, index: number) => (
                  <tr key={customer.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-4">{index + 1}</td>

                    <td className="px-4 py-4 font-medium">
                      {customer.fullname}
                    </td>

                    <td className="px-4 py-4">{customer.username}</td>

                    <td className="px-4 py-4">{customer.phonenumber}</td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          customer.status === "aktif"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        to={`/admin/customers/${customer.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
