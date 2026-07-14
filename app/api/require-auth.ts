import { redirect } from "react-router";
import { AuthAPI } from "~/api/auth";

export async function requireAuth() {
  try {
    const user = await AuthAPI.me();

    return user;
  } catch {
    throw redirect("/login");
  }
}
