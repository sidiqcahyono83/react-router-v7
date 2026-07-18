import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import PembayaranForm from "~/components/pembayaran/PembayaranForm";

import { getPembayaranById, updatePembayaran } from "~/api/pembayaran";

import { getCustomers } from "~/api/customers";

export default function EditPembayaran() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState([]);

  const [pembayaran, setPembayaran] = useState<any>();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const customerResult = await getCustomers({
      page: 1,
      limit: 1000,
      search: "",
    });

    setCustomers(customerResult.data);

    const result = await getPembayaranById(id!);

    setPembayaran(result.data);
  }

  async function handleSubmit(formData: FormData) {
    try {
      setLoading(true);

      await updatePembayaran(id!, formData);

      alert("Pembayaran berhasil diubah");

      navigate("/admin/pembayaran");
    } finally {
      setLoading(false);
    }
  }

  if (!pembayaran) return <div>Loading...</div>;

  return (
    <PembayaranForm
      customers={customers}
      defaultValues={pembayaran}
      imageUrl={
        pembayaran.image
          ? `${import.meta.env.VITE_API_URL}${pembayaran.image}`
          : undefined
      }
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
}
