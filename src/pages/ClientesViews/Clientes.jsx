// src/pages/Clientes.jsx
import { useMemo, useState } from "react";

/**
 * Clientes.jsx
 * - Dos vistas: "Kanban" (por defecto) y "Lista".
 * - Toggle arriba a la derecha.
 * - Responsive, minimal y consistente con el estilo (slate + acentos azul/gradient).
 */

const MOCK_CLIENTES = [
  { id: 1, nombre: "María López", empresa: "AgroSol", email: "maria@agrosol.gt", telefono: "+502 5555-1001", status: "Nuevo" },
  { id: 2, nombre: "Juan Pérez", empresa: "Juppiter", email: "juan@juppiter.dev", telefono: "+502 5555-1002", status: "Activo" },
  { id: 3, nombre: "Ana Gómez", empresa: "FreshCo", email: "ana@freshco.com", telefono: "+502 5555-1003", status: "VIP" },
  { id: 4, nombre: "Carlos Ruiz", empresa: "Verde SA", email: "carlos@verde.com", telefono: "+502 5555-1004", status: "Inactivo" },
  { id: 5, nombre: "Lucía Martínez", empresa: "CampoFeliz", email: "lucia@campofeliz.gt", telefono: "+502 5555-1005", status: "Activo" },
  { id: 6, nombre: "Diego Hernández", empresa: "DeportesWeb", email: "diego@deportesweb.com", telefono: "+502 5555-1006", status: "Nuevo" },
  { id: 7, nombre: "Sofía Ramírez", empresa: "PinaPro", email: "sofia@pinapro.com", telefono: "+502 5555-1007", status: "VIP" },
  { id: 8, nombre: "Pedro Sánchez", empresa: "MarketGT", email: "pedro@market.gt", telefono: "+502 5555-1008", status: "Inactivo" },
];

const statusBadgeClass = (s) => {
  switch (s) {
    case "Nuevo":
      return "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
    case "Activo":
      return "bg-green-100 text-green-700 ring-1 ring-green-200";
    case "VIP":
      return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
};

const initials = (fullName = "") =>
  fullName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function Clientes() {
  const [view, setView] = useState("kanban"); // "kanban" | "list"
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return MOCK_CLIENTES;
    return MOCK_CLIENTES.filter((c) =>
      [c.nombre, c.empresa, c.email, c.telefono, c.status].join(" ").toLowerCase().includes(term)
    );
  }, [q]);

  return (
    <div className="space-y-6">
      {/* Header + acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">Gestiona tu cartera de clientes y cambia de vista cuando lo necesites.</p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Buscador */}
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar cliente…"
              className="h-10 w-56 rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-2 focus:border-blue-500"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </div>

          {/* Toggle de vista (esquina superior derecha) */}
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
            <button
              onClick={() => setView("kanban")}
              className={[
                "px-3 py-2 text-sm flex items-center gap-2",
                view === "kanban" ? "bg-gradient-to-tr from-blue-600 to-blue-400 text-white" : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
              title="Vista Kanban"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="6" height="16" rx="1" />
                <rect x="10" y="4" width="4" height="16" rx="1" />
                <rect x="15" y="4" width="6" height="16" rx="1" />
              </svg>
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setView("list")}
              className={[
                "px-3 py-2 text-sm flex items-center gap-2",
                view === "list" ? "bg-gradient-to-tr from-blue-600 to-blue-400 text-white" : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
              title="Vista Lista"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="5" width="16" height="2" rx="1" />
                <rect x="4" y="11" width="16" height="2" rx="1" />
                <rect x="4" y="17" width="16" height="2" rx="1" />
              </svg>
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {view === "kanban" ? <Kanban data={filtered} /> : <Lista data={filtered} />}
    </div>
  );
}

/* =========================
   VISTA KANBAN (por defecto)
   - Tarjetas en grid, SIN columnas por estatus.
   ========================= */
function Kanban({ data }) {
  if (data.length === 0) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <svg className="mb-2 h-6 w-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 7a2 2 0 012-2h3l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
        <p className="text-sm text-slate-500">No hay clientes para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((c) => (
        <ClientCard key={c.id} c={c} />
      ))}
    </div>
  );
}

function ClientCard({ c }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white text-sm font-semibold">
          {initials(c.nombre)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-semibold text-slate-900">{c.nombre}</p>
            <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${statusBadgeClass(c.status)}`}>{c.status}</span>
          </div>
          <p className="truncate text-xs text-slate-500">{c.empresa}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 5.5A2.5 2.5 0 014.5 3h2.1c.5 0 .93.34 1.06.83l.6 2.07c.1.34 0 .72-.28.95l-1.2.98a12.3 12.3 0 005.49 5.49l.98-1.2c.23-.27.61-.38.95-.28l2.07.6c.49.14.83.55.83 1.06v2.1A2.5 2.5 0 0118.5 22h-1A15.5 15.5 0 012 6.5v-1z" />
              </svg>
              {c.telefono}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25V6.75zm2.42.75l6.58 4.385a1.5 1.5 0 001.7 0L19.54 7.5H4.67z" />
              </svg>
              {c.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============
   VISTA LISTA
   =============== */
function Lista({ data }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-auto">
          <thead className="bg-slate-50">
            <tr>
              <Th>Cliente</Th>
              <Th className="hidden md:table-cell">Empresa</Th>
              <Th className="hidden lg:table-cell">Teléfono</Th>
              <Th className="hidden lg:table-cell">Email</Th>
              <Th>Status</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No se encontraron clientes con ese filtro.
                </td>
              </tr>
            ) : (
              data.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white text-xs font-semibold">
                        {initials(c.nombre)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{c.nombre}</p>
                        <p className="truncate text-xs text-slate-500 lg:hidden">{c.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="hidden md:table-cell">
                    <p className="text-sm text-slate-700">{c.empresa}</p>
                  </Td>
                  <Td className="hidden lg:table-cell">
                    <p className="text-sm text-slate-700">{c.telefono}</p>
                  </Td>
                  <Td className="hidden lg:table-cell">
                    <p className="truncate text-sm text-slate-700">{c.email}</p>
                  </Td>
                  <Td>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusBadgeClass(c.status)}`}>{c.status}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <IconButton title="Llamar">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 5.5A2.5 2.5 0 014.5 3h2.1c.5 0 .93.34 1.06.83l.6 2.07c.1.34 0 .72-.28.95l-1.2.98a12.3 12.3 0 005.49 5.49l.98-1.2c.23-.27.61-.38.95-.28l2.07.6c.49.14.83.55.83 1.06v2.1A2.5 2.5 0 0118.5 22h-1A15.5 15.5 0 012 6.5v-1z" />
                        </svg>
                      </IconButton>
                      <IconButton title="Email">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25V6.75zm2.42.75l6.58 4.385a1.5 1.5 0 001.7 0L19.54 7.5H4.67z" />
                        </svg>
                      </IconButton>
                      <IconButton title="Ver">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 5c5.523 0 10 5 10 7s-4.477 7-10 7S2 14 2 12s4.477-7 10-7zm0 3a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                      </IconButton>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500 ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
function IconButton({ children, title }) {
  return (
    <button
      title={title}
      className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
      type="button"
    >
      {children}
    </button>
  );
}
