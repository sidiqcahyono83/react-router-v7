import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { requireAuth } from "../api/require-auth";
import AdminLayout from "~/layouts/layoutadmin";
import { getSession } from "~/lib/auth/session";

export async function loader() {
  return {
    user: await getSession(),
  };
}
// export async function loader() {
//   return await requireAuth();
// }

export default function Layout() {
  useLoaderData();

  return <AdminLayout />;
}
