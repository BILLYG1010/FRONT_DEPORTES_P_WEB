// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, booted } = useAuth();
  const loc = useLocation();
  if (!booted) return null; // o un loader central
  if (!isAuthenticated) {
    const redirectTo = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
  }
  return <Outlet />;
}
