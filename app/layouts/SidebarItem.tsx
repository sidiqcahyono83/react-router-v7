import { NavLink, useNavigate } from "react-router";
import type { MenuItem } from "./navigation/navigation";
import { useAuth } from "~/hooks/useAuth";

interface Props {
  item: MenuItem;
  onClick?: () => void;
}

export default function SidebarItem({ item, onClick }: Props) {
  const Icon = item.icon;
  const navigate = useNavigate();
  const { logout } = useAuth();

  const className =
    "flex w-full items-center gap-3 rounded-xl px-4 py-3 transition";

  async function handleLogout() {
    await logout();
    onClick?.();
    navigate("/login", { replace: true });
  }

  if (item.action === "logout") {
    return (
      <button
        onClick={handleLogout}
        className={`${className} text-red-600 hover:bg-red-50`}
      >
        <Icon size={20} />
        <span>{item.title}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={item.href!}
      onClick={onClick}
      end={item.href === "/admin"}
      className={({ isActive }) =>
        `${className} ${
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
