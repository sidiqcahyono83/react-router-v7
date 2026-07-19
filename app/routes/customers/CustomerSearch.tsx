import { useEffect, useState } from "react";
import { searchCustomers } from "~/api/customers";

interface Props {
  selected: any[];
  onChange: (customers: any[]) => void;
}

export default function CustomerSearch({ selected, onChange }: Props) {
  const [keyword, setKeyword] = useState("");

  const [results, setResults] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (keyword.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const data = await searchCustomers(keyword);

        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword]);

  function addCustomer(customer: any) {
    if (selected.some((x) => x.id === customer.id)) {
      return;
    }

    onChange([...selected, customer]);

    setKeyword("");

    setResults([]);
  }

  function removeCustomer(id: string) {
    onChange(selected.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-4">
      <label className="font-semibold">Customer</label>

      <input
        type="text"
        placeholder="Cari customer..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-full rounded-lg border p-3"
      />

      {loading && <div className="rounded border p-3">Mencari...</div>}

      {results.length > 0 && (
        <div className="rounded-lg border">
          {results.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => addCustomer(customer)}
              className="block w-full border-b px-4 py-3 text-left hover:bg-slate-100"
            >
              <div className="font-semibold">{customer.fullname}</div>

              <div className="text-sm text-slate-500">@{customer.username}</div>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {selected.map((customer) => (
          <div
            key={customer.id}
            className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"
          >
            <div>
              <div className="font-semibold">{customer.fullname}</div>

              <div className="text-sm text-slate-500">@{customer.username}</div>
            </div>

            <button
              type="button"
              onClick={() => removeCustomer(customer.id)}
              className="rounded bg-red-500 px-3 py-1 text-white"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
