import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  FileUp,
  Info,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { createPaymentCash, createPaymentManual, getAllInvoices } from "~/api/payment";
import PaymentStatusBadge from "./PaymentStatusBadge";

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB (sesuai backend)
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

// Metode pembayaran MANUAL:
// - CASH          → langsung lunas, TANPA upload bukti
// - BANK_TRANSFER → transfer manual, WAJIB upload bukti (menunggu verifikasi)
const METHODS = [
  {
    value: "CASH",
    label: "Tunai (Cash)",
    desc: "Langsung lunas — tidak perlu upload bukti",
  },
  {
    value: "BANK_TRANSFER",
    label: "Transfer Bank Manual",
    desc: "Wajib upload bukti transfer — menunggu verifikasi admin",
  },
];

interface InvoiceOption {
  id: string;
  invoiceNumber: string;
  total?: number | null;
  bulan?: number | null;
  tahun?: number | null;
  status?: string | null; // UNPAID / PAID / EXPIRED / dll (dipakai untuk filter)
  customer?: { fullname?: string; username?: string } | null;
}

interface CreateResult {
  message: string;
  payment?: { id: string; status: string } | null;
}

export default function CreatePayment() {
  const navigate = useNavigate();
  // Route /admin/payment/create/:invoiceId — invoice sudah ditentukan dari URL
  const { invoiceId: invoiceIdParam } = useParams();

  // ---------- Pencarian & pemilihan invoice ----------
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceId, setInvoiceId] = useState("");
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceOption | null>(null);
  // Pesan kalau invoice dari URL tidak ditemukan di daftar UNPAID
  const [paramNote, setParamNote] = useState("");
  // Saat datang dari detail invoice: pilihan dikunci (bisa dibuka lewat "Ganti Invoice")
  const [showPicker, setShowPicker] = useState(false);

  // ---------- Metode & file ----------
  const [method, setMethod] = useState("CASH");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CreateResult | null>(null);

  const isCash = method === "CASH";

  // Muat ulang daftar invoice UNPAID (loop semua halaman, tidak dibatasi).
  const loadInvoices = () => {
    setLoadingInvoices(true);
    setParamNote("");

    getAllInvoices({ status: "UNPAID" })
      .then((list) => {
        // Filter client-side juga — jaga-jaga kalau backend tidak
        // menerapkan query ?status= (mis. masih ada invoice PAID masuk).
        const unpaid = (list as InvoiceOption[]).filter(
          (inv) => String(inv.status ?? "").toUpperCase() === "UNPAID"
        );

        setInvoices(unpaid);

        // Invoice dari URL (?invoiceId) → otomatis dipilih kalau masih UNPAID
        if (invoiceIdParam) {
          const target = unpaid.find((i) => i.id === invoiceIdParam);

          if (target) {
            setInvoiceId(target.id);
            setSelectedInvoice(target);
          } else {
            setInvoiceId("");
            setSelectedInvoice(null);
            setParamNote(
              "Invoice ini tidak ditemukan di daftar UNPAID — mungkin sudah lunas atau sudah dibayar. Silakan pilih invoice lain."
            );
          }
        } else {
          // Kalau invoice terpilih ternyata tidak ada lagi di daftar
          // (sudah lunas / tidak valid), kosongkan pilihan.
          if (
            selectedInvoice &&
            !unpaid.some((i) => i.id === selectedInvoice.id)
          ) {
            setInvoiceId("");
            setSelectedInvoice(null);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setInvoices([]);
      })
      .finally(() => setLoadingInvoices(false));
  };

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceIdParam]);

  // Filter hasil pencarian: nomor invoice / nama customer / username
  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return invoices;

    return invoices.filter(
      (inv) =>
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.customer?.fullname?.toLowerCase().includes(q) ||
        inv.customer?.username?.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const selectInvoice = (inv: InvoiceOption) => {
    setInvoiceId(inv.id);
    setSelectedInvoice(inv);
    // Kalau datang dari URL invoice, langsung kunci kembali pilihannya
    if (invoiceIdParam) setShowPicker(false);
  };

  const clearSelection = () => {
    setInvoiceId("");
    setSelectedInvoice(null);
    if (invoiceIdParam) setShowPicker(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFileError("");

    if (!f) {
      setFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError("Format file harus JPG, PNG, atau PDF.");
      setFile(null);
      return;
    }

    if (f.size > MAX_FILE_SIZE) {
      setFileError("Ukuran file maksimal 3 MB.");
      setFile(null);
      return;
    }

    setFile(f);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!invoiceId || !selectedInvoice) {
      setError("Pilih invoice terlebih dahulu.");
      return;
    }

    if (!isCash && !file) {
      setError("Metode transfer wajib menyertakan bukti transfer.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      let res;

      if (isCash) {
        // CASH → POST /payment (JSON, tanpa file)
        res = await createPaymentCash({ invoiceId, method });
      } else {
        // TRANSFER MANUAL → POST /payment/manual/attachment (multipart + file bukti)
        res = await createPaymentManual({ invoiceId, method, file });
      }

      setResult({
        message: res?.message ?? "Pembayaran berhasil dibuat.",
        payment: res?.data ?? null,
      });

      // Invoice yang baru dibayar tidak lagi UNPAID —
      // keluarkan dari daftar supaya tidak bisa dipilih lagi.
      setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
      setInvoiceId("");
      setSelectedInvoice(null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal membuat pembayaran.";
      setError(msg);

      // Invoice ternyata sudah lunas / punya pembayaran berjalan →
      // segarkan daftar biar invoice itu tidak muncul lagi.
      if (/sudah dibayar|diproses|tidak ditemukan/i.test(msg)) {
        setInvoiceId("");
        setSelectedInvoice(null);
        loadInvoices();
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError("");
    setFile(null);
    setFileError("");
    setSearch("");
    clearSelection();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={
            invoiceIdParam
              ? `/admin/invoice/${invoiceIdParam}`
              : "/admin/payment"
          }
          className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
          title={
            invoiceIdParam
              ? "Kembali ke Detail Invoice"
              : "Kembali ke Pembayaran"
          }
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Buat Pembayaran</h1>
          <p className="mt-1 text-sm text-slate-500">
            Catat pembayaran invoice secara manual.
          </p>
        </div>
      </div>

      {/* Banner: pembayaran untuk invoice tertentu (dari URL) */}
      {invoiceIdParam && selectedInvoice && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <span className="rounded-lg bg-green-600 p-2">
            <Wallet className="text-white" size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-green-700">
              Pembayaran untuk invoice
            </p>
            <p className="truncate font-bold text-green-900">
              {selectedInvoice.invoiceNumber} —{" "}
              {selectedInvoice.customer?.fullname ?? "-"}
            </p>
            <p className="text-sm text-green-700">
              {rupiah(Number(selectedInvoice.total) || 0)} · Periode{" "}
              {selectedInvoice.bulan}/{selectedInvoice.tahun}
            </p>
          </div>
        </div>
      )}

      {invoiceIdParam && paramNote && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {paramNote}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
      >
        {/* Pencarian & pemilihan invoice */}
        <div>
          {/* Mode terkunci: invoice sudah ditentukan dari URL (detail invoice) */}
          {invoiceIdParam && selectedInvoice && !showPicker ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-green-700">
                    Invoice untuk pembayaran (dari halaman invoice)
                  </p>
                  <p className="truncate font-bold text-green-900">
                    {selectedInvoice.invoiceNumber} —{" "}
                    {selectedInvoice.customer?.fullname ?? "-"}
                  </p>
                  <p className="text-sm text-green-700">
                    {rupiah(Number(selectedInvoice.total) || 0)} · Periode{" "}
                    {selectedInvoice.bulan}/{selectedInvoice.tahun}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="shrink-0 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100"
                >
                  Ganti Invoice
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Cari Invoice / Customer
                </label>

                <button
                  type="button"
                  onClick={loadInvoices}
                  disabled={loadingInvoices}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-green-700 disabled:opacity-50"
                  title="Muat ulang daftar invoice"
                >
                  <RefreshCw
                    size={13}
                    className={loadingInvoices ? "animate-spin" : ""}
                  />
                  Muat ulang
                </button>
              </div>

              {/* Kolom pencarian */}
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ketik nomor invoice atau nama customer..."
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    title="Bersihkan pencarian"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Invoice terpilih */}
              {selectedInvoice && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-green-700">
                      Invoice terpilih
                    </p>
                    <p className="truncate font-bold text-green-900">
                      {selectedInvoice.invoiceNumber} —{" "}
                      {selectedInvoice.customer?.fullname ?? "-"}
                    </p>
                    <p className="text-sm text-green-700">
                      {rupiah(Number(selectedInvoice.total) || 0)} · Periode{" "}
                      {selectedInvoice.bulan}/{selectedInvoice.tahun}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearSelection}
                    className="shrink-0 rounded-lg border border-green-300 bg-white p-1.5 text-green-700 transition hover:bg-green-100"
                    title="Batal pilih invoice"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Daftar hasil pencarian */}
              {loadingInvoices ? (
                <div className="mt-3 flex h-12 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-400">
                  <Loader2 size={15} className="animate-spin" /> Memuat invoice...
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  {search.trim()
                    ? "Tidak ada invoice yang cocok dengan pencarian."
                    : "Tidak ada invoice berstatus UNPAID."}{" "}
                  <Link to="/admin/invoice" className="font-semibold underline">
                    Lihat daftar invoice
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {search.trim()
                        ? `${filteredInvoices.length} hasil dari ${invoices.length} invoice UNPAID`
                        : `${invoices.length} invoice UNPAID`}
                    </span>
                    <span>Klik untuk memilih</span>
                  </div>

                  <ul className="mt-1.5 max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                    {filteredInvoices.map((inv) => {
                      const selected = inv.id === invoiceId;

                      return (
                        <li key={inv.id}>
                          <button
                            type="button"
                            onClick={() => selectInvoice(inv)}
                            className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition ${selected ? "bg-green-50" : "hover:bg-slate-50"
                              }`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-slate-700">
                                {inv.invoiceNumber}
                              </span>
                              <span className="block truncate text-xs text-slate-500">
                                {inv.customer?.fullname ?? "-"} · Periode{" "}
                                {inv.bulan}/{inv.tahun}
                              </span>
                            </span>

                            <span className="flex shrink-0 items-center gap-2">
                              <span className="font-semibold text-slate-700">
                                {rupiah(Number(inv.total) || 0)}
                              </span>
                              {selected ? (
                                <CheckCircle2 size={18} className="text-green-600" />
                              ) : (
                                <span className="h-4 w-4 rounded-full border-2 border-slate-300" />
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </>
          )}
        </div>

        {/* Metode pembayaran */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {METHODS.map((m) => {
              const active = method === m.value;

              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    setMethod(m.value);
                    // Pindah metode -> hapus file yang sudah dipilih (CASH tidak butuh bukti)
                    setFile(null);
                    setFileError("");
                  }}
                  className={`rounded-xl border p-4 text-left transition ${active
                    ? "border-green-600 bg-green-50 ring-2 ring-green-200"
                    : "border-slate-300 bg-white hover:border-green-300 hover:bg-green-50/50"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-green-600" : "border-slate-300"
                        }`}
                    >
                      {active && (
                        <span className="h-2 w-2 rounded-full bg-green-600" />
                      )}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {m.label}
                    </span>
                  </span>
                  <span className="mt-1.5 block pl-6 text-xs text-slate-500">
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Info: CASH tidak perlu bukti transfer */}
          {isCash && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 size={15} className="shrink-0" />
              Pembayaran tunai tidak memerlukan unggahan bukti.
            </div>
          )}
        </div>

        {/* Upload bukti transfer (HANYA jika bukan CASH) */}
        {!isCash && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Bukti Transfer <span className="text-red-500">*</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm transition hover:border-green-400 hover:bg-green-50">
              <FileUp size={20} className="shrink-0 text-slate-400" />

              <div className="min-w-0">
                {file ? (
                  <p className="truncate font-medium text-slate-700">
                    {file.name}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </p>
                ) : (
                  <p className="text-slate-500">
                    Klik untuk pilih file — JPG, PNG, atau PDF (maks. 3 MB)
                  </p>
                )}
              </div>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {fileError && (
              <p className="mt-1.5 text-sm text-red-600">{fileError}</p>
            )}
          </div>
        )}

        {/* Info alur */}
        <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            {isCash
              ? "CASH dikirim ke POST /payment (JSON, tanpa file) — langsung tercatat LUNAS, masuk Pendapatan & Buku Kas, dan status customer diaktifkan."
              : "Transfer manual: bukti transfer diupload, pembayaran masuk status \"Menunggu Verifikasi\". Admin harus memverifikasi di halaman Verifikasi sebelum invoice dianggap lunas."}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || loadingInvoices || filteredInvoices.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Memproses...
            </>
          ) : (
            "Simpan Pembayaran"
          )}
        </button>
      </form>

      {/* Hasil */}
      {result && (
        <div className="space-y-4 rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-green-600 p-2">
              <CheckCircle2 className="text-white" size={22} />
            </span>
            <div>
              <h2 className="font-bold text-green-800">{result.message}</h2>
              {result.payment && (
                <div className="mt-1">
                  <PaymentStatusBadge status={result.payment.status} />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetForm}
              className="rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
            >
              Buat Lagi
            </button>

            {result.payment?.status === "WAITING_VERIFICATION" && (
              <button
                onClick={() => navigate("/admin/payment/verify")}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                <ShieldCheck size={16} /> Verifikasi Sekarang
              </button>
            )}

            <button
              onClick={() => navigate("/admin/payment")}
              className="flex items-center gap-2 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
            >
              <Wallet size={16} /> Lihat Daftar Pembayaran
            </button>

            {invoiceIdParam && (
              <button
                onClick={() => navigate(`/admin/invoice/${invoiceIdParam}`)}
                className="flex items-center gap-2 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
              >
                <ArrowLeft size={16} /> Kembali ke Invoice
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
