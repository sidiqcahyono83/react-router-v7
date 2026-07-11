import { Form, Link, useNavigation } from "react-router";
import { formatIDR } from "~/type/toIdr";
import type { Route } from "./+types/detailLoader";

export default function customerDetail({ loaderData }: Route.ComponentProps) {
  const { customer, paket, area, odp, modem, olt } = loaderData;
  console.log(customer);
  const navigation = useNavigation();

  const submitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">Edit customer</h1>

      <Form
        method="patch"
        className="space-y-6 rounded-lg border bg-white p-6 shadow"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label>Nama</label>

            <input
              name="fullname"
              defaultValue={customer.fullname}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label>Username</label>

            <input
              name="username"
              defaultValue={customer.username}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label>Password PPPoE</label>

            <input
              name="password"

              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label>No HP</label>

            <input
              name="phonenumber"
              defaultValue={customer.phonenumber}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label>Alamat</label>

            <input
              name="address"
              defaultValue={customer.address}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label>Nama ONT</label>

            <input
              name="ontName"
              defaultValue={customer.ontName}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label>Redaman OLT</label>

            <input
              name="redamanOlt"
              defaultValue={customer.redamanOlt ?? ""}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label>Area</label>
            <select
              name="areaId"
              defaultValue={customer.areaId}
              className="w-full rounded border p-2"
            >
              {area.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Paket</label>
            <select
              name="paketId"
              defaultValue={customer.paketId}
              className="w-full rounded border p-2"
            >
              {paket.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({formatIDR(item.harga)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Diskon</label>

            <input
              type="number"
              name="diskon"
              defaultValue={customer.diskon}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label>ODP</label>
            <select
              name="odpId"
              defaultValue={customer.odpId}
              className="w-full rounded border p-2"
            >
              {odp.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Modem</label>
            <select
              name="modemId"
              defaultValue={customer.modemId}
              className="w-full rounded border p-2"
            >
              {modem.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.serial})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>OLT</label>
            <select
              name="oltId"
              defaultValue={customer.oltId ?? ""}
              className="w-full rounded border p-2"
            >
              <option value="">Tidak Ada</option>

              {olt.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Status</label>

            <select
              name="status"
              defaultValue={customer.status}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="aktif">Aktif</option>
              <option value="isolir">Isolir</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg bg-gray-100 p-4">
          <h2 className="font-semibold">Informasi Paket</h2>

          <p>Paket : {customer.paket.name}</p>

          <p>Harga : {formatIDR(customer.paket.harga)}</p>

          <p>Area : {customer.area.name}</p>
          <p>Redaman : {customer.redamanOlt}</p>

          <p>ODP : {customer.odp.name}</p>

          <p>Modem : {customer.modem.name}</p>
        </div>

        <div className="flex justify-between">
          <Link
            to="/customers"
            className="rounded bg-blue-600 px-5 py-2 text-white"
          >
            Kembali
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-green-600 px-5 py-2 text-white disabled:bg-amber-700"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </Form>
    </div>
  );
}
