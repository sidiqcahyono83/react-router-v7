import { Wifi } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-blue-600 p-3 text-white">
        <Wifi size={24} />
      </div>

      <div>
        <h1 className="font-bold text-xl">Billing ISP</h1>

        <p className="text-sm text-slate-500">Administrator</p>
      </div>
    </div>
  );
}
