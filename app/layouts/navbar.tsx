import { formatDate } from "date-fns/format";
import { Menu } from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Props = {
  onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: Props) {
  const { user } = useAuth();

  const tanggalMasehi = format(Date.now(), "dd MMMM yyyy", { locale: id });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-lg font-semibold">{tanggalMasehi}</h1>
      </div>

      <div className="text-right">
        <p className="font-medium">{user?.fullname}</p>
        <p className="text-sm text-slate-500 capitalize">{user?.level}</p>
      </div>
    </header>
  );
}
