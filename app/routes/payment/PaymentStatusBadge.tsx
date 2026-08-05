// Badge status pembayaran — self-contained, tanpa import eksternal
// supaya tidak bentrok dengan file PaymentStatusBadge lain di proyek.

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  SUCCESS: "Berhasil",
  PENDING: "Pending",
  WAITING_VERIFICATION: "Menunggu Verifikasi",
  REJECTED: "Ditolak",
  FAILED: "Gagal",
};

const STATUS_STYLE: Record<string, string> = {
  SUCCESS: "border-green-200 bg-green-100 text-green-700",
  PENDING: "border-amber-200 bg-amber-100 text-amber-700",
  WAITING_VERIFICATION: "border-blue-200 bg-blue-100 text-blue-700",
  REJECTED: "border-red-200 bg-red-100 text-red-700",
  FAILED: "border-red-200 bg-red-100 text-red-700",
};

interface Props {
  status: string;
}

export default function PaymentStatusBadge({ status }: Props) {
  const s = String(status ?? "").toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[s] ?? "border-slate-200 bg-slate-100 text-slate-600"
        }`}
    >
      {PAYMENT_STATUS_LABEL[s] ?? status}
    </span>
  );
}
