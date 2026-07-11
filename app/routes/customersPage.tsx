import { Link, useLoaderData } from "react-router";
import type { loader } from "./customers";

export default function CustomersPage() {
  const { customers } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Customers</h1>

        <Link
          to="/customers/create"
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Tambah Customer
        </Link>
      </div>

      <div className="rounded border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-3 text-left">No</th>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Area</th>
              <th className="p-3 text-left">Paket</th>
              <th className="p-3 text-left">Telepon</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer.id} className="border-b">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{customer.fullname}</td>

                <td className="p-3">{customer.username}</td>
                <td className="p-3">{customer.area.name}</td>
                <td className="p-3">{customer.paket.name}</td>
                <td className="p-3">{customer.phonenumber ?? "-"}</td>
                <td className="p-3">
                  <Link to={`/customers/${customer.id}`}>Edit</Link>
                  <button>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
