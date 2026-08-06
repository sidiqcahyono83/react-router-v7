import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  TrendingDown,
} from "lucide-react";
import {
  createPengeluaran,
  getPengeluaranId,
  updatePengeluaran,
} from "~/api/pengeluaran";

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

// Saran kategori (backend menerima string bebas)
const KATEGORI_SUGGESTIONS = [
  "Operasional Kantor",
  "Listrik & Utilitas",
  "Internet",
  "Perawatan Jaringan",
  "Gaji Karyawan",
  "Transportasi",
  "Marketing / Promosi",
  "Lainnya",
];

/** Ubah tanggal (ISO) jadi format yyyy-mm-dd untuk input type=date */
function toDateInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CreatePengeluaran() {
  const navigate = useNavigate();
  // Route /admin/pengeluaran/create/:id? — kalau ada id → mode edit
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loadingData, setLoadingData] = useState(isEdit);

  const [totalKeluar, setTotalKeluar] = useState("");
  const [kategori, setKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState(() => {
    const d = new Date();
    return toDateInput(d.toISOString()) || "";
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Mode edit: muat data lama
  useEffect(() => {
    if (!id) return;

    getPengeluaranId(id)
      .then((res) => {
        const p = res?.data ?? res ?? null;
        if (!p) return;

        setTotalKeluar(String(Number(p.totalKeluar) || ""));
        setKategori(String(p.kategori ?? ""));
        setDeskripsi(String(p.deskripsi ?? ""));
        setTanggal(toDateInput(p.tanggal));
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data.")
      )
      .finally(() => setLoadingData(false));
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nominal = Number(totalKeluar);

    if (!nominal || nominal <= 0) {
      setError("Total pengeluaran wajib diisi dan lebih dari 0.");
      return;
    }

    if (!kategori.trim()) {
      setError("Kategori wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const payload = {
        totalKeluar: nominal,
        kategori: kategori.trim(),
        deskripsi: deskripsi.trim() || undefined,
        tanggal: tanggal ? new Date(`${tanggal}T00:00:00`).toISOString() : undefined,
      };

      if (isEdit && id) {
        await updatePengeluaran(id, payload);
      } else {
        await createPengeluaran(payload);
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pengeluaran.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200";
  const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/pengeluaran"
          className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
          title="Kembali ke Pengeluaran"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pengeluaran otomatis mengurangi saldo di Buku Kas.
          </p>
        </div>
      </div>

      {loadingData ? (
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
        >
          {/* Total */}
          <div>
            <label className={labelCls}>
              Total Pengeluaran <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={totalKeluar}
              onChange={(e) => setTotalKeluar(e.target.value)}
              placeholder="cth: 150000"
              className={inputCls}
            />
            {totalKeluar && Number(totalKeluar) > 0 && (
              <p className="mt-1 text-sm font-semibold text-red-600">
                - {rupiah(Number(totalKeluar))}
              </p>
            )}
          </div>

          {/* Kategori */}
          <div>
            <label className={labelCls}>
              Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              placeholder="cth: Operasional Kantor"
              list="kategori-suggestions"
              className={inputCls}
            />
            <datalist id="kategori-suggestions">
              {KATEGORI_SUGGESTIONS.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {KATEGORI_SUGGESTIONS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKategori(k)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${kategori === k
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-red-50 hover:text-red-600 hover:ring-red-300"
                    }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className={labelCls}>Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={3}
              placeholder='cth: "Pembelian alat tulis kantor (ATK)"'
              className={inputCls}
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className={labelCls}>Tanggal (opsional)</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className={`${inputCls} [scheme:light]`}
            />
            <p className="mt-1 text-xs text-slate-400">
              Kosongkan untuk memakai tanggal hari ini.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <TrendingDown size={16} className="mt-0.5 shrink-0" />
            <p>
              Pengeluaran akan tercatat di <b>Buku Kas</b> — totalKeluar
              bertambah dan <b>saldo akhir berkurang</b>. Pastikan saldo
              mencukupi.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-green-700">
                <CheckCircle2 size={16} />
                {isEdit
                  ? "Pengeluaran berhasil diperbarui."
                  : "Pengeluaran berhasil dicatat."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/admin/pengeluaran")}
                className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Lihat Pengeluaran
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEdit ? "Simpan Perubahan" : "Simpan Pengeluaran"}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
