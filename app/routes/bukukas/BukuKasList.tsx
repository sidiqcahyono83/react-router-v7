import { BookOpenText, Minus, Plus } from "lucide-react";
import type { BukuKasItem } from "~/api/bukuKas";

const rupiah = (n: number) =>
  n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

const amount = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const fmtHari = (tanggal: string) => {
  const d = new Date(tanggal);

  if (Number.isNaN(d.getTime())) return tanggal;

  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

function KategoriBadge({ kategori }: { kategori?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
      {kategori || "Pengeluaran"}
    </span>
  );
}

interface Props {
  loading: boolean;
  data: BukuKasItem[];
}

export default function BukuKasList({ loading, data }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <BookOpenText className="mx-auto mb-4 text-slate-300" size={48} />
        <h3 className="text-lg font-semibold">Buku Kas Kosong</h3>
        <p className="mt-2 text-slate-500">
          Belum ada mutasi kas pada periode ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((bk) => {
        const pendapatan = Array.isArray(bk.pendapatan)
          ? bk.pendapatan
          : [];

        const pengeluaran = Array.isArray(bk.pengeluaran)
          ? bk.pengeluaran
          : [];

        const totalTransaksi = pendapatan.length + pengeluaran.length;

        const detailMasuk = pendapatan.reduce(
          (sum, item) => sum + amount(item.total ?? item.totalMasuk),
          0,
        );

        const detailKeluar = pengeluaran.reduce(
          (sum, item) => sum + amount(item.totalKeluar ?? item.total),
          0,
        );

        const totalMasuk = Number.isFinite(Number(bk.totalMasuk))
          ? Number(bk.totalMasuk)
          : detailMasuk;

        const totalKeluar = Number.isFinite(Number(bk.totalKeluar))
          ? Number(bk.totalKeluar)
          : detailKeluar;

        return (
          <div
            key={bk.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
              <div>
                <p className="font-bold text-slate-800">
                  {fmtHari(bk.tanggal)}
                </p>

                <p className="text-xs text-slate-400">
                  {totalTransaksi} transaksi ·{" "}
                  {bk.user?.fullname ?? bk.user?.username ?? "-"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 text-xs text-green-600">
                    <Plus size={11} /> Masuk
                  </p>
                  <p className="font-semibold text-green-700">
                    {rupiah(totalMasuk)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 text-xs text-red-600">
                    <Minus size={11} /> Keluar
                  </p>
                  <p className="font-semibold text-red-600">
                    -{rupiah(totalKeluar)}
                  </p>
                </div>

                <div className="border-l border-slate-200 pl-3 text-right">
                  <p className="text-xs text-slate-400">Saldo Akhir</p>
                  <p className="text-base font-bold text-slate-800">
                    {rupiah(amount(bk.saldoAkhir))}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {pendapatan.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Plus size={15} />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {p.deskripsi || "Pendapatan"}
                      </p>

                      <p className="text-xs text-slate-400">
                        {p.payment?.customer?.fullname
                          ? `${p.payment.customer.fullname} · `
                          : ""}
                        {p.payment?.method ?? "Manual"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-green-700">
                    +{rupiah(amount(p.total ?? p.totalMasuk))}
                  </p>
                </div>
              ))}

              {pengeluaran.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <Minus size={15} />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {p.deskripsi || "Pengeluaran"}
                      </p>

                      <p className="mt-0.5">
                        <KategoriBadge kategori={p.kategori} />
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-red-600">
                    -{rupiah(amount(p.totalKeluar ?? p.total))}
                  </p>
                </div>
              ))}

              {totalTransaksi === 0 && (
                <p className="px-5 py-4 text-sm text-slate-400">
                  Tidak ada transaksi rinci pada hari ini.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}