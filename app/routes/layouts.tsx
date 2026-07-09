import Header from "~/layouts/header";
import type { Route } from "./+types/home";

export default function Layout() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to React Router
          </h1>
        </header>
      </div>
    </main>
  );
}
