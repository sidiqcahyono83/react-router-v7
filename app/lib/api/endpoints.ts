export const API_ENDPOINT = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },

  dashboard: {
    summary: "/dashboard/summary",
  },

  customers: {
    list: "/customers",
    detail: (id: number | string) => `/customers/${id}`,
  },

  packages: {
    list: "/packages",
    detail: (id: number | string) => `/packages/${id}`,
  },

  invoices: {
    list: "/invoices",
    detail: (id: number | string) => `/invoices/${id}`,
  },

  payments: {
    list: "/payments",
    detail: (id: number | string) => `/payments/${id}`,
  },
} as const;
