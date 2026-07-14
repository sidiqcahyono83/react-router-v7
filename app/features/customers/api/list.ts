import { api } from "~/api/client";
import type { Customer } from "../types";

export async function getCustomers(cookie?: string) {
  return api<Customer[]>("/customers", {
    headers: cookie ? { Cookie: cookie } : {},
  });
}
