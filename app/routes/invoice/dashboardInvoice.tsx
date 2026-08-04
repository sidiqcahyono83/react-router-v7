import { useEffect, useState } from "react";
import DashboardCard from "./CardInvoice";
import { getInvoiceDashboard } from "~/api/invoice";

export default function InvoiceDashboard() {
  const [dashboard, setDashboard] = useState<any>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await getInvoiceDashboard();

      setDashboard(res.data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <DashboardCard
        title="Total Invoice"
        value={dashboard.invoice.total}
      />

      <DashboardCard
        title="Invoice Bulan Ini"
        value={dashboard.invoice.bulanIni}
      />

      <DashboardCard
        title="Lunas"
        value={dashboard.status.paid}
      />

      <DashboardCard
        title="Belum Lunas"
        value={dashboard.status.unpaid}
      />

      <DashboardCard
        title="Sebagian Dibayar"
        value={dashboard.status.partial}
      />

      <DashboardCard
        title="Jatuh Tempo"
        value={dashboard.status.overdue}
      />

      <DashboardCard
        title="Jatuh Tempo Hari Ini"
        value={dashboard.status.dueToday}
      />

      <DashboardCard
        title="7 Hari Kedepan"
        value={dashboard.status.dueNext7Days}
      />

      <DashboardCard
        title="Total Tagihan"
        value={new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(dashboard.nominal.total)}
      />

      <DashboardCard
        title="Sudah Dibayar"
        value={new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(dashboard.nominal.paid)}
      />

      <DashboardCard
        title="Outstanding"
        value={new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(dashboard.nominal.outstanding)}
      />

    </div>
  );
}


