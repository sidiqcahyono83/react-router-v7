import {
  CreditCard,
  ShieldAlert,
  UserPlus,
  Users,
  Wallet,
  Wifi,
} from "lucide-react";
import DashboardCard from "./CardDashboard";

export default function DashboardSummary({ summary }: any) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
      {/* <pre>{JSON.stringify(summary, null, 2)}</pre> */}
      <DashboardCard
        title="Customer"
        value={summary.totalCustomers}
        icon={Users}
      />

      <DashboardCard
        title="Sudah Bayar"
        value={summary.invoicePaid}
        icon={CreditCard}
      />

      <DashboardCard
        title="Belum Bayar"
        value={summary.invoiceUnpaid}
        icon={Wallet}
      />

      <DashboardCard
        title="Tunggakan"
        value={summary.invoiceExpired}
        icon={ShieldAlert}
      />

      <DashboardCard
        title="Customer Baru"
        value={summary.newCustomers}
        icon={UserPlus}
      />

      <DashboardCard title="Aktif" value={summary.pppoeActive} icon={Wifi} />

      <DashboardCard
        title="Isolir"
        value={summary.pppoeDisable}
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
