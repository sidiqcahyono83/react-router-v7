import { useState } from "react";
import { NavLink } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { MenuItem } from "./navigation/navigation";

interface Props {
  item: MenuItem;
  onClick?: () => void;
  onLogout?: () => void;
}

export default function SidebarItem({ item, onClick, onLogout }: Props) {
  const [open, setOpen] = useState(false);

  // Logout
  if (item.action === "logout") {
    return (
      <button
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
      >
        <item.icon size={18} />
        <span>{item.title}</span>
      </button>
    );
  }

  // Menu yang memiliki children
  if (item.children?.length) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          <div className="flex items-center gap-3">
            <item.icon size={18} />
            <span>{item.title}</span>
          </div>

          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {open && (
          <div className="ml-6 mt-2 space-y-1 border-l border-slate-200 pl-3">
            {item.children.map((child) => (
              <SidebarItem
                key={child.href ?? child.title}
                item={child}
                onClick={onClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Menu biasa
  return (
    <NavLink
      to={item.href ?? "#"}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 transition ${
          isActive
            ? "bg-blue-600 text-white"
            : "hover:bg-slate-100 text-slate-700"
        }`
      }
    >
      <item.icon size={18} />
      <span>{item.title}</span>
    </NavLink>
  );
}
