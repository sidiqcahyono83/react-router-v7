import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Package,
  BarChart3,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  action?: "logout";
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const navigation: MenuGroup[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Master Data",
    items: [
      {
        title: "Customer",
        href: "/admin/customers",
        icon: Users,
      },
      {
        title: "Paket Internet",
        href: "/admin/paket",
        icon: Package,
      },
    ],
  },
  {
    title: "Transaksi",
    items: [
      {
        title: "Pembayaran",
        href: "/admin/pembayaran",
        icon: CreditCard,
      },
      {
        title: "Invoice",
        href: "/admin/invoice",
        icon: FileText,
      },
    ],
  },
  {
    title: "Laporan",
    items: [
      {
        title: "Laporan",
        href: "/admin/laporan",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Setting",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        title: "Logout",
        icon: LogOut,
        action: "logout",
      },
    ],
  },
];
