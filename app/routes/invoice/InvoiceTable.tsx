import { Eye, Pencil, User } from "lucide-react";
import { Link } from "react-router";
import { formatBulanTahun } from "~/types/toIdr";

interface Props {
  loading: boolean;
  data: any[];
}

export default function InvoiceTable({ loading, data }: Props) {
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

        <h3 className="text-lg font-semibold">Data Invoice Kosong</h3>

        <p className="mt-2 text-slate-500">
          Belum ada Invoice yang ditambahkan.
        </p>
      </div>
    );
  }

  return (
    // <pre>{JSON.stringify(data, null, 2)}</pre>
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b bg-green-200">
            <tr className="text-left text-sm font-semibold text-slate-600">
              <th className="px-5 py-4">#</th>
              <th className="px-5 py-4">InvoiceId</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Periode</th>
              <th className="px-5 py-4">Subtotal</th>
              <th className="px-5 py-4">Diskon</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Expaired</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((invoice, index) => (
              <tr
                key={invoice.id}
                className="border-b transition hover:bg-slate-50"
              >
                <td className="px-5 py-4 font-medium">{index + 1}</td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">
                        {invoice.customer?.fullname}
                      </p>
                      <p className="text-sm text-slate-500">
                        {invoice.customer?.status}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">
                        {invoice.bulan}/{invoice.tahun}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">
                        {invoice.subtotal?.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">
                        {invoice.diskon?.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">
                        {invoice.total?.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">
                        {formatBulanTahun(invoice.dueDate)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">{invoice.status}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-baseline gap-2">
                    <Link
                      to={`/admin/invoice/${invoice.id}`}
                      className="rounded-lg border p-2 text-blue-600 transition hover:bg-blue-50"
                    >
                      <Eye size={18} />
                    </Link>

                    <Link
                      to={`/admin/invoice/${invoice.id}/edit`}
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
