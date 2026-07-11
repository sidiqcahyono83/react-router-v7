// app/routes/customers.tsx

import { api } from "~/lib/api";
import type { Route } from "./+types/customers";
import CustomersPage from "~/routes/customersPage";
import type { Customer } from "~/type/typdeData";

type CustomersResponse = {
  customers: Customer[];
};

export async function loader({}: Route.LoaderArgs) {
  const data = await api<CustomersResponse>("/customers");

  return {
    customers: data.customers,
  };
}

export default CustomersPage;
