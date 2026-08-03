import { useEffect, useState } from "react";

import InvoiceToolbar from "./InvoiceToolbar";
import InvoiceTable from "./InvoiceTable";
import InvoicePagination from "./InvoicePagination";
import { getInvoice } from "~/api/invoice";

export default function AreaPage() {
  const [invoice, setInvoice] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");

  async function loadInvoice(
    page: number = pagination.page,
    keyword: string = search,
  ) {
    setLoading(true);

    try {
      const result = await getInvoice({
        page,
        limit: pagination.limit,
        search: keyword,
      });
      console.log("Invoice result:", result);
      setInvoice(result.data);

      setPagination(result.pagination);

      setSearch(keyword);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoice();
  }, []);

  return (
    <div className="space-y-6">
      <InvoiceToolbar
        search={search}
        onSearch={(keyword) => {
          loadInvoice(1, keyword);
        }}
      />

      <InvoiceTable loading={loading} data={invoice} />

      <InvoicePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page: number) => {
          loadInvoice(page);
        }}
      />
    </div>
  );
}
