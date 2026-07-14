import { api, API_ENDPOINT } from "../../lib/api";

import type { AuthUser } from "~/features/auth";

export async function getSession() {
  try {
    const { data } = await api.get<AuthUser>(API_ENDPOINT.auth.me);

    return data;
  } catch {
    return null;
  }
}
