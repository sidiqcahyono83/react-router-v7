import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"),
    route("layouts", "routes/layouts.tsx"),
] satisfies RouteConfig;
