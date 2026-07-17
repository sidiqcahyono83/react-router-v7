import { redirect } from "react-router";
import { AuthAPI } from "~/api/auth";
import type { User } from "~/types/typdeData";

export async function requireAuth() {
  try {
    const user = (await AuthAPI.me()) as User;

    return user;
  } catch {
    throw redirect("/login");
  }
}
