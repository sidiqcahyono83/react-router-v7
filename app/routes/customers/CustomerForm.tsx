import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Save, UserPlus } from "lucide-react";

/* ============================================================
   TYPES & SCHEMA (sesuai schema Prisma Customer)
============================================================ */

export const CUSTOMER_STATUS = [
  "ACTIVE",
  "SUSPENDED",
  "TERMINATED",
  "PENDING",
] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUS)[number];

export const customerSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  fullname: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),

  // Jaringan
  ontName: z.string().optional().or(z.literal("")),
  redamanOlt: z.string().optional().or(z.literal("")),
  diskon: z.coerce.number().min(0, "Diskon tidak boleh minus").default(0),

  status: z.enum(CUSTOMER_STATUS),

  // Relasi (optional)
  paketId: z.string().optional().or(z.literal("")),
  areaId: z.string().optional().or(z.literal("")),
  odpId: z.string().optional().or(z.literal("")),
  modemId: z.string().optional().or(z.literal("")),
  oltId: z.string().optional().or(z.literal("")),

  // Register PPPoE (create)
  password: z.string().optional().or(z.literal("")),
  withPppoe: z.boolean().optional(),
});

/** Tipe hasil validasi (output zod) — dipakai onSubmit */
export type CustomerFormValues = z.output<typeof customerSchema>;

/** Tipe input form (RHF) — beda dengan output karena ada z.coerce */
export type CustomerFormInput = z.input<typeof customerSchema>;

/* ============================================================
   OPTIONS (untuk dropdown relasi)
============================================================ */

export interface FormOptions {
  pakets: { id: string; name?: string; nama?: string; harga?: number }[];
  areas: { id: string; name?: string; nama?: string }[];
  odps: { id: string; name?: string; nama?: string }[];
  modems: { id: string; name?: string; serial?: string }[];
  olts: { id: string; name?: string; nama?: string }[];
}

const optLabel = (o: any, extra = "") => {
  const name = o?.name ?? o?.nama ?? o?.serial ?? o?.id ?? "—";
  return extra ? `${name}${extra}` : name;
};

/* ============================================================
   KOMPONEN
============================================================ */

interface Props {
  mode: "create" | "edit" | "detail";
  defaultValues?: Partial<CustomerFormValues>;
  options: FormOptions;
  loadingOptions?: boolean;
  saving?: boolean;
  error?: string;
  saved?: boolean;
  /** Kirim nilai form (create/edit) — detail tidak memanggil */
  onSubmit?: (values: CustomerFormValues) => void | Promise<void>;
  /** Label tombol submit (default: Simpan) */
  submitLabel?: string;
  onBack?: () => void;
  onGoList?: () => void;
}

export default function CustomerForm({
  mode,
  defaultValues,
  options,
  loadingOptions = false,
  saving = false,
  error,
  saved = false,
  onSubmit,
  submitLabel,
  onBack,
  onGoList,
}: Props) {
  const readOnly = mode === "detail";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CustomerFormInput, any, CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      username: "",
      fullname: "",
      email: "",
      phoneNumber: "",
      address: "",
      ontName: "",
      redamanOlt: "",
      diskon: 0,
      status: "PENDING",
      paketId: "",
      areaId: "",
      odpId: "",
      modemId: "",
      oltId: "",
      password: "",
      withPppoe: false,
      ...(defaultValues as Partial<CustomerFormInput>),
    },
  });

  const withPppoe = watch("withPppoe");
  const status = watch("status");

  const inputCls = `w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 ${readOnly ? "cursor-not-allowed bg-slate-50 text-slate-600" : ""
    }`;
  const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";
  const errCls = "mt-1 text-xs text-red-600";

  const field = (name: keyof CustomerFormValues) => {
    const e = errors[name];
    return e ? <p className={errCls}>{e.message as string}</p> : null;
  };

  const select = (name: any, items: any[], placeholder: string) => (
    <select
      {...register(name)}
      disabled={readOnly}
      className={inputCls}
    >
      <option value="">{placeholder}</option>
      {items.map((o) => (
        <option key={o.id} value={o.id}>
          {optLabel(o)}
        </option>
      ))}
    </select>
  );

  return (
    <form
      onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
      className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
    >
      {/* ===== Identitas ===== */}
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Identitas Customer
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>
              Username <span className="text-red-500">*</span>
            </label>
            <input
              {...register("username")}
              disabled={readOnly || mode === "edit"}
              placeholder="cth: budi01"
              className={`${inputCls} ${mode === "edit" ? "cursor-not-allowed bg-slate-100" : ""
                }`}
            />
            {field("username")}
          </div>

          <div>
            <label className={labelCls}>
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              {...register("fullname")}
              disabled={readOnly}
              placeholder="cth: Budi Santoso"
              className={inputCls}
            />
            {field("fullname")}
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input
              {...register("email")}
              disabled={readOnly}
              type="email"
              placeholder="cth: budi@mail.com"
              className={inputCls}
            />
            {field("email")}
          </div>

          <div>
            <label className={labelCls}>No. HP</label>
            <input
              {...register("phoneNumber")}
              disabled={readOnly}
              placeholder="cth: 081234567890"
              className={inputCls}
            />
            {field("phoneNumber")}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Alamat</label>
            <textarea
              {...register("address")}
              disabled={readOnly}
              rows={2}
              placeholder="cth: Jl. Merdeka No. 12"
              className={inputCls}
            />
            {field("address")}
          </div>
        </div>
      </div>

      {/* ===== Jaringan ===== */}
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Data Jaringan
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>ONT Name</label>
            <input
              {...register("ontName")}
              disabled={readOnly}
              placeholder="cth: ONT01/001"
              className={inputCls}
            />
            {field("ontName")}
          </div>

          <div>
            <label className={labelCls}>Redaman OLT (dBm)</label>
            <input
              {...register("redamanOlt")}
              disabled={readOnly}
              placeholder="cth: -18.50"
              className={inputCls}
            />
            {field("redamanOlt")}
          </div>

          <div>
            <label className={labelCls}>Diskon (Rp)</label>
            <input
              {...register("diskon")}
              disabled={readOnly}
              type="number"
              min={0}
              placeholder="cth: 0"
              className={inputCls}
            />
            {field("diskon")}
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select
              {...register("status")}
              disabled={readOnly}
              className={inputCls}
            >
              {CUSTOMER_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {field("status")}
          </div>
        </div>
      </div>

      {/* ===== Relasi ===== */}
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Relasi (Paket / Area / ODP / Modem / OLT)
        </p>
        {loadingOptions ? (
          <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-400">
            <Loader2 size={15} className="animate-spin" /> Memuat opsi...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Paket</label>
              {select("paketId", options.pakets, "Pilih paket...")}
              {field("paketId")}
            </div>

            <div>
              <label className={labelCls}>Area</label>
              {select("areaId", options.areas, "Pilih area...")}
              {field("areaId")}
            </div>

            <div>
              <label className={labelCls}>ODP</label>
              {select("odpId", options.odps, "Pilih ODP...")}
              {field("odpId")}
            </div>

            <div>
              <label className={labelCls}>Modem</label>
              {select("modemId", options.modems, "Pilih modem...")}
              {field("modemId")}
            </div>

            <div>
              <label className={labelCls}>OLT</label>
              {select("oltId", options.olts, "Pilih OLT...")}
              {field("oltId")}
            </div>
          </div>
        )}
      </div>

      {/* ===== Register PPPoE (hanya create) ===== */}
      {mode === "create" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("withPppoe")}
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
                {...register("password")}
                type="password"
                placeholder="Min. 4 karakter"
                className={inputCls}
              />
              {field("password")}
            </div>
          )}
        </div>
      )}

      {/* ===== Error & sukses ===== */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 size={16} /> Data berhasil disimpan.
          </p>
          {onGoList && (
            <button
              type="button"
              onClick={onGoList}
              className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Lihat Customer
            </button>
          )}
        </div>
      )}

      {/* ===== Aksi ===== */}
      {!readOnly && onSubmit && (
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
              {mode === "create" ? <UserPlus size={18} /> : <Save size={18} />}
              {submitLabel ??
                (mode === "create"
                  ? withPppoe
                    ? "Daftarkan + PPPoE"
                    : "Buat Customer"
                  : "Simpan Perubahan")}
            </>
          )}
        </button>
      )}

      {readOnly && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Kembali
        </button>
      )}
    </form>
  );
}
