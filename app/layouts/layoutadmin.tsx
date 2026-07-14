import { Outlet } from "react-router";
import { useState } from "react";
import Navbar from "~/components/layouts/navbar";
import Sidebar from "~/components/layouts/sidebar";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar onMenuClick={() => setOpen(true)} />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
