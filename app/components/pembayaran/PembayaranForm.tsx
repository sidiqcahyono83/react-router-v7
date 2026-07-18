import { useEffect, useMemo, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { formatIDR } from "~/types/toIdr";
import type { CustomerOption, PembayaranFormData } from "~/types/typeData";

interface Props {
  customers?: any[];
  defaultValues?: any;
  loading?: boolean;
  imageUrl?: string;
  onSubmit: (formData: FormData) => void;
}

export default function PembayaranForm({
  customers = [],
  defaultValues,
  loading = false,
  imageUrl,
  onSubmit,
}: Props) {
  const { user } = useAuth();
  const [customerId, setCustomerId] = useState(defaultValues?.customerId ?? "");
  const [periode, setPeriode] = useState(
    defaultValues?.periode ?? new Date().toISOString().substring(0, 10),
  );
  const [metode, setMetode] = useState(defaultValues?.metode ?? "Transfer BRI");
  const [totalBayar, setTotalBayar] = useState(defaultValues?.totalBayar ?? 0);
  const [image, setImage] = useState<File | null>(null);
  const [additional, setAdditional] = useState(defaultValues?.additional ?? 0);

  const customerList = Array.isArray(customers) ? customers : [];

  const selectedCustomer = useMemo(() => {
    return customerList.find((c) => c.id === customerId) ?? null;
  }, [customerId, customerList]);

  useEffect(() => {
    if (!selectedCustomer) return;

    const harga = Number(selectedCustomer.paket?.harga ?? 0);
    const diskon = Number(selectedCustomer.diskon ?? 0);
    const tambahan = Number(additional || 0);

    setTotalBayar(harga - diskon + tambahan);
  }, [selectedCustomer, additional]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const form = new FormData();

    form.append("userId", user?.id ?? "");
    form.append("customerId", customerId);
    form.append("periode", periode);
    form.append("metode", metode);
    form.append("totalBayar", String(Number(totalBayar)));

    if (image) {
      form.append("image", image);
    }

    await onSubmit(form);
  }

  useEffect(() => {
    if (!defaultValues) return;

    setCustomerId(defaultValues.customerId ?? "");

    setPeriode(
      defaultValues.periode
        ? new Date(defaultValues.periode).toISOString().substring(0, 10)
        : new Date().toISOString().substring(0, 10),
    );

    setMetode(defaultValues.metode ?? "Transfer BRI");

    setTotalBayar(Number(defaultValues.totalBayar ?? 0));
  }, [defaultValues]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-white p-8 shadow"
    >
      {/* <pre>{JSON.stringify(customers, null, 2)}</pre> */}
      <h2 className="text-2xl font-bold">Form Pembayaran</h2>

      {/* Customer */}

      <div>
        <label className="mb-2 block font-medium">Customer</label>

        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full rounded-xl border p-3"
          required
        >
          <option value="">Pilih Customer</option>
          {customerList.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.fullname}
            </option>
          ))}
        </select>
      </div>

      {/* Paket */}

      {/* {selectedCustomer && (
        <div className="rounded-xl bg-slate-50 p-4">
          <p>
            <strong>Paket :</strong> {selectedCustomer.paket?.name}
          </p>

          <p>
            <strong>Harga :</strong> Rp{" "}
            {selectedCustomer.paket?.harga.toLocaleString("id-ID")}
          </p>

          <p>
            <strong>Diskon :</strong> Rp{" "}
            {selectedCustomer.diskon.toLocaleString("id-ID")}
          </p>
        </div>
      )} */}

      {/* Periode */}

      <div>
        <label className="mb-2 block font-medium">Periode</label>

        <input
          type="date"
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="w-full rounded-xl border p-3"
        />
      </div>

      {/* Metode */}

      <div>
        <label className="mb-2 block font-medium">Metode Pembayaran</label>

        <select
          value={metode}
          onChange={(e) => setMetode(e.target.value)}
          className="w-full rounded-xl border p-3"
        >
          <option>Transfer BRI</option>
          <option>Transfer BCA</option>
          <option>Transfer Mandiri</option>
          <option>Cash</option>
          <option>QRIS</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block font-medium">Additional</label>
        <input
          type="text"
          inputMode="numeric"
          value={additional}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d]/g, "");
            setAdditional(value);
          }}
          className="w-full rounded-xl border p-3"
          placeholder="0"
        />

        <p className="mt-1 text-sm text-slate-500">
          Tambahan biaya instalasi, denda, administrasi, dll.
        </p>
      </div>

      {selectedCustomer && (
        <div className="rounded-xl bg-slate-50 p-4 space-y-2">
          <div className="flex justify-between">
            <span>Harga Paket</span>
            <span>
              Rp {selectedCustomer.paket?.harga.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Diskon</span>
            <span>- Rp {selectedCustomer.diskon.toLocaleString("id-ID")}</span>
          </div>

          <div className="flex justify-between">
            <span>Additional</span>
            <span>+ Rp {additional.toLocaleString("id-ID")}</span>
          </div>

          <hr />

          <div className="flex justify-between text-lg font-bold text-blue-600">
            <span>Total</span>
            <span>Rp {totalBayar.toLocaleString("id-ID")}</span>
          </div>
        </div>
      )}

      {/* Total */}

      <div>
        <label className="mb-2 block font-medium">Total Bayar</label>

        <input
          type="number"
          value={totalBayar.toLocaleString("id-ID")}
          readOnly
          onChange={(e) => setTotalBayar(Number(e.target.value))}
          className="w-full rounded-xl border p-3"
        />
      </div>

      {/* Upload */}

      <div>
        <label className="mb-2 block font-medium">Bukti Pembayaran</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="w-full rounded-xl border p-3"
        />
      </div>

      {/* Preview */}

      {(image || imageUrl) && (
        <div>
          <label className="mb-2 block font-medium">Preview</label>

          <img
            src={image ? URL.createObjectURL(image) : imageUrl}
            className="max-h-72 rounded-xl border"
          />
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" className="rounded-xl border px-6 py-3">
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
