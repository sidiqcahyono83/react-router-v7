import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronsLeftRightEllipsis,
  Pin,
  Router,
  Server,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  action?: "logout";
  children?: MenuItem[];
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
      {
        title: "Cover Area",
        href: "/admin/area",
        icon: Pin,
      },
      {
        title: "ODP",
        href: "/admin/odp",
        icon: ChevronsLeftRightEllipsis,
      },
      {
        title: "Modem",
        href: "/admin/modem",
        icon: Router,
      },
      {
        title: "Olt",
        href: "/admin/olt",
        icon: Server,
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
        icon: BarChart3,
        children: [
          {
            title: "Pendapatan",
            href: "/admin/laporan/pendapatan",
            icon: CreditCard,
          },
          {
            title: "Pengeluaran",
            href: "/admin/laporan/pengeluaran",
            icon: FileText,
          },
          {
            title: "Buku Kas",
            href: "/admin/laporan/buku-kas",
            icon: BarChart3,
          },
        ],
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
