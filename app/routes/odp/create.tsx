import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { createOdp } from "~/api/odp";
import { getAreas, getAreasAll } from "~/api/area";
import { getCustomers, getCustomersAll } from "~/api/customers";

export default function CreateOdpPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rasio, setRasio] = useState("");
  const [pasiveSpliter, setPasiveSpliter] = useState("");
  const [areaId, setAreaId] = useState("");
  const [customerIds, setCustomerIds] = useState<string[]>([]);

  const [areas, setAreas] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [areaData, customerData] = await Promise.all([
          getAreasAll(),
          getCustomersAll(),
        ]);
        console.log(areaData.data);
        console.log(customerData.data);
        setAreas(areaData);
        setCustomers(customerData);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, []);

  function handleCustomerChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );

    setCustomerIds(values);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      await createOdp({
        name,
        rasio,
        pasiveSpliter,
        areaId,
      });

      alert("ODP berhasil ditambahkan");

      navigate("/admin/odp");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCustomerCheck(customerId: string) {
    setCustomerIds((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId],
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-8 text-2xl font-bold">Tambah ODP</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block font-medium">Nama ODP</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border p-3"
              placeholder="ODP SOKA-01"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Rasio</label>

            <input
              value={rasio}
              onChange={(e) => setRasio(e.target.value)}
              className="w-full rounded-xl border p-3"
              placeholder="1:8"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Passive Splitter</label>

            <input
              value={pasiveSpliter}
              onChange={(e) => setPasiveSpliter(e.target.value)}
              className="w-full rounded-xl border p-3"
              placeholder="PLC 1:8"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Area</label>

            {/* <pre>{JSON.stringify(areas, null, 2)}</pre> */}
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full rounded-xl border p-3"
              required
            >
              <option value="">Pilih Area</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">Customer</label>

            <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border p-4">
              {customers.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada customer.</p>
              ) : (
                customers.map((customer) => (
                  <label
                    key={customer.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={customerIds.includes(customer.id)}
                      onChange={() => handleCustomerCheck(customer.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div>
                      <p className="font-medium">{customer.fullname}</p>

                      {customer.area && (
                        <p className="text-sm text-gray-500">
                          {customer.area.name}
                        </p>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {customerIds.length} customer dipilih
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/odp")}
              className="rounded-xl border px-6 py-3"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
