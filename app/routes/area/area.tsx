import { useEffect, useState } from "react";
import { getAreas } from "~/api/area";
import AreaToolbar from "./AreaToolbar";
import AreaTable from "./AreaTable";
import AreaPagination from "./AreaPagination";

export default function AreaPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");

  async function loadAreas(
    page: number = pagination.page,
    keyword: string = search,
  ) {
    setLoading(true);

    try {
      const result = await getAreas({
        page,
        limit: pagination.limit,
        search: keyword,
      });

      setAreas(result.data);

      setPagination(result.pagination);

      setSearch(keyword);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAreas();
  }, []);

  return (
    <div className="space-y-6">
      <AreaToolbar
        search={search}
        onSearch={(keyword) => loadAreas(1, keyword)}
      />

      <AreaTable loading={loading} data={areas} />

      <AreaPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page: number) => {
          loadAreas(page);
        }}
      />
    </div>
  );
}
