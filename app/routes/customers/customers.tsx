import { useEffect, useState } from "react";

import { getCustomers } from "~/api/customers";

import CustomerToolbar from "./CustomerToolbar";
import CustomerTable from "./CustomerTable";
import CustomerPagination from "./CustomerPagination";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");

  async function loadCustomers(
    page: number = pagination.page,
    keyword: string = search,
  ) {
    setLoading(true);

    try {
      const result = await getCustomers({
        page,
        limit: pagination.limit,
        search: keyword,
      });

      setCustomers(result.data);

      setPagination(result.pagination);

      setSearch(keyword);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <CustomerToolbar
        onSearch={(keyword) => {
          loadCustomers(1, keyword);
        }}
      />

      <CustomerTable loading={loading} data={customers} />

      <CustomerPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page: number) => {
          loadCustomers(page);
        }}
      />
    </div>
  );
}
