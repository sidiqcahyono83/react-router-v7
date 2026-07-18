import { Outlet, useOutletContext } from "react-router";
import type { User } from "~/types/typeData";

type AuthContext = {
  user: User;
};

export default function AdminLayout() {
   const { user } = useOutletContext<AuthContext>();
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white">Sidebar</aside>

      {/* Content */}
      <main className="flex-1">
        <header className="h-16 border-b px-6 flex items-center">Navbar</header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
