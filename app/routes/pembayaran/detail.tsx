import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { getPembayaranById } from "~/api/pembayaran";
import { formatBulanTahun, formatIDR } from "~/types/toIdr";

export default function PembayaranDetail() {
  const { id } = useParams();

  const [pembayaran, setPembayaran] = useState<any>();

  useEffect(() => {
    if (id) {
      getPembayaranById(id).then((res) => {
        setPembayaran(res.data);
      });
    }
  }, [id]);

  if (!pembayaran) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detail Pembayaran</h1>

        <Link
          to={`/admin/pembayaran/${pembayaran.id}/edit`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Edit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Informasi Pembayaran</h2>
          {/* <pre>{JSON.stringify(pembayaran, null, 2)}</pre> */}
          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr>
                <td className="py-2 font-medium">Nama</td>
                <td>{pembayaran.customer.fullname}</td>
              </tr>

              <tr>
                <td className="py-2 font-medium">Username</td>
                <td>{pembayaran.customer.username}</td>
              </tr>

              <tr>
                <td className="py-2 font-medium">Paket</td>
                <td>{formatIDR(pembayaran.customer.paket?.harga)}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Metode</td>
                <td>{pembayaran.metode}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Tota Bayarl</td>
                <td>{formatIDR(pembayaran.totalBayar)}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Periode</td>
                <td>{formatBulanTahun(pembayaran.periode)}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Petugas</td>
                <td>{pembayaran.user.username}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Buti</td>
                <td>
                  {" "}
                  <div className="w-full items-center">
                    {pembayaran.image && (
                      <a
                        href={`${import.meta.env.VITE_API_URL}${pembayaran.image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={`${import.meta.env.VITE_API_URL}${pembayaran.image}`}
                          alt="Bukti Pembayaran"
                          className="h-80 rounded-lg border object-cover hover:opacity-80"
                        />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
