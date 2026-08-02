import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getCustomerId } from "~/api/customers";
import { formatIDR } from "~/types/toIdr";

export default function CustomerDetail() {
  const { id } = useParams();

  const [customer, setCustomer] = useState<any>();

  useEffect(() => {
    if (id) {
      getCustomerId(id).then(setCustomer);
    }
  }, [id]);

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detail Customer</h1>

        <Link
          to={`/admin/customers/${customer.id}/edit`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Edit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Informasi Customer</h2>

          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr>
                <td className="py-2 font-medium">Nama</td>
                <td>{customer.fullname}</td>
              </tr>

              <tr>
                <td className="py-2 font-medium">Username</td>
                <td>{customer.username}</td>
              </tr>

              <tr>
                <td className="py-2 font-medium">Paket</td>
                <td>{customer.paket?.name}</td>
              </tr>

              <tr>
                <td className="py-2 font-medium">Area</td>
                <td>{customer.area?.name}</td>
              </tr>

              <tr>
                <td className="py-2 font-medium">ODP</td>
                <td>{customer.odp?.name ?? "-"}</td>
              </tr>

              <tr>
                <td className="py-2 font-medium">Status</td>
                <td>{customer.status}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Riwayat Pembayaran</h2>

          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">No</th>
                <th className="text-left">Periode</th>

                <th className="text-left">Total</th>
              </tr>
            </thead>
            {/* <pre>{JSON.stringify(customer.payments, null, 2)}</pre> */}
            <tbody>
              {customer.payments.map((p: any, i: number) => (
                <tr key={p.id} className="border-t">
                  <td>{i + 1}</td>
                  <td>{p.periode}</td>

                  <td className="text-left">{formatIDR(p.totalBayar ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
