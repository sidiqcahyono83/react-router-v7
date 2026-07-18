import {
  Users,
  CreditCard,
  Wallet,
  UserPlus,
  Wifi,
  ShieldAlert,
} from "lucide-react";
import DashboardCard from "./CardDashboard";

export default function DashboardSummary({ summary }: any) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
      {/* <pre>{JSON.stringify(summary, null, 2)}</pre> */}
      <DashboardCard title="Customer" value={summary.customers} icon={Users} />

      <DashboardCard
        title="Sudah Bayar"
        value={summary.paid}
        icon={CreditCard}
      />

      <DashboardCard title="Belum Bayar" value={summary.unpaid} icon={Wallet} />

      <DashboardCard
        title="Tunggakan"
        value={summary.isolir}
        icon={ShieldAlert}
      />

      <DashboardCard
        title="Customer Baru"
        value={summary.newCustomers}
        icon={UserPlus}
      />

      <DashboardCard title="Aktif" value={summary.PPPoeActive} icon={Wifi} />

      <DashboardCard
        title="Isolir"
        value={summary.disablePppoe}
        icon={ShieldAlert}
        className="bg-red-600 text-white border-red-600"
      />

      <DashboardCard
        title="Pendapatan"
        value={new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(summary.income)}
      />
    </div>
  );
}
