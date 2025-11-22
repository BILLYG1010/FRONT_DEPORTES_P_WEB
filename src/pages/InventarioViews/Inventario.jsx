// src/pages/InventarioViews/Inventario.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProductos } from "../../services/inventario";

/**
 * Inventario.jsx
 * - Mismo UX que Clientes:
 *   - Vista Kanban (default) y Lista
 *   - Buscador
 *   - Botones "Nuevo producto" y "Importar/exportar"
 *   - Click en tarjeta/fila -> ProductoForm
 */

const fmtQ = (n) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

const safe = (v, fallback = "—") => (v == null || v === "" ? fallback : v);

const statusBadgeClass = (s) =>
  s === "Activo"
    ? "bg-green-100 text-green-700 ring-1 ring-green-200"
    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

const initials = (fullName = "") =>
  fullName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const chipStock = (qty) => {
  const n = Number(qty || 0);
  if (n <= 0) return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  if (n <= 5) return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
  if (n <= 20) return "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200";
  return "bg-green-100 text-green-700 ring-1 ring-green-200";
};

export default function Inventario() {
  const [view, setView] = useState("kanban"); // "kanban" | "list"
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    getProductos()
      .then(({ items }) => {
        if (!alive) return;
        setRows(Array.isArray(items) ? items : []);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "Error al cargar productos");
      })
      .finally(() => alive && setLoading(false));
    return () => (alive = false);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((p) =>
      [p.nombre, p.sku, p.descripcion, p.categoria]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [q, rows]);

  return (
    <div className="space-y-6">
      {/* Header + acciones (igual a Clientes) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/inventario/new"
            className="h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 px-4 text-sm text-white grid place-items-center hover:opacity-95"
          >
            Nuevo producto
          </Link>
          <Link
            to="/inventario/import-export"
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50"
          >
            Importar/exportar
          </Link>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Buscador */}
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar producto o SKU…"
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
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
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
        <p className="text-sm text-slate-500">No hay productos para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((p) => (
        <Link
          key={p.id}
          to={`/inventario/${p.id}`}
          className="block overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow transition-shadow"
        >
          <ProductCard p={p} />
        </Link>
      ))}
    </div>
  );
}

function ProductCard({ p }) {
  // imagen_url todavía no existe en API, dejamos fallback
  const hasUrl = Boolean(p.imagen_url);

  return (
    <div className="flex items-stretch">
      {/* Imagen izquierda, toda la altura (igual que clientes) */}
      <div className="w-24 flex-shrink-0">
        {hasUrl ? (
          <img
            src={p.imagen_url}
            alt={p.nombre}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.style.background = "#e5e7eb";
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-tr from-blue-600 to-blue-400 text-white text-lg font-semibold">
            {initials(p.nombre)}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="relative flex-1 p-4 pr-4">
        <p className="truncate text-sm font-semibold text-slate-900">{safe(p.nombre)}</p>
        <p className="truncate text-xs text-slate-500">SKU: {safe(p.sku)}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          {/* FUTURO: categoría */}
          {/* <span className="inline-flex items-center gap-1">{safe(p.categoria)}</span> */}

          <span className="inline-flex items-center gap-1 font-medium">
            {fmtQ(p.precio)}
          </span>

          <span className={`rounded-full px-2 py-0.5 text-[11px] ${chipStock(p.stock)}`}>
            {p.stock <= 0 ? "Sin stock" : `Stock: ${p.stock}`}
          </span>
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
              <Th>Producto</Th>
              <Th>SKU</Th>
              {/* FUTURO: Categoría */}
              {/* <Th className="hidden md:table-cell">Categoría</Th> */}
              <Th>Precio</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No se encontraron productos con ese filtro.
                </td>
              </tr>
            ) : (
              data.map((p) => {
                const statusText = p.activo ? "Activo" : "Inactivo";
                return (
                  <tr key={p.id} className="border-b border-slate-100">
                    {/* Producto clickeable */}
                    <Td>
                      <Link to={`/inventario/${p.id}`} className="block min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 hover:underline">
                          {safe(p.nombre)}
                        </p>
                        <p className="truncate text-xs text-slate-500 md:hidden">SKU: {safe(p.sku)}</p>
                      </Link>
                    </Td>

                    <Td>
                      <p className="text-sm text-slate-700">{safe(p.sku)}</p>
                    </Td>

                    {/* FUTURO: categoría */}
                    {/* <Td className="hidden md:table-cell">
                      <p className="text-sm text-slate-700">{safe(p.categoria)}</p>
                    </Td> */}

                    <Td>
                      <p className="text-sm font-medium text-slate-900">{fmtQ(p.precio)}</p>
                    </Td>

                    <Td>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${chipStock(p.stock)}`}>
                        {p.stock <= 0 ? "Sin stock" : p.stock}
                      </span>
                    </Td>

                    <Td>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusBadgeClass(statusText)}`}>
                        {statusText}
                      </span>
                    </Td>

                    <Td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/inventario/${p.id}`}
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
                );
              })
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
        <div key={i} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-stretch">
            <div className="w-24 bg-slate-100 animate-pulse" />
            <div className="flex-1 p-4 space-y-2">
              <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
              <div className="mt-3 flex gap-3">
                <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListaSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-auto">
          <thead className="bg-slate-50">
            <tr>
              {["Producto", "SKU", "Precio", "Stock", "Status", "Acciones"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100">
                <Td>
                  <div className="min-w-0">
                    <div className="h-4 w-40 rounded bg-slate-100 animate-pulse" />
                    <div className="mt-1 h-3 w-28 rounded bg-slate-100 animate-pulse lg:hidden" />
                  </div>
                </Td>
                <Td><div className="h-4 w-24 rounded bg-slate-100 animate-pulse" /></Td>
                <Td><div className="h-4 w-20 rounded bg-slate-100 animate-pulse" /></Td>
                <Td><div className="h-4 w-14 rounded bg-slate-100 animate-pulse" /></Td>
                <Td><div className="h-4 w-16 rounded bg-slate-100 animate-pulse" /></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-slate-100 animate-pulse" />
                  </div>
                </Td>
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
