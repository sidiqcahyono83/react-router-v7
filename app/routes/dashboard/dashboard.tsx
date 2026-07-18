import { useEffect, useState } from "react";



import IncomeChart from "~/components/dashboard/IncomeChart";

import NewCustomers from "~/components/dashboard/NewCustomers";
import UnpaidCustomers from "~/components/dashboard/UnpaidCustomers";
import { getDashboard } from "./apiDashboard";
import DashboardSummary from "~/components/dashboard/DashboardSumary";
import LatestPayments from "~/components/dashboard/LastPayments";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>();

  useEffect(() => {
    getDashboard().then(setDashboard);
  }, []);

  if (!dashboard) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-8">
      <DashboardSummary summary={dashboard.summary} />

      <IncomeChart data={dashboard.monthlyIncome} />

      <div className="grid gap-6 lg:grid-cols-2">
        <UnpaidCustomers data={dashboard.unpaidCustomers} />

        <LatestPayments data={dashboard.latestPayments} />
      </div>

      <NewCustomers data={dashboard.newCustomers} />
    </div>
  );
}
