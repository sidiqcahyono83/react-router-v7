import { api } from "~/api/client";
import type { CustomerSchema } from "../schemas/customer.schema";

export async function updateCustomer(id: string, data: CustomerSchema) {
  return api(`/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
