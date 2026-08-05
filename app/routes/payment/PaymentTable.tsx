import { Banknote, Eye, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { formatTanggal } from "~/types/toIdr";

import type { PaymentItem } from "~/api/payment";
import PaymentStatusBadge from "./PaymentStatusBadge";

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

const METHOD_STYLE: Record<string, string> = {
  CASH: "border-emerald-200 bg-emerald-50 text-emerald-700",
  BANK_TRANSFER: "border-blue-200 bg-blue-50 text-blue-700",
  QRIS: "border-violet-200 bg-violet-50 text-violet-700",
  VA_BCA: "border-cyan-200 bg-cyan-50 text-cyan-700",
  MIDTRANS: "border-orange-200 bg-orange-50 text-orange-700",
};

function MethodBadge({ method }: { method: string }) {
  const m = String(method ?? "").toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${METHOD_STYLE[m] ?? "border-slate-200 bg-slate-50 text-slate-600"
        }`}
    >
      {method ?? "-"}
    </span>
  );
}

interface Props {
  loading: boolean;
  data: PaymentItem[];
  /** Kalau diisi, baris berstatus WAITING_VERIFICATION menampilkan tombol verifikasi */
  onVerify?: (payment: PaymentItem) => void;
}

export default function PaymentTable({ loading, data, onVerify }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <Banknote className="mx-auto mb-4 text-slate-400" size={48} />

        <h3 className="text-lg font-semibold">Data Pembayaran Kosong</h3>

        <p className="mt-2 text-slate-500">
          Belum ada pembayaran yang tercatat.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b bg-green-200">
            <tr className="text-left text-sm font-semibold text-slate-600">
              <th className="px-5 py-4">#</th>
              <th className="px-5 py-4">Invoice</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Metode</th>
              <th className="px-5 py-4">Jumlah</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Tanggal</th>
              <th className="px-5 py-4">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((payment, index) => (
              <tr
                key={payment.id}
                className="border-b transition hover:bg-slate-50"
              >
                <td className="px-5 py-4 font-medium">{index + 1}</td>

                <td className="px-5 py-4">
                  <p className="font-semibold">
                    {payment.invoice?.invoiceNumber ?? "-"}
                  </p>
                  <p className="text-xs text-slate-400">{payment.gateway}</p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-semibold">
                    {payment.customer?.fullname ?? "-"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {payment.customer?.username}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <MethodBadge method={payment.method} />
                </td>

                <td className="px-5 py-4 font-semibold">
                  {rupiah(Number(payment.amount) || 0)}
                </td>

                <td className="px-5 py-4">
                  <PaymentStatusBadge status={payment.status} />
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {payment.createdAt ? formatTanggal(payment.createdAt) : "-"}
                </td>

                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {payment.invoiceId && (
                      <Link
                        to={`/invoice/${payment.invoiceId}`}
                        className="rounded-lg border p-2 text-blue-600 transition hover:bg-blue-50"
                        title="Lihat Invoice"
                      >
                        <Eye size={18} />
                      </Link>
                    )}

                    {onVerify &&
                      String(payment.status ?? "").toUpperCase() ===
                      "WAITING_VERIFICATION" && (
                        <button
                          onClick={() => onVerify(payment)}
                          className="rounded-lg border p-2 text-green-600 transition hover:bg-green-50"
                          title="Verifikasi Pembayaran"
                        >
                          <ShieldCheck size={18} />
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
