import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("login", "routes/auth/login.tsx"),

  ...prefix("admin", [
    layout("routes/layouts.tsx", [
      index("routes/dashboard/dashboard.tsx"),

      ...prefix("customers", [
        index("routes/customers/customers.tsx"),
        // route("create", "routes/customers/create.tsx"),
        // route(":id", "routes/customers/CustomerDetail.tsx"),
      ]),

      // ...prefix("payments", [
      //   index("routes/pembayaran/pembayaran.tsx"),
      //   route("create", "routes/pembayaran/create.tsx"),
      //   route(":id", "routes/pembayaran/detail.tsx"),
      // ]),
    ]),
  ]),
] satisfies RouteConfig;
