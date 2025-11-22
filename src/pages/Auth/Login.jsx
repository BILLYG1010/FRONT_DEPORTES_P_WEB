// src/pages/Auth/Login.jsx
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(redirect, { replace: true });
    } catch (error) {
      setErr(error?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
          {/* Panel copy (solo desktop) */}
          <div className="hidden lg:flex flex-col text-white p-6">
            <h1 className="font-bold text-5xl mb-3 text-white">
              ¡Bienvenido de vuelta!
            </h1>
            <p className="opacity-90">
              Inicia sesión para acceder a tu panel y continuar gestionando tus clientes, inventario y facturas.
            </p>

            {/* SVG centrado debajo del título */}
            <img
              src="/secury.svg"
              alt="Seguridad"
              className="mx-auto mt-8 h-40 w-auto opacity-95"
            />
          </div>

          {/* Card login */}
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full">
            <div className="mb-6">
              <h3 className="font-semibold text-2xl text-gray-900">Iniciar sesión</h3>
              <p className="text-gray-500">Ingresa tus credenciales para continuar.</p>
            </div>

            {err && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
                {err}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full text-base px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-2 focus:border-blue-500"
                  placeholder="mail@tuempresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative">
                  <input
                    type={show ? "text" : "password"}
                    className="w-full text-base px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-2 focus:border-blue-500 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-600"
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                   
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-blue-600 focus:ring-blue-400"
                  />
                  Recuérdame
                </label>
                <Link to="#" className="text-sm text-blue-500 hover:text-blue-600">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center bg-gradient-to-tr from-blue-600 to-blue-400 hover:brightness-110 disabled:opacity-60 text-white p-3 rounded-full font-semibold shadow-lg transition"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <div className="pt-5 text-center text-gray-400 text-xs">
              <span>
                © {new Date().getFullYear()} Juppiter •{" "}
                <a href="#" className="text-blue-500 hover:text-blue-600">
                  Términos
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Línea superior de acento */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400" />
    </div>
  );
}
