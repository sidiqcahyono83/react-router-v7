import { useState } from "react";
import { useNavigate } from "react-router";

import { createOlt } from "~/api/olt";
import CustomerSearch from "../customers/CustomerSearch";

interface CustomerOption {
  id: string;
  fullname: string;
  username: string;
}

export default function CreateOltPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [serial, setSerial] = useState("");
  const [password, setPassword] = useState("");

  const [selectedCustomers, setSelectedCustomers] = useState<CustomerOption[]>(
    [],
  );

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      await createOlt({
        name,
        username,
        serial,
        password,
        customerIds: selectedCustomers.map((customer) => customer.id),
      });

      alert("OLT berhasil ditambahkan");

      navigate("/admin/olt");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
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
        {/* Nama OLT */}
        <div>
          <label className="mb-2 block font-medium">Nama OLT</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ZTE-C100"
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            disabled={loading}
            required
          />
        </div>

        {/* Username */}
        <div>
          <label className="mb-2 block font-medium">Username</label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Administrator"
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            disabled={loading}
            required
          />
        </div>

        {/* Serial */}
        <div>
          <label className="mb-2 block font-medium">Serial Number</label>

          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="G08XYTRQWE"
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            disabled={loading}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block font-medium">Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            disabled={loading}
            required
          />
        </div>

        {/* Customer */}
        <div>
          <label className="mb-2 block font-medium">
            Customer yang menggunakan OLT
          </label>

          <CustomerSearch
            selected={selectedCustomers}
            onChange={setSelectedCustomers}
          />
        </div>

        {/* Tombol */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/olt")}
            className="rounded-xl border px-6 py-3 hover:bg-gray-100"
            disabled={loading}
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
