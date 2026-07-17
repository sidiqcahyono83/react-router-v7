import { useLoaderData } from "react-router";
import AdminLayout from "~/layouts/layoutadmin";

export default function Layout() {
  useLoaderData();

  return <AdminLayout />;
}
