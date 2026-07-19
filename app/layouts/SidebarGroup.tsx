
import type { MenuGroup } from "./navigation/navigation";
import SidebarItem from "./SidebarItem";
import { useAuth } from "~/hooks/useAuth";

interface Props {
  group: MenuGroup;
  onClick?: () => void;
}

export default function SidebarGroup({ group, onClick }: Props) {
  const { logout } = useAuth();
  return (
    <div className="space-y-2">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {group.title}
      </p>

      <div className="space-y-1">
        {group.items.map((item) => (
          <SidebarItem
            key={item.href ?? item.title}
            item={item}
            onClick={onClick}
            onLogout={logout}
          />
        ))}
      </div>
    </div>
  );
}
