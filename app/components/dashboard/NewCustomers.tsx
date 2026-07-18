export default function NewCustomers({ data }: any) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Customer Baru Bulan Ini</h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">No</th>
            <th className="py-2 text-left">Nama</th>
            <th className="py-2 text-left">Paket</th>
            <th className="py-2 text-left">Tanggal</th>
            <th className="py-2 text-left">User</th>
          </tr>
        </thead>

        <tbody>
          {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
          {data.length > 0 ? (
            data.map((item: any, i: number) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="py-3">{i + 1}</td>

                <td className="py-3">{item.fullname}</td>

                <td className="py-3">{item.paket?.name ?? "-"}</td>

                <td className="py-3">
                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="py-3">{item.user?.id ?? "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-6 text-center text-slate-500">
                Belum ada customer baru.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
