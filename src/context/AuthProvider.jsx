// src/context/AuthProvider.jsx
import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context";
import { login as apiLogin, logout as apiLogout, getStoredSession } from "../services/auth";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [tokenType, setTokenType] = useState("Bearer");
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);

  // Restaurar sesión al montar
  useEffect(() => {
    const s = getStoredSession();
    if (s?.token) {
      setToken(s.token);
      setTokenType(s.tokenType || "Bearer");
      setUser(s.user || null);
    }
    setBooted(true);
  }, []);

  // Iniciar sesión
  const signIn = async (email, password) => {
    const { token, tokenType, user } = await apiLogin(email, password);
    localStorage.setItem("token", token);
    localStorage.setItem("tokenType", tokenType || "Bearer");
    localStorage.setItem("auth.user", JSON.stringify(user || null));
    setToken(token);
    setTokenType(tokenType || "Bearer");
    setUser(user || null);
  };

  // Cerrar sesión
  const signOut = () => {
    try { apiLogout?.(); } catch { /* empty */ }
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("auth.user");
    setToken(null);
    setTokenType("Bearer");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      tokenType,
      user,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
      booted,
    }),
    [token, tokenType, user, booted]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
