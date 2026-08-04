import { useEffect, useState } from "react";

import DashboardCard from "./DashboardCard";
import DashboardTable from "./DashboardTable";
import { getDashboard, getDashboardSummary } from "~/api/pppoe";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);

  const [type, setType] = useState<
    "secret" | "active" | "inactive" | "disabled" | "nonactive"
  >("secret");

  const [rows, setRows] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>();

  const [page, setPage] = useState(1);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadTable();
  }, [type, page]);

  async function loadSummary() {
    const res = await getDashboardSummary();
    setSummary(res.summary);
  }

  async function loadTable() {
    const res = await getDashboard({
      page,
      limit: 20,
      type,
    });

    setRows(res.data);
    setPagination(res.pagination);
  }

  if (!summary) return null;

  return (
    <>
      <DashboardCard
        summary={summary}
        selected={type}
        onSelect={(value) => {
          setType(value);
          setPage(1);
        }}
      />

      <div className="mt-6">
        <DashboardTable
          rows={rows}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}