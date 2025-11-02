// src/pages/Facturas.jsx
import { useMemo, useState } from "react";

/**
 * Facturas.jsx
 * - Dos vistas: "Kanban" (por defecto) y "Lista".
 * - Toggle arriba a la derecha.
 * - Buscador simple (filtra por número, cliente, estado).
 * - Mismo estilo que Clientes (slate + acentos azul/gradient).
 * - Sin otras funcionalidades extra.
 */

const FACTURAS = [
  {
    id: 1,
    numero: "FEL-2025-000123",
    cliente: "Distribuidora GT, S.A.",
    fecha: "2025-10-15",
    vencimiento: "2025-11-15",
    estado: "Emitida",
    total: 5320.75,
    saldo: 5320.75,
  },
  {
    id: 2,
    numero: "FEL-2025-000124",
    cliente: "Juppiter",
    fecha: "2025-10-10",
    vencimiento: "2025-10-20",
    estado: "Vencida",
    total: 899.0,
    saldo: 200.0,
  },
  {
    id: 3,
    numero: "FEL-2025-000125",
    cliente: "AgroConecta",
    fecha: "2025-10-05",
    vencimiento: "2025-10-05",
    estado: "Pagada",
    total: 1500.0,
    saldo: 0.0,
  },
  {
    id: 4,
    numero: "FEL-2025-000126",
    cliente: "Identidad Studio",
    fecha: "2025-10-28",
    vencimiento: "2025-11-12",
    estado: "Emitida",
    total: 7500.0,
    saldo: 7500.0,
  },
  {
    id: 5,
    numero: "FEL-2025-000127",
    cliente: "DeportesWeb",
    fecha: "2025-09-20",
    vencimiento: "2025-10-20",
    estado: "Anulada",
    total: 3200.0,
    saldo: 0.0,
  },
];

const fmtQ = (n) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ", maximumFractionDigits: 2 }).format(n);

const fmtDate = (iso) => new Date(iso).toLocaleDateString("es-GT");

const chipEstado = (estado) => {
  switch (estado) {
    case "Emitida":
      return "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
    case "Pagada":
      return "bg-green-100 text-green-700 ring-1 ring-green-200";
    case "Vencida":
      return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
    case "Anulada":
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
};

export default function Facturas() {
  const [view, setView] = useState("kanban"); // "kanban" | "list"
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return FACTURAS;
    return FACTURAS.filter((f) =>
      [f.numero, f.cliente, f.estado].join(" ").toLowerCase().includes(term)
    );
  }, [q]);

  return (
    <div className="space-y-6">
      {/* Header: título, buscador y toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Facturas</h1>
          <p className="text-sm text-slate-500">Listado y tarjetas de facturas.</p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Buscador */}
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por número, cliente o estado…"
              className="h-10 w-72 rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-2 focus:border-blue-500"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </div>

          {/* Toggle de vista */}
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
            <button
              onClick={() => setView("kanban")}
              className={[
                "px-3 py-2 text-sm flex items-center gap-2",
                view === "kanban"
                  ? "bg-gradient-to-tr from-blue-600 to-blue-400 text-white"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
              title="Vista Kanban"
              type="button"
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
                view === "list"
                  ? "bg-gradient-to-tr from-blue-600 to-blue-400 text-white"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
              title="Vista Lista"
              type="button"
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
      {view === "kanban" ? <Kanban data={data} /> : <Lista data={data} />}
    </div>
  );
}

/* =========================
   VISTA KANBAN (tarjetas)
   ========================= */
function Kanban({ data }) {
  if (data.length === 0) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <svg className="mb-2 h-6 w-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 7a2 2 0 012-2h3l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
        <p className="text-sm text-slate-500">No hay facturas para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((f) => (
        <FacturaCard key={f.id} f={f} />
      ))}
    </div>
  );
}

function FacturaCard({ f }) {
  const saldoZero = f.saldo <= 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow">
      {/* Header: número + estado */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="truncate text-sm font-semibold text-slate-900">{f.numero}</p>
        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] ${chipEstado(f.estado)}`}>{f.estado}</span>
      </div>

      {/* Cliente */}
      <p className="truncate text-xs text-slate-500">{f.cliente}</p>

      {/* Fechas */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div>
          <p className="text-slate-500">Emisión</p>
          <p className="font-medium text-slate-800">{fmtDate(f.fecha)}</p>
        </div>
        <div>
          <p className="text-slate-500">Vence</p>
          <p className="font-medium text-slate-800">{fmtDate(f.vencimiento)}</p>
        </div>
      </div>

      {/* Totales */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-sm font-semibold text-slate-900">{fmtQ(f.total)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Saldo</p>
          <p className={`text-sm font-semibold ${saldoZero ? "text-green-600" : "text-slate-900"}`}>
            {saldoZero ? "Q0.00" : fmtQ(f.saldo)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===============
   VISTA LISTA (tabla)
   =============== */
function Lista({ data }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] table-auto">
          <thead className="bg-slate-50">
            <tr>
              <Th>Factura</Th>
              <Th>Cliente</Th>
              <Th>Emisión</Th>
              <Th>Vencimiento</Th>
              <Th>Estado</Th>
              <Th>Total</Th>
              <Th>Saldo</Th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                  No hay facturas para mostrar.
                </td>
              </tr>
            ) : (
              data.map((f) => {
                const saldoZero = f.saldo <= 0;
                return (
                  <tr key={f.id} className="border-b border-slate-100">
                    <Td>
                      <p className="truncate text-sm font-semibold text-slate-900">{f.numero}</p>
                    </Td>
                    <Td>
                      <p className="truncate text-sm text-slate-700">{f.cliente}</p>
                    </Td>
                    <Td>
                      <p className="text-sm text-slate-700">{fmtDate(f.fecha)}</p>
                    </Td>
                    <Td>
                      <p className="text-sm text-slate-700">{fmtDate(f.vencimiento)}</p>
                    </Td>
                    <Td>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${chipEstado(f.estado)}`}>{f.estado}</span>
                    </Td>
                    <Td>
                      <p className="text-sm font-medium text-slate-900">{fmtQ(f.total)}</p>
                    </Td>
                    <Td>
                      <p className={`text-sm font-medium ${saldoZero ? "text-green-600" : "text-slate-900"}`}>
                        {saldoZero ? "Q0.00" : fmtQ(f.saldo)}
                      </p>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===============
   Helpers UI
   =============== */
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
