import { api } from "~/lib/axios";

export interface LoginRequest {
  username: string;
  password: string;
}

export const AuthAPI = {
  login(data: LoginRequest) {
    return api.post("/auth/login", data);
  },

  me() {
    return api.get("/auth/me");
  },

  logout() {
    return api.post("/auth/logout");
  },
};
