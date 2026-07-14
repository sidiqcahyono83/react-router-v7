import { Form, redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { AuthAPI } from "~/api/auth";

export async function action({}: ActionFunctionArgs) {
  await AuthAPI.logout();

  return redirect("/login");
}

export default function Logout() {
  return null;
}


<Form action="/logout" method="post">
  <button>Logout</button>
</Form>;