interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AreaPagination({
  page,
  totalPages,
  onPageChange,
}: Props) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        className="rounded-lg border px-4 py-2 disabled:opacity-50"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>

      <span className="font-medium">
        {page} / {totalPages}
      </span>

      <button
        className="rounded-lg border px-4 py-2 disabled:opacity-50"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
