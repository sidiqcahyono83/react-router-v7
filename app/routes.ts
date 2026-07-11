import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("./routes/layouts.tsx", [
    ...prefix("customers", [
      index("routes/customers.tsx"),
      route(":id", "routes/customers/detailLoader.tsx"),
      route("create", "routes/customers/create.tsx"),
      // route("edit/:id", "routes/customers/edit.tsx"),
    ]),
    ...prefix("pembayaran", [
      index("routes/pembayaran/pembayaran.tsx"),
      route(":pembayaranId", "routes/pembayaran/detail.tsx"),
      route("create", "routes/pembayaran/create.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
