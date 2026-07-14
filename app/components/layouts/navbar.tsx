import { Menu, Bell } from "lucide-react";

type Props = {
  onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
      >
        <Menu />
      </button>

      <div className="font-semibold">Dashboard Admin</div>

      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 hover:bg-slate-100">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
            A
          </div>

          <div className="hidden md:block">
            <p className="font-semibold">Administrator</p>

            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
