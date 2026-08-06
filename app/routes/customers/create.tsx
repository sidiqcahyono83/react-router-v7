import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  UserPlus,
} from "lucide-react";

import { CustomerStatusBadge } from "./CustomerTable";
import { createCustomer, getCustomerId, registerCustomer, updateCustomer } from "~/api/customers";

const STATUS_OPTIONS = ["ACTIVE", "PENDING", "SUSPENDED", "INACTIVE", "DISCONNECTED"];

export default function CreateCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loadingData, setLoadingData] = useState(isEdit);

  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [password, setPassword] = useState("");

  // Mode register (create + PPPoE) — toggle untuk customer baru
  const [withPppoe, setWithPppoe] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Mode edit: muat data
  useEffect(() => {
    if (!id) return;

    getCustomerId(id)
      .then((res) => {
        const c = res?.data ?? res ?? null;
        if (!c) return;

        setUsername(String(c.username ?? ""));
        setFullname(String(c.fullname ?? ""));
        setPhoneNumber(String(c.phoneNumber ?? ""));
        setAddress(String(c.address ?? ""));
        setStatus(String(c.status ?? "PENDING").toUpperCase());
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data.")
      )
      .finally(() => setLoadingData(false));
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (username.trim().length < 3) {
      setError("Username minimal 3 karakter.");
      return;
    }
    if (fullname.trim().length < 3) {
      setError("Nama lengkap minimal 3 karakter.");
      return;
    }
    if (!isEdit && withPppoe && password.length < 4) {
      setError("Password PPPoE minimal 4 karakter.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const base = {
        username: username.trim(),
        fullname: fullname.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        address: address.trim() || undefined,
        status,
      };

      if (isEdit && id) {
        await updateCustomer(id, base);
      } else if (withPppoe) {
        // Create + PPPoE sekaligus
        await registerCustomer({ ...base, password });
      } else {
        await createCustomer(base);
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan customer.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";
  const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/customer"
          className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
          title="Kembali ke Customer"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit Customer" : "Tambah Customer"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "Perbarui data pelanggan."
              : "Daftarkan pelanggan baru — bisa sekalian buat akun PPPoE."}
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
          {/* Username */}
          <div>
            <label className={labelCls}>
              Username <span className="text-red-500">*</span>
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isEdit}
              placeholder="cth: budi01"
              className={`${inputCls} disabled:cursor-not-allowed disabled:bg-slate-100`}
            />
          </div>

          {/* Nama lengkap */}
          <div>
            <label className={labelCls}>
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="cth: Budi Santoso"
              className={inputCls}
            />
          </div>

          {/* Kontak */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>No. HP</label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="cth: 081234567890"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputCls}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="mt-1.5">
                <CustomerStatusBadge status={status} />
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className={labelCls}>Alamat</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="cth: Jl. Merdeka No. 12"
              className={inputCls}
            />
          </div>

          {/* Mode create + PPPoE (hanya untuk customer baru) */}
          {!isEdit && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={withPppoe}
                  onChange={(e) => setWithPppoe(e.target.checked)}
                  className="h-4 w-4 accent-green-600"
                />
                <span className="text-sm font-medium text-green-800">
                  Buat akun PPPoE sekaligus (register)
                </span>
              </label>

              {withPppoe && (
                <div className="mt-3">
                  <label className={labelCls}>
                    Password PPPoE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 4 karakter"
                    className={inputCls}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Akan dikirim ke{" "}
                    <b>POST /customers/register</b> untuk membuat customer +
                    PPP Secret Mikrotik.
                  </p>
                </div>
              )}
            </div>
          )}

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
                  ? "Customer berhasil diperbarui."
                  : withPppoe
                    ? "Customer berhasil dibuat + PPPoE."
                    : "Customer berhasil dibuat."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/admin/customer")}
                className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Lihat Customer
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
                {isEdit ? <Save size={18} /> : <UserPlus size={18} />}
                {isEdit
                  ? "Simpan Perubahan"
                  : withPppoe
                    ? "Daftarkan + PPPoE"
                    : "Buat Customer"}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
