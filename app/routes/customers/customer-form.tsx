import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import CustomerForm, {
  type CustomerFormValues,
  type FormOptions,
} from "./CustomerForm";
import {
  createCustomer,
  getCustomerId,
  registerCustomer,
  updateCustomer,
} from "~/api/customers";
import { getAllPaket } from "~/api/paket";
import { getAllArea } from "~/api/area";
import { getAllOdp } from "~/api/odp";
import { getAllModem } from "~/api/modem";
import { getAllOlt } from "~/api/olt";

/* ============================================================
   SATU HALAMAN UNTUK 3 MODE (berdasarkan URL):
   /admin/customers/create       → mode "create"
   /admin/customers/:id/edit     → mode "edit"
   /admin/customers/:id          → mode "detail" (read-only)
============================================================ */

/** Normalisasi response list → array */
const toArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.result)) return raw.result;
  return [];
};

const EMPTY_OPTIONS: FormOptions = {
  pakets: [],
  areas: [],
  odps: [],
  modems: [],
  olts: [],
};

export default function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const path = window.location.pathname;

  // Tentukan mode dari URL
  const mode: "create" | "edit" | "detail" = id
    ? path.endsWith("/edit")
      ? "edit"
      : "detail"
    : "create";

  const [defaultValues, setDefaultValues] = useState<
    Partial<CustomerFormValues> | undefined
  >(undefined);
  const [loadingData, setLoadingData] = useState(Boolean(id));

  const [options, setOptions] = useState<FormOptions>(EMPTY_OPTIONS);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // ---------- Muat opsi relasi (sekali) ----------
  useEffect(() => {
    let active = true;
    setLoadingOptions(true);

    Promise.allSettled([
      getAllPaket(),
      getAllArea(),
      getAllOdp(),
      getAllModem(),
      getAllOlt(),
    ]).then(([p, a, o, m, l]) => {
      if (!active) return;

      setOptions({
        pakets: toArray(p.status === "fulfilled" ? p.value : []),
        areas: toArray(a.status === "fulfilled" ? a.value : []),
        odps: toArray(o.status === "fulfilled" ? o.value : []),
        modems: toArray(m.status === "fulfilled" ? m.value : []),
        olts: toArray(l.status === "fulfilled" ? l.value : []),
      });
      setLoadingOptions(false);
    });

    return () => {
      active = false;
    };
  }, []);

  // ---------- Muat data customer (edit / detail) ----------
  useEffect(() => {
    if (!id) return;
    setLoadingData(true);

    getCustomerId(id)
      .then((res) => {
        const c = res?.data ?? res ?? null;
        if (!c) return;

        setDefaultValues({
          username: String(c.username ?? ""),
          fullname: String(c.fullname ?? ""),
          email: String(c.email ?? ""),
          phoneNumber: String(c.phoneNumber ?? ""),
          address: String(c.address ?? ""),
          ontName: String(c.ontName ?? ""),
          redamanOlt: String(c.redamanOlt ?? ""),
          diskon: Number(c.diskon ?? 0),
          status: String(c.status ?? "PENDING").toUpperCase() as any,
          paketId: String(c.paketId ?? c.paket?.id ?? ""),
          areaId: String(c.areaId ?? c.area?.id ?? ""),
          odpId: String(c.odpId ?? c.odp?.id ?? ""),
          modemId: String(c.modemId ?? c.modem?.id ?? ""),
          oltId: String(c.oltId ?? c.olt?.id ?? ""),
        });
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data."),
      )
      .finally(() => setLoadingData(false));
  }, [id]);

  // ---------- Submit ----------
  const handleSubmit = async (values: CustomerFormValues) => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const payload = {
        username: values.username.trim(),
        fullname: values.fullname.trim(),
        email: values.email?.trim() || undefined,
        phoneNumber: values.phoneNumber?.trim() || undefined,
        address: values.address?.trim() || undefined,
        ontName: values.ontName?.trim() || undefined,
        redamanOlt: values.redamanOlt?.trim() || undefined,
        diskon: Number(values.diskon) || 0,
        status: values.status,
        paketId: values.paketId || null,
        areaId: values.areaId || null,
        odpId: values.odpId || null,
        modemId: values.modemId || null,
        oltId: values.oltId || null,
      };

      if (mode === "edit" && id) {
        await updateCustomer(id, payload);
      } else if (mode === "create" && values.withPppoe) {
        await registerCustomer({ ...payload, password: values.password });
      } else {
        await createCustomer(payload);
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const listUrl = "/admin/customers";

  if (loadingData) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  const title =
    mode === "create"
      ? "Register Customer"
      : mode === "edit"
        ? "Edit Customer"
        : "Detail Customer";

  const subtitle =
    mode === "create"
      ? "Daftarkan pelanggan baru — bisa sekalian buat akun PPPoE."
      : mode === "edit"
        ? "Perbarui data pelanggan."
        : "Lihat data pelanggan (read-only).";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={listUrl}
          className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-50"
          title="Kembali"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <CustomerForm
        key={`${mode}-${id ?? "new"}`}
        mode={mode}
        defaultValues={defaultValues}
        options={options}
        loadingOptions={loadingOptions}
        saving={saving}
        error={error}
        saved={saved}
        onSubmit={mode === "detail" ? undefined : handleSubmit}
        onBack={() => navigate(listUrl)}
        onGoList={() => navigate(listUrl)}
      />
    </div>
  );
}
