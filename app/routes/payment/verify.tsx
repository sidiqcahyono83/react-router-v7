import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { getAllPayments, verifyPayment } from "~/api/payment";

const API_URL = import.meta.env.VITE_API_URL;

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

interface VerifyCardProps {
  payment: any;
  onDone: () => void;
}

function VerifyCard({ payment, onDone }: VerifyCardProps) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"" | "APPROVED" | "REJECTED">("");
  const [error, setError] = useState("");

  const act = async (status: "APPROVED" | "REJECTED") => {
    const label = status === "APPROVED" ? "menerima" : "menolak";
    if (!window.confirm(`Yakin ingin ${label} pembayaran ini?`)) return;

    setBusy(status);
    setError("");

    try {
      await verifyPayment(payment.id, {
        status,
        note: note.trim() || undefined,
      });
      onDone();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal verifikasi pembayaran."
      );
    } finally {
      setBusy("");
    }
  };

  const attachment = Array.isArray(payment.attachments)
    ? payment.attachments[0]
    : undefined;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold">{payment.invoice?.invoiceNumber ?? "-"}</p>
          <p className="text-sm text-slate-500">
            {payment.customer?.fullname ?? "-"}
          </p>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500">Jumlah</p>
          <p className="font-bold">{rupiah(Number(payment.amount) || 0)}</p>
        </div>
        <div>
          <p className="text-slate-500">Metode</p>
          <p className="font-bold">{payment.method ?? "-"}</p>
        </div>
      </div>

      {attachment && (
        <a
          href={`${API_URL}${attachment.url}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
        >
          <ExternalLink size={15} /> Lihat Bukti Transfer
        </a>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Catatan verifikasi (opsional)..."
        className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => act("APPROVED")}
          disabled={busy !== ""}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "APPROVED" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <CheckCircle2 size={15} />
          )}
          Terima
        </button>

        <button
          onClick={() => act("REJECTED")}
          disabled={busy !== ""}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "REJECTED" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <XCircle size={15} />
          )}
          Tolak
        </button>
      </div>
    </div>
  );
}

export default function VerifyPayment() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getAllPayments({ search: debouncedSearch })
      .then((list) => {
        if (!active) return;
        setPayments(
          list.filter(
            (p: any) =>
              String(p.status ?? "").toUpperCase() === "WAITING_VERIFICATION"
          )
        );
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setPayments([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, reloadKey]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/payment"
            className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
            title="Kembali ke Pembayaran"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold">Verifikasi Pembayaran</h1>
            <p className="mt-1 text-sm text-slate-500">
              Tinjau bukti transfer lalu terima atau tolak pembayaran.
            </p>
          </div>
        </div>

        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Pencarian */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama customer / nomor invoice..."
          className="w-full max-w-sm rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
        />
      </div>

      {/* Daftar menunggu verifikasi */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 text-green-400" size={48} />
          <h3 className="text-lg font-semibold">
            Tidak Ada Pembayaran Menunggu Verifikasi
          </h3>
          <p className="mt-2 text-slate-500">
            Semua pembayaran sudah diproses. 🎉
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {payments.map((payment) => (
            <VerifyCard
              key={payment.id}
              payment={payment}
              onDone={() => setReloadKey((k) => k + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
