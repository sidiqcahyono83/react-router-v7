import { Form, Link, useNavigation } from "react-router";

import { useMemo, useState } from "react";
import type { Route } from "./+types/create";
import { formatIDR } from "~/types/toIdr";

export default function PembayaranCreate({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();

  const submitting = navigation.state === "submitting";

  const { customers } = loaderData;

  const [customerId, setCustomerId] = useState(
    customers.length ? customers[0].id : "",
  );

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === customerId);
  }, [customers, customerId]);

  const hargaPaket = selectedCustomer
    ? selectedCustomer.paket.harga - (selectedCustomer.diskon ?? 0)
    : 0;

  const [aditional, setAditional] = useState(0);

  const totalBayar = useMemo(() => {
    return hargaPaket + aditional;
  }, [hargaPaket, aditional]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Tambah Pembayaran</h1>

      <Form method="post" encType="multipart/form-data" className="space-y-4">
        <div>
          <label>Customer</label>

          <select
            name="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="mt-1 w-full rounded border p-2"
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullname}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Periode</label>

          <input
            type="date"
            name="periode"
            className="mt-1 w-full rounded border p-2"
          />
        </div>
        <div>
          <label>Harga Paket</label>

          <input
            type="text"
            readOnly
            value={formatIDR(hargaPaket)}
            className="mt-1 w-full rounded border bg-gray-100 p-2"
          />
        </div>

        <div>
          <label>Diskon / Abodemen (+/-)</label>

          <input
            type="number"
            name="aditional"
            value={aditional}
            onChange={(e) => setAditional(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div>
          <label>Metode</label>

          <select name="metode" className="mt-1 w-full rounded border p-2">
            <option value="Cash">Cash</option>
            <option value="Transfer BRI">Transfer BRI</option>
            <option value="Transfer BNI">Transfer BNI</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <input type="number" name="totalBayar" value={totalBayar} hidden />

        <div>
          <label>Total Bayar</label>

          <input
            type="text"
            value={formatIDR(totalBayar)}
            readOnly
            className="mt-1 w-full rounded border bg-gray-100 p-2"
          />
        </div>

        <div>
          <label>Metode</label>

          <select name="metode" className="mt-1 w-full rounded border p-2">
            <option>Cash</option>

            <option>Transfer BRI</option>

            <option>Transfer BNI</option>

            <option>Lainnya</option>
          </select>
        </div>

        <div>
          <label>Bukti Pembayaran</label>

          <input
            type="file"
            name="image"
            accept="image/*"
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div className="flex">
          <Link
            to={"/pembayaran"}
            className="rounded px-5 py-2 text-white 
              bg-gray-400 hover:bg-green-600"
          >
            Kembali
          </Link>

          <button
            disabled={submitting}
            className={`rounded px-5 py-2 text-white ${
              submitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </Form>
    </div>
  );
}
