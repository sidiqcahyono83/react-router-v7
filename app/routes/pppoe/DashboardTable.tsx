interface Props {
  rows: any[];
  pagination: any;
  page: number;
  onPageChange(page: number): void;
}

export default function DashboardTable({
  rows,
  pagination,
  page,
  onPageChange,
}: Props) {
  return (
    <div className="rounded-xl border bg-white shadow">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-3 text-left">Username</th>

            <th className="p-3 text-left">Profile</th>

            <th className="p-3 text-left">Status</th>

          </tr>

        </thead>

        <tbody>

          {rows.map((row) => (
            <tr
              key={row[".id"]}
              className="border-t"
            >
              <td className="p-3">
                {row.name}
              </td>

              <td className="p-3">
                {row.profile ?? "-"}
              </td>

              <td className="p-3">
                {row.disabled === "true"
                  ? "Disable"
                  : "Aktif"}
              </td>
            </tr>
          ))}

        </tbody>

      </table>

      <div className="flex justify-end gap-2 p-4">

        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>

        <span>
          {page} / {pagination?.totalPages}
        </span>

        <button
          disabled={page >= pagination?.totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>

      </div>

    </div>
  );
}