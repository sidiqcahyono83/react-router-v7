import { useEffect, useState } from "react";
import { getPakets } from "~/api/paket";
import PaketToolbar from "./PaketToolbar";
import PaketTable from "./PaketTable";
import PaketPagination from "./PaketPagination";

export default function PaketsPage() {
  const [pakets, setPakets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");

  async function loadPakets(
    page: number = pagination.page,
    keyword: string = search,
  ) {
    setLoading(true);

    try {
      const result = await getPakets({
        page,
        limit: pagination.limit,
        search: keyword,
      });

      setPakets(result.data);

      setPagination(result.pagination);

      setSearch(keyword);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPakets();
  }, []);

  return (
    <div className="space-y-6">
      <PaketToolbar
        onSearch={(keyword) => {
          loadPakets(1, keyword);
        }}
      />

      <PaketTable loading={loading} data={pakets} />

      <PaketPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page: number) => {
          loadPakets(page);
        }}
      />
    </div>
  );
}
