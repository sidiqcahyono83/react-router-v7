import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getPaketId, updatePaket } from "~/api/paket";

export default function PaketEdit() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [form, setForm] = useState<any>();

  useEffect(() => {
    if (id) {
      getPaketId(id).then(setForm);
    }
  }, [id]);

  if (!form) {
    return <div>Loading...</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await updatePaket(id!, form);

      navigate(`/admin/paket/${id}`);
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

      <div>
        <label>Harga</label>

        <textarea
          value={form.harga}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
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
