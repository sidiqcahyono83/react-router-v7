import { useState } from "react";
import { useNavigate } from "react-router";

import { createPaket } from "~/api/paket";

export default function CreatePaketPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [harga, setHarga] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      await createPaket({
        name,
        harga: Number(harga),
      });

      alert("Paket berhasil ditambahkan");

      navigate("/admin/paket");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Tambah Paket</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-8 shadow"
      >
        <div>
          <label className="mb-2 block font-medium">Nama Paket</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            placeholder="Unlimited 35 Mbps"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Harga</label>

          <input
            type="text"
            inputMode="numeric"
            value={Number(harga || 0).toLocaleString("id-ID")}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\./g, "")
                .replace(/[^\d]/g, "");

              setHarga(value);
            }}
            className="w-full rounded-xl border p-3"
            placeholder="0"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/paket")}
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
