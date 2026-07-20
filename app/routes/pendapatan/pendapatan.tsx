import { useEffect, useState } from "react";

import { getPendapatan } from "~/api/pendapatan";
import PendapatanToolbar from "./PendapatanToolbar";
import PendapatanTable from "./PendapatanTable";
import PendapatanPagination from "./PendapatanPagination";

export default function PendapatanPage() {
  const [pendapatan, setPendapatan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");

  async function loadPendapatan(
    page: number = pagination.page,
    keyword: string = search,
  ) {
    setLoading(true);

    try {
      const result = await getPendapatan({
        page,
        limit: pagination.limit,
        search: keyword,
      });

      setPendapatan(result.data);

      setPagination(result.pagination);

      setSearch(keyword);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendapatan();
  }, []);

  return (
    <div className="space-y-6">
      <PendapatanToolbar
        search={search}
        onSearch={(keyword) => {
          loadPendapatan(1, keyword);
        }}
      />

      <PendapatanTable loading={loading} data={pendapatan} />

      <PendapatanPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page: number) => {
          loadPendapatan(page);
        }}
      />
    </div>
  );
}
