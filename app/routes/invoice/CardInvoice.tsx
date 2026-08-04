import type { ReactNode } from "react";


interface Props {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
}

export default function DashboardCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="mt-2 text-2xl font-bold">
            {value}
          </h2>
        </div>

        {icon}
      </div>
    </div>
  );
}