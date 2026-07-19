import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { getPaketId } from "~/api/paket";

export default function PaketDetail() {
  const { id } = useParams();

  const [paket, setPaket] = useState<any>();

  useEffect(() => {
    if (id) {
      getPaketId(id).then(setPaket);
    }
  }, [id]);

  if (!paket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detail Pakets</h1>

        <Link
          to={`/admin/paket/${paket.id}/edit`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Edit
        </Link>
      </div>
      {/* <pre>{JSON.stringify(paket, null, 2)}</pre> */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Informasi Paket</h2>

          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr>
                <td className="py-2 font-medium">Nama</td>
                <td>{paket.name}</td>
              </tr>

              <tr>
                <td className="py-2 font-medium">Harga</td>
                <td>{paket.harga}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
