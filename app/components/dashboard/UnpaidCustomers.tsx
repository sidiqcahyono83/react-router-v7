import { formatIDR } from "~/types/toIdr";

export default function UnpaidCustomers({ data }: any) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Belum Bayar</h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">No</th>
            <th className="py-2 text-left">Nama</th>
            <th className="text-left">Area</th>
            <th className="text-right">Tagihan</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>1</td>
            <td>2</td>
            <td>3</td>
            <td className="text-right">4</td>
          </tr>


        </tbody>
      </table>
    </div>
  );
}
