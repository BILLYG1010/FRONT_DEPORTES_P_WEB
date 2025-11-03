// src/components/GuestOnlyRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GuestOnlyRoute({ children }) {
  const { isAuthenticated, booted } = useAuth();
  if (!booted) return null; // o un loader
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}
