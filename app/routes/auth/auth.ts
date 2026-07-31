import { api } from "~/lib/axios";

export type LoginPayload = {
  username: string;
  password: string;
};

export type User = {
  id: string;
  username: string;
  fullname: string;
  level: string;
};

// 1. Send 1 single object { username, password }
export async function login(data: LoginPayload) {
  const response = await api.post("/auth/login", data);
  return response.data;
}

// 2. Fetch active user profile
export async function me(): Promise<User> {
  const response = await api.get("/auth/me");
  return response.data;
}

// 3. Logout
export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}
