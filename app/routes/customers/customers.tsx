import { Link, useLoaderData } from "react-router";
import { getCustomers } from "~/features/customers/api";

import { CustomerTable } from "~/features/customers/components/CustomerTable";
import type { Route } from "./+types/customers";

export async function loader({ request }: Route.LoaderArgs) {
  const cookie = request.headers.get("cookie");

  return {
    customers: await getCustomers(cookie),
  };
}

export default function CustomersPage({ loaderData }: Route.ComponentProps) {
  const { customers } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customer</h1>

        <Link
          to="/admin/customers/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Tambah Customer
        </Link>
      </div>

      <CustomerTable customers={customers} />
    </div>
  );
}
