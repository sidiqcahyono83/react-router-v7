import { NavLink } from "react-router";
import type { MenuItem } from "../navigation/navigation";

interface Props {
  item: MenuItem;
}

export default function SidebarItem({ item }: Props) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      end={item.href === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      <Icon size={20} />
      <span>{item.title}</span>
    </NavLink>
  );
}
