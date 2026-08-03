import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getInvoiceId, updateInvoice } from "~/api/invoice";
export default function InvoiceEdit() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [form, setForm] = useState<any>();

  useEffect(() => {
    if (id) {
      getInvoiceId(id).then(setForm);
    }
  }, [id]);

  if (!form) {
    return <div>Loading...</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await updateInvoice(id!, form);

      navigate(`/admin/invoice/${id}`);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl bg-white p-6 shadow"
    >
      <h1 className="text-3xl font-bold">Edit Invoice</h1>

      <div>
        <label>No Invoice</label>

        <input
          value={form.invoiceNumber}
          onChange={(e) =>
            setForm({
              ...form,
              customer: {
                ...form.customer,
                fullname: e.target.value,
              },
            })
          }
          className="mt-2 w-full rounded-lg border p-3"
        />
      </div>
      <div>
        <label>Nama</label>

        <input
          value={form.serial}
          onChange={(e) =>
            setForm({
              ...form,
              serial: e.target.value,
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
