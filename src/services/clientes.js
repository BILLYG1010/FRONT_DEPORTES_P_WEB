// src/services/clientes.js
// Capa de SERVICIO: llamadas HTTP a la API y adaptación UI <-> API.
// Se complementa con el MODELO en src/models/cliente.js (mapClienteDto, normalizeTipo, toBool).

import { http } from "../lib/http";
import { mapClienteDto, normalizeTipo, toBool } from "../models/cliente";

const ENDPOINT = "/clientes";

/* --------------------------------
 * Helpers de query (GET /clientes)
 * -------------------------------- */
function buildParams(opts = {}) {
  const p = {};

  // Búsqueda y filtros
  if (opts.search) p.q = opts.search;

  if (typeof opts.activo === "boolean") {
    // FastAPI interpreta boolean en query, pero enviarlo como "true"/"false"
    p.activo = String(!!opts.activo);
  }

  // Filtro por tipo: admite "EMPRESA" | "INDIVIDUO" | boolean
  if (opts.tipo !== undefined && opts.tipo !== null) {
    const etiqueta = typeof opts.tipo === "string" ? opts.tipo : normalizeTipo(opts.tipo);
    p.tipo = etiqueta === "EMPRESA" ? "true" : "false";
  }

  // Paginación
  const pageSize = Number.isFinite(opts.pageSize) ? Number(opts.pageSize) : 20;
  const page = Number.isFinite(opts.page) ? Number(opts.page) : 1;
  p.limit = String(pageSize);
  p.offset = String((page - 1) * pageSize);

  // Orden
  if (opts.sortBy) p.sort_by = opts.sortBy; // id_cliente | nombre | creado_en | actualizado_en
  if (opts.order) p.order = opts.order;     // asc | desc

  return p;
}

/* --------------------------------
 * Lectura (lista + detalle)
 * -------------------------------- */
export async function getClientes(opts = {}) {
  const params = buildParams(opts);
  const data = await http.get(ENDPOINT, { params });

  // La API devuelve { items, meta }. Si viniera un array directo, lo toleramos.
  const itemsRaw = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
  const items = itemsRaw.map(mapClienteDto);

  const meta = data?.meta ?? {
    total: items.length,
    limit: Number(params.limit ?? 20),
    offset: Number(params.offset ?? 0),
  };

  return { items, meta };
}

export async function getCliente(id) {
  const data = await http.get(`${ENDPOINT}/${id}`);
  return mapClienteDto(data);
}

/* --------------------------------
 * Escritura (create / update)
 * -------------------------------- */

/**
 * Adapta el objeto de UI (form) al DTO que espera la API.
 * - tipo: "EMPRESA"/"INDIVIDUO" -> boolean (true=EMPRESA, false=INDIVIDUO)
 * - activo: cualquier truthy/falsy -> boolean
 */
function toDto(model = {}) {
  // Acepta tipo como string ("EMPRESA"/"INDIVIDUO") o como boolean/bit; lo normalizamos.
  const etiqueta = model.tipo === undefined ? "INDIVIDUO" : normalizeTipo(model.tipo);
  return {
    nit: model.nit || "",
    nombre: model.nombre || "",
    direccion: model.direccion ?? null,
    correo: model.correo ?? null,
    telefono: model.telefono ?? null,
    tipo: etiqueta === "EMPRESA", // FastAPI espera bool/BIT
    foto_url: model.foto_url ?? null,
    activo: toBool(model.activo),
  };
}

/** Crea (POST /clientes) */
export async function createCliente(model = {}) {
  const body = toDto(model);
  const created = await http.post(ENDPOINT, body);
  return mapClienteDto(created);
}

/**
 * Actualiza parcial (PATCH /clientes/:id)
 * Solo enviamos los campos presentes en `model`.
 * Nota: Si envías null, tu API actual IGNOARÁ ese campo (no "borra" a null).
 */
export async function updateCliente(id, model = {}) {
  const dto = toDto(model);

  // Construimos payload parcial: solo claves presentes en `model`
  const partial = {};
  const allowed = ["nombre", "direccion", "correo", "telefono", "tipo", "foto_url", "activo"];

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(model, key)) {
      // Usamos el valor convertido del dto (por ejemplo, tipo boolean ya normalizado)
      partial[key] = dto[key];
    }
  }

  // Si no hay nada que enviar, lanzamos un error coherente
  if (Object.keys(partial).length === 0) {
    const e = new Error("No se enviaron campos para actualizar");
    e.status = 400;
    throw e;
  }

  const updated = await http.patch(`${ENDPOINT}/${id}`, partial);
  return mapClienteDto(updated);
}

/** Crea o actualiza según id */
export async function upsertCliente(id, model) {
  if (id == null || id === "" || id === "new") {
    return createCliente(model);
  }
  return updateCliente(id, model);
}

/* --------------------------------
 * Utilidad local (cache)
 * -------------------------------- */
export function findClienteIn(cache, id) {
  return Array.isArray(cache) ? cache.find((c) => c.id === Number(id)) : undefined;
}

export default {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  upsertCliente,
  findClienteIn,
};
