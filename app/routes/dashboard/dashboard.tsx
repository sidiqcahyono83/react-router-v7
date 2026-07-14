import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <p className="mt-2 text-slate-500">Selamat datang di Billing System</p>
    </div>
  );
}
