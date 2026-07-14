import { env } from "./env";

export const appConfig = {
  name: env.APP_NAME,

  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
  },

  dateFormat: "dd MMM yyyy",

  currency: "IDR",

  locale: "id-ID",
} as const;
