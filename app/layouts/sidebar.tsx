import { X } from "lucide-react";
import { navigation } from "./navigation/navigation";
import SidebarGroup from "./SidebarGroup";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay Mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-72 bg-white border-r
          transform transition-transform duration-300
          lg:static lg:flex lg:translate-x-0 lg:flex-col
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Teranet Bill</h1>

            <p className="text-sm text-slate-500">Billing Management System</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto p-5">
          {navigation.map((group) => (
            <SidebarGroup key={group.title} group={group} onClick={onClose} />
          ))}
        </div>
      </aside>
    </>
  );
}
