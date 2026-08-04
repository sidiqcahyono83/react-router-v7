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

          <tr>
            <td>1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td>5</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
