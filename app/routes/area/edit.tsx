import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getAreaId, updateArea } from "~/api/area";

export default function AreaEdit() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [form, setForm] = useState<any>();

  useEffect(() => {
    if (id) {
      getAreaId(id).then(setForm);
    }
  }, [id]);

  if (!form) {
    return <div>Loading...</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await updateArea(id!, form);

      navigate(`/admin/area/${id}`);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl bg-white p-6 shadow"
    >
      <h1 className="text-3xl font-bold">Edit Paket</h1>

      <div>
        <label>Nama</label>

        <input
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          className="mt-2 w-full rounded-lg border p-3"
        />
      </div>

      <button className="rounded-lg bg-blue-600 px-5 py-3 text-white">
        Simpan
      </button>
    </form>
  );
}
