import { useEffect, useState } from "react";
import { getOdp } from "~/api/odp";
import OdpToolbar from "./OdpToolbar";
import OdpTable from "./OdpTable";
import OdpPagination from "./OdpPagination";

export default function OdpPage() {
  const [odp, setOdp] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");

  async function loadOdp(
    page: number = pagination.page,
    keyword: string = search,
  ) {
    setLoading(true);

    try {
      const result = await getOdp({
        page,
        limit: pagination.limit,
        search: keyword,
      });

      setOdp(result.data);

      setPagination(result.pagination);

      setSearch(keyword);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOdp();
  }, []);

  return (
    <div className="space-y-6">
      <OdpToolbar
        search={search}
        onSearch={(keyword) => {
          loadOdp(1, keyword);
        }}
      />

      <OdpTable loading={loading} data={odp} />

      <OdpPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page: number) => {
          loadOdp(page);
        }}
      />
    </div>
  );
}
