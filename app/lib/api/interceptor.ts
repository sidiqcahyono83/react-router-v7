import axios from "axios";

import { api } from "./client";

api.interceptors.request.use(
  (config) => {
    return config;
  },

  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (axios.isAxiosError(error)) {
      switch (error.response?.status) {
        case 401:
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          break;

        case 403:
          console.error("Forbidden");
          break;

        case 404:
          console.error("Not Found");
          break;

        case 500:
          console.error("Internal Server Error");
          break;
      }
    }

    return Promise.reject(error);
  },
);
