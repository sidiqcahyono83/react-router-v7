// PembayaranDetail.tsx

import { format } from "date-fns";
import { id } from "date-fns/locale";

import { formatIDR } from "~/type/toIdr";
import type { Route } from "./+types/detail";
import { Link } from "react-router";

export default function PembayaranDetail({ loaderData }: Route.ComponentProps) {
  const { pembayaran } = loaderData;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Detail Pembayaran</h1>
        <Link
          to={"/pembayaran"}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Kembali
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="font-semibold">Customer</label>

            <p>{pembayaran.customer.fullname}</p>
          </div>

          <div>
            <label className="font-semibold">Username</label>

            <p>{pembayaran.customer.username}</p>
          </div>

          <div>
            <label className="font-semibold">Paket</label>

            <p>{pembayaran.customer.paket.name}</p>
          </div>

          <div>
            <label className="font-semibold">Area</label>

            <p>{pembayaran.customer.area.name}</p>
          </div>

          <div>
            <label className="font-semibold">Periode</label>

            <p>
              {format(new Date(pembayaran.periode), "dd MMMM yyyy", {
                locale: id,
              })}
            </p>
          </div>

          <div>
            <label className="font-semibold">Metode</label>

            <p>{pembayaran.metode}</p>
          </div>

          <div>
            <label className="font-semibold">Total Bayar</label>

            <p>{formatIDR(pembayaran.totalBayar)}</p>
          </div>

          <div>
            <label className="font-semibold">Petugas</label>

            <p>{pembayaran.user.fullname}</p>
          </div>
        </div>

        {pembayaran.image && (
          <div className="mt-6">
            <label className="font-semibold">Bukti Pembayaran</label>

            <img
              src={import.meta.env.VITE_BACKEND_API_URL + pembayaran.image}
              className="mt-2 w-full max-w-md rounded border"
            />
          </div>
        )}
      </div>
    </div>
  );
}
