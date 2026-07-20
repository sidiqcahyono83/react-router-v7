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

        //Customers
        route("customers", "routes/customers/customers.tsx"),
        route(
          "customers/create",
          "routes/customers/CustomerCreateWithPpoePage.tsx",
        ),
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

        //Area
        route("area", "routes/area/area.tsx"),
        route("area/create", "routes/area/create.tsx"),
        route("area/:id", "routes/area/detail.tsx"),
        route("area/:id/edit", "routes/area/edit.tsx"),
        //Modem
        route("modem", "routes/modem/modem.tsx"),
        route("modem/create", "routes/modem/create.tsx"),
        route("modem/:id", "routes/modem/detail.tsx"),
        route("modem/:id/edit", "routes/modem/edit.tsx"),

        //Odp
        route("odp", "routes/odp/odp.tsx"),
        route("odp/create", "routes/odp/create.tsx"),
        route("odp/:id", "routes/odp/detail.tsx"),
        route("odp/:id/edit", "routes/odp/edit.tsx"),
        //OLT
        route("olt", "routes/olt/olt.tsx"),
        route("olt/create", "routes/olt/create.tsx"),
        route("olt/:id", "routes/olt/detail.tsx"),
        route("olt/:id/edit", "routes/olt/edit.tsx"),

        //Pendapatan
        route("laporan/pendapatan", "routes/pendapatan/pendapatan.tsx"),
        // route("pendapatan/create", "routes/pendapatan/create.tsx"),
        // route("pendapatan/:id", "routes/pendapatan/detail.tsx"),
        // route("pendapatan/:id/edit", "routes/pendapatan/edit.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
