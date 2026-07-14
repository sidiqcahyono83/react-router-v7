import type { MenuGroup, MenuItem } from "../navigation/navigation";
import SidebarItem from "./SidebarItem";

interface Props {
  group: MenuGroup;
}

export default function SidebarGroup({ group }: Props) {
  return (
    <div className="space-y-2">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {group.title}
      </p>

      <div className="space-y-1">
        {group.items.map((item) => (
          <SidebarItem key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}
