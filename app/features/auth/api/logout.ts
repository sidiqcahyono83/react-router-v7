import { api, API_ENDPOINT } from "../../../lib/api/index";

export async function logout() {
  const { data } = await api.post(API_ENDPOINT.auth.logout);

  return data;
}
