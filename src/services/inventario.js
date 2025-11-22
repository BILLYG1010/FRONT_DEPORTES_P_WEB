// src/services/inventario.js
const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = (BASE || "").replace(/\/$/, "");

/** HTTP helper (errores .NET bien parseados) */
async function http(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const data = await res.json();

      // ProblemDetails .NET => { title, errors: { campo: [msg...] } }
      if (data?.title && data?.errors) {
        const all = Object.entries(data.errors)
          .map(([k, arr]) => `${k}: ${arr?.join(" | ")}`)
          .join(" • ");
        msg = `${data.title}${all ? `: ${all}` : ""}`;
      } else {
        msg = data?.message || data?.title || JSON.stringify(data) || msg;
      }
    } catch {
      try {
        const t = await res.text();
        if (t) msg = t;
      } catch { /* empty */ }
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

/**
 * ProductoDTO (.NET):
 * id_producto, sku, nombre, descripcion, precio_unitario, cantidad, activo, creado_en, actualizado_en
 */
const mapProductoFromApi = (p = {}) => ({
  id: p.id_producto ?? null,
  sku: p.sku ?? "",
  nombre: p.nombre ?? "",
  descripcion: p.descripcion ?? "",
  precio: p.precio_unitario ?? 0,
  stock: p.cantidad ?? 0,
  activo: p.activo === 1 || p.activo === true,

  // FUTUROS (no existen en API aún)
  categoria: p.categoria ?? "General",
  imagen: p.imagen ?? null,

  creado_en: p.creado_en ?? null,
  actualizado_en: p.actualizado_en ?? null,
});

export async function getProductos() {
  const arr = await http(`${API_BASE}/productos`);
  return { items: Array.isArray(arr) ? arr.map(mapProductoFromApi) : [] };
}

export async function getProducto(id) {
  const p = await http(`${API_BASE}/productos/${id}`);
  return mapProductoFromApi(p);
}

/**
 * upsertProducto:
 * - CREATE => POST /productos  (body ProductoDTO directo)
 * - UPDATE => PUT /productos/{id} (body ProductoDTO directo)
 *
 * Reglas reales:
 * - sku, nombre, descripcion => REQUIRED en backend
 * - activo => ulong => mandar 1/0
 */
export async function upsertProducto(id, payload = {}) {
  const sku = (payload.sku ?? "").trim();
  const nombre = (payload.nombre ?? "").trim();
  const descripcion = (payload.descripcion ?? "").trim();

  // validación front para evitar 400 tontos
  if (!sku) throw new Error("El SKU es obligatorio.");
  if (!nombre) throw new Error("El nombre es obligatorio.");
  if (!descripcion) throw new Error("La descripción es obligatoria.");

  const precio_unitario = Number(payload.precio_unitario ?? payload.precio ?? 0) || 0;
  const cantidad = Number(payload.cantidad ?? payload.stock ?? 0) || 0;

  const activoNum =
    payload.activo === true ||
    payload.activo === 1 ||
    payload.activo === "1"
      ? 1
      : 0;

  // ✅ Body EXACTO que espera tu API
  const body = {
    sku,
    nombre,
    descripcion,          // requerido => string siempre
    precio_unitario,
    cantidad,
    activo: activoNum,
  };

  if (!id) {
    return http(`${API_BASE}/productos`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  return http(`${API_BASE}/productos/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...body,
      id_producto: Number(id),
    }),
  });
}

export async function deleteProducto(id) {
  return http(`${API_BASE}/productos/${id}`, { method: "DELETE" });
}
