import { api } from "~/api/client";
import type { CustomerSchema } from "../schemas/customer.schema";

export async function createCustomer(data: CustomerSchema) {
  return api("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
