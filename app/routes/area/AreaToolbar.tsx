import { Link } from "react-router";
import { Plus, Search } from "lucide-react";

interface Props {
  search: string;
  onSearch: (value: string) => void;
}

export default function AreaToolbar({ search, onSearch }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Area</h1>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <div className="flex items-center justify-between gap-4">
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Cari Area..."
              className="w-full rounded-lg border px-4 py-2"
            />
          </div>
        </div>

        <Link
          to="/admin/area/create"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Tambah Area
        </Link>
      </div>
    </div>
  );
}
