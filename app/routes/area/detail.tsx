import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { getAreaId } from "~/api/area";
import { formatIDR } from "~/types/toIdr";

export default function AreaDetail() {
  const { id } = useParams();

  const [area, setArea] = useState<any>();

  useEffect(() => {
    if (id) {
      getAreaId(id).then(setArea);
    }
  }, [id]);

  if (!area) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detail Area</h1>

        <Link
          to={`/admin/area/${area.id}/edit`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Edit
        </Link>
      </div>
      {/* <pre>{JSON.stringify(paket, null, 2)}</pre> */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Informasi Area</h2>

          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr>
                <td className="py-2 font-medium">Nama</td>
                <td>{area.name}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
