import { api } from "./client";

export const AuthAPI = {
  login(data: { username: string; password: string }) {
    return api("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me() {
    return api("/auth/me");
  },

  logout() {
    return api("/auth/logout", {
      method: "POST",
    });
  },
};
