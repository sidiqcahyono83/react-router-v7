import { api } from "~/lib/axios";

export async function getSession() {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch {
    return null;
  }
}
