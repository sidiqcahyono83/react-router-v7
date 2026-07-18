import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import PembayaranForm from "~/components/pembayaran/PembayaranForm";

import { createPembayaran } from "~/api/pembayaran";
import { getCustomers } from "~/api/customers";
import type { Customer } from "~/types/typeData";

export default function CreatePembayaran() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const result = await getCustomers({
      page: 1,
      limit: 1000,
      search: "",
    });

    // console.log("RESULT =", result);
    // console.log("KEYS =", Object.keys(result));

    setCustomers(result.data);
  }

  async function handleSubmit(formData: FormData) {
    try {
      setLoading(true);

      await createPembayaran(formData);

      alert("Pembayaran berhasil ditambahkan");

      navigate("/admin/pembayaran");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }
  console.log(customers);
  return (
    <div className="mx-auto max-w-5xl">
      <PembayaranForm
        customers={customers}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
