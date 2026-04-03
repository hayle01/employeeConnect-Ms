import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return <Navigate to="/overview" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
