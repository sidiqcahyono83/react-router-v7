import axios from "axios";

import { env } from "~/config";

export const api = axios.create({
  baseURL: env.API_URL,

  withCredentials: true,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  timeout: 10000,
});
