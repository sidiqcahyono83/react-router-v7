import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import { getInvoiceId, updateInvoice, type OltPayload } from "~/api/invoice";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const STATUS_OPTIONS = [
  "UNPAID",
  "PAID",
  "PENDING",
  "PARTIAL",
  "EXPIRED",
  "CANCELLED",
];

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

/** Ubah tanggal (ISO / Date) jadi format yyyy-mm-dd untuk input type=date */
function toDateInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface FormState {
  status: string;
  bulan: number;
  tahun: number;
  dueDate: string;
  subtotal: number;
  diskon: number;
  pajak: number;
  paidAt: string;
}

export default function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState<FormState>({
    status: "UNPAID",
    bulan: 1,
    tahun: new Date().getFullYear(),
    dueDate: "",
    subtotal: 0,
    diskon: 0,
    pajak: 0,
    paidAt: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    getInvoiceId(id)
      .then((res) => {
        const inv = res?.data ?? res ?? null;
        setInvoice(inv);

        if (inv) {
          setForm({
            status: String(inv.status ?? "UNPAID"),
            bulan: Number(inv.bulan ?? new Date().getMonth() + 1),
            tahun: Number(inv.tahun ?? new Date().getFullYear()),
            dueDate: toDateInput(inv.dueDate),
            subtotal: Number(inv.subtotal ?? 0),
            diskon: Number(inv.diskon ?? 0),
            pajak: Number(inv.pajak ?? 0),
            paidAt: toDateInput(inv.paidAt),
          });
        }
      })
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Gagal memuat invoice.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  // Total dihitung otomatis: subtotal - diskon + pajak
  const total = Math.max(0, form.subtotal - form.diskon + form.pajak);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleNumberChange = (name: keyof FormState) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setForm((f) => ({ ...f, [name]: Number(e.target.value) || 0 }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!invoice) return;

    if (!form.dueDate) {
      setError("Tanggal jatuh tempo wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const payload: OltPayload = {
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId ?? null,
        periode: new Date(`${form.dueDate}T00:00:00`),
        bulan: Number(form.bulan),
        tahun: Number(form.tahun),
        subtotal: Number(form.subtotal),
        diskon: Number(form.diskon),
        total,
        dueDate: new Date(`${form.dueDate}T00:00:00`),
        status: form.status,
        paidAt:
          form.status === "PAID"
            ? form.paidAt
              ? new Date(`${form.paidAt}T00:00:00`)
              : new Date()
            : null,
      };

      await updateInvoice(invoice.id, payload);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan invoice."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">Invoice Tidak Ditemukan</h3>
        <p className="mt-2 text-slate-500">
          {loadError || "Data invoice tidak tersedia."}
        </p>
        <Link
          to="/admin/invoice"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Invoice
        </Link>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";
  const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/admin/invoice/${invoice.id}`}
          className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
          title="Kembali ke Detail Invoice"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Edit Invoice</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            {invoice.invoiceNumber}
            <InvoiceStatusBadge status={invoice.status} />
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
      >
        {/* Status */}
        <div>
          <label className={labelCls}>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputCls}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <InvoiceStatusBadge status={form.status} />
          </div>
        </div>

        {/* Periode */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Bulan</label>
            <select
              name="bulan"
              value={form.bulan}
              onChange={handleChange}
              className={inputCls}
            >
              {BULAN_NAMES.map((nama, i) => (
                <option key={i + 1} value={i + 1}>
                  {nama} ({i + 1})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Tahun</label>
            <input
              type="number"
              name="tahun"
              min={2020}
              max={2100}
              value={form.tahun}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
        </div>

        {/* Jatuh tempo & tanggal bayar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>
              Jatuh Tempo <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          {form.status === "PAID" && (
            <div>
              <label className={labelCls}>Tanggal Dibayar (opsional)</label>
              <input
                type="date"
                name="paidAt"
                value={form.paidAt}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          )}
        </div>

        {/* Rincian tagihan */}
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Rincian Tagihan
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Subtotal</label>
              <input
                type="number"
                min={0}
                value={form.subtotal}
                onChange={handleNumberChange("subtotal")}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Diskon</label>
              <input
                type="number"
                min={0}
                value={form.diskon}
                onChange={handleNumberChange("diskon")}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Pajak</label>
              <input
                type="number"
                min={0}
                value={form.pajak}
                onChange={handleNumberChange("pajak")}
                className={inputCls}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">
              Total (otomatis)
            </span>
            <span className="text-lg font-bold text-green-700">
              {rupiah(total)}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 size={16} /> Perubahan berhasil disimpan.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/admin/invoice/${invoice.id}`)}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Lihat Detail
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Save size={18} /> Simpan Perubahan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
