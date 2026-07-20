import { useEffect, useState } from "react";
import { getOlt, getAllOlt } from "~/api/olt";
import OltToolbar from "./OltToolbar";
import OltTable from "./OltTable";
import OltPagination from "./OltPagination";

export default function OltPage() {
  const [olt, setOlt] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");

  async function loadOlt(
    page: number = pagination.page,
    keyword: string = search,
  ) {
    setLoading(true);

    try {
      const result = await getOlt({
        page,
        limit: pagination.limit,
        search: keyword,
      });

      setOlt(result.data);

      setPagination(result.pagination);

      setSearch(keyword);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOlt();
  }, []);

  return (
    <div className="space-y-6">
      <OltToolbar
        search={search}
        onSearch={(keyword) => {
          loadOlt(1, keyword);
        }}
      />

      <OltTable loading={loading} data={olt} />

      <OltPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page: number) => {
          loadOlt(page);
        }}
      />
    </div>
  );
}
