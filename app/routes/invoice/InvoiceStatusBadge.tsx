// Badge status invoice — self-contained, dipakai di detail & edit.

const STATUS_LABEL: Record<string, string> = {
  PAID: "Lunas",
  UNPAID: "Belum Dibayar",
  PENDING: "Pending",
  PARTIAL: "Dibayar Sebagian",
  EXPIRED: "Expired / Jatuh Tempo",
  CANCELLED: "Dibatalkan",
};

const STATUS_STYLE: Record<string, string> = {
  PAID: "border-green-200 bg-green-100 text-green-700",
  UNPAID: "border-amber-200 bg-amber-100 text-amber-700",
  PENDING: "border-blue-200 bg-blue-100 text-blue-700",
  PARTIAL: "border-violet-200 bg-violet-100 text-violet-700",
  EXPIRED: "border-red-200 bg-red-100 text-red-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-600",
};

interface Props {
  status?: string | null;
}

export default function InvoiceStatusBadge({ status }: Props) {
  const s = String(status ?? "").toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[s] ?? "border-slate-200 bg-slate-100 text-slate-600"
        }`}
    >
      {STATUS_LABEL[s] ?? status ?? "-"}
    </span>
  );
}
