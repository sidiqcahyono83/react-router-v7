import { api } from "~/lib/axios";
import { useContext } from "react";
import { AuthContext } from "~/context/AuthContext";


export type LoginPayload = {
  username: string;
  password: string;
};

export async function login(data: LoginPayload) {
  const response = await api.post("/auth/login", data);
  return response.data;
}

export async function me() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }

  return context;
}
