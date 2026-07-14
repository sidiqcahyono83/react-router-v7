import { useRouteLoaderData } from "react-router";

import type { loader } from "~/root";

export function useAuth() {
  const data = useRouteLoaderData<typeof loader>("root");

  return {
    user: data?.user ?? null,
    isAuthenticated: !!data?.user,
  };
}
