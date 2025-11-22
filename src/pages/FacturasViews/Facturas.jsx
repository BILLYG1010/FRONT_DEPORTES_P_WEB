// src/pages/FacturasViews/Facturas.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getFacturas } from "../../services/facturas";

/**
 * Facturas.jsx
 * - Vista Kanban (por defecto) y Lista.
 * - Click en tarjeta/registro → navega a FacturasForm.
 * - Botón "Nueva factura" igual Inventario/Clientes.
 */

const statusBadgeClass = (estado) => {
  switch (estado) {
    case 1:
      return "bg-green-100 text-green-700 ring-1 ring-green-200"; // Aprobada
    case 2:
      return "bg-rose-100 text-rose-700 ring-1 ring-rose-200"; // Anulada
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200"; // Pendiente
  }
};

const statusText = (estado) =>
  estado === 1 ? "Aprobada" : estado === 2 ? "Anulada" : "Pendiente";

const safe = (v, fallback = "—") => (v == null || v === "" ? fallback : v);

const fmtQ = (n) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

export default function Facturas() {
  const [view, setView] = useState("kanban");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    getFacturas()
      .then(({ items }) => {
        if (!alive) return;
        setRows(Array.isArray(items) ? items : []);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "Error al cargar facturas");
      })
      .finally(() => alive && setLoading(false));
    return () => (alive = false);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((f) => {
      return [
        f.uuid,
        f.serie,
        f.correlativo,
        f.observaciones,
        statusText(f.estado),
        f.id_cliente_emisor,
        f.id_cliente_receptor,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [q, rows]);

  return (
    <div className="space-y-6">
      {/* Header + acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Botones izquierdos */}
        <div className="flex items-center gap-2">
          <Link
            to="/facturas/new"
            className="h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 px-4 text-sm text-white grid place-items-center hover:opacity-95"
          >
            Nueva factura
          </Link>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Buscador */}
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar factura… UUID / serie / observación"
              className="h-10 w-64 rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-2 focus:border-blue-500"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </div>

          {/* Toggle vista */}
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

      {/* Estados */}
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {error}
        </div>
      ) : loading ? (
        view === "kanban" ? <KanbanSkeleton /> : <ListaSkeleton />
      ) : view === "kanban" ? (
        <Kanban data={filtered} />
      ) : (
        <Lista data={filtered} />
      )}
    </div>
  );
}

/* =========================
   VISTA KANBAN
   ========================= */
function Kanban({ data }) {
  if (!data || data.length === 0) {
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
        <Link
          key={f.id}
          to={`/facturas/${f.id}`}
          className="block overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow transition-shadow"
        >
          <FacturaCard f={f} />
        </Link>
      ))}
    </div>
  );
}

function FacturaCard({ f }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {safe(f.serie)}-{safe(f.correlativo, "…")}
          </p>
          <p className="truncate text-xs text-slate-500">
            UUID: {safe(f.uuid)}
          </p>
        </div>

        <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusBadgeClass(f.estado)}`}>
          {statusText(f.estado)}
        </span>
      </div>

      <div className="text-xs text-slate-600 space-y-1">
        <p>Emisor ID: {safe(f.id_cliente_emisor)}</p>
        <p>Receptor ID: {safe(f.id_cliente_receptor)}</p>
        <p>Usuario ID: {safe(f.id_usuario)}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <p className="text-sm font-semibold text-slate-900">{fmtQ(f.total)}</p>
        <p className="text-xs text-slate-500">
          {f.fecha_emision ? new Date(f.fecha_emision).toLocaleString() : "—"}
        </p>
      </div>

      {f.observaciones ? (
        <p className="text-xs text-slate-500 line-clamp-2">
          {f.observaciones}
        </p>
      ) : null}
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
        <table className="w-full min-w-[900px] table-auto">
          <thead className="bg-slate-50">
            <tr>
              <Th>Factura</Th>
              <Th>UUID</Th>
              <Th>Emisor</Th>
              <Th>Receptor</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                  No se encontraron facturas con ese filtro.
                </td>
              </tr>
            ) : (
              data.map((f) => (
                <tr key={f.id} className="border-b border-slate-100">
                  <Td>
                    <Link
                      to={`/facturas/${f.id}`}
                      className="block truncate text-sm font-semibold text-slate-900 hover:underline"
                    >
                      {safe(f.serie)}-{safe(f.correlativo, "…")}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {f.fecha_emision ? new Date(f.fecha_emision).toLocaleDateString() : "—"}
                    </p>
                  </Td>

                  <Td>
                    <p className="truncate text-sm text-slate-700">{safe(f.uuid)}</p>
                  </Td>

                  <Td>
                    <p className="text-sm text-slate-700">{safe(f.id_cliente_emisor)}</p>
                  </Td>

                  <Td>
                    <p className="text-sm text-slate-700">{safe(f.id_cliente_receptor)}</p>
                  </Td>

                  <Td>
                    <p className="text-sm font-medium text-slate-900">{fmtQ(f.total)}</p>
                  </Td>

                  <Td>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusBadgeClass(f.estado)}`}>
                      {statusText(f.estado)}
                    </span>
                  </Td>

                  <Td>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/facturas/${f.id}`}
                        className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                        title="Ver/Editar"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 5c5.523 0 10 5 10 7s-4.477 7-10 7S2 14 2 12s4.477-7 10-7zm0 3a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                      </Link>
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

/* =========================
   Skeletons
   ========================= */
function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm p-4 space-y-3">
          <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-slate-100 animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-1/3 rounded bg-slate-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function ListaSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] table-auto">
          <thead className="bg-slate-50">
            <tr>
              {["Factura", "UUID", "Emisor", "Receptor", "Total", "Status", "Acciones"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100">
                {Array.from({ length: 7 }).map((__, j) => (
                  <Td key={j}>
                    <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================
   Helpers
   ========================= */
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
