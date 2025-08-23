import { useAuth } from "@/hooks/use-auth";
import { Navigate, Outlet, useLocation } from "react-router";

export function ProtectedPages() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
