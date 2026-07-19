import { useState } from "react";
import { useNavigate } from "react-router";
import { createModem } from "~/api/modem";

export default function CreatemodemPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [serial, setSerial] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      await createModem({
        name,
      });

      alert("Modem berhasil ditambahkan");

      navigate("/admin/modem");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Tambah Modem</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-8 shadow"
      >
        <div>
          <label className="mb-2 block font-medium">Nama Modem</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            placeholder="HSGQ-W100"
            required
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">Nama Modem</label>

          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            placeholder="xpom123dasd"
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/modem")}
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
  );
}
