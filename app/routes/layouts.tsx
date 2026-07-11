import Header from "~/layouts/header";
import type { Route } from "./+types/home";
import { NavLink, Outlet } from "react-router";
import { useState } from "react";

const menus = [
  {
    name: "Dashboard",
    to: "/",
  },
  {
    name: "Customers",
    to: "/customers",
  },
  {
    name: "Pembayaran",
    to: "/pembayaran",
  },
  {
    name: "Invoices",
    to: "/invoices",
  },
  {
    name: "Reports",
    to: "/reports",
  },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <main className="flex items-center justify-center pt-1 pb-2">
      <div className="w-screen items-center gap-16 min-h-screen">
        <header className="bg-white shadow-sm">
          <div className="mx-auto flex h-16 max-w-full items-center justify-between px-4">
            {/* Logo */}
            <NavLink to="/" className="text-xl font-bold text-blue-600">
              MyApp
            </NavLink>

            {/* Desktop Menu */}
            <nav className="hidden items-center gap-6 md:flex">
              {menus.map((menu) => (
                <NavLink
                  key={menu.to}
                  to={menu.to}
                  className={({ isActive }) =>
                    `transition ${
                      isActive
                        ? "font-semibold text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`
                  }
                >
                  {menu.name}
                </NavLink>
              ))}
            </nav>

            {/* Profile */}
            <div className="hidden md:block">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Logout
              </button>
            </div>

            {/* Hamburger */}
            <button
              className="rounded p-2 md:hidden"
              onClick={() => setOpen(!open)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {open && (
            <nav className="space-y-2 border-t p-4 md:hidden">
              {menus.map((menu) => (
                <NavLink
                  key={menu.to}
                  to={menu.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 ${
                      isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                    }`
                  }
                >
                  {menu.name}
                </NavLink>
              ))}

              <button className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-white">
                Logout
              </button>
            </nav>
          )}
        </header>
        <section className="w-screen p-4 mx-auto  ">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
