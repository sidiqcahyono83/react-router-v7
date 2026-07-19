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
    layout("routes/auth/auth-layout.tsx", [
      layout("routes/layouts.tsx", [
        index("routes/dashboard/dashboard.tsx"),
        route("customers", "routes/customers/customers.tsx"),

        route("customers/create", "routes/customers/create.tsx"),

        route("customers/:id", "routes/customers/detail.tsx"),

        route("customers/:id/edit", "routes/customers/edit.tsx"),

        //Pembayaran
        route("pembayaran", "routes/pembayaran/pembayaran.tsx"),
        route("pembayaran/create", "routes/pembayaran/create.tsx"),
        route("pembayaran/:id", "routes/pembayaran/detail.tsx"),
        route("pembayaran/:id/edit", "routes/pembayaran/edit.tsx"),

        //Paket
        route("paket", "routes/paket/paket.tsx"),
        route("paket/create", "routes/paket/create.tsx"),
        route("paket/:id", "routes/paket/detail.tsx"),
        route("paket/:id/edit", "routes/paket/edit.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
