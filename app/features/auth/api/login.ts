import { api, API_ENDPOINT } from "~/lib/api";

import type { LoginRequest, LoginResponse } from "../types";

export async function login(data: LoginRequest) {
  const response = await api.post<LoginResponse>(API_ENDPOINT.auth.login, data);

  return response.data;
}
