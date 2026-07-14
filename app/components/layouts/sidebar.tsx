import { navigation } from "../navigation/navigation";
import SidebarGroup from "./SidebarGroup";

export default function Sidebar() {
  return (
    <aside className="hidden w-72 border-r bg-white lg:flex lg:flex-col">
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold text-blue-600">Teranet Bill</h1>

        <p className="text-sm text-slate-500">Billing Management System</p>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto p-5">
        {navigation.map((group) => (
          <SidebarGroup key={group.title} group={group} />
        ))}
      </div>
    </aside>
  );
}
