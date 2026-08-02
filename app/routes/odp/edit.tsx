import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getAreas } from "~/api/area";
import { getOdpId, updateOdp } from "~/api/odp";
import CustomerSearch from "../customers/CustomerSearch";

export default function OdpEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);

      const [odp, areaResult] = await Promise.all([
        getOdpId(id!),
        getAreas({
          page: 1,
          limit: 1000,
          search: "",
        }),
      ]);

      setAreas(areaResult.data);

      setForm({
        id: odp.id,
        name: odp.name,
        rasio: odp.rasio,
        passiveSpliter: odp.passiveSpliter,
        areaId: odp.areaId ?? "",
      });

      setSelectedCustomers(odp.customers ?? []);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data ODP");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        rasio: form.rasio,
        passiveSpliter: form.passiveSpliter,
        areaId: form.areaId || null,
        customerIds: selectedCustomers.map((c) => c.id),
      };

      console.log(payload);

      await updateOdp(id!, payload);

      alert("ODP berhasil diperbarui");

      navigate(`/admin/odp/${id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!form) {
    return <div className="rounded-xl bg-white p-10 shadow">Loading...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-white p-8 shadow"
    >
      <h1 className="text-3xl font-bold">Edit ODP</h1>

      <div>
        <label className="mb-2 block font-medium">Nama ODP</label>

        <input
          className="w-full rounded-xl border p-3"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Area</label>

        <select
          className="w-full rounded-xl border p-3"
          value={form.areaId}
          onChange={(e) =>
            setForm({
              ...form,
              areaId: e.target.value,
            })
          }
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
        <label className="mb-2 block font-medium">Rasio Splitter</label>

        <input
          className="w-full rounded-xl border p-3"
          value={form.rasio ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              rasio: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Passive Splitter</label>

        <input
          className="w-full rounded-xl border p-3"
          value={form.passiveSpliter ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              passiveSpliter: e.target.value,
            })
          }
        />
      </div>

      <CustomerSearch
        selected={selectedCustomers}
        onChange={setSelectedCustomers}
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-xl border px-6 py-3"
          onClick={() => navigate(-1)}
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-3 text-white"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
