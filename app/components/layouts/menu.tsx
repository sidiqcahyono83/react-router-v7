import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  Package,
  ChartColumn,
  Settings,
} from "lucide-react";

export const menus = [
  {
    title: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    to: "/customers",
    icon: Users,
  },
  {
    title: "Pembayaran",
    to: "/pembayaran",
    icon: Wallet,
  },
  {
    title: "Invoice",
    to: "/invoice",
    icon: Receipt,
  },
  {
    title: "Paket Internet",
    to: "/paket",
    icon: Package,
  },
  {
    title: "Laporan",
    to: "/laporan",
    icon: ChartColumn,
  },
  {
    title: "Pengaturan",
    to: "/setting",
    icon: Settings,
  },
];
