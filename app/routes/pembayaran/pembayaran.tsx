import { useEffect, useState } from "react";

import { getPembayarans } from "~/api/pembayaran";

import PembayaranToolbar from "./PembayaranToolbar";
import PembayaranTable from "./PembayaranTable";
import PembayaranPagination from "./PembayaranPagination";
import Pagination from "~/components/ui/Pagination";

export default function PembayaranPage() {
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  async function load(page = 1, keyword = search) {
    setLoading(true);

    try {
      const result = await getPembayarans({
        page,
        limit: pagination.limit,
        search: keyword,
      });

      setData(result.data);

      setPagination(result.pagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PembayaranToolbar
        onSearch={(keyword) => {
          setSearch(keyword);

          load(1, keyword);
        }}
      />

      <PembayaranTable loading={loading} data={data} />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onChange={(page) => load(page)}
      />
    </div>
  );
}
