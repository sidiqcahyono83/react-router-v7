import type { ReactNode } from "react";

export interface MenuItem {
  label: string;

  href: string;

  icon?: ReactNode;

  children?: MenuItem[];
}
