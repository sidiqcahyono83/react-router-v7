import { api } from "~/api/client";
import type { Customer } from "../types";

export async function getCustomer(id: string) {
  return api<Customer>(`/customers/${id}`);
}
