import { Form, redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { logout } from "./auth";

export async function action({}: ActionFunctionArgs) {
  await logout();

  return redirect("/");
}

export default function Logout() {
  return null;
}

<Form action="/logout" method="post">
  <button>Logout</button>
</Form>;
