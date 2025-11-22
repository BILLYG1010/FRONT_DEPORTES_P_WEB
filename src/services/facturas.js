// src/services/facturas.js
const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = (BASE || "").replace(/\/$/, "");

/** HTTP helper (mismo estilo que inventario/clientes) */
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
      } catch { /* empty */}
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

/**
 * FacturaDTO (.NET):
 * id_factura, uuid, id_cliente_emisor, id_cliente_receptor, id_usuario,
 * fecha_emision, estado, eliminado, subtotal, total, observaciones,
 * numero_autorizacion, serie, correlativo, fecha_certificacion,
 * creado_en, actualizado_en
 */
const mapFacturaFromApi = (f = {}) => ({
  id: f.id_factura ?? null,
  uuid: f.uuid ?? null,
  id_cliente_emisor: f.id_cliente_emisor ?? null,
  id_cliente_receptor: f.id_cliente_receptor ?? null,
  id_usuario: f.id_usuario ?? null,

  fecha_emision: f.fecha_emision ?? null,
  estado: f.estado ?? 0,
  eliminado: f.eliminado === 1 || f.eliminado === true,

  subtotal: Number(f.subtotal ?? 0),
  total: Number(f.total ?? 0),
  observaciones: f.observaciones ?? "",

  numero_autorizacion: f.numero_autorizacion ?? null,
  serie: f.serie ?? "",
  correlativo: f.correlativo ?? null,
  fecha_certificacion: f.fecha_certificacion ?? null,

  creado_en: f.creado_en ?? null,
  actualizado_en: f.actualizado_en ?? null,

  // --------------------------
  // CAMPOS FUTUROS / UI (NO EXISTEN EN API)
  // solo para diseño
  // --------------------------
  cliente_emisor_nombre: f.cliente_emisor_nombre ?? "",
  cliente_receptor_nombre: f.cliente_receptor_nombre ?? "",
  usuario_nombre: f.usuario_nombre ?? "",
  detalle_count: f.detalle_count ?? 0,
  // --------------------------
});

export async function getFacturas() {
  const arr = await http(`${API_BASE}/facturas`);
  return { items: Array.isArray(arr) ? arr.map(mapFacturaFromApi) : [] };
}

export async function getFactura(id) {
  const f = await http(`${API_BASE}/facturas/${id}`);
  return mapFacturaFromApi(f);
}

/**
 * upsertFactura:
 * - CREATE => POST /facturas  (FacturaDTO directo)
 * - UPDATE => PUT /facturas/{id}
 *
 * NOTA API:
 * - uuid y fecha_emision los asigna backend al crear
 * - eliminado lo maneja backend (DELETE lógico)
 */
export async function upsertFactura(id, payload = {}) {
  // normalizamos numéricos
  const id_cliente_emisor = Number(payload.id_cliente_emisor || 0);
  const id_cliente_receptor = Number(payload.id_cliente_receptor || 0);
  const id_usuario = Number(payload.id_usuario || 0);

  const estado = Number(payload.estado ?? 0);
  const subtotal = Number(payload.subtotal ?? 0) || 0;
  const total = Number(payload.total ?? subtotal) || 0;

  // validación mínima front (evita 400 tontos)
  if (!id_cliente_emisor) throw new Error("Debes seleccionar cliente emisor.");
  if (!id_cliente_receptor) throw new Error("Debes seleccionar cliente receptor.");
  if (!id_usuario) throw new Error("Debes seleccionar usuario.");

  const bodyBase = {
    id_cliente_emisor,
    id_cliente_receptor,
    id_usuario,
    estado,
    subtotal,
    total,
    observaciones: payload.observaciones ?? "",
    serie: payload.serie ?? "A",

    // opcionales reales del API
    numero_autorizacion: payload.numero_autorizacion ?? null,
    correlativo: payload.correlativo ?? null,

    // NO enviar campos UI/futuros:
    // cliente_emisor_nombre, cliente_receptor_nombre, usuario_nombre, detalles[], etc
  };

  if (!id) {
    // CREATE
    return http(`${API_BASE}/facturas`, {
      method: "POST",
      body: JSON.stringify(bodyBase),
    });
  }

  // UPDATE
  const body = {
    ...bodyBase,
    id_factura: Number(id),
    uuid: payload.uuid ?? null, // por si backend lo exige en update
    fecha_emision: payload.fecha_emision ?? null,
  };

  return http(`${API_BASE}/facturas/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteFactura(id) {
  return http(`${API_BASE}/facturas/${id}`, { method: "DELETE" });
}

/** Helpers extra opcionales */
export async function patchEstadoFactura(id, nuevoEstado) {
  return http(`${API_BASE}/facturas/${id}/estado/${nuevoEstado}`, {
    method: "PATCH",
  });
}

export async function anularFactura(id) {
  return http(`${API_BASE}/facturas/${id}/anular`, {
    method: "PATCH",
  });
}
