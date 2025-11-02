// src/pages/Inventario.jsx
import { useMemo, useState } from "react";

/**
 * Inventario.jsx
 * - Dos vistas: "Kanban" (por defecto) y "Lista".
 * - Toggle arriba a la derecha.
 * - Responsive, minimal y consistente con el estilo (slate + acentos azul/gradient).
 * - En vista Kanban, la imagen es perfectamente cuadrada.
 * - En vista Lista, no se muestra imagen.
 */

const MOCK_PRODUCTOS = [
  {
    id: 1,
    nombre: "Gorra Clásica Negra",
    sku: "GOR-CLS-NEG",
    categoria: "Accesorios",
    precio: 89.99,
    stock: 42,
    imagen: "https://picsum.photos/seed/GOR-CLS-NEG/600",
  },
  {
    id: 2,
    nombre: "Camiseta Deportiva Pro",
    sku: "CAM-DEP-PRO",
    categoria: "Ropa",
    precio: 149.5,
    stock: 8,
    imagen: "https://picsum.photos/seed/CAM-DEP-PRO/600",
  },
  {
    id: 3,
    nombre: "Balón Fútbol Training",
    sku: "BAL-FUT-TRN",
    categoria: "Deportes",
    precio: 199.0,
    stock: 3,
    imagen: "https://picsum.photos/seed/BAL-FUT-TRN/600",
  },
  {
    id: 4,
    nombre: "Zapatillas Runner X",
    sku: "ZAP-RUN-X",
    categoria: "Calzado",
    precio: 459.99,
    stock: 25,
    imagen: "https://picsum.photos/seed/ZAP-RUN-X/600",
  },
  {
    id: 5,
    nombre: "Short DryFit",
    sku: "SHT-DRY-01",
    categoria: "Ropa",
    precio: 119.5,
    stock: 17,
    imagen: "https://picsum.photos/seed/SHT-DRY-01/600",
  },
  {
    id: 6,
    nombre: "Guantes de Portero",
    sku: "GUA-POR-ELI",
    categoria: "Deportes",
    precio: 329.0,
    stock: 12,
    imagen: "https://picsum.photos/seed/GUA-POR-ELI/600",
  },
  {
    id: 7,
    nombre: "Gorra Visera Curva Azul",
    sku: "GOR-VSC-AZL",
    categoria: "Accesorios",
    precio: 95.0,
    stock: 0,
    imagen: "https://picsum.photos/seed/GOR-VSC-AZL/600",
  },
  {
    id: 8,
    nombre: "Calcetas Compresión",
    sku: "CAL-CMP-02",
    categoria: "Ropa",
    precio: 75.0,
    stock: 60,
    imagen: "https://picsum.photos/seed/CAL-CMP-02/600",
  },
];

const fmtQ = (n) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ", maximumFractionDigits: 2 }).format(n);

const chipCategoria = (cat) => {
  switch (cat) {
    case "Accesorios":
      return "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
    case "Ropa":
      return "bg-fuchsia-100 text-fuchsia-700 ring-1 ring-fuchsia-200";
    case "Deportes":
      return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    case "Calzado":
      return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
};

const chipStock = (qty) => {
  if (qty <= 0) return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  if (qty <= 5) return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
  if (qty <= 20) return "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200";
  return "bg-green-100 text-green-700 ring-1 ring-green-200";
};

export default function Inventario() {
  const [view, setView] = useState("kanban"); // "kanban" | "list"
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return MOCK_PRODUCTOS;
    return MOCK_PRODUCTOS.filter((p) =>
      [p.nombre, p.sku, p.categoria].join(" ").toLowerCase().includes(term)
    );
  }, [q]);

  return (
    <div className="space-y-6">
      {/* Header + acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Inventario</h1>
          <p className="text-sm text-slate-500">Administra tus productos, existencias y precios.</p>
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

          {/* Toggle de vista */}
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
   - Tarjetas en grid, imagen perfectamente cuadrada.
   ========================= */
function Kanban({ data }) {
  if (data.length === 0) {
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
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}

function ProductCard({ p }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow transition-shadow">
      {/* Imagen cuadrada */}
      <SquareImage src={p.imagen} alt={p.nombre} />

      {/* Info */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{p.nombre}</p>
          <p className="truncate text-xs text-slate-500">SKU: {p.sku}</p>
        </div>
        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] ${chipCategoria(p.categoria)}`}>
          {p.categoria}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{fmtQ(p.precio)}</p>
        <span className={`rounded-full px-2 py-0.5 text-[11px] ${chipStock(p.stock)}`}>
          {p.stock <= 0 ? "Sin stock" : `Stock: ${p.stock}`}
        </span>
      </div>

      {/* Acciones */}
      <div className="mt-3 flex items-center gap-2">
        <PrimaryButton>Ver</PrimaryButton>
        <GhostButton title="Editar">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.004 1.004 0 000-1.42L18.37 3.29a1.004 1.004 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
          </svg>
        </GhostButton>
        <GhostButton title="Añadir">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-2-.9-2-2V6H3V4h3.2l.6-1.6C7 1.6 7.5 1 8.2 1h7.6c.7 0 1.2.6 1.4 1.4L18 4h3v2h-2v10a2 2 0 01-2 2H7zm0-2h10V6H7v10zm3-2V9h2v5h3v2h-8v-2h3z" />
          </svg>
        </GhostButton>
      </div>
    </div>
  );
}

/** Imagen cuadrada 100% sin depender de plugins: contenedor con padding-top:100% */
function SquareImage({ src, alt }) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-slate-100 pt-[100%]">
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
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
        <table className="w-full min-w-[880px] table-auto">
          <thead className="bg-slate-50">
            <tr>
              <Th>Producto</Th>
              <Th>SKU</Th>
              <Th className="hidden md:table-cell">Categoría</Th>
              <Th>Precio</Th>
              <Th>Stock</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No se encontraron productos con ese filtro.
                </td>
              </tr>
            ) : (
              data.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <Td>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{p.nombre}</p>
                      <p className="truncate text-xs text-slate-500 md:hidden">SKU: {p.sku}</p>
                    </div>
                  </Td>
                  <Td>
                    <p className="text-sm text-slate-700">{p.sku}</p>
                  </Td>
                  <Td className="hidden md:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${chipCategoria(p.categoria)}`}>{p.categoria}</span>
                  </Td>
                  <Td>
                    <p className="text-sm font-medium text-slate-900">{fmtQ(p.precio)}</p>
                  </Td>
                  <Td>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${chipStock(p.stock)}`}>
                      {p.stock <= 0 ? "Sin stock" : p.stock}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <IconButton title="Ver">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 5c5.523 0 10 5 10 7s-4.477 7-10 7S2 14 2 12s4.477-7 10-7zm0 3a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                      </IconButton>
                      <IconButton title="Editar">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.004 1.004 0 000-1.42L18.37 3.29a1.004 1.004 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
                        </svg>
                      </IconButton>
                      <IconButton title="Añadir">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 18c-1.1 0-2-.9-2-2V6H3V4h3.2l.6-1.6C7 1.6 7.5 1 8.2 1h7.6c.7 0 1.2.6 1.4 1.4L18 4h3v2h-2v10a2 2 0 01-2 2H7zm0-2h10V6H7v10zm3-2V9h2v5h3v2h-8v-2h3z" />
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
function PrimaryButton({ children }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md bg-gradient-to-tr from-blue-600 to-blue-400 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
    >
      {children}
    </button>
  );
}
function GhostButton({ children, title }) {
  return (
    <button
      type="button"
      title={title}
      className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
    >
      {children}
    </button>
  );
}
