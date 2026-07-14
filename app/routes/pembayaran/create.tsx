// create.tsx

import { api } from "~/lib/api";
import type { Route } from "./+types/create";
import type { Customer } from "~/types/typdeData";
import PembayaranCreate from "./PembayaranCreate";

type CustomersResponse = {
  customers: Customer[];
};

export async function loader() {
  const customers = await api<CustomersResponse>("/customers");

  return {
    customers: customers.customers,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  await api("/pembayaran", {
    method: "POST",
    body: formData,
  });

  return null;
}

export default PembayaranCreate;
