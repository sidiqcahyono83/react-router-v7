import {
  Wifi,
  Users,
  UserCheck,
  UserX,
  Ban,
} from "lucide-react";

interface Props {
  summary: {
    jumlah_active: number;
    jumlah_secret: number;
    jumlah_inactive: number;
    jumlah_nonactive_nondisabled: number;
    jumlah_disabled: number;
  };

  selected: string;

  onSelect: (
    type:
      | "secret"
      | "active"
      | "inactive"
      | "disabled"
      | "nonactive",
  ) => void;
}

export default function DashboardCard({
  summary,
  selected,
  onSelect,
}: Props) {
  const cards = [
    {
      type: "secret",
      title: "PPPoE Secret",
      value: summary.jumlah_secret,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      type: "active",
      title: "Online",
      value: summary.jumlah_active,
      icon: Wifi,
      color: "bg-green-500",
    },
    {
      type: "inactive",
      title: "Offline",
      value: summary.jumlah_inactive,
      icon: UserX,
      color: "bg-orange-500",
    },
    {
      type: "nonactive",
      title: "Offline Aktif",
      value: summary.jumlah_nonactive_nondisabled,
      icon: UserCheck,
      color: "bg-cyan-500",
    },
    {
      type: "disabled",
      title: "Disable",
      value: summary.jumlah_disabled,
      icon: Ban,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <button
            key={card.type}
            onClick={() => onSelect(card.type as any)}
            className={`rounded-xl border p-5 shadow transition

            ${selected === card.type
                ? "border-blue-500 ring-2 ring-blue-200"
                : "bg-white hover:shadow-lg"
              }`}
          >
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {card.value}
                </h2>
              </div>

              <div
                className={`rounded-full p-3 text-white ${card.color}`}
              >
                <Icon size={28} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}