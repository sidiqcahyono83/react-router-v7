import { api, API_ENDPOINT } from "../../../lib/api/index";

import type { AuthUser } from "../types";

export async function getCurrentUser() {
  const { data } = await api.get<AuthUser>(API_ENDPOINT.auth.me);

  return data;
}
