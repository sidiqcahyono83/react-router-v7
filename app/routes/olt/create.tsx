import { useState } from "react";
import { useNavigate } from "react-router";
import { createOlt } from "~/api/olt";
import CustomerSearch from "../customers/CustomerSearch";

export default function CreateOltPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [serial, setSerial] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      await createOlt({
        name: name,
        username: username,
        serial: serial,
        password: password,
       
      });

      alert("OLT berhasil ditambahkan");

      navigate("/admin/olt");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Tambah OLT</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-8 shadow"
      >
        <div>
          <label className="mb-2 block font-medium">Nama OLT</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            placeholder="ZTE-C100"
            required
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">Username</label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            placeholder="Administrator"
            required
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">Serial</label>

          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            placeholder="G08XYTRQWE"
            required
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">Password</label>

          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            placeholder="Password"
            required
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
            onClick={() => navigate("/admin/olt")}
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
