interface Props {
  onSearch: (keyword: string) => void;
}

export default function PembayaranToolbar({ onSearch }: Props) {
  return (
    <input
      type="text"
      placeholder="Cari customer..."
      className="w-full rounded-lg border px-4 py-2"
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}
