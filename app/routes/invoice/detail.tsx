import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { getModemId } from "~/api/modem";
import { formatIDR } from "~/types/toIdr";

export default function ModemDetail() {
  const { id } = useParams();

  const [modem, setModem] = useState<any>();

  useEffect(() => {
    if (id) {
      getModemId(id).then(setModem);
    }
  }, [id]);

  if (!modem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detail Modem</h1>

        <Link
          to={`/admin/modem/${modem.id}/edit`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Edit
        </Link>
      </div>
      {/* <pre>{JSON.stringify(paket, null, 2)}</pre> */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Informasi Modem</h2>

          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr>
                <td className="py-2 font-medium">Nama : </td>
                <td>{modem.name}</td>
                <td className="py-2 font-medium">Serial : </td>
                <td>{modem.serial}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
