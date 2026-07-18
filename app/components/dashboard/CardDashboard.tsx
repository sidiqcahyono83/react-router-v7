import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
};

export default function DashboardCard({ title, value, icon: Icon }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="mt-3 text-3xl font-bold">{value}</h2>
        </div>

        {Icon && (
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Icon size={28} />
          </div>
        )}
      </div>
    </div>
  );
}
