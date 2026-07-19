import { useEffect, useState } from "react";
import { getModem } from "~/api/modem";

import ModemTable from "./ModemTable";
import ModemPagination from "./ModemPagination";
import ModemToolbar from "./ModemToolbar";

export default function AreaPage() {
  const [modem, setModem] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");

  async function loadModem(
    page: number = pagination.page,
    keyword: string = search,
  ) {
    setLoading(true);

    try {
      const result = await getModem({
        page,
        limit: pagination.limit,
        search: keyword,
      });

      setModem(result.data);

      setPagination(result.pagination);

      setSearch(keyword);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModem();
  }, []);

  return (
    <div className="space-y-6">
      <ModemToolbar
        search={search}
        onSearch={(keyword) => {
          loadModem(1, keyword);
        }}
      />

      <ModemTable loading={loading} data={modem} />

      <ModemPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page: number) => {
          loadModem(page);
        }}
      />
    </div>
  );
}
