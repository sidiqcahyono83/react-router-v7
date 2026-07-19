import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";

export default function AuthLayout() {
  const { initialized, user } = useAuth();

  // console.log("AUTH LAYOUT", {
  //   initialized,
  //   user,
  // });

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // console.log("REDIRECT LOGIN");
    return <Navigate to="/login" replace />;
  }

  // console.log("MASUK ADMIN");

  return <Outlet />;
}
