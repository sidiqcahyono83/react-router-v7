import { api } from "~/api/client";

export async function deleteCustomer(id: string) {
  return api(`/customers/${id}`, {
    method: "DELETE",
  });
}
