import { useAuth } from "@/hooks/use-auth";
import { Loader } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

export function ProtectedPages() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div className="grid h-dvh place-items-center">
        <Loader className="animate-spin" />
      </div>
    );

  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
