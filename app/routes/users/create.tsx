import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
  UserPlus,
} from "lucide-react";
import {
  createUser,
  getAreas,
  getUsers,
  updateUser,
  type AreaItem,
} from "~/api/user";
import { LevelBadge } from "./UserTable";

const LEVEL_OPTIONS = ["ADMIN", "SUPER_ADMIN", "STAFF"];

export default function CreateUser() {
  const navigate = useNavigate();
  // Route /admin/user/create/:id? — kalau ada id → mode edit
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loadingData, setLoadingData] = useState(isEdit);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [level, setLevel] = useState("STAFF");
  const [password, setPassword] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Muat daftar area
  const loadAreas = () => {
    setAreasLoading(true);
    getAreas()
      .then((list) => setAreas(list))
      .catch(() => setAreas([]))
      .finally(() => setAreasLoading(false));
  };

  useEffect(() => {
    loadAreas();
  }, []);

  // Mode edit: muat data user (backend tidak punya GET /user/:id,
  // jadi ambil dari list lalu cari berdasarkan id)
  useEffect(() => {
    if (!id) return;

    getUsers()
      .then((res) => {
        const raw = res?.users ?? res?.data ?? [];
        const list = Array.isArray(raw) ? raw : [];
        const user = list.find((u: any) => u.id === id);

        if (!user) {
          setError("User tidak ditemukan.");
          return;
        }

        setUsername(String(user.username ?? ""));
        setFullname(String(user.fullname ?? ""));
        setPhoneNumber(String(user.phoneNumber ?? ""));
        setAddress(String(user.address ?? ""));
        setLevel(String(user.level ?? "STAFF").toUpperCase());
        setSelectedAreas((user.areas ?? []).map((a: any) => a.id));
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data user.")
      )
      .finally(() => setLoadingData(false));
  }, [id]);

  const toggleArea = (areaId: string) => {
    setSelectedAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((a) => a !== areaId)
        : [...prev, areaId]
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isEdit) {
      if (username.trim().length < 4) {
        setError("Username minimal 4 karakter.");
        return;
      }
      if (password.length < 4) {
        setError("Password minimal 4 karakter.");
        return;
      }
      if (fullname.trim().length < 4) {
        setError("Nama lengkap minimal 4 karakter.");
        return;
      }
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      if (isEdit && id) {
        await updateUser(id, {
          password: password || undefined,
          areaIds: selectedAreas,
          phoneNumber: phoneNumber || undefined,
          address: address || undefined,
          level,
        });
      } else {
        await createUser({
          username: username.trim(),
          fullname: fullname.trim(),
          password,
          level,
          address: address.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          areaIds: selectedAreas,
        });
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan user.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
  const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/user"
          className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
          title="Kembali ke Manajemen User"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit User" : "Tambah User"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "Perbarui data user — password boleh dikosongkan jika tidak diganti."
              : "Buat akun baru untuk admin / staff."}
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
          {/* Username + Level */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>
                Username {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isEdit}
                placeholder="cth: admin1"
                className={`${inputCls} disabled:cursor-not-allowed disabled:bg-slate-100`}
              />
            </div>

            <div>
              <label className={labelCls}>Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className={inputCls}
              >
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <div className="mt-1.5">
                <LevelBadge level={level} />
              </div>
            </div>
          </div>

          {/* Nama lengkap */}
          <div>
            <label className={labelCls}>
              Nama Lengkap {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="cth: Cahyono Muslim Sidiq"
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
              <label className={labelCls}>
                Password{" "}
                {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Kosongkan jika tidak diganti" : "Min. 4 karakter"}
                className={inputCls}
              />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className={labelCls}>Alamat</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="cth: Jl. Merdeka No. 12, Kebumen"
              className={inputCls}
            />
          </div>

          {/* Area */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Area (opsional)
                {areas.length > 0 && (
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                    {areas.length} area
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={loadAreas}
                disabled={areasLoading}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:opacity-50"
              >
                <RefreshCw size={12} className={areasLoading ? "animate-spin" : ""} />
                Muat ulang
              </button>
            </div>

            {areasLoading ? (
              <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-400">
                <Loader2 size={15} className="animate-spin" /> Memuat area...
              </div>
            ) : areas.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Tidak ada area tersedia (atau endpoint area belum tersedia).
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {areas.map((a) => {
                  const active = selectedAreas.includes(a.id);

                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleArea(a.id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${active
                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : "border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/50"
                        }`}
                    >
                      <MapPin size={14} className="shrink-0" />
                      <span className="truncate">{a.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedAreas.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                {selectedAreas.length} area dipilih
              </p>
            )}
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
                {isEdit ? "User berhasil diperbarui." : "User berhasil dibuat."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/admin/user")}
                className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Lihat User
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                {isEdit ? <Save size={18} /> : <UserPlus size={18} />}
                {isEdit ? "Simpan Perubahan" : "Buat User"}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
