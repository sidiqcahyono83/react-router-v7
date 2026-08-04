import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getOltId, updateOlt } from "~/api/olt";
import { getAreas } from "~/api/area";
import CustomerSearch from "../customers/CustomerSearch";

export default function OltEdit() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>(null);

  const [areas, setAreas] = useState<any[]>([]);

  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;

    try {
      setLoading(true);

      const [olt, areaResult] = await Promise.all([
        getOltId(id),
        getAreas({
          page: 1,
          limit: 1000,
          search: "",
        }),
      ]);

      setForm(olt);

      setAreas(areaResult.data);

      setSelectedCustomers(olt.customer ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await updateOlt(id!, {
        name: form.name,
        serial: form.serial,
        username: form.username,
        password: form.password,

        customerIds: selectedCustomers.map((c) => c.id),
      });

      alert("OLT berhasil diperbarui");

      navigate(`/admin/olt/${id}`);
    } catch (err: any) {
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

      {/* Nama */}

      <div>
        <label className="mb-2 block font-medium">Nama ODP</label>

        <input
          value={form.name ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          className="w-full rounded-xl border p-3"
        />
      </div>

      {/* Area */}

      <div>
        <label className="mb-2 block font-medium">Area</label>

        <select
          value={form.areaId ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              areaId: e.target.value,
            })
          }
          className="w-full rounded-xl border p-3"
        >
          <option value="">Pilih Area</option>

          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      {/* Rasio */}

      <div>
        <label className="mb-2 block font-medium">Rasio Splitter</label>

        <input
          value={form.rasio ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              rasio: e.target.value,
            })
          }
          className="w-full rounded-xl border p-3"
        />
      </div>

      {/* Passive */}

      <div>
        <label className="mb-2 block font-medium">Passive Splitter</label>

        <input
          value={form.pasiveSpliter ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              pasiveSpliter: e.target.value,
            })
          }
          className="w-full rounded-xl border p-3"
        />
      </div>

      {/* Customer */}

      <CustomerSearch
        selected={selectedCustomers}
        onChange={setSelectedCustomers}
      />

      {/* Tombol */}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl border px-6 py-3"
        >
          Batal
        </button>

        <button
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-3 text-white"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
