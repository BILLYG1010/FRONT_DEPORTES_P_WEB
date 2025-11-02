// src/components/Topbar.jsx
import { useLocation } from "react-router-dom";

export default function Topbar({ onOpenSidebar, user }) {
  const { pathname } = useLocation();
  const crumb = pathname === "/" ? "home" : pathname.replace("/", "");

  const displayName = user?.name ?? "Usuario";
  const role = user?.role ?? "Administrador"; // muestra el rol debajo del nombre
  const avatarUrl =
    user?.avatarUrl ?? "https://i.pravatar.cc/100?img=12"; // reemplaza por tu URL

  return (
    <nav className="w-full bg-transparent rounded-xl px-0 py-0">
      <div className="flex items-center justify-between gap-3">
        {/* Breadcrumb + título */}
        <div className="capitalize">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center">
              <li className="text-sm text-blue-900 opacity-50">
                <span className="hover:text-blue-500">dashboard</span>
                <span className="mx-2 text-gray-500">/</span>
              </li>
              <li className="text-sm text-blue-900">{crumb}</li>
            </ol>
          </nav>
          <h6 className="text-base font-semibold text-slate-900">{crumb}</h6>
        </div>

        {/* Derecha: burger (mobile) + notificaciones + usuario */}
        <div className="flex items-center gap-2">
          {/* Abrir sidebar (solo mobile) */}
          <button
            onClick={onOpenSidebar}
            className="grid xl:hidden place-items-center h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-500/10"
            type="button"
            aria-label="Open sidebar"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path
                fillRule="evenodd"
                d="M3 6.75h18v1.5H3v-1.5zM3 12h18v1.5H3V12zm0 5.25h18v1.5H3v-1.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Notificaciones */}
          <button
            className="grid place-items-center h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-500/10"
            type="button"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Usuario: avatar + nombre (arriba) y rol (abajo) */}
          <div className="flex items-center gap-3 pl-2">
            <div className="h-10 w-10 rounded-full ring-2 ring-white/70 overflow-hidden">
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <p className="text-sm font-medium leading-tight text-slate-900">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 leading-tight">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
