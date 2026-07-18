interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm md:flex-row">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg border px-4 py-2 text-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Sebelumnya
      </button>

      <div className="flex flex-wrap justify-center gap-2">
        {pages.map((item) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`h-10 w-10 rounded-lg transition ${
              item === page
                ? "bg-blue-600 text-white"
                : "border hover:bg-slate-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg border px-4 py-2 text-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Berikutnya →
      </button>
    </div>
  );
}
