// src/services/auth.js
//import { http } from "../lib/http";

// Lee sesión guardada (si existe)
export function getStoredSession() {
  try {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType") || "Bearer";
    const rawUser = localStorage.getItem("auth.user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    return { token, tokenType, user };
  } catch {
    return { token: null, tokenType: "Bearer", user: null };
  }
}

// MOCK de login: cámbialo por tu API real luego
export async function login(email, password) {
  // Ejemplo de conexión real (cuando tengas endpoint):
  // const res = await http.post("/auth/login", { email, password });
  // return { token: res.access_token, tokenType: res.token_type || "Bearer", user: res.user };

  // Mock temporal
  if (!email || !password) throw new Error("Credenciales inválidas");
  // Simula perfil básico
  const user = { id: 1, name: "Usuario Demo", email };
  return {
    token: "demo-token-123",
    tokenType: "Bearer",
    user,
  };
}

export function logout() {
  // Si tu API requiere invalidar tokens refresco/sesión, hazlo aquí.
  // await http.post("/auth/logout");
  return true;
}
