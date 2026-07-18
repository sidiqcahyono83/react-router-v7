export default function LatestPayments({ data }: any) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Pembayaran Terakhir</h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Customer</th>
            <th>Paket</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item: any) => (
            <tr key={item.id} className="border-b">
              <td className="py-3">{item.customer}</td>

              <td>{item.paket}</td>

              <td>Rp {item.total.toLocaleString("id-ID")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
