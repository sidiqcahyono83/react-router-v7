import { Form, Link, useNavigation } from "react-router";
import type { Route } from "./+types/create";

export default function CustomerCreate({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();

  const submitting = navigation.state === "submitting";

  const { pakets, areas, odps, modems, olts } = loaderData;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Tambah Pembayaran</h1>

      <Form method="post" className="space-y-4">
        <div>
          <label>Username</label>

          <input
            type="text"
            name="username"
            className="mt-1 w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label>Nama Customer</label>

          <input
            type="text"
            name="fullname"
            className="mt-1 w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label>Alamat</label>

          <input
            type="text"
            name="address"
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div>
          <label>Ont Name</label>

          <input
            type="text"
            name="ontName"
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div>
          <label>Redaman</label>

          <input
            type="text"
            name="redamanOlt"
            className="mt-1 w-full rounded border p-2"
          />
        </div>
        {/* <div>
          <label>Diskon</label>

          <input
            type="number"
            name="diskon"
            className="mt-1 w-full rounded border p-2"
          />
        </div> */}

        <div>
          <label>Status</label>

          <select name="status">
            <option value="aktive" className="mt-1 w-full rounded border p-2">
              Aktive
            </option>
            <option value="isolir" className="mt-1 w-full rounded border p-2">
              Isolir
            </option>
            <option
              value="non-aktive"
              className="mt-1 w-full rounded border p-2"
            >
              Non Aktive
            </option>
          </select>
        </div>

        <div>
          <label>No HP</label>

          <input
            type="text"
            name="phonenumber"
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <div>
          <label>Paket</label>
          <select name="paketId">
            {pakets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}-{item.harga}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Area</label>
          <select name="areaId">
            {areas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Odp</label>
          <select name="odpId">
            {odps.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Modem</label>
          <select name="modemId">
            {modems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}-{item.serial}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>OLT</label>
          <select name="oltId">
            {olts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}-{item.serial}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between">
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
